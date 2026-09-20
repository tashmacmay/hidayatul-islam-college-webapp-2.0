// lib/db.js

import sql from 'mssql';

/*
 * Azure SQL connection configuration.
 *
 * Environment variables are loaded from .env.local during development
 * and should be supplied by the hosting environment in production.
 */
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    port: 1433,
    database: process.env.DB_NAME,

    options: {
        encrypt: true,
        trustServerCertificate: false,
    },

    /*
     * Connection pool configuration.
     *
     * max: Maximum number of simultaneous database connections.
     * min: Minimum number of connections kept available.
     * idleTimeoutMillis: Closes idle connections after this period.
     */
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },

    /*
     * How long a connection attempt may take before failing.
     */
    connectionTimeout: 15000,

    /*
     * Timeout for individual SQL requests.
     */
    requestTimeout: 30000,
};

/*
 * The active SQL connection pool.
 */
let pool = null;

/*
 * Stores an in-progress connection attempt.
 *
 * This prevents multiple simultaneous requests from all attempting
 * to create their own SQL connection at the same time.
 */
let connectionPromise = null;

/*
 * Maximum number of connection attempts.
 *
 * Example:
 * Attempt 1 → immediate
 * Attempt 2 → after 1 second
 * Attempt 3 → after 2 seconds
 * Attempt 4 → after 4 seconds
 */
const MAX_RETRIES = 3;

/*
 * Initial delay before retrying.
 */
const INITIAL_RETRY_DELAY = 1000;

/**
 * Wait for a specified amount of time.
 */
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determines whether an error is likely to be temporary.
 *
 * We retry network/connectivity-related errors because these can occur
 * temporarily with cloud-hosted databases.
 *
 * Authentication, configuration, SQL syntax and permission errors
 * should generally not be retried because retrying will not fix them.
 */
function isTransientError(error) {
    const transientCodes = new Set([
        'ETIMEOUT',
        'ESOCKET',
        'ECONNRESET',
        'ECONNREFUSED',
        'EPIPE',
        'ENETUNREACH',
        'EHOSTUNREACH',
    ]);

    if (error?.code && transientCodes.has(error.code)) {
        return true;
    }

    const message = error?.message?.toLowerCase() || '';

    const transientMessages = [
        'timeout',
        'timed out',
        'connection reset',
        'connection refused',
        'socket',
        'temporarily unavailable',
        'network error',
        'transport-level error',
    ];

    return transientMessages.some((text) => message.includes(text));
}

/**
 * Safely closes and clears the current connection pool.
 *
 * This is important when a connection becomes stale or a connection
 * attempt fails. Keeping a broken pool reference would cause future
 * requests to continue using the failed connection.
 */
async function resetPool() {
    if (pool) {
        try {
            if (!pool.closed) {
                await pool.close();
            }
        } catch (error) {
            console.warn(
                '⚠️ Error while closing SQL connection pool:',
                error.message
            );
        }
    }

    pool = null;
}

/**
 * Creates a new SQL connection pool with bounded retries
 * and exponential backoff.
 */

async function createPoolWithRetry() {
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(
                `🔄 Azure SQL connection attempt ${attempt}/${MAX_RETRIES}...`
            );

            const newPool = new sql.ConnectionPool(config);

            /*
             * Attach an error listener so unexpected pool errors
             * do not silently go unnoticed.
             */
            newPool.on('error', async (error) => {
                console.error(
                    '❌ Azure SQL connection pool error:',
                    error.message
                );

                /*
                 * Only reset the pool if this is still the active pool.
                 * This avoids accidentally clearing a newer healthy pool.
                 */
                if (pool === newPool) {
                    await resetPool();
                }
            });

            await newPool.connect();

            /*
             * Confirm that the pool is actually usable before
             * storing it as the active connection.
             */
            if (!newPool.connected) {
                await newPool.close();

                throw new Error(
                    'Azure SQL connection pool was created but is not connected.'
                );
            }

            console.log('✅ Connected to Azure SQL Database');

            return newPool;
        } catch (error) {
            lastError = error;

            console.error(
                `❌ Azure SQL connection attempt ${attempt} failed:`,
                {
                    code: error?.code,
                    message: error?.message,
                }
            );

            /*
             * Do not retry errors that are unlikely to be temporary.
             */
            if (!isTransientError(error)) {
                console.error(
                    '🛑 Error does not appear to be transient. Aborting retries.'
                );

                throw error;
            }

            /*
             * If this was not the final attempt, wait using
             * exponential backoff:
             *
             * 1 second
             * 2 seconds
             * 4 seconds
             */
            if (attempt < MAX_RETRIES) {
                const retryDelay =
                    INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);

                console.warn(
                    `⏳ Transient database error. Retrying in ${retryDelay}ms...`
                );

                await delay(retryDelay);
            }
        }
    }

    console.error(
        `🛑 Azure SQL connection failed after ${MAX_RETRIES} attempts.`
    );

    throw lastError;
}

/**
 * Returns a healthy SQL connection pool.
 *
 * This function:
 * - reuses the existing pool
 * - detects closed/unusable pools
 * - prevents simultaneous connection attempts
 * - retries transient failures
 * - cleans up failed connections
 */
export async function getConnection() {
    /*
     * Reuse the existing pool if it is healthy.
     */
    if (pool && pool.connected && !pool.closed) {
        return pool;
    }

    /*
     * If the existing pool is no longer usable, remove it.
     */
    if (pool) {
        console.warn(
            '⚠️ Existing Azure SQL connection is no longer healthy. Reconnecting...'
        );

        await resetPool();
    }

    /*
     * If another request is already establishing a connection,
     * wait for that same connection instead of creating another one.
     *
     * This is particularly important when several users make requests
     * at the same time.
     */
    if (connectionPromise) {
        console.log(
            '⏳ Azure SQL connection already in progress. Waiting for it...'
        );

        return connectionPromise;
    }

    /*
     * Start exactly one connection attempt.
     */
    connectionPromise = createPoolWithRetry();

    try {
        pool = await connectionPromise;

        return pool;
    } catch (error) {
        /*
         * Make sure a failed connection does not leave a broken
         * pool reference behind.
         */
        await resetPool();

        throw error;
    } finally {
        /*
         * Allow a future request to create a new connection if
         * this connection attempt failed or the pool later becomes stale.
         */
        connectionPromise = null;
    }
}

/**
 * Gracefully closes the database connection pool.
 *
 * Useful for application shutdown or controlled cleanup.
 */
export async function closeConnection() {
    /*
     * If a connection is currently being established, wait for it
     * before attempting to close the pool.
     */
    if (connectionPromise) {
        try {
            await connectionPromise;
        } catch {
            /*
             * The connection attempt already failed.
             * There is nothing further to close.
             */
        }
    }

    if (pool) {
        console.log('🔌 Closing Azure SQL connection pool...');

        await resetPool();

        console.log('✅ Azure SQL connection pool closed.');
    }
}
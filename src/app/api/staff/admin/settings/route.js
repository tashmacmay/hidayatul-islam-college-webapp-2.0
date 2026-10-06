import { NextResponse } from 'next/server';
import sql from 'mssql';
import { getConnection } from '@/lib/db';
import { verifyUser } from '@/lib/auth';

const getSettingType = (value) => {
    if (typeof value === 'boolean') {
        return 'boolean';
    }

    if (typeof value === 'number') {
        return 'number';
    }

    return 'string';
};
// GET - Load all system settings
export async function GET(request) {
     try {
        // 1. Verify that the Firebase user is logged in
        const firebaseUser = await verifyUser(request);

        // 2. Connect to Azure SQL
        const pool = await getConnection();

        // 3. Find the logged-in user in our Users table
        const userResult = await pool
            .request()
            .input("firebase_uid", sql.NVarChar, firebaseUser.uid)
            .query(`
                SELECT id, role, is_admin
                FROM Users
                WHERE firebase_uid = @firebase_uid
            `);

        // User doesn't exist in our database
        if (userResult.recordset.length === 0) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const user = userResult.recordset[0];

        // 4. Make sure the user is an administrator
        if (!user.is_admin) {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        // 5. Get all system settings
        const settingsResult = await pool
            .request()
            .query(`
                SELECT
                    id,
                    setting_key,
                    setting_value,
                    setting_type,
                    updated_by,
                    updated_at
                FROM SystemSettings
                ORDER BY setting_key
            `);

        // 6. Convert database values into useful JavaScript values
        const settings = {};

        settingsResult.recordset.forEach((row) => {
            let value = row.setting_value;

            if (row.setting_type === "boolean") {
                value = value === "true";
            }

            if (row.setting_type === "number") {
                value = Number(value);
            }

            settings[row.setting_key] = value;
        });

        // 7. Return the settings
        return NextResponse.json({
            settings,
        });

    } catch (error) {
        console.error("Settings GET error:", error);

        if (
            error.message === "Invalid token" ||
            error.message === "Missing or invalid Authorization header"
        ) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}


// PUT - Save system settings
export async function PUT(request) {
    try {
        // Verify that the request comes from a logged-in Firebase user
        const user = await verifyUser(request);

        const body = await request.json();

        const pool = await getConnection();

        // Find the logged-in user in our database
        const userResult = await pool.request()
            .input('firebase_uid', sql.NVarChar, user.uid)
            .query(`
                SELECT id, is_admin
                FROM Users
                WHERE firebase_uid = @firebase_uid
            `);

        if (userResult.recordset.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const currentUser = userResult.recordset[0];

        // Only administrators can change Settings
        if (!currentUser.is_admin) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        /*
         * Convert the Settings page structure into a simple list.
         *
         * Example:
         * {
         *     schoolInfo: {
         *         school_name: "Hidayatul Islam College"
         *     }
         * }
         *
         * becomes:
         * school_name -> Hidayatul Islam College
         */
        const settings = [];

if (body.schoolInfo) {
    Object.entries(body.schoolInfo).forEach(([key, value]) => {
        settings.push({
            key,
            value,
            type: getSettingType(value)
        });
    });
}

if (body.portalSettings) {
    Object.entries(body.portalSettings).forEach(([key, value]) => {
        settings.push({
            key,
            value,
            type: getSettingType(value)
        });
    });
}

if (body.bookingSettings) {
    Object.entries(body.bookingSettings).forEach(([key, value]) => {
        settings.push({
            key,
            value,
            type: getSettingType(value)
        });
    });
}

if (body.popiaSettings) {
    Object.entries(body.popiaSettings).forEach(([key, value]) => {
        settings.push({
            key,
            value,
            type: getSettingType(value)
        });
    });
}

        // Update each setting
        for (const setting of settings) {

            // Find the existing setting
            const existingResult = await pool.request()
                .input('setting_key', sql.NVarChar, setting.key)
                .query(`
                    SELECT setting_value, setting_type
                    FROM SystemSettings
                    WHERE setting_key = @setting_key
                `);

            // If the setting does not exist yet, skip it.
            // We can populate the database with the approved settings later.
            if (existingResult.recordset.length === 0) {
                continue;
            }

            const existing = existingResult.recordset[0];

            // Convert the new value into a string for storage
            const newValue = String(setting.value);

            // Only create an audit record if something actually changed
            if (
                existing.setting_value !== newValue ||
                existing.setting_type !== setting.type
            ) {

                // Update the setting
                await pool.request()
                    .input('setting_key', sql.NVarChar, setting.key)
                    .input('setting_value', sql.NVarChar, newValue)
                    .input('setting_type', sql.NVarChar, setting.type)
                    .input('updated_by', sql.Int, currentUser.id)
                    .query(`
                        UPDATE SystemSettings
                        SET
                            setting_value = @setting_value,
                            setting_type = @setting_type,
                            updated_by = @updated_by,
                            updated_at = GETDATE()
                        WHERE setting_key = @setting_key
                    `);

                // Record the change
                await pool.request()
                    .input('setting_key', sql.NVarChar, setting.key)
                    .input('old_value', sql.NVarChar, existing.setting_value)
                    .input('new_value', sql.NVarChar, newValue)
                    .input('changed_by', sql.Int, currentUser.id)
                    .query(`
                        INSERT INTO SettingsAuditLog
                            (
                                setting_key,
                                old_value,
                                new_value,
                                changed_by,
                                changed_at
                            )
                        VALUES
                            (
                                @setting_key,
                                @old_value,
                                @new_value,
                                @changed_by,
                                GETDATE()
                            )
                    `);
            }
        }

        return NextResponse.json({
            message: 'Settings saved successfully'
        });

    } catch (error) {
        console.error('Settings PUT error:', error);

        if (
            error.message === 'Invalid token' ||
            error.message === 'Missing or invalid Authorization header'
        ) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
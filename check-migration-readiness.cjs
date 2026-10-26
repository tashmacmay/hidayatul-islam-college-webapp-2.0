
require("dotenv").config({ path: ".env.local" });

const sql = require("mssql");
const { Client } = require("pg");

const TABLES = [
  "bookings",
  "Gallery",
  "GalleryImages",
  "LearningResources",
  "NewsAnnouncements",
  "Notices",
  "TermCalendars",
  "Users",
];

function getAzureConfig() {
  // Adapt these names only if your .env.local uses different names.
  const server = process.env.DB_HOST;
  const database = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const port = Number(process.env.DB_PORT || 1433);

  if (!server || !database || !user || !password) {
    throw new Error(
      "Azure settings are missing. Check DB_HOST, DB_NAME, DB_USER and DB_PASSWORD in .env.local."
    );
  }

  return {
    server,
    database,
    user,
    password,
    port,
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
    connectionTimeout: 15000,
    requestTimeout: 30000,
  };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing from .env.local.");
  }

  let azurePool;
  let neonClient;

  try {
    console.log("Connecting to Azure SQL...");
    azurePool = await sql.connect(getAzureConfig());

    console.log("Connecting to Neon PostgreSQL...");
    neonClient = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    });
    await neonClient.connect();

    console.log("\nConnection checks passed.");
    console.log("\nSOURCE: Azure SQL");

    for (const table of TABLES) {
      const result = await azurePool
        .request()
        .input("tableName", sql.NVarChar, table)
        .query(`
          SELECT
            c.COLUMN_NAME AS column_name,
            c.DATA_TYPE AS data_type,
            c.CHARACTER_MAXIMUM_LENGTH AS max_length
          FROM INFORMATION_SCHEMA.COLUMNS c
          WHERE c.TABLE_SCHEMA = 'dbo'
            AND c.TABLE_NAME = @tableName
          ORDER BY c.ORDINAL_POSITION
        `);

      const countResult = await azurePool
        .request()
        .input("tableName", sql.NVarChar, table)
        .query(`
          SELECT COUNT_BIG(*) AS row_count
          FROM dbo.${table === "bookings" ? "[bookings]" : `[${table}]`}
        `);

      console.log(
        `${table}: ${countResult.recordset[0].row_count} rows; ` +
        `${result.recordset.length} columns`
      );

      for (const col of result.recordset) {
        console.log(
          `  ${col.column_name}: ${col.data_type}` +
          (col.max_length != null ? ` (${col.max_length})` : "")
        );
      }
    }

    console.log("\nDESTINATION: Neon PostgreSQL");

    for (const table of TABLES) {
      const result = await neonClient.query(
        `
          SELECT column_name, data_type, character_maximum_length
          FROM information_schema.columns
          WHERE table_schema = 'dbo'
            AND table_name = $1
          ORDER BY ordinal_position
        `,
        [table]
      );

      const countResult = await neonClient.query(
        `SELECT COUNT(*)::bigint AS row_count FROM "dbo".${quotePgIdentifier(table)}`
      );

      console.log(
        `${table}: ${countResult.rows[0].row_count} rows; ` +
        `${result.rows.length} columns`
      );

      for (const col of result.rows) {
        console.log(
          `  ${col.column_name}: ${col.data_type}` +
          (col.character_maximum_length != null
            ? ` (${col.character_maximum_length})`
            : "")
        );
      }
    }

    console.log("\nReadiness check complete. No rows were inserted or changed.");
  } finally {
    if (neonClient) await neonClient.end().catch(() => {});
    if (azurePool) await azurePool.close().catch(() => {});
  }
}

function quotePgIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

main().catch((error) => {
  // Avoid printing connection strings or credentials.
  console.error("\nReadiness check failed:", error.message);
  process.exitCode = 1;
});

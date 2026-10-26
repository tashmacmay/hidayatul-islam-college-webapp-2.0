
require("dotenv").config({ path: ".env.local" });

const sql = require("mssql");
const { Client } = require("pg");

const tables = [
  "bookings",
  "Gallery",
  "GalleryImages",
  "LearningResources",
  "NewsAnnouncements",
  "Notices",
  "TermCalendars",
  "Users",
];

const quote = (name) => `"${name.replace(/"/g, '""')}"`;

async function main() {
  const required = [
    "DB_HOST",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
    "DATABASE_URL",
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  const source = await new sql.ConnectionPool({
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 1433),
    options: { encrypt: true, trustServerCertificate: false },
    connectionTimeout: 15000,
    requestTimeout: 30000,
  }).connect();

  // Use Neon’s connection-string TLS settings; don't disable certificate checks.
  const target = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await target.connect();

    // Verify column names and refuse to overwrite existing Neon data.
    for (const table of tables) {
      const sourceColumns = await source.request().query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = '${table}'
        ORDER BY ORDINAL_POSITION
      `);

      const targetColumns = await target.query(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'dbo' AND table_name = $1
         ORDER BY ordinal_position`,
        [table]
      );

      const src = sourceColumns.recordset.map((r) => r.COLUMN_NAME);
      const dst = targetColumns.rows.map((r) => r.column_name);

      if (
        src.length !== dst.length ||
        src.some((column, i) => column !== dst[i])
      ) {
        throw new Error(`Column mismatch in ${table}; no import performed.`);
      }

      const count = await target.query(
        `SELECT COUNT(*)::int AS count FROM "dbo".${quote(table)}`
      );

      if (count.rows[0].count !== 0) {
        throw new Error(`Neon table ${table} is not empty; import stopped.`);
      }
    }

    await target.query("BEGIN");
    let total = 0;

    for (const table of tables) {
      const result = await source.request().query(
        `SELECT * FROM dbo.${quote(table)}`
      );

      const columns = result.recordset.columns
        ? Object.keys(result.recordset.columns)
        : [];

      // The mssql recordset metadata is normally present even for empty tables.
      if (result.recordset.length && !columns.length) {
        throw new Error(`Could not read column metadata for ${table}`);
      }

      for (const row of result.recordset) {
        const values = columns.map((column) => row[column]);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

        await target.query(
          `INSERT INTO "dbo".${quote(table)}
           (${columns.map(quote).join(", ")})
           VALUES (${placeholders})`,
          values
        );
      }

      console.log(`${table}: ${result.recordset.length} rows read`);
      total += result.recordset.length;
    }

    // Set identity sequences to the current maximum ID.
    for (const table of tables) {
      await target.query(
        `SELECT setval(
           pg_get_serial_sequence($1, 'id'),
           COALESCE(MAX(id), 1),
           MAX(id) IS NOT NULL
         )
         FROM "dbo".${quote(table)}`,
        [`"dbo"."${table}"`]
      );
    }

    await target.query("COMMIT");
    console.log(`Import committed. Total source rows: ${total}`);
    console.log("Next: compare source and destination row counts.");
  } catch (error) {
    try {
      await target.query("ROLLBACK");
    } catch {}
    throw error;
  } finally {
    await source.close();
    await target.end();
  }
}

main().catch((error) => {
  console.error("Import failed:", error.message);
  process.exitCode = 1;
});

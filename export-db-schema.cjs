
const fs = require("fs");
const path = require("path");
const sql = require("mssql");

// Read environment variables locally without printing secrets.
const envPath = path.join(__dirname, ".env.local");

if (!fs.existsSync(envPath)) {
  throw new Error(".env.local was not found in the project root.");
}

for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (!match || process.env[match[1]] !== undefined) continue;

  let value = match[2].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  process.env[match[1]] = value;
}

function firstDefined(...names) {
  return names.map((name) => process.env[name]).find((value) => value);
}

async function main() {
  const config = {
    server: firstDefined("DB_HOST", "AZURE_SQL_SERVER", "SQL_SERVER"),
    database: firstDefined("DB_NAME", "AZURE_SQL_DATABASE", "SQL_DATABASE"),
    user: firstDefined("DB_USER", "AZURE_SQL_USER", "SQL_USER"),
    password: firstDefined("DB_PASSWORD", "AZURE_SQL_PASSWORD", "SQL_PASSWORD"),
    port: Number(firstDefined("DB_PORT", "AZURE_SQL_PORT", "SQL_PORT") || 1433),
    options: {
      encrypt: true,
      trustServerCertificate: false,
      connectTimeout: 15000,
      requestTimeout: 20000,
    },
    pool: { max: 1, min: 0, idleTimeoutMillis: 10000 },
  };

  const missing = ["server", "database", "user", "password"]
    .filter((key) => !config[key]);

  if (missing.length) {
    throw new Error(
      "Missing database environment settings: " +
      missing.join(", ") +
      ". Check the variable names in .env.local; do not paste their values here."
    );
  }

  const pool = new sql.ConnectionPool(config);

  try {
    await pool.connect();

    const result = await pool.request().query(`
      SELECT
        s.name AS schema_name,
        t.name AS table_name,
        c.column_id,
        c.name AS column_name,
        ty.name AS data_type,
        c.max_length,
        c.precision,
        c.scale,
        c.is_nullable,
        c.is_identity,
        dc.definition AS default_definition
      FROM sys.tables t
      JOIN sys.schemas s ON t.schema_id = s.schema_id
      JOIN sys.columns c ON c.object_id = t.object_id
      JOIN sys.types ty ON c.user_type_id = ty.user_type_id
      LEFT JOIN sys.default_constraints dc
        ON dc.object_id = c.default_object_id
      WHERE t.is_ms_shipped = 0
      ORDER BY s.name, t.name, c.column_id;

      SELECT
        s.name AS schema_name,
        t.name AS table_name,
        i.name AS index_name,
        i.is_primary_key,
        i.is_unique,
        c.name AS column_name,
        ic.key_ordinal
      FROM sys.tables t
      JOIN sys.schemas s ON t.schema_id = s.schema_id
      JOIN sys.indexes i ON i.object_id = t.object_id
      JOIN sys.index_columns ic
        ON ic.object_id = i.object_id
       AND ic.index_id = i.index_id
      JOIN sys.columns c
        ON c.object_id = ic.object_id
       AND c.column_id = ic.column_id
      WHERE t.is_ms_shipped = 0
        AND i.name IS NOT NULL
      ORDER BY s.name, t.name, i.name, ic.key_ordinal;

      SELECT
        OBJECT_SCHEMA_NAME(fk.parent_object_id) AS schema_name,
        OBJECT_NAME(fk.parent_object_id) AS table_name,
        fk.name AS foreign_key_name,
        pc.name AS column_name,
        OBJECT_SCHEMA_NAME(fk.referenced_object_id) AS referenced_schema,
        OBJECT_NAME(fk.referenced_object_id) AS referenced_table,
        rc.name AS referenced_column,
        fk.delete_referential_action_desc AS on_delete,
        fk.update_referential_action_desc AS on_update
      FROM sys.foreign_keys fk
      JOIN sys.foreign_key_columns fkc
        ON fkc.constraint_object_id = fk.object_id
      JOIN sys.columns pc
        ON pc.object_id = fkc.parent_object_id
       AND pc.column_id = fkc.parent_column_id
      JOIN sys.columns rc
        ON rc.object_id = fkc.referenced_object_id
       AND rc.column_id = fkc.referenced_column_id
      ORDER BY schema_name, table_name, foreign_key_name;

      SELECT
        SCHEMA_NAME(o.schema_id) AS schema_name,
        o.name AS object_name,
        o.type_desc
      FROM sys.objects o
      WHERE o.is_ms_shipped = 0
        AND o.type IN ('V', 'P', 'TR', 'FN', 'IF', 'TF')
      ORDER BY schema_name, object_name;
    `);

    const sets = result.recordsets;
    const output = [
      "-- Schema inventory export; no application rows exported.",
      "-- Generated " + new Date().toISOString(),
      "",
      "TABLE COLUMNS",
      ...sets[0].map((r) =>
        `${r.schema_name}.${r.table_name}.${r.column_name} | ${r.data_type}` +
        ` | nullable=${r.is_nullable}` +
        ` | identity=${r.is_identity}` +
        (r.max_length != null ? ` | max_length=${r.max_length}` : "") +
        (r.default_definition ? ` | default=${r.default_definition}` : "")
      ),
      "",
      "INDEXES AND PRIMARY KEYS",
      ...sets[1].map((r) =>
        `${r.schema_name}.${r.table_name} | ${r.index_name}` +
        ` | primary=${r.is_primary_key} | unique=${r.is_unique}` +
        ` | column=${r.column_name} | order=${r.key_ordinal}`
      ),
      "",
      "FOREIGN KEYS",
      ...sets[2].map((r) =>
        `${r.schema_name}.${r.table_name}.${r.column_name}` +
        ` -> ${r.referenced_schema}.${r.referenced_table}.${r.referenced_column}` +
        ` | delete=${r.on_delete} | update=${r.on_update}`
      ),
      "",
      "VIEWS, PROCEDURES, FUNCTIONS AND TRIGGERS",
      ...sets[3].map((r) =>
        `${r.schema_name}.${r.object_name} | ${r.type_desc}`
      ),
      "",
    ].join("\n");

    const outPath = path.join(__dirname, "db-schema-inventory.txt");
    fs.writeFileSync(outPath, output, "utf8");

    console.log("Schema inventory created: db-schema-inventory.txt");
    console.log("Table columns found:", sets[0].length);
    console.log("Foreign-key relationships found:", sets[2].length);
    console.log("No application data rows were exported.");
  } finally {
    await pool.close();
  }
}

main().catch((error) => {
  // Avoid printing connection configuration or credentials.
  console.error("Schema export failed:", error.message);
  process.exitCode = 1;
});

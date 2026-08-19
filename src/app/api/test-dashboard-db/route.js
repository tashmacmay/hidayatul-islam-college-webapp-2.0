import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET() {
  try {
    const pool = await getConnection();

    const tables = await pool.request().query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);

    const result = {};

    for (const table of tables.recordset) {
      const tableName = table.TABLE_NAME;

      const columns = await pool.request()
        .input("tableName", tableName)
        .query(`
          SELECT
            COLUMN_NAME,
            DATA_TYPE,
            IS_NULLABLE
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = @tableName
          ORDER BY ORDINAL_POSITION
        `);

      result[tableName] = columns.recordset;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Dashboard DB inspection error:", error);

    return NextResponse.json(
      {
        error: "Failed to inspect database",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
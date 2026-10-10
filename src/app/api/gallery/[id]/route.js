import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const id = parseInt(params.id);

    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid gallery image ID." },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT
          id,
          image_url,
          title,
          caption,
          alt_text,
          category,
          photo_type,
          created_at,
          updated_at
        FROM Gallery
        WHERE id = @id
          AND published = 1
          AND consent_confirmed = 1
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "Gallery image not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      gallery: result.recordset[0],
    });
  } catch (error) {
    console.error("Public Gallery GET by ID error:", error);

    return NextResponse.json(
      { error: "Failed to fetch gallery image." },
      { status: 500 }
    );
  }
}
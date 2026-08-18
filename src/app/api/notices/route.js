import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET() {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT *
      FROM Notices
      ORDER BY CreatedAt DESC
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch notices" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const pool = await getConnection();

    await pool
      .request()
      .input("Title", body.title)
      .input("Content", body.content)
      .input("Audience", body.audience)
      .query(`
        INSERT INTO Notices
        (Title, Content, Audience)
        VALUES
        (@Title, @Content, @Audience)
      `);

    return NextResponse.json({
      success: true,
      message: "Notice created",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create notice" },
      { status: 500 }
    );
  }
}
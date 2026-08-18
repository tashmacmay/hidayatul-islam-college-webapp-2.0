import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", params.id)
      .query(`
        SELECT *
        FROM Notices
        WHERE NoticeID = @id
      `);

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notice" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();

    const pool = await getConnection();

    await pool
      .request()
      .input("id", params.id)
      .input("Title", body.title)
      .input("Content", body.content)
      .input("Audience", body.audience)
      .query(`
        UPDATE Notices
        SET
          Title = @Title,
          Content = @Content,
          Audience = @Audience,
          UpdatedAt = GETDATE()
        WHERE NoticeID = @id
      `);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update notice" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const pool = await getConnection();

    await pool
      .request()
      .input("id", params.id)
      .query(`
        DELETE FROM Notices
        WHERE NoticeID = @id
      `);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete notice" },
      { status: 500 }
    );
  }
}
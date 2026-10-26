import { NextResponse } from "next/server";
import { getPostgresConnection } from "@/lib/db-postgres";

export async function GET(req, { params }) {
try {
const id = Number.parseInt(params.id, 10);

if (Number.isNaN(id)) {
  return NextResponse.json(
    { error: "Invalid gallery image ID." },
    { status: 400 }
  );
}

const pool = getPostgresConnection();

const result = await pool.query(
  `
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
    FROM "dbo"."GalleryImages"
    WHERE id = $1
      AND published = TRUE
      AND (photo_type <> 'learners' OR consent_confirmed = TRUE)
  `,
  [id]
);

if (result.rows.length === 0) {
  return NextResponse.json(
    { error: "Gallery image not found." },
    { status: 404 }
  );
}

return NextResponse.json({
  gallery: result.rows[0],
});

} catch (error) {
console.error("Public Gallery GET by ID error:", error);

return NextResponse.json(
  { error: "Failed to fetch gallery image." },
  { status: 500 }
);

}
}
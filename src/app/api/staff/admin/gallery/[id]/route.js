import { NextResponse } from "next/server";
import { getPostgresConnection } from "@/lib/db-postgres";
import { requireAdmin } from "@/lib/auth";

const GALLERY_CATEGORIES = [
"Sport",
"Islamic Events",
"Academic",
"School Events",
"Outings",
];

const PHOTO_TYPES = ["general", "learners"];

function errorResponse(error, operation) {
console.error(`${operation} error:`, error);

const status =
error.statusCode ||
(error.message === "Admin access required" ||
error.message === "Forbidden"
? 403
: error.message === "Unauthorized"
? 401
: 500);

return NextResponse.json(
{
error:
status === 401 || status === 403
? error.message
: "Failed to process gallery image",
...(status === 500 ? { message: error.message } : {}),
},
{ status }
);
}

// GET /api/staff/admin/gallery/[id]
export async function GET(req, { params }) {
try {
await requireAdmin(req);

const { id: rawId } = await params;
const id = Number(rawId);

if (!Number.isSafeInteger(id) || id <= 0) {
  return NextResponse.json(
    { error: "Invalid gallery image ID" },
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
      consent_confirmed,
      published,
      uploaded_by,
      created_at,
      updated_at
    FROM "dbo"."GalleryImages"
    WHERE id = $1
  `,
  [id]
);

if (result.rows.length === 0) {
  return NextResponse.json(
    { error: "Gallery image not found" },
    { status: 404 }
  );
}

return NextResponse.json(result.rows[0]);

} catch (error) {
return errorResponse(error, "GET /api/staff/admin/gallery/[id]");
}
}

// PUT /api/staff/admin/gallery/[id]
export async function PUT(req, { params }) {
try {
await requireAdmin(req);

const { id: rawId } = await params;
const id = Number(rawId);

if (!Number.isSafeInteger(id) || id <= 0) {
  return NextResponse.json(
    { error: "Invalid gallery image ID" },
    { status: 400 }
  );
}

const body = await req.json();

const {
  image_url,
  title,
  caption,
  alt_text,
  category,
  photo_type,
  consent_confirmed,
  published,
} = body;

if (typeof image_url !== "string" || !image_url.trim()) {
  return NextResponse.json(
    { error: "Image URL is required" },
    { status: 400 }
  );
}

if (typeof alt_text !== "string" || !alt_text.trim()) {
  return NextResponse.json(
    { error: "Alt text is required" },
    { status: 400 }
  );
}

if (!GALLERY_CATEGORIES.includes(category)) {
  return NextResponse.json(
    { error: "Invalid gallery category" },
    { status: 400 }
  );
}

if (!PHOTO_TYPES.includes(photo_type)) {
  return NextResponse.json(
    { error: "Invalid photo type" },
    { status: 400 }
  );
}

const isPublished = Boolean(published);
const hasConsent = Boolean(consent_confirmed);

// Learner photos cannot be published without confirmed consent.
if (photo_type === "learners" && isPublished && !hasConsent) {
  return NextResponse.json(
    {
      error:
        "Parent/guardian consent is required before publishing a learner photo",
    },
    { status: 400 }
  );
}

const pool = getPostgresConnection();

const result = await pool.query(
  `
    UPDATE "dbo"."GalleryImages"
    SET
      image_url = $1,
      title = $2,
      caption = $3,
      alt_text = $4,
      category = $5,
      photo_type = $6,
      consent_confirmed = $7,
      published = $8,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
    RETURNING *
  `,
  [
    image_url.trim(),
    typeof title === "string" ? title.trim() || null : null,
    typeof caption === "string" ? caption.trim() || null : null,
    alt_text.trim(),
    category,
    photo_type,
    hasConsent,
    isPublished,
    id,
  ]
);

if (result.rows.length === 0) {
  return NextResponse.json(
    { error: "Gallery image not found" },
    { status: 404 }
  );
}

return NextResponse.json({
  success: true,
  image: result.rows[0],
});

} catch (error) {
return errorResponse(error, "PUT /api/staff/admin/gallery/[id]");
}
}

// DELETE /api/staff/admin/gallery/[id]
export async function DELETE(req, { params }) {
try {
await requireAdmin(req);

const { id: rawId } = await params;
const id = Number(rawId);

if (!Number.isSafeInteger(id) || id <= 0) {
  return NextResponse.json(
    { error: "Invalid gallery image ID" },
    { status: 400 }
  );
}

const pool = getPostgresConnection();

const result = await pool.query(
  `
    DELETE FROM "dbo"."GalleryImages"
    WHERE id = $1
    RETURNING id
  `,
  [id]
);

if (result.rows.length === 0) {
  return NextResponse.json(
    { error: "Gallery image not found" },
    { status: 404 }
  );
}

return NextResponse.json({
  success: true,
  message: "Gallery image deleted successfully",
});

} catch (error) {
return errorResponse(error, "DELETE /api/staff/admin/gallery/[id]");
}
}
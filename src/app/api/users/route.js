import { NextResponse } from "next/server";
import { getPostgresConnection } from "@/lib/db-postgres";
import { requireAdmin } from "@/lib/auth";

const USER_FIELDS = `
  id,
  firebase_uid,
  email,
  display_name,
  role,
  is_admin,
  created_at,
  updated_at
`;

function apiError(error, fallback) {
  const code = error?.code;
  const status =
    error?.statusCode ||
    (
      [
        "MISSING_AUTH_HEADER",
        "EMPTY_TOKEN",
        "INVALID_TOKEN",
        "NO_UID_IN_TOKEN",
      ].includes(code)
        ? 401
        : code === "NOT_ADMIN" || code === "USER_NOT_FOUND"
          ? 403
          : 500
    );

  if (status === 500) {
    console.error(fallback, {
      code,
      message: error?.message,
    });
  }

  return NextResponse.json(
    {
      error:
        status === 500
          ? fallback
          : status === 403
            ? "Administrator access is required."
            : "Authentication is required. Please sign in again.",
    },
    { status }
  );
}

function normalizeUserPayload(body) {
  const display_name =
    typeof body?.display_name === "string"
      ? body.display_name.trim()
      : "";

  const email =
    typeof body?.email === "string"
      ? body.email.trim().toLowerCase()
      : "";

  let role =
    typeof body?.role === "string"
      ? body.role.trim().toLowerCase()
      : "parent";

  let is_admin =
    body?.is_admin === true ||
    body?.is_admin === 1 ||
    body?.is_admin === "true";

  // Support legacy form/import values.
  if (role === "admin") {
    role = "staff";
    is_admin = true;
  }

  // Administrator accounts must also be staff accounts.
  if (is_admin) {
    role = "staff";
  }

  if (!display_name) {
    return { error: "Full name is required." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  if (!["parent", "staff"].includes(role)) {
    return {
      error: "Role must be either parent or staff.",
    };
  }

  if (role === "parent" && is_admin) {
    return {
      error: "Parent accounts cannot have administrator access.",
    };
  }

  return {
    value: {
      display_name,
      email,
      role,
      is_admin,
    },
  };
}

// GET /api/users
// Retrieve users. Only administrators may access this endpoint.
export async function GET(request) {
  try {
    await requireAdmin(request);

    const pool = getPostgresConnection();

    const result = await pool.query(`
      SELECT ${USER_FIELDS}
      FROM "dbo"."Users"
      ORDER BY display_name ASC NULLS LAST, email ASC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    return apiError(error, "Failed to fetch users.");
  }
}

// POST /api/users
// Create an invitation record. Firebase account creation happens later.
export async function POST(request) {
  try {
    await requireAdmin(request);

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must contain valid JSON." },
        { status: 400 }
      );
    }

    const normalized = normalizeUserPayload(body);

    if (normalized.error) {
      return NextResponse.json(
        { error: normalized.error },
        { status: 400 }
      );
    }

    const {
      display_name,
      email,
      role,
      is_admin,
    } = normalized.value;

    const pool = getPostgresConnection();

    const duplicate = await pool.query(
      `
        SELECT id
        FROM "dbo"."Users"
        WHERE LOWER(BTRIM(email)) = $1
        LIMIT 1
      `,
      [email]
    );

    if (duplicate.rows.length > 0) {
      return NextResponse.json(
        {
          error:
            "A user with this email address already exists.",
        },
        { status: 409 }
      );
    }

    const result = await pool.query(
      `
        INSERT INTO "dbo"."Users"
          (
            firebase_uid,
            email,
            display_name,
            role,
            is_admin,
            created_at,
            updated_at
          )
        VALUES
          (
            NULL,
            $1,
            $2,
            $3,
            $4,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        RETURNING ${USER_FIELDS}
      `,
      [
        email,
        display_name,
        role,
        is_admin,
      ]
    );

    return NextResponse.json(
      {
        message: "Invitation created successfully.",
        user: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    if (error?.code === "23505") {
      return NextResponse.json(
        {
          error:
            "A user with this email address already exists.",
        },
        { status: 409 }
      );
    }

    return apiError(
      error,
      "Failed to create user invitation."
    );
  }
}

// PUT /api/users
// Update a user's details and role.
export async function PUT(request) {
  try {
    const admin = await requireAdmin(request);

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must contain valid JSON." },
        { status: 400 }
      );
    }

    const id = Number(body?.id);

    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json(
        { error: "A valid user ID is required." },
        { status: 400 }
      );
    }

    const normalized = normalizeUserPayload(body);

    if (normalized.error) {
      return NextResponse.json(
        { error: normalized.error },
        { status: 400 }
      );
    }

    const {
      display_name,
      email,
      role,
      is_admin,
    } = normalized.value;

    const pool = getPostgresConnection();

    // Prevent the current administrator from locking themselves out.
    if (
      Number(admin.id) === id &&
      (role !== "staff" || !is_admin)
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot remove your own administrator access.",
        },
        { status: 400 }
      );
    }

    const duplicate = await pool.query(
      `
        SELECT id
        FROM "dbo"."Users"
        WHERE LOWER(BTRIM(email)) = $1
          AND id <> $2
        LIMIT 1
      `,
      [email, id]
    );

    if (duplicate.rows.length > 0) {
      return NextResponse.json(
        {
          error:
            "Another user already uses this email address.",
        },
        { status: 409 }
      );
    }

    const current = await pool.query(
      `
        SELECT id, role, is_admin
        FROM "dbo"."Users"
        WHERE id = $1
      `,
      [id]
    );

    if (current.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const wasAdmin =
      current.rows[0].role === "staff" &&
      current.rows[0].is_admin === true;

    const willBeAdmin =
      role === "staff" && is_admin;

    if (wasAdmin && !willBeAdmin) {
      const admins = await pool.query(`
        SELECT COUNT(*)::int AS count
        FROM "dbo"."Users"
        WHERE role = 'staff'
          AND is_admin = TRUE
      `);

      if (admins.rows[0].count <= 1) {
        return NextResponse.json(
          {
            error:
              "You cannot remove the last administrator.",
          },
          { status: 409 }
        );
      }
    }

    const result = await pool.query(
      `
        UPDATE "dbo"."Users"
        SET
          email = $1,
          display_name = $2,
          role = $3,
          is_admin = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING ${USER_FIELDS}
      `,
      [
        email,
        display_name,
        role,
        is_admin,
        id,
      ]
    );

    return NextResponse.json({
      message: "User updated successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    if (error?.code === "23505") {
      return NextResponse.json(
        {
          error:
            "Another user already uses this email address.",
        },
        { status: 409 }
      );
    }

    return apiError(error, "Failed to update user.");
  }
}

// DELETE /api/users?id=123
// Delete a user's database record.
export async function DELETE(request) {
  try {
    const admin = await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json(
        { error: "A valid user ID is required." },
        { status: 400 }
      );
    }

    if (Number(admin.id) === id) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();

    const target = await pool.query(
      `
        SELECT id, role, is_admin
        FROM "dbo"."Users"
        WHERE id = $1
      `,
      [id]
    );

    if (target.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    if (
      target.rows[0].role === "staff" &&
      target.rows[0].is_admin === true
    ) {
      const admins = await pool.query(`
        SELECT COUNT(*)::int AS count
        FROM "dbo"."Users"
        WHERE role = 'staff'
          AND is_admin = TRUE
      `);

      if (admins.rows[0].count <= 1) {
        return NextResponse.json(
          {
            error:
              "You cannot delete the last administrator.",
          },
          { status: 409 }
        );
      }
    }

    await pool.query(
      `
        DELETE FROM "dbo"."Users"
        WHERE id = $1
      `,
      [id]
    );

    return NextResponse.json({
      message: "User record deleted successfully.",
    });
  } catch (error) {
    return apiError(error, "Failed to delete user.");
  }
}
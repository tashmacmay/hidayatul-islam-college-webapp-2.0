import { getPostgresConnection } from "@/lib/db-postgres";

/**
 * Looks up Users.id for a list of email addresses.
 * Returns a Map<lowercasedEmail, userId>. Emails with no match are absent.
 */
export async function getUserIdsByEmail(emails) {
  const normalised = emails
    .map((email) => (email || "").toLowerCase().trim())
    .filter(Boolean);

  if (normalised.length === 0) return new Map();

  const pool = getPostgresConnection();

  const result = await pool.query(
    `
      SELECT
        id,
        LOWER(BTRIM(email)) AS email
      FROM "dbo"."Users"
      WHERE LOWER(BTRIM(email)) = ANY($1::text[])
    `,
    [normalised]
  );

  const map = new Map();

  for (const row of result.rows) {
    map.set(row.email, row.id);
  }

  return map;
}

/**
 * Upserts a single booking row keyed on ms_booking_id.
 * Returns "inserted" or "updated".
 *
 * Requires a UNIQUE constraint on "dbo"."bookings"(ms_booking_id).
 */
export async function upsertBooking(row) {
  const pool = getPostgresConnection();

  const values = [
    row.msBookingId,
    row.reference ?? null,
    row.parentId ?? null,
    row.parentEmail ?? null,
    row.parentName ?? null,
    row.learnerName ?? null,
    row.staffMsId ?? null,
    row.staffName ?? null,
    row.appointmentType ?? null,
    row.startAt,
    row.endAt,
    row.status,
    row.cancelledAt ?? null,
  ];

  const result = await pool.query(
    `
      INSERT INTO "dbo"."bookings" (
        ms_booking_id,
        reference,
        parent_id,
        customer_email,
        customer_name,
        learner_name,
        staff_ms_id,
        staff_name,
        appointment_type,
        start_at,
        end_at,
        status,
        cancelled_at,
        synced_at,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (ms_booking_id)
      DO UPDATE SET
        reference = EXCLUDED.reference,
        parent_id = EXCLUDED.parent_id,
        customer_email = EXCLUDED.customer_email,
        customer_name = EXCLUDED.customer_name,
        learner_name = EXCLUDED.learner_name,
        staff_ms_id = EXCLUDED.staff_ms_id,
        staff_name = EXCLUDED.staff_name,
        appointment_type = EXCLUDED.appointment_type,
        start_at = EXCLUDED.start_at,
        end_at = EXCLUDED.end_at,
        status = EXCLUDED.status,
        cancelled_at = EXCLUDED.cancelled_at,
        synced_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING (xmax = 0) AS inserted
    `,
    values
  );

  return result.rows[0].inserted ? "inserted" : "updated";
}

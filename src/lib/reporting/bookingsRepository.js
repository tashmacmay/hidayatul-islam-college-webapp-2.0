// src/lib/reporting/bookingsRepository.js
import sql from "mssql";
import { getConnection } from "@/lib/db";

/**
 * Looks up Users.id for a list of email addresses.
 * Returns a Map<lowercasedEmail, userId>. Emails with no match are absent.
 */
export async function getUserIdsByEmail(emails) {
  const normalised = emails
    .map((e) => (e || "").toLowerCase().trim())
    .filter(Boolean);

  if (normalised.length === 0) return new Map();

  const pool = await getConnection();
  const request = pool.request();

  // Build a parameterised IN clause
  const placeholders = normalised.map((_, i) => `@e${i}`).join(",");
  normalised.forEach((email, i) => {
    request.input(`e${i}`, sql.NVarChar(255), email);
  });

  const result = await request.query(`
    SELECT id, LOWER(LTRIM(RTRIM(email))) AS email
    FROM dbo.Users
    WHERE LOWER(LTRIM(RTRIM(email))) IN (${placeholders})
  `);

  const map = new Map();
  for (const row of result.recordset) {
    map.set(row.email, row.id);
  }
  return map;
}

/**
 * Upserts a single booking row keyed on ms_booking_id.
 * Returns "inserted" or "updated".
 */
export async function upsertBooking(row) {
  const pool = await getConnection();
  const request = pool.request();

  request.input("ms_booking_id", sql.NVarChar(255), row.msBookingId);
  request.input("reference", sql.NVarChar(50), row.reference);
  request.input("parent_id", sql.Int, row.parentId);
  request.input("customer_email", sql.NVarChar(255), row.parentEmail);
  request.input("customer_name", sql.NVarChar(255), row.parentName);
  request.input("learner_name", sql.NVarChar(255), row.learnerName);
  request.input("staff_ms_id", sql.NVarChar(128), row.staffMsId);
  request.input("staff_name", sql.NVarChar(255), row.staffName);
  request.input("appointment_type", sql.NVarChar(100), row.appointmentType);
  request.input("start_at", sql.DateTime2, row.startAt);
  request.input("end_at", sql.DateTime2, row.endAt);
  request.input("status", sql.NVarChar(20), row.status);
  request.input("cancelled_at", sql.DateTime2, row.cancelledAt);
  request.input("synced_at", sql.DateTime2, new Date());
  request.input("created_at", sql.DateTime2, new Date());
  request.input("updated_at", sql.DateTime2, new Date());

  // UPDATE first — if no row matched, INSERT.
  const updateResult = await request.query(`
    UPDATE dbo.bookings SET
      reference         = @reference,
      parent_id         = @parent_id,
      customer_email    = @customer_email,
      customer_name     = @customer_name,
      learner_name      = @learner_name,
      staff_ms_id       = @staff_ms_id,
      staff_name        = @staff_name,
      appointment_type  = @appointment_type,
      start_at          = @start_at,
      end_at            = @end_at,
      status            = @status,
      cancelled_at      = @cancelled_at,
      synced_at         = @synced_at,
      updated_at        = @updated_at
    WHERE ms_booking_id = @ms_booking_id
  `);

  if (updateResult.rowsAffected[0] > 0) return "updated";

  // No existing row — insert. Note: created_at / updated_at have defaults.
  await request.query(`
    INSERT INTO dbo.bookings (
      ms_booking_id, reference, parent_id,
      customer_email, customer_name, learner_name,
      staff_ms_id, staff_name, appointment_type,
      start_at, end_at, status, cancelled_at, synced_at,
      created_at, updated_at
    ) VALUES (
      @ms_booking_id, @reference, @parent_id,
      @customer_email, @customer_name, @learner_name,
      @staff_ms_id, @staff_name, @appointment_type,
      @start_at, @end_at, @status, @cancelled_at, @synced_at,
      @created_at, @updated_at
    )
  `);

  return "inserted";
}
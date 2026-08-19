import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

// ============================================================
// BOOKINGS API
// ============================================================
// Purpose:
// Handles retrieving and creating bookings for the parent
// My Bookings section.
//
// IMPORTANT:
// The actual SQL Bookings table is still being finalised.
//
// Search for:
//     connectBookingTable
//
// The database team should update the marked sections once
// the final SQL table and column names are confirmed.
// ============================================================


// ============================================================
// GET BOOKINGS
// ============================================================
// Retrieves bookings that will be displayed on the parent's
// My Bookings page.
//
// connectBookingTable
//
// Once the SQL table is confirmed, this query should be updated
// to retrieve bookings belonging to the logged-in parent.
//
// At the moment, authentication is not being enforced here
// because the database/auth integration is still being finalised.
// ============================================================

export async function GET(req) {
  try {
    const pool = await getConnection();

    // ==========================================================
    // connectBookingTable
    // ==========================================================
    // TODO:
    // Connect this query to the final SQL Bookings table.
    //
    // The final version should filter bookings by the
    // authenticated parent's ID / Firebase UID / email,
    // depending on the database design.
    //
    // Example:
    //
    // SELECT *
    // FROM Bookings
    // WHERE parent_id = @parentId
    // ORDER BY booking_date DESC
    //
    // Do not assume the column names until the SQL table
    // has been confirmed.
    // ==========================================================

    const result = await pool.request().query(`
      SELECT *
      FROM Bookings
      ORDER BY id DESC
    `);

    return NextResponse.json({
      bookings: result.recordset,
    });

  } catch (error) {

    console.error(
      "❌ Error retrieving bookings:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to retrieve bookings",
        details: error.message,
      },
      { status: 500 }
    );
  }
}


// ============================================================
// CREATE BOOKING
// ============================================================
// Creates a new booking.
//
// IMPORTANT:
// Because Microsoft Bookings is currently the actual booking
// system, this endpoint should NOT be considered the final
// booking-creation implementation yet.
//
// connectBookingTable
//
// Once the team confirms how Microsoft Bookings connects to
// SQL Server, this section can either:
// 1. Insert directly into SQL, or
// 2. Send the booking through the Microsoft Bookings/API
//    integration and then store the relevant information
//    in SQL.
// ============================================================

export async function POST(req) {
  try {

    const body = await req.json();

    // ==========================================================
    // Booking information expected from the frontend
    // ==========================================================

    const {
      appointmentType,
      learner,
      date,
      startTime,
      endTime,
      staff,
    } = body;


    // ==========================================================
    // Basic validation
    // ==========================================================

    if (
      !appointmentType ||
      !learner ||
      !date ||
      !startTime
    ) {
      return NextResponse.json(
        {
          error: "Required booking information is missing",
        },
        { status: 400 }
      );
    }


    const pool = await getConnection();


    // ==========================================================
    // connectBookingTable
    // ==========================================================
    // TODO:
    // Replace this with the final SQL INSERT once the
    // Bookings table structure is confirmed.
    //
    // Example:
    //
    // INSERT INTO Bookings (
    //   parent_id,
    //   learner_id,
    //   appointment_type,
    //   booking_date,
    //   start_time,
    //   end_time,
    //   staff_id,
    //   status
    // )
    // VALUES (
    //   @parentId,
    //   @learnerId,
    //   @appointmentType,
    //   @date,
    //   @startTime,
    //   @endTime,
    //   @staffId,
    //   'Upcoming'
    // );
    //
    // ==========================================================

    const result = await pool
      .request()
      .input("appointmentType", appointmentType)
      .input("learner", learner)
      .input("date", date)
      .input("startTime", startTime)
      .input("endTime", endTime || null)
      .input("staff", staff || null)
      .query(`
        INSERT INTO Bookings (
          appointment_type,
          learner,
          booking_date,
          start_time,
          end_time,
          staff
        )
        OUTPUT INSERTED.*
        VALUES (
          @appointmentType,
          @learner,
          @date,
          @startTime,
          @endTime,
          @staff
        )
      `);


    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking: result.recordset[0],
      },
      { status: 201 }
    );

  } catch (error) {

    console.error(
      "❌ Error creating booking:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create booking",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
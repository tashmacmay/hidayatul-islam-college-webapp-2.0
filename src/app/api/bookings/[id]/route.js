import { NextResponse } from 'next/server';
import { //Import the necessary functions from graphHelper to do the job: 
  initializeGraphForAppOnlyAuth,
  cancelBookingAsync,
} from '@/lib/graph/graphHelper';

export async function DELETE(request, { params }) {
  try {
    const { id } = params; //Booking's Graph id - found as this page is through id URL

    if (!id) { //If no ID found:
      return NextResponse.json({ error: 'Missing booking id' }, { status: 400 });
    }

    initializeGraphForAppOnlyAuth(); //Calls to initialise graphHelper: make Client Secret Credential to make Microsoft Graph Client
    await cancelBookingAsync(id); //Cancel the booking!

    return NextResponse.json({ success: true, id }); //Return JSON
  } catch (error) {
    console.error('CANCEL BOOKING ERROR:', error);
    return NextResponse.json(
      {
        error: 'Failed to cancel booking',
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
        body: error.body,
      },
      { status: error.statusCode || 500 }
    );
  }
}

/*import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

// ============================================================
// GET SINGLE BOOKING
// ============================================================
// Purpose:
// Retrieves one booking using its booking ID.
//
// TODO:
// connectBookingTable
//
// Once the SQL Bookings table is finalised, update the query
// below to match the actual table name and column names.
// ============================================================

export async function GET(req, { params }) {
  try {
    const pool = await getConnection();

    const { id } = params;

    // ==========================================================
    // connectBookingTable
    // ==========================================================
    // Replace the placeholder query below once the SQL
    // Bookings table structure has been confirmed.
    //
    // Example:
    //
    // SELECT *
    // FROM Bookings
    // WHERE id = @id
    //
    // Do NOT assume column names until the database structure
    // has been confirmed by the database team.
    // ==========================================================

    const result = await pool
      .request()
      .input("id", id)
      .query(`
        SELECT *
        FROM Bookings
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        {
          error: "Booking not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(result.recordset[0]);

  } catch (error) {
    console.error(
      "❌ Error retrieving booking:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to retrieve booking",
        details: error.message,
      },
      { status: 500 }
    );
  }
}


// ============================================================
// DELETE / CANCEL BOOKING
// ============================================================
// Purpose:
// Cancels a booking.
//
// IMPORTANT:
// This should only be activated once the SQL booking table
// and cancellation rules have been confirmed.
//
// connectBookingTable
// ============================================================

export async function DELETE(req, { params }) {
  try {
    const pool = await getConnection();

    const { id } = params;

    // ==========================================================
    // connectBookingTable
    // ==========================================================
    // The database team should confirm whether cancelling a
    // booking means:
    //
    // 1. DELETE the record
    // 2. UPDATE status = 'Cancelled'
    // 3. Update another cancellation field
    //
    // For now, we use a status update as the safer approach.
    // ==========================================================

    const result = await pool
      .request()
      .input("id", id)
      .query(`
        UPDATE Bookings
        SET status = 'Cancelled'
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json(
        {
          error: "Booking not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Booking cancelled successfully",
    });

  } catch (error) {
    console.error(
      "❌ Error cancelling booking:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to cancel booking",
        details: error.message,
      },
      { status: 500 }
    );
  }
}*/
//Adapting index.js from https://learn.microsoft.com/en-us/graph/tutorials/javascript-app-only to Next.js webapp
import { NextResponse } from 'next/server';
//Verifies Firebase token AND looks user up in SQL
import { verifyUser } from '@/lib/auth';

import { //Importing "export"ed functions from the graphHelper
  initializeGraphForAppOnlyAuth,
  getBookingsAsync,
  formatParentBooking,
} from '@/lib/graph/graphHelper';

export async function GET(request) { //Receives "request" to read Authorization header
  try {
    //Identify the caller:
    let user;
    try {
      user = await verifyUser(request); //Reads the "Authorization: Bearer <token>" header
    } catch (error) {
      //No valid token or no matching SQL row
      return NextResponse.json(
        { error: error.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    //Normalise the email from the token (comparisons later are safe)
    const email = (user.email || '').toLowerCase().trim();
    if (!email) {
      //Valid token, but no email attatched - needed for filtering!
      return NextResponse.json(
        { error: 'No email on token' },
        { status: 400 }
      );
    }

    initializeGraphForAppOnlyAuth(); //Calls to initialise graphHelper: make Client Secret Credential to make Microsoft Graph Client

    const response = await getBookingsAsync(); //Calls graphHelper to return MS Bookings data

    //Filter the bookings by logged-in email:
    //Filter BEFORE mapping because formatParentBooking() drops email field
    const mine = response.value.filter((booking) => {
      const bookerEmail = (
        booking.customerEmailAddress ||
        booking.customers?.[0]?.emailAddress || //in case there are multiple guests - unlikely - but check here
        '' //MS Bookings page will require email field, but this is safety net
      ).toLowerCase().trim();

      return bookerEmail === email;
    });

    //Map remaining bookings to UI shape:
    const bookings = mine.map(formatParentBooking); //Booking data isnt in right formation for the ui db table -> map to right cogfiguration!

    return NextResponse.json(bookings); //In response to GET(), return the data through Next.js as JSON

  } catch (error) {
    console.error('FULL GRAPH ERROR:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve Microsoft Bookings',
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
        body: error.body,
      },
      { status: error.statusCode || 500 }
    );
  }
}
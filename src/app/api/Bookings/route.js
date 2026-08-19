//Adapting index.js from https://learn.microsoft.com/en-us/graph/tutorials/javascript-app-only to Next.js webapp
import { NextResponse } from 'next/server';

import { //Importing "export"ed functions from the graphHelper
  initializeGraphForAppOnlyAuth,
  getBookingsAsync,
} from '@/lib/graph/graphHelper';

export async function GET() {
  try {
    initializeGraphForAppOnlyAuth(); //Calls to initialises graphHelper
    
    //const token = await getAppOnlyTokenAsync();
    //console.log('Token acquired successfully');
    //console.log('Token length:', token?.length);

    const bookings = await getBookingsAsync(); //Calls graphHelper to return MS Bookings data
    //const bookings = mockBookings; //^ TEMP REPLACEMENT for getBooking... - DO NOT treat as official shape of booking data returned (only mock data)
    
    //await saveBookings(bookings); //Actual booking data
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
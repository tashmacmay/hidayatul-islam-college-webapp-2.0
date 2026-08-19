//Adapting index.js from https://learn.microsoft.com/en-us/graph/tutorials/javascript-app-only to Next.js webapp
import { NextResponse } from 'next/server';

import { //Importing "export"ed functions from the graphHelper
  initializeGraphForAppOnlyAuth,
  getBookingsAsync,
} from '@/lib/graph/graphHelper';

export async function GET() {
  try {
    initializeGraphForAppOnlyAuth(); //Calls to initialises graphHelper

    const response = await getBookingsAsync(); //Calls graphHelper to return MS Bookings data
    
    const bookings = response.value.map((booking) => { //HOWEVER Booking data isnt in right formation for the ui db table -> map to right cogfiguration!
      const learnerAnswer =
        booking.customers?.[0]?.customQuestionAnswers?.find(
          (answer) =>
            answer.question === "Learner's Full Name"
        );

      const start = new Date(
        booking.startDateTime.dateTime
      );

      const end = new Date(
        booking.endDateTime.dateTime
      );
      return {
        id: booking.id,

        ref: booking.selfServiceAppointmentId,

        date: start.toLocaleDateString(),

        time: `${start.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })} - ${end.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`,

        appointmentType: booking.serviceName,

        learner: learnerAnswer?.answer || booking.customerName,

        staff: booking.staffMemberIds?.[0] || "Unassigned",

        status:
          start >= new Date()
            ? "upcoming"
            : "past",
      };
    });
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
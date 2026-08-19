//Adapting index.js from https://learn.microsoft.com/en-us/graph/tutorials/javascript-app-only to Next.js webapp
//import { keyInSelect } from 'readline-sync';
//import settings from './appSettings.js';
import { NextResponse } from 'next/server';

import {
  initializeGraphForAppOnlyAuth,
  getBookingBusinessesAsync,
  getAppOnlyTokenAsync,
  //getUsersAsync,
  //makeGraphCallAsync,
} from '@/lib/graph/graphHelper';

// async function main() {
//   console.log('JavaScript Graph App-Only Tutorial');

//   let choice = 0;

//   // Initialize Graph
//   initializeGraph(settings);

//   const choices = ['Display access token', 'List users', 'Make a Graph call'];

//   while (choice != -1) {
//     choice = keyInSelect(choices, 'Select an option', { cancel: 'Exit' });

//     switch (choice) {
//       case -1:
//         // Exit
//         console.log('Goodbye...');
//         break;
//       case 0:
//         // Display access token
//         await displayAccessTokenAsync();
//         break;
//       case 1:
//         // List emails from user's inbox
//         await listUsersAsync();
//         break;
//       case 2:
//         // Run any Graph code
//         await doGraphCallAsync();
//         break;
//       default:
//         console.log('Invalid choice! Please try again.');
//     }
//   }
// }

//main();

// function initializeGraph(settings) {
//   initializeGraphForAppOnlyAuth(settings); //creates a new instance of ClientSecretCredential, then uses that instance to create a new instance of Client
// // }
// import {
//     initializeGraphForOnlyAuth
// } from '@/lib/graph/graphHelper.js';

export async function GET() {
  try {
    initializeGraphForAppOnlyAuth();

    const token = await getAppOnlyTokenAsync();

    console.log('Token acquired successfully');
    console.log('Token length:', token?.length);

    const bookingBusinesses = await getBookingBusinessesAsync();

    return NextResponse.json(bookingBusinesses);

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

// async function displayAccessTokenAsync() {
//   try {
//     const appOnlyToken = await getAppOnlyTokenAsync();
//     console.log(`App-only token: ${appOnlyToken}`);
//   } catch (err) {
// //     console.log(`Error getting app-only access token: ${err}`);
// //   }
// // }

// async function listUsersAsync() {
//   // TODO
// }

// async function doGraphCallAsync() {
//   // TODO
// }
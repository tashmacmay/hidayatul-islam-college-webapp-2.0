//File created with https://learn.microsoft.com/en-us/graph/tutorials/javascript-app-only
//And adapted for Next.js

import 'isomorphic-fetch';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
// prettier-ignore
import { TokenCredentialAuthenticationProvider } from
  '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js';

//Declares two private properties for initialising Graph: ClientSecretCredential object & Client object (outside of the initializeGraphForAppOnlyAuth() function as to persist)
let _clientSecretCredential = undefined;
let _appClient = undefined;
const BOOKING_BUSINESS_ID =
  'HidayatulIslamCollegeParentMeetings@Hidayatulcpt.onmicrosoft.com';
let _staffMemberLookup = null;

//Creates the Client Secret Credential, then creates the Microsoft Graph Client using that credential
export function initializeGraphForAppOnlyAuth() {
  if (!_clientSecretCredential) { //Is there already a Client Secret Credential? If not:
    _clientSecretCredential = new ClientSecretCredential( //Make a new one! Using our secret IDs from .env.local
      process.env.MS_TENANT_ID,
      process.env.MS_CLIENT_ID,
      process.env.MS_CLIENT_SECRET
    );
  }

  if (!_appClient) { //Is there already an App Client? If not: 
    const authProvider = new TokenCredentialAuthenticationProvider( //Create an Authentication Provider, using:
      _clientSecretCredential, //Client Secret Credentials created above this block ^
      {
        scopes: ['https://graph.microsoft.com/.default'],
      },
    );

    _appClient = Client.initWithMiddleware({ //Creates actual Microsoft Graph Client using ^ Auth Provider (with our Client Secret Credentials)
      authProvider: authProvider,
    });
  }
}

//Gets the Microsoft Bookings appointments available to the application
export async function getBookingsAsync() {
  if (!_appClient) { //Ensure that the Microsoft Graph Client has been created
    throw new Error('Graph has not been initialized for app-only auth');
  }

  return _appClient
    .api(`/solutions/bookingBusinesses/${BOOKING_BUSINESS_ID}/appointments`) //Interact with Microsoft Graph endpoint 
    .get(); //Perform an HTTP GET request
}

//Fetches (and caches) staff members for the Bookings page.
//byID: parent view renders the teacher's name from a booking's staffMemberIds bookings can be filtered the same way the parent view filters by email
export async function getStaffMemberLookupAsync() {
  if (!_appClient) {
    throw new Error('Graph has not been initialized for app-only auth');
  }

  if (_staffMemberLookup) {
    return _staffMemberLookup;
  }

  const response = await _appClient
    .api(`/solutions/bookingBusinesses/${BOOKING_BUSINESS_ID}/staffMembers`)
    .get();

  const byId = new Map();
  const byEmail = new Map();

  for (const staff of response.value) {
    byId.set(staff.id, {
      id: staff.id,
      displayName: staff.displayName,
      emailAddress: staff.emailAddress,
    });

    if (staff.emailAddress) {
      byEmail.set(staff.emailAddress.toLowerCase().trim(), staff.id);
    }
  }

  _staffMemberLookup = { byId, byEmail };
  return _staffMemberLookup;
}

//Fetches a single appointment by Graph id. Used by the DELETE routes
//to verify ownership before cancelling.
export async function getAppointmentAsync(appointmentId) {
  if (!_appClient) {
    throw new Error('Graph has not been initialized for app-only auth');
  }

  return _appClient
    .api(`/solutions/bookingBusinesses/${BOOKING_BUSINESS_ID}/appointments/${appointmentId}`)
    .get();
}

export async function cancelBookingAsync(appointmentId) {
  if (!_appClient) { //Ensure that the Microsoft Graph Client has been created
    throw new Error('Graph has not been initialized for app-only auth');
  }

  return _appClient
    .api( //"Cancel" API call to MS Booking with variable ID 
      `/solutions/bookingBusinesses/${BOOKING_BUSINESS_ID}/appointments/${appointmentId}/cancel`
    )
    .post({ //Document how booking was cancelled for documentation
      cancellationMessage: 'Cancelled by user via portal',
    });
}

function getStaffDisplayName(booking, staffLookup) {
  const staffId = booking.staffMemberIds?.[0];
  if (!staffId) return 'Unassigned';
  const staff = staffLookup?.byId?.get(staffId);
  return staff?.displayName || staffId;
}

export function formatParentBooking(booking, staffLookup) {
  const learnerAnswer = booking.customers?.[0]?.customQuestionAnswers?.find(
    (answer) => answer.question === "Learner's Full Name"
  );

  const start = new Date(booking.startDateTime.dateTime);
  const end = new Date(booking.endDateTime.dateTime);

  return {
    id: booking.id,
    ref: booking.selfServiceAppointmentId,
    date: start.toLocaleDateString(),
    startDateTime: start.toISOString(),
    time: `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    appointmentType: booking.serviceName,
    learner: learnerAnswer?.answer || booking.customerName,
    staff: getStaffDisplayName(booking, staffLookup),
    status: start >= new Date() ? "upcoming" : "past",
  };
}

export function formatStaffBooking(booking, staffLookup) {
  const base = formatParentBooking(booking, staffLookup);

  const parentEmail =
    booking.customerEmailAddress ||
    booking.customers?.[0]?.emailAddress ||
    "";

  const parentName =
    booking.customerName ||
    booking.customers?.[0]?.displayName ||
    "";

  return {
    ...base,
    parentEmail,
    parentName,
  };
}
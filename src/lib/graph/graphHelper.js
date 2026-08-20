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
    .api('/solutions/bookingBusinesses/HidayatulIslamCollegeBookings@HidayatulProject.onmicrosoft.com/appointments') //Interact with Microsoft Graph endpoint 
    .get(); //Perform an HTTP GET request
}


export async function cancelBookingAsync(appointmentId) {
  if (!_appClient) { //Ensure that the Microsoft Graph Client has been created
    throw new Error('Graph has not been initialized for app-only auth');
  }

  return _appClient
    .api( //"Cancel" API call to MS Booking with variable ID 
      `/solutions/bookingBusinesses/HidayatulIslamCollegeBookings@HidayatulProject.onmicrosoft.com/appointments/${appointmentId}/cancel`
    )
    .post({ //Document how booking was cancelled for documentation
      cancellationMessage: 'Cancelled by user via portal',
    });
}
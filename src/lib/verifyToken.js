// src/lib/verifyToken.js
import { createRemoteJWKSet, jwtVerify } from 'jose';

const PROJECT_ID = 'hidayatul-islam-college-webapp';

const JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

/**
 * Verifies a Firebase ID token and returns its payload.
 */
export async function verifyFirebaseToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });

    return payload;
  } catch (error) {
    console.error(
      'Token verification failed:',
      error.message
    );

    throw new Error('Invalid token');
  }
}
// lib/verifyToken.js
import { createRemoteJWKSet, jwtVerify } from 'jose';

// Firebase project ID from your config
const PROJECT_ID = 'hidayatul-islam-college-webapp';

// Build the JWKS URL for Firebase
const JWKS_URL = `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`;

// Create a remote JWKS set (caches keys automatically)
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

/**
 * Verifies a Firebase ID token and returns the decoded payload.
 * @param {string} token - The ID token (JWT) from the client.
 * @returns {Promise<object>} - Decoded token payload.
 */
export async function verifyFirebaseToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid token');
  }
}
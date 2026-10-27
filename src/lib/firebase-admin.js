// lib/firebase-admin.js
import admin from 'firebase-admin';
import serviceAccount from '../serviceAccountKey.json' assert { type: 'json' };

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK initialized from JSON file');
  } catch (error) {
    console.error('❌ Firebase Admin init error:', error);
    throw error;
  }
}

export const authAdmin = admin.auth();
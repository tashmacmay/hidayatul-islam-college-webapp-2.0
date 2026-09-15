import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration (copied from your code)
const firebaseConfig = {
  apiKey: "AIzaSyA5SIjnJVrxelQGZvpJ2rjbiN77yQOyz3k",
  authDomain: "hidayatul-islam-college-webapp.firebaseapp.com",
  projectId: "hidayatul-islam-college-webapp",
  storageBucket: "hidayatul-islam-college-webapp.firebasestorage.app",
  messagingSenderId: "200753960506",
  appId: "1:200753960506:web:811d1a14010674cfae4703"
};

const app = initializeApp(firebaseConfig);

// Export auth and Google provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
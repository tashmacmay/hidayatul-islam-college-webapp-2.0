// lib/googleSignIn.js
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

// Toggle this to true if popup-based sign-in keeps failing for a user
const USE_REDIRECT_FLOW = false;

export function startGoogleSignIn() {
  if (USE_REDIRECT_FLOW) {
    return signInWithRedirect(auth, googleProvider);
  }
  return signInWithPopup(auth, googleProvider);
}

export function checkRedirectResult() {
  if (!USE_REDIRECT_FLOW) return Promise.resolve(null);
  return getRedirectResult(auth);
}
"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/public/navbar";
import Footer from "@/components/public/footer";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function ActivateAccountPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Controls whether the activation form or success message is displayed.
  const [activationComplete, setActivationComplete] = useState(false);

  /**
   * Safely reads an API response.
   * This prevents an empty or invalid response from causing
   * an "Unexpected end of JSON input" error.
   */
  const readResponse = async (response) => {
    const responseText = await response.text();

    if (!responseText) {
      return {};
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return {
        error: "The server returned an unexpected response. Please try again.",
      };
    }
  };

  /**
   * Activates the user's account.
   *
   * 1. Create a Firebase account using the supplied email and password.
   * 2. If the Firebase account already exists, attempt to sign in instead.
   * 3. Obtain a fresh Firebase ID token.
   * 4. Send the token to the backend to link the Firebase UID
   *    to the existing user record in Neon.
   * 5. Sign the user out and display the success message.
   *
   * Email verification is intentionally not required in this prototype.
   */
  const handleActivateAccount = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    // Validate the passwords before communicating with Firebase.
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Your password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      let firebaseUser;

      /*
       * Step 1: Create the Firebase account.
       *
       * If the Firebase account already exists, sign in using
       * the supplied credentials. This allows users to retry
       * activation if their previous attempt was interrupted.
       */
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          password
        );

        firebaseUser = userCredential.user;
      } catch (createError) {
        if (createError.code !== "auth/email-already-in-use") {
          throw createError;
        }

        // An account already exists, so attempt to sign in.
        const signInCredential = await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          password
        );

        firebaseUser = signInCredential.user;
      }

      /*
       * Step 2: Obtain a fresh Firebase ID token.
       *
       * The server uses this signed token to identify the Firebase
       * user. The UID and email are not accepted from the client.
       */
      const token = await firebaseUser.getIdToken(true);

      /*
       * Step 3: Link the Firebase account to the existing Neon record.
       *
       * The backend checks that the token email matches an invitation
       * created by an administrator before linking the Firebase UID.
       */
      const linkResponse = await fetch("/api/users/link", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const linkData = await readResponse(linkResponse);

      if (!linkResponse.ok) {
        throw new Error(
          linkData.error || "Unable to link your account."
        );
      }

      /*
       * Step 4: Sign the user out.
       *
       * Activation and login are separate steps. Signing out here
       * ensures the user can use the login page to access the system.
       *
       * A sign-out error should not undo a successful backend link.
       */
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.warn(
          "The account was linked, but automatic sign-out failed:",
          signOutError
        );
      }

      /*
       * Step 5: Display the success screen.
       *
       * Do not redirect automatically. The user must click
       * "Already have an account? Sign in" to continue.
       */
      setActivationComplete(true);
    } catch (err) {
      console.error("Account activation error:", err);

      switch (err.code) {
        case "auth/email-already-in-use":
          setError(
            "An account already exists with this email address. " +
              "Please sign in using the password you previously created."
          );
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          setError(
            "The password is too weak. Please choose a stronger password."
          );
          break;

        case "auth/operation-not-allowed":
          setError(
            "Email and password accounts are currently unavailable. " +
              "Please contact an administrator."
          );
          break;

        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setError(
            "The email or password is incorrect. If you have already " +
              "created your account, check your password."
          );
          break;

        case "auth/too-many-requests":
          setError(
            "There have been too many attempts. Please wait a while before trying again."
          );
          break;

        default:
          setError(
            err.message ||
              "Unable to activate your account. Please try again."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-off-white px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">

            {/* SUCCESS SCREEN */}
            {activationComplete ? (
              <div className="text-center">
                {/* Success icon */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <CheckCircle2 className="h-9 w-9" />
                </div>

                <h1 className="mt-5 text-3xl font-bold text-navy">
                  Account Activated!
                </h1>

                <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gold" />

                <p className="mt-6 text-text-muted leading-relaxed">
                  Your Hidayatul College account has been successfully
                  activated.
                </p>

                <p className="mt-3 text-sm text-text-muted">
                  You can now sign in using your email address and the
                  password you just created.
                </p>

                {/* Go to login */}
                <a
                  href="/login"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3 font-semibold text-navy transition hover:bg-gold-light focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
                >
                  Already have an account? Sign in
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            ) : (
              <>
                {/* ACTIVATION FORM HEADER */}
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <UserPlus className="h-7 w-7" />
                  </div>

                  <h1 className="mt-4 text-3xl font-bold text-navy">
                    Activate Your Account
                  </h1>

                  <p className="mt-2 text-text-muted">
                    Create a password to access your Hidayatul College account.
                  </p>

                  <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gold" />
                </div>

                {/* ERROR MESSAGE */}
                {error && (
                  <div
                    role="alert"
                    className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200"
                  >
                    {error}
                  </div>
                )}

                {/* ACTIVATION FORM */}
                <form
                  onSubmit={handleActivateAccount}
                  className="mt-8 space-y-6"
                >
                  {/* Email address */}
                  <div>
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
                        <Mail className="h-5 w-5" />
                      </div>

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="form-input pl-10"
                        placeholder="you@example.com"
                        disabled={loading}
                      />
                    </div>

                    <p className="mt-2 text-xs text-text-muted">
                      Enter the email address that was registered for your
                      account.
                    </p>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="form-label">
                      Create Password
                    </label>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
                        <Lock className="h-5 w-5" />
                      </div>

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="form-input pl-10 pr-10"
                        placeholder="••••••••"
                        disabled={loading}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-navy"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-text-muted">
                      Password must contain at least 6 characters.
                    </p>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password
                    </label>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
                        <Lock className="h-5 w-5" />
                      </div>

                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="form-input pl-10 pr-10"
                        placeholder="••••••••"
                        disabled={loading}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-navy"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit activation */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-gold py-3 font-semibold text-navy transition hover:bg-gold-light focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Activating Account..." : "Create Account"}
                  </button>
                </form>

                {/* Existing account link */}
                <div className="mt-6 text-center">
                  <a
                    href="/login"
                    className="text-sm font-semibold text-gold hover:underline"
                  >
                    Already have an account? Sign in
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
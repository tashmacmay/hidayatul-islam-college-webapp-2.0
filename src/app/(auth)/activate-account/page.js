// src/app/(auth)/activate-account/page.js

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/public/navbar";
import Footer from "@/components/public/footer";
import { Mail, Lock, Eye, EyeOff, UserPlus } from "lucide-react";

export default function ActivateAccountPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * --------------------------------------------------------------------------
   * Redirect the newly activated user according to their SQL role
   * --------------------------------------------------------------------------
   *
   * Mirrors the logic in the login page:
   *  - Firebase handles authentication
   *  - Azure SQL determines the application role
   *  - The Firebase ID token (and UID) is sent to /api/user-role
   */
  const redirectBasedOnRole = async (user) => {
    try {
      const token = await user.getIdToken();

      const res = await fetch(`/api/user-role?uid=${user.uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let errorMessage = "Unable to determine your user role.";
        try {
          const errorData = await res.json();
          if (errorData?.error) errorMessage = errorData.error;
        } catch {
          // Non-JSON response — keep the default message.
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();

      // Parent users
      if (data.role === "parent") {
        router.push("/dashboard");
        return;
      }

      // Staff users
      if (data.role === "staff") {
        if (data.is_admin) {
          router.push("/staff/notices");
        } else {
          router.push("/staff/dashboard");
        }
        return;
      }

      // Unknown role
      throw new Error(
        "Your account does not have a valid application role. Please contact an administrator."
      );
    } catch (err) {
      console.error("Role redirect error:", err);

      /*
       * The Firebase account may have been created, but if the SQL
       * record cannot be resolved, sign the user back out of Firebase.
       */
      await signOut(auth);

      throw err;
    }
  };

  /*
   * --------------------------------------------------------------------------
   * Account activation
   * --------------------------------------------------------------------------
   *
   * 1. Firebase creates the email/password account.
   * 2. Firebase generates the UID.
   * 3. The Firebase ID token is sent to /api/users/link.
   * 4. The server extracts the UID from the verified token.
   * 5. The server links the UID to the existing SQL Users record.
   */
  const handleActivateAccount = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    // Basic password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Early client-side password length check (Firebase also requires 6+)
    if (password.length < 6) {
      setError("Your password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      /*
       * ----------------------------------------------------------------------
       * Step 1:
       * Create the Firebase email/password account.
       * If the account already exists, sign in instead.
       * ----------------------------------------------------------------------
       */
      let firebaseUser;

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        firebaseUser = userCredential.user;
      } catch (createError) {
        if (createError.code !== "auth/email-already-in-use") {
          throw createError;
        }

        const signInCredential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        firebaseUser = signInCredential.user;
      }

      /*
       * ----------------------------------------------------------------------
       * Step 2:
       * Get the Firebase ID token.
       * ----------------------------------------------------------------------
       */
      const token = await firebaseUser.getIdToken();

      /*
       * ----------------------------------------------------------------------
       * Step 3:
       * Ask the server to link the Firebase account to the existing
       * SQL Users record.
       *
       * IMPORTANT:
       * We deliberately do NOT send firebaseUser.uid in the request body.
       * The server obtains the UID from the verified Firebase token.
       * ----------------------------------------------------------------------
       */
      const linkResponse = await fetch("/api/users/link", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Defensive JSON parsing — never let a non-JSON response crash us.
      let linkData = {};
      try {
        linkData = await linkResponse.json();
      } catch {
        linkData = {};
      }

      /*
       * ----------------------------------------------------------------------
       * Step 4:
       * If linking failed, don't allow the Firebase account to remain
       * logged in.
       * ----------------------------------------------------------------------
       */
      if (!linkResponse.ok) {
        await signOut(auth);
        throw new Error(
          linkData.error || "Unable to link your account."
        );
      }

      /*
       * ----------------------------------------------------------------------
       * Step 5:
       * Firebase UID has now been linked to SQL.
       * ----------------------------------------------------------------------
       */
      setSuccess("Your account has been activated successfully.");

      /*
       * ----------------------------------------------------------------------
       * Step 6:
       * Redirect according to the role stored in SQL.
       * ----------------------------------------------------------------------
       */
      await redirectBasedOnRole(firebaseUser);
    } catch (err) {
      console.error("Account activation error:", err);

      switch (err.code) {
        case "auth/email-already-in-use":
          setError(
            "An account already exists with this email address. Please return to the login page and sign in."
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
            "Email and password accounts are currently unavailable. Please contact an administrator."
          );
          break;

        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setError(
            "An account may already exist with this email. Please check your password or reset it before trying again."
          );
          break;

        default:
          setError(
            err.message ||
              "Unable to activate your account. Please try again."
          );
      }

      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-off-white px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
            {/* Header */}
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

            {/* Error */}
            {error && (
              <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mt-6 rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                {success}
              </div>
            )}

            {/* Activation form */}
            <form
              onSubmit={handleActivateAccount}
              className="mt-8 space-y-6"
            >
              {/* Email */}
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
                  Enter the email address that was registered for your account.
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

              {/* Activate */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gold py-3 font-semibold text-navy transition hover:bg-gold-light focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Activating account..." : "Activate Account"}
              </button>
            </form>

            {/* Back to login */}
            <div className="mt-6 text-center">
              <a
                href="/login"
                className="text-sm font-semibold text-gold hover:underline"
              >
                Already have an account? Sign in
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
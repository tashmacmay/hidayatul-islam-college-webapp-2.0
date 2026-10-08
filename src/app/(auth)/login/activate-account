"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
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
   */
  const redirectBasedOnRole = async (user) => {
    try {
      const token = await user.getIdToken();

      const response = await fetch("/api/user-role", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.error || "Unable to determine your user role."
        );
      }

      const data = await response.json();

      /*
       * Parent
       */
      if (data.role === "parent") {
        router.push("/dashboard");
        return;
      }

      /*
       * Staff
       */
      if (data.role === "staff") {
        if (data.is_admin) {
          router.push("/staff/notices");
        } else {
          router.push("/staff/dashboard");
        }

        return;
      }

      throw new Error(
        "Your account does not have a valid application role."
      );
    } catch (err) {
      console.error("Role redirect error:", err);

      /*
       * The Firebase account may have been created,
       * but if the SQL account cannot be resolved,
       * sign the user back out.
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

    /*
     * Basic password confirmation
     */
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    /*
     * Firebase requires passwords to meet its password
     * requirements. We also provide an early client-side
     * check for a better user experience.
     */
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
       * ----------------------------------------------------------------------
       *
       * Firebase automatically generates the UID.
       */
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const firebaseUser = userCredential.user;

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
       * Ask the server to link the Firebase account
       * to the existing SQL Users record.
       * ----------------------------------------------------------------------
       *
       * IMPORTANT:
       *
       * We deliberately do NOT send firebaseUser.uid
       * in the request body.
       *
       * The server obtains the UID from the verified
       * Firebase token.
       */
      const linkResponse = await fetch("/api/users/link", {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const linkData = await linkResponse.json();

      /*
       * ----------------------------------------------------------------------
       * Step 4:
       * If linking failed, don't allow the Firebase account
       * to remain logged in.
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
      setSuccess("Your account has been created successfully.");

      /*
       * ----------------------------------------------------------------------
       * Step 6:
       * Redirect according to the role stored in SQL.
       * ----------------------------------------------------------------------
       */
      await redirectBasedOnRole(firebaseUser);
    } catch (err) {
      console.error("Account activation error:", err);

      /*
       * Firebase error handling
       */
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
                {loading ? "Activating account..." : "Create Account"}
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
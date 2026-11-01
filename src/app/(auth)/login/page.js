"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import Navbar from "@/components/public/navbar";
import Footer from "@/components/public/footer";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Safely reads an API response so an empty response does not
   * cause a JSON parsing exception in the login page.
   */
  async function readApiResponse(response) {
    const responseText = await response.text();

    if (!responseText) {
      return {};
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return {
        error: "The server returned an invalid response. Please try again.",
      };
    }
  }

  /**
   * Retrieves the authenticated user's role from Neon.
   *
   * The UID is already contained in the Firebase ID token.
   * There is no need to send it separately as a query parameter.
   */
  async function redirectBasedOnRole(firebaseUser) {
    try {
      const token = await firebaseUser.getIdToken(true);

      const response = await fetch("/api/user-role", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to determine your account role."
        );
      }

      // Parents use the parent dashboard.
      if (data.role === "parent") {
        router.replace("/dashboard");
        return;
      }

      // Staff and administrators have separate landing pages.
      if (data.role === "staff") {
        if (data.is_admin === true) {
          router.replace("/staff/notices");
        } else {
          router.replace("/staff/dashboard");
        }

        return;
      }

      throw new Error(
        "Your account does not have a valid application role. Please contact an administrator."
      );
    } catch (roleError) {
      console.error("Role resolution failed:", {
        message: roleError?.message,
      });

      // Do not leave an account signed in if it cannot be
      // associated with a valid Neon user record and role.
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error("Unable to sign out:", signOutError);
      }

      throw roleError;
    }
  }

  /**
   * Email and password login.
   *
   * Firebase authenticates the credentials. The application then
   * checks the user's database record before allowing access.
   */
  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const credential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );

      await redirectBasedOnRole(credential.user);
    } catch (loginError) {
      console.error("Login failed:", {
        code: loginError?.code,
        message: loginError?.message,
      });

      switch (loginError.code) {
        case "auth/user-not-found":
          setError("No Firebase account was found with this email address.");
          break;

        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("The email address or password is incorrect.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/too-many-requests":
          setError(
            "There have been too many login attempts. Please wait before trying again."
          );
          break;

        default:
          setError(
            loginError.message ||
              "Login failed. Please try again or contact an administrator."
          );
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * Google sign-in.
   *
   * Google authentication does not automatically create a Neon
   * user record. The account must already be linked to an
   * administrator-created record to access the application.
   */
  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);

    try {
      const credential = await signInWithPopup(auth, googleProvider);

      await redirectBasedOnRole(credential.user);
    } catch (googleError) {
      console.error("Google sign-in failed:", {
        code: googleError?.code,
        message: googleError?.message,
      });

      setError(
        googleError.message ||
          "Google sign-in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-off-white px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
            {/* Page heading */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-navy">
                Welcome Back
              </h1>

              <p className="mt-2 text-text-muted">
                Sign in to your account to continue.
              </p>

              <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gold" />
            </div>

            {/* Login error */}
            {error && (
              <div
                role="alert"
                className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200"
              >
                {error}
              </div>
            )}

            {/* Email and password login */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                    className="form-input pl-10"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
                    <Lock className="h-5 w-5" />
                  </div>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    autoComplete="current-password"
                    className="form-input pl-10 pr-10"
                    placeholder="••••••••"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
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
              </div>

              {/* Submit login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gold py-3 font-semibold text-navy transition hover:bg-gold-light focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Alternative sign-in method */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>

              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-text-muted">
                  or
                </span>
              </div>
            </div>

            {/* Google sign-in */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-3 font-medium text-navy transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:opacity-50"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>

              Sign in with Google
            </button>

            {/* Invitation activation link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-text-muted">
                Have you been invited but have not created your password yet?
              </p>

              <a
                href="/activate-account"
                className="inline-block mt-2 font-semibold text-gold hover:underline"
              >
                Activate your account
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
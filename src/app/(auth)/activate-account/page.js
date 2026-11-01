"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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
} from "lucide-react";

export default function ActivateAccountPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const readResponse = async (response) => {
    const responseText = await response.text();
    if (!responseText) return {};
    try {
      return JSON.parse(responseText);
    } catch {
      return { error: "The server returned an unexpected response. Please try again." };
    }
  };

  const handleActivateAccount = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

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

        const signInCredential = await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          password
        );
        firebaseUser = signInCredential.user;
      }

      const token = await firebaseUser.getIdToken(true);

      const linkResponse = await fetch("/api/users/link", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const linkData = await readResponse(linkResponse);

      if (!linkResponse.ok) {
        throw new Error(linkData.error || "Unable to link your account.");
      }

      // THE FIX: Hard reload forces RoleProvider to fetch fresh state before rendering
      const userRole = linkData.user?.role;
      
      if (userRole === "staff") {
        window.location.href = "/staff/dashboard";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err) {
      console.error("Account activation error:", err);

      switch (err.code) {
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setError("The password is too weak. Please choose a stronger password.");
          break;
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setError("The email or password is incorrect. If you have already created your account, check your password.");
          break;
        default:
          setError(err.message || "Unable to activate your account. Please try again.");
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
            
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
                <UserPlus className="h-7 w-7" />
              </div>
              <h1 className="mt-4 text-3xl font-bold text-navy">Activate Your Account</h1>
              <p className="mt-2 text-text-muted">Create a password to access your Hidayatul College account.</p>
              <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gold" />
            </div>

            {error && (
              <div role="alert" className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleActivateAccount} className="mt-8 space-y-6">
              <div>
                <label htmlFor="email" className="form-label">Email Address</label>
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
                <p className="mt-2 text-xs text-text-muted">Enter the email address that was registered for your account.</p>
              </div>

              <div>
                <label htmlFor="password" className="form-label">Create Password</label>
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
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-navy"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gold py-3 font-semibold text-navy transition hover:bg-gold-light focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? "Activating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="/login" className="text-sm font-semibold text-gold hover:underline">
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
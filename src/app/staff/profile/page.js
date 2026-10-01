"use client";

import { useEffect, useState } from "react";
import {
  UserCircle,
  Mail,
  Shield,
  CalendarDays,
  Pencil,
  Save,
  X,
  Camera,
  CheckCircle2,
} from "lucide-react";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import StaffSidebar from "@/components/staff/StaffSidebar";

export default function MyProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    display_name: "",
    profile_picture_url: "",
  });

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /*
   * Get the currently authenticated Firebase user.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        setErrorMessage("You must be logged in to view your profile.");
        return;
      }

      setUser(currentUser);
      await fetchProfile(currentUser);
    });

    return () => unsubscribe();
  }, []);

  /*
   * Fetch the logged-in user's information.
   */
  async function fetchProfile(currentUser) {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/staff/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load profile.");
      }

      setProfile(data.user);

      setFormData({
        display_name: data.user.display_name || "",
        profile_picture_url: data.user.profile_picture_url || "",
      });
    } catch (error) {
      console.error("Fetch profile error:", error);
      setErrorMessage(error.message || "Failed to load your profile.");
    } finally {
      setLoading(false);
    }
  }

  /*
   * Handle changes to editable fields.
   */
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /*
   * Save the user's editable profile information.
   */
  async function handleSave() {
    if (!user) return;

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const token = await user.getIdToken();

      const response = await fetch("/api/staff/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          display_name: formData.display_name,
          profile_picture_url: formData.profile_picture_url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setProfile(data.user);

      setFormData({
        display_name: data.user.display_name || "",
        profile_picture_url: data.user.profile_picture_url || "",
      });

      setIsEditing(false);
      setMessage("Your profile has been updated successfully.");

      setTimeout(() => {
        setMessage("");
      }, 4000);
    } catch (error) {
      console.error("Update profile error:", error);
      setErrorMessage(error.message || "Failed to update your profile.");
    } finally {
      setSaving(false);
    }
  }

  /*
   * Cancel editing and restore the original values.
   */
  function handleCancel() {
    if (!profile) return;

    setFormData({
      display_name: profile.display_name || "",
      profile_picture_url: profile.profile_picture_url || "",
    });

    setIsEditing(false);
    setErrorMessage("");
  }

  /*
   * Display a formatted date.
   */
  function formatDate(dateValue) {
    if (!dateValue) return "—";

    return new Date(dateValue).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  /*
   * Create a profile-picture preview.
   */
  function getProfilePicture() {
    if (isEditing) {
      return formData.profile_picture_url;
    }

    return profile?.profile_picture_url;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--off-white)]">
        <StaffSidebar />

        <main className="min-h-screen md:ml-[240px]">
          <div className="mx-auto w-full max-w-[1600px] px-6 py-6 md:px-8 md:py-8">
            <div className="flex min-h-[70vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--navy)]" />

                <p className="text-sm text-[var(--text-muted)]">
                  Loading your profile...
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <StaffSidebar />

      <main className="min-h-screen md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-6 md:px-8 md:py-8">

          {/* PAGE HEADER */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-[var(--gold)]">
                Account
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-[var(--navy)]">
                My Profile
              </h1>

              <p className="mt-2 text-sm text-[var(--text-muted)]">
                View and manage your personal staff information.
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setMessage("");
                  setErrorMessage("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--navy-dark)]"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>

{/* SUCCESS MESSAGE */}
{message && (
  <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
    {message}
  </div>
)}

          {/* ERROR MESSAGE */}
          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {profile && (
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">

              {/* PROFILE SUMMARY */}
              <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
                <div className="flex flex-col items-center text-center">

                  {/* PROFILE IMAGE */}
                  <div className="relative mb-5">
                    {getProfilePicture() ? (
                      <img
                        src={getProfilePicture()}
                        alt={profile.display_name || "Profile picture"}
                        className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-md"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[var(--gold-pale)] text-[var(--navy)]">
                        <UserCircle className="h-20 w-20" />
                      </div>
                    )}

                    {isEditing && (
                      <div className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[var(--navy)] text-white">
                        <Camera className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-[var(--navy)]">
                    {profile.display_name || "Staff Member"}
                  </h2>

                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {profile.email}
                  </p>

                  {/* ROLE BADGE */}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full bg-[var(--gold-pale)] px-3 py-1 text-xs font-semibold capitalize text-[var(--navy)]">
                      {profile.role || "Staff"}
                    </span>

                    {profile.is_admin && (
                      <span className="rounded-full bg-[var(--navy)] px-3 py-1 text-xs font-semibold text-white">
                        Administrator
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* PROFILE DETAILS */}
              <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm">

                {/* SECTION HEADER */}
                <div className="border-b border-[var(--border)] px-6 py-5">
                  <h2 className="text-lg font-semibold text-[var(--navy)]">
                    Personal Information
                  </h2>

                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Your information stored in the school system.
                  </p>
                </div>

                <div className="p-6">

                  {/* EDIT MODE */}
                  {isEditing ? (
                    <div className="space-y-6">

                      {/* DISPLAY NAME */}
                      <div>
                        <label
                          htmlFor="display_name"
                          className="mb-2 block text-sm font-semibold text-[var(--navy)]"
                        >
                          Display Name
                        </label>

                        <input
                          id="display_name"
                          name="display_name"
                          type="text"
                          value={formData.display_name}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/10"
                          placeholder="Enter your name"
                        />
                      </div>

                      {/* PROFILE PICTURE URL */}
                      <div>
                        <label
                          htmlFor="profile_picture_url"
                          className="mb-2 block text-sm font-semibold text-[var(--navy)]"
                        >
                          Profile Picture URL
                        </label>

                        <input
                          id="profile_picture_url"
                          name="profile_picture_url"
                          type="url"
                          value={formData.profile_picture_url}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/10"
                          placeholder="https://example.com/profile-picture.jpg"
                        />

                        <p className="mt-2 text-xs text-[var(--text-muted)]">
                          You can leave this blank if you do not want to use a
                          profile picture.
                        </p>
                      </div>

                      {/* EMAIL - READ ONLY */}
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                          Email Address
                        </label>

                        <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--off-white)] px-4 py-3">
                          <Mail className="h-4 w-4 text-[var(--text-muted)]" />

                          <span className="text-sm text-[var(--text-muted)]">
                            {profile.email || "—"}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-[var(--text-muted)]">
                          Your email address is managed through your account
                          and cannot be changed here.
                        </p>
                      </div>

                      {/* ROLE - READ ONLY */}
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                          Role
                        </label>

                        <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--off-white)] px-4 py-3">
                          <Shield className="h-4 w-4 text-[var(--text-muted)]" />

                          <span className="text-sm capitalize text-[var(--text-muted)]">
                            {profile.role || "—"}
                          </span>
                        </div>
                      </div>

                      {/* ADMIN STATUS - READ ONLY */}
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--navy)]">
                          Administrator Status
                        </label>

                        <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--off-white)] px-4 py-3">
                          <Shield className="h-4 w-4 text-[var(--text-muted)]" />

                          <span className="text-sm text-[var(--text-muted)]">
                            {profile.is_admin
                              ? "Administrator"
                              : "Standard Staff Member"}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-[var(--text-muted)]">
                          Administrator permissions can only be changed by
                          authorised system administrators.
                        </p>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={saving}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[var(--off-white)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--navy-dark)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />

                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* VIEW MODE */
                    <div className="space-y-6">

                      {/* DISPLAY NAME */}
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--gold-pale)] text-[var(--navy)]">
                          <UserCircle className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                            Display Name
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                            {profile.display_name || "—"}
                          </p>
                        </div>
                      </div>

                      {/* EMAIL */}
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--gold-pale)] text-[var(--navy)]">
                          <Mail className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                            Email Address
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                            {profile.email || "—"}
                          </p>
                        </div>
                      </div>

                      {/* ROLE */}
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--gold-pale)] text-[var(--navy)]">
                          <Shield className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                            Role
                          </p>

                          <p className="mt-1 text-sm font-semibold capitalize text-[var(--text)]">
                            {profile.role || "—"}
                          </p>
                        </div>
                      </div>

                      {/* ADMIN STATUS */}
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--gold-pale)] text-[var(--navy)]">
                          <Shield className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                            Administrator Status
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                            {profile.is_admin
                              ? "Administrator"
                              : "Standard Staff Member"}
                          </p>
                        </div>
                      </div>

                      {/* CREATED DATE */}
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--gold-pale)] text-[var(--navy)]">
                          <CalendarDays className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                            Account Created
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                            {formatDate(profile.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* FIREBASE UID */}
                      <div className="border-t border-[var(--border)] pt-6">
                        <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                          Account ID
                        </p>

                        <p className="mt-1 break-all font-mono text-xs text-[var(--text-muted)]">
                          {profile.firebase_uid || "—"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import StaffSidebar from "@/components/staff/StaffSidebar";

export default function SettingsPage() {
  // =========================================================
  // AUTHENTICATED USER
  // =========================================================

  const [user, setUser] = useState(null);

  // =========================================================
  // PAGE STATE
  // =========================================================

  const [activeTab, setActiveTab] = useState("school");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // SETTINGS HISTORY
  // =========================================================

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // =========================================================
  // SCHOOL INFORMATION
  // =========================================================

  const [schoolInfo, setSchoolInfo] = useState({
    school_name: "Hidayatul Islam College",
    school_type: "Independent Islamic Primary School",
    phone: "+27 21 593 7544",
    email: "info@hidayatulislam.ac.za",
    physical_address: "Kensington, Cape Town, Western Cape, 7405",
    office_hours:
      "Monday–Friday: 07:30–15:00 | Closed weekends & public holidays",
    facebook_url: "",
    instagram_url: "",
  });

  // =========================================================
  // PORTAL SETTINGS
  // =========================================================

  const [portalSettings, setPortalSettings] = useState({
    allow_parent_registration: true,
    maintenance_mode: false,
    show_school_calendar: true,
    enable_learning_resources: true,
    public_gallery: true,
  });

  // =========================================================
  // BOOKING SETTINGS
  // =========================================================

  const [bookingSettings, setBookingSettings] = useState({
    max_bookings_per_term: 5,
  });

  // =========================================================
  // POPIA / PRIVACY SETTINGS
  // =========================================================

  const [popiaSettings, setPopiaSettings] = useState({
    require_media_consent: true,
    show_contact_popia_notice: true,
    show_login_popia_notice: true,
    allow_data_deletion_requests: true,
    data_retention_years: 3,
    information_officer_name: "Mrs. Aayesha Fridie",
    information_officer_email: "a.fridie@hic.co.za",
  });

  // =========================================================
  // LOAD SETTINGS
  // =========================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setError("You must be logged in to access Settings.");
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const token = await currentUser.getIdToken();

        const response = await fetch("/api/staff/admin/settings", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load settings.");
        }

        if (data.settings) {
          setSchoolInfo((previous) => ({
            ...previous,
            ...Object.fromEntries(
              Object.entries(data.settings).filter(([key]) =>
                key in previous
              )
            ),
          }));

          setPortalSettings((previous) => ({
            ...previous,
            ...Object.fromEntries(
              Object.entries(data.settings).filter(([key]) =>
                key in previous
              )
            ),
          }));

          setBookingSettings((previous) => ({
            ...previous,
            ...Object.fromEntries(
              Object.entries(data.settings).filter(([key]) =>
                key in previous
              )
            ),
          }));

          setPopiaSettings((previous) => ({
            ...previous,
            ...Object.fromEntries(
              Object.entries(data.settings).filter(([key]) =>
                key in previous
              )
            ),
          }));
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        setError(err.message || "Failed to load settings.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // =========================================================
  // CHANGE HANDLERS
  // =========================================================

  function handleSchoolChange(event) {
    const { name, value } = event.target;

    setSchoolInfo((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handlePortalChange(name) {
    setPortalSettings((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));
  }

  function handleBookingChange(event) {
    const { name, value } = event.target;

    setBookingSettings((previous) => ({
      ...previous,
      [name]: Number(value),
    }));
  }

  function handlePopiaChange(name) {
    setPopiaSettings((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));
  }

  function handlePopiaTextChange(event) {
    const { name, value } = event.target;

    setPopiaSettings((previous) => ({
      ...previous,
      [name]:
        name === "data_retention_years" ? Number(value) : value,
    }));
  }

  // =========================================================
  // SAVE SETTINGS
  // =========================================================

  async function handleSave() {
    if (!user) {
      setError("You must be logged in to save settings.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const token = await user.getIdToken();

      const response = await fetch("/api/staff/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schoolInfo,
          portalSettings,
          bookingSettings,
          popiaSettings,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save settings.");
      }

      setMessage("Settings have been saved successfully.");

      setTimeout(() => {
        setMessage("");
      }, 4000);
    } catch (err) {
      console.error("Save settings error:", err);
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // LOAD SETTINGS HISTORY
  // =========================================================

  async function handleViewHistory() {
    if (!user) {
      setError("You must be logged in to view settings history.");
      return;
    }

    try {
      setHistoryLoading(true);
      setError("");

      const token = await user.getIdToken();

      const response = await fetch(
        "/api/staff/admin/settings/history",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load settings history."
        );
      }

      setHistory(data.history || []);
    } catch (err) {
      console.error("Load settings history error:", err);

      setError(
        err.message || "Failed to load settings history."
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  // =========================================================
  // REUSABLE TOGGLE
  // =========================================================

  function SettingToggle({
    title,
    description,
    checked,
    onChange,
  }) {
    return (
      <div className="flex items-center justify-between gap-6 border-b border-[var(--border)] py-5 last:border-b-0">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--navy)]">
            {title}
          </h3>

          <p className="mt-1 max-w-3xl text-xs leading-5 text-[var(--text-muted)]">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={onChange}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
            checked
              ? "bg-[var(--navy)]"
              : "bg-gray-300"
          }`}
          aria-label={`Toggle ${title}`}
          aria-pressed={checked}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
              checked ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
    );
  }

  // =========================================================
  // SECTION HEADER
  // =========================================================

  function SectionHeader({ symbol, title, description }) {
    return (
      <div className="border-b border-[var(--border)] px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--gold-pale)] text-lg text-[var(--navy)]">
            {symbol}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--navy)]">
              {title}
            </h2>

            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // SAVE BUTTON
  // =========================================================

  function SaveButton() {
    return (
      <div className="flex justify-end border-t border-[var(--border)] pt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--navy-dark)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-sm">✓</span>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    );
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--off-white)]">
        <StaffSidebar />

        <main className="min-h-screen md:ml-[240px]">
          <div className="mx-auto w-full max-w-[1200px] px-6 py-6 md:px-8 md:py-8">
            <div className="flex min-h-[70vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--navy)]" />

                <p className="text-sm text-[var(--text-muted)]">
                  Loading system settings...
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <StaffSidebar />

      <main className="min-h-screen md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-6 md:px-8 md:py-8">

          {/* PAGE HEADER */}

          <div className="mb-8">
            <p className="mb-1 text-sm font-medium text-[var(--gold)]">
              Administration
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[var(--navy)]">
              System Settings
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
              Manage school information, portal features, booking rules,
              and privacy settings.
            </p>
          </div>

          {/* SUCCESS */}

          {message && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {message}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* TABS */}

          <div className="mb-6 overflow-x-auto">
            <div className="flex min-w-max border-b border-[var(--border)]">
              {[
                ["school", "School Information"],
                ["portal", "Portal"],
                ["bookings", "Bookings"],
                ["popia", "POPIA & Privacy"],
                ["history", "History"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setActiveTab(value);

                    if (value === "history") {
                      handleViewHistory();
                    }
                  }}
                  className={`border-b-2 px-5 py-3 text-sm font-semibold transition ${
                    activeTab === value
                      ? "border-[var(--navy)] text-[var(--navy)]"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--navy)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ================================================= */}
          {/* SCHOOL INFORMATION */}
          {/* ================================================= */}

          {activeTab === "school" && (
            <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm">

              <SectionHeader
                symbol="🏫"
                title="School Information"
                description="Update the school information displayed throughout the website and portal."
              />

              <div className="space-y-6 p-6">

                <div>
                  <label
                    htmlFor="school_name"
                    className="mb-2 block text-sm font-semibold text-[var(--navy)]"
                  >
                    School Name
                  </label>

                  <input
                    id="school_name"
                    name="school_name"
                    type="text"
                    value={schoolInfo.school_name}
                    onChange={handleSchoolChange}
                    className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="school_type"
                    className="mb-2 block text-sm font-semibold text-[var(--navy)]"
                  >
                    School Type
                  </label>

                  <input
                    id="school_type"
                    name="school_type"
                    type="text"
                    value={schoolInfo.school_type}
                    onChange={handleSchoolChange}
                    className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/10"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-[var(--navy)]"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={schoolInfo.phone}
                      onChange={handleSchoolChange}
                      className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-[var(--navy)]"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={schoolInfo.email}
                      onChange={handleSchoolChange}
                      className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/10"
                    />
                  </div>

                </div>

                <div>
                  <label
                    htmlFor="physical_address"
                    className="mb-2 block text-sm font-semibold text-[var(--navy)]"
                  >
                    Physical Address
                  </label>

                  <textarea
                    id="physical_address"
                    name="physical_address"
                    rows={3}
                    value={schoolInfo.physical_address}
                    onChange={handleSchoolChange}
                    className="w-full resize-none rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="office_hours"
                    className="mb-2 block text-sm font-semibold text-[var(--navy)]"
                  >
                    Office Hours
                  </label>

                  <input
                    id="office_hours"
                    name="office_hours"
                    type="text"
                    value={schoolInfo.office_hours}
                    onChange={handleSchoolChange}
                    className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/10"
                  />
                </div>

                <div className="border-t border-[var(--border)] pt-6">

                  <div className="mb-5">
                    <h3 className="text-sm font-semibold text-[var(--navy)]">
                      Social Media
                    </h3>

                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Manage the social media links displayed on the school website.
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">

                    <div>
                      <label
                        htmlFor="facebook_url"
                        className="mb-2 block text-sm font-semibold text-[var(--navy)]"
                      >
                        Facebook URL
                      </label>

                      <input
                        id="facebook_url"
                        name="facebook_url"
                        type="url"
                        value={schoolInfo.facebook_url}
                        onChange={handleSchoolChange}
                        placeholder="https://facebook.com/..."
                        className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="instagram_url"
                        className="mb-2 block text-sm font-semibold text-[var(--navy)]"
                      >
                        Instagram URL
                      </label>

                      <input
                        id="instagram_url"
                        name="instagram_url"
                        type="url"
                        value={schoolInfo.instagram_url}
                        onChange={handleSchoolChange}
                        placeholder="https://instagram.com/..."
                        className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/10"
                      />
                    </div>

                  </div>
                </div>

                <SaveButton />

              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* PORTAL */}
          {/* ================================================= */}

          {activeTab === "portal" && (
            <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm">

              <SectionHeader
                symbol="⚙"
                title="Portal Settings"
                description="Control which features are available to parents and visitors."
              />

              <div className="p-6">

                <SettingToggle
                  title="Allow Parent Self-Registration"
                  description="Allow new parents to create an account through the portal. New registrations remain under review until an administrator approves the account."
                  checked={portalSettings.allow_parent_registration}
                  onChange={() =>
                    handlePortalChange("allow_parent_registration")
                  }
                />

                <SettingToggle
                  title="Maintenance Mode"
                  description="Temporarily restrict access to the portal while system maintenance or major updates are being performed."
                  checked={portalSettings.maintenance_mode}
                  onChange={() =>
                    handlePortalChange("maintenance_mode")
                  }
                />

                <SettingToggle
                  title="School Calendar"
                  description="Allow parents to view the school calendar through the parent portal."
                  checked={portalSettings.show_school_calendar}
                  onChange={() =>
                    handlePortalChange("show_school_calendar")
                  }
                />

                <SettingToggle
                  title="Learning Resources"
                  description="Show the learning resources section to parents through the portal."
                  checked={portalSettings.enable_learning_resources}
                  onChange={() =>
                    handlePortalChange("enable_learning_resources")
                  }
                />

                <SettingToggle
                  title="Public Gallery"
                  description="Allow the public website gallery to be displayed to visitors."
                  checked={portalSettings.public_gallery}
                  onChange={() =>
                    handlePortalChange("public_gallery")
                  }
                />

                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-800">
                    Parent registration approval
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    New parent accounts remain under review until an
                    administrator approves them through User Management.
                  </p>
                </div>

                <div className="mt-6">
                  <SaveButton />
                </div>

              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* BOOKINGS */}
          {/* ================================================= */}

          {activeTab === "bookings" && (
            <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm">

              <SectionHeader
                symbol="📅"
                title="Booking Settings"
                description="Configure the additional booking rule used by the school portal."
              />

              <div className="p-6">

                <div>
                  <label
                    htmlFor="max_bookings_per_term"
                    className="mb-2 block text-sm font-semibold text-[var(--navy)]"
                  >
                    Maximum Bookings Per Parent Per Term
                  </label>

                  <input
                    id="max_bookings_per_term"
                    name="max_bookings_per_term"
                    type="number"
                    min="1"
                    value={bookingSettings.max_bookings_per_term}
                    onChange={handleBookingChange}
                    className="w-full max-w-xs rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/10"
                  />

                  <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                    This is an additional school rule. It does not replace
                    Microsoft Bookings availability or booking rules.
                  </p>
                </div>

                <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--off-white)] p-5">

                  <div className="flex items-start gap-4">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-base shadow-sm">
                      MS
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[var(--navy)]">
                        Microsoft Bookings
                      </h3>

                      <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                        Appointment services, available time slots,
                        booking duration, availability, booking windows,
                        and cancellation rules are managed through
                        Microsoft Bookings.
                      </p>

                      <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                        Microsoft Bookings remains the source of truth for
                        appointment availability.
                      </p>
                    </div>

                  </div>

                </div>

                <div className="mt-6">
                  <SaveButton />
                </div>

              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* POPIA & PRIVACY */}
          {/* ================================================= */}

          {activeTab === "popia" && (
            <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm">

              <SectionHeader
                symbol="🔒"
                title="POPIA & Privacy"
                description="Manage privacy notices, learner media consent, and personal information settings."
              />

              <div className="p-6">

                <SettingToggle
                  title="Require Media Consent"
                  description="Require appropriate consent before learner photographs or other media can be published through the school website."
                  checked={popiaSettings.require_media_consent}
                  onChange={() =>
                    handlePopiaChange("require_media_consent")
                  }
                />

                <SettingToggle
                  title="Show POPIA Notice on Contact Form"
                  description="Display the school's privacy notice when a visitor submits the public contact form."
                  checked={popiaSettings.show_contact_popia_notice}
                  onChange={() =>
                    handlePopiaChange("show_contact_popia_notice")
                  }
                />

                <SettingToggle
                  title="Show POPIA Notice on Portal Login"
                  description="Display the school's privacy notice when users access the portal."
                  checked={popiaSettings.show_login_popia_notice}
                  onChange={() =>
                    handlePopiaChange("show_login_popia_notice")
                  }
                />

                <SettingToggle
                  title="Allow Parent Data Deletion Requests"
                  description="Allow parents to submit requests relating to the deletion or removal of their personal information."
                  checked={popiaSettings.allow_data_deletion_requests}
                  onChange={() =>
                    handlePopiaChange("allow_data_deletion_requests")
                  }
                />

                {/* DATA RETENTION */}

                <div className="border-b border-[var(--border)] py-6">

                  <label
                    htmlFor="data_retention_years"
                    className="mb-2 block text-sm font-semibold text-[var(--navy)]"
                  >
                    Data Retention Period
                  </label>

                  <select
                    id="data_retention_years"
                    name="data_retention_years"
                    value={popiaSettings.data_retention_years}
                    onChange={handlePopiaTextChange}
                    className="w-full max-w-xs rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/10"
                  >
                    <option value={1}>1 Year</option>
                    <option value={3}>3 Years</option>
                    <option value={5}>5 Years</option>
                  </select>

                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    This should reflect the school's approved information
                    retention policy.
                  </p>

                </div>

                {/* INFORMATION OFFICER */}

                <div className="border-b border-[var(--border)] py-6">

                  <div className="mb-5">
                    <h3 className="text-sm font-semibold text-[var(--navy)]">
                      Information Officer
                    </h3>

                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Contact details for the person responsible for
                      information and privacy matters.
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">

                    <div>
                      <label
                        htmlFor="information_officer_name"
                        className="mb-2 block text-sm font-semibold text-[var(--navy)]"
                      >
                        Name
                      </label>

                      <input
                        id="information_officer_name"
                        name="information_officer_name"
                        type="text"
                        value={popiaSettings.information_officer_name}
                        onChange={handlePopiaTextChange}
                        className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="information_officer_email"
                        className="mb-2 block text-sm font-semibold text-[var(--navy)]"
                      >
                        Email Address
                      </label>

                      <input
                        id="information_officer_email"
                        name="information_officer_email"
                        type="email"
                        value={popiaSettings.information_officer_email}
                        onChange={handlePopiaTextChange}
                        className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/10"
                      />
                    </div>

                  </div>
                </div>

                <div className="pt-6">
                  <SaveButton />
                </div>

              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* SETTINGS HISTORY */}
          {/* ================================================= */}

          {activeTab === "history" && (
            <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm">

              <SectionHeader
                symbol="↺"
                title="Settings Change History"
                description="Review changes made to system settings by administrators."
              />

              <div className="p-6">

                {/* ACCOUNTABILITY NOTICE */}

                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-800">
                    Administrator accountability
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    Settings changes record the administrator, date and
                    time, setting changed, previous value, and new value.
                  </p>
                </div>

                {/* LOADING */}

                {historyLoading ? (
                  <div className="flex items-center justify-center rounded-xl border border-[var(--border)] p-10">
                    <div className="text-center">
                      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--navy)]" />

                      <p className="text-sm text-[var(--text-muted)]">
                        Loading settings history...
                      </p>
                    </div>
                  </div>
                ) : history.length === 0 ? (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--off-white)] p-8 text-center">
                    <p className="text-sm font-medium text-[var(--navy)]">
                      No settings changes recorded
                    </p>

                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Changes made to system settings will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                    <table className="w-full min-w-[850px] text-left">

                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--off-white)]">

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                            Setting
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                            Previous Value
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                            New Value
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                            Changed By
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                            Date
                          </th>

                        </tr>
                      </thead>

                      <tbody>
                        {history.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-[var(--border)] last:border-b-0"
                          >

                            <td className="px-5 py-4">
                              <p className="text-sm font-semibold text-[var(--navy)]">
                                {item.setting_key}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <span className="text-sm text-[var(--text-muted)]">
                                {item.old_value ?? "—"}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span className="text-sm font-medium text-[var(--navy)]">
                                {item.new_value ?? "—"}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div>
                                <p className="text-sm font-medium text-[var(--navy)]">
                                  {item.display_name || "Unknown"}
                                </p>

                                {item.email && (
                                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                                    {item.email}
                                  </p>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span className="text-sm text-[var(--text-muted)]">
                                {new Date(
                                  item.changed_at
                                ).toLocaleString("en-ZA")}
                              </span>
                            </td>

                          </tr>
                        ))}
                      </tbody>

                    </table>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
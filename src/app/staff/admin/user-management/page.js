"use client";

import { useEffect, useRef, useState } from "react";
import {
  Users,
  UserRound,
  Shield,
  GraduationCap,
  Search,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Upload,
  X,
  FileSpreadsheet,
  Menu,
  RefreshCw,
} from "lucide-react";

import * as XLSX from "xlsx";

import StaffSidebar from "@/components/staff/StaffSidebar";

export default function UsersPage() {
  // ============================================================
  // STATE
  // ============================================================

  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("all");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showUserModal, setShowUserModal] =
    useState(false);

  const [showImportModal, setShowImportModal] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState(null);

  const [viewingUser, setViewingUser] =
    useState(null);

  const [deletingUser, setDeletingUser] =
    useState(null);

  const [saving, setSaving] = useState(false);

  const [importing, setImporting] = useState(false);

  const [importPreview, setImportPreview] =
    useState([]);

  const fileInputRef = useRef(null);

  // ============================================================
  // FORM
  // ============================================================

  const emptyForm = {
    firebase_uid: "",
    email: "",
    display_name: "",
    role: "parent",
    is_admin: false,
  };

  const [form, setForm] = useState(emptyForm);

  // ============================================================
  // SIDEBAR
  // ============================================================

  const toggleSidebar = () => {
    setIsSidebarOpen((previous) => !previous);
  };

  // ============================================================
  // LOAD USERS
  // ============================================================

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/users");

      if (!response.ok) {
        throw new Error("Failed to load users.");
      }

      const data = await response.json();

      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      setError("Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // FORM HANDLING
  // ============================================================

  function handleFormChange(event) {
    const { name, value, type, checked } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  }

  // ============================================================
  // OPEN ADD USER
  // ============================================================

  function openAddUser() {
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowUserModal(true);
  }

  // ============================================================
  // OPEN EDIT USER
  // ============================================================

  function openEditUser(user) {
    setEditingUser(user);

    setForm({
      firebase_uid: user.firebase_uid || "",
      email: user.email || "",
      display_name: user.display_name || "",
      role: user.role || "parent",
      is_admin: user.is_admin === true,
    });

    setError("");
    setSuccess("");

    setShowUserModal(true);
  }

  // ============================================================
  // SAVE USER
  // ============================================================

  async function saveUser(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const method = editingUser ? "PUT" : "POST";

      const body = editingUser
        ? {
            id: editingUser.id,
            ...form,
          }
        : form;

      const response = await fetch("/api/users", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save user."
        );
      }

      await fetchUsers();

      setShowUserModal(false);
      setForm(emptyForm);
      setEditingUser(null);

      setSuccess(
        editingUser
          ? "User updated successfully."
          : "User added successfully."
      );
    } catch (error) {
      console.error(error);

      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // DELETE USER
  // ============================================================

  async function deleteUser() {
    if (!deletingUser) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/users?id=${deletingUser.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete user."
        );
      }

      await fetchUsers();

      setDeletingUser(null);

      setSuccess(
        "User deleted successfully."
      );
    } catch (error) {
      console.error(error);

      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // IMPORT FILE
  // ============================================================

  function handleFile(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(
          event.target.result
        );

        const workbook = XLSX.read(data, {
          type: "array",
        });

        const firstSheet =
          workbook.Sheets[
            workbook.SheetNames[0]
          ];

        const rows = XLSX.utils.sheet_to_json(
          firstSheet,
          {
            defval: "",
          }
        );

        const formattedRows = rows.map((row) => ({
          firebase_uid:
            row.firebase_uid ||
            row.Firebase_UID ||
            row.firebaseUid ||
            "",

          email:
            row.email ||
            row.Email ||
            "",

          display_name:
            row.display_name ||
            row.Display_Name ||
            row.displayName ||
            row.name ||
            row.Name ||
            "",

          role:
            row.role ||
            row.Role ||
            "parent",

          is_admin:
            row.is_admin === true ||
            row.is_admin === 1 ||
            String(row.is_admin)
              .toLowerCase() === "true" ||
            String(row.is_admin) === "1",
        }));

        setImportPreview(formattedRows);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to read this file. Please check the format."
        );
      }
    };

    reader.readAsArrayBuffer(file);
  }

  // ============================================================
  // IMPORT USERS
  // ============================================================

  async function importUsers() {
    if (importPreview.length === 0) {
      setError("There are no users to import.");
      return;
    }

    try {
      setImporting(true);
      setError("");
      setSuccess("");

      let imported = 0;
      let failed = 0;

      for (const user of importPreview) {
        try {
          const response = await fetch(
            "/api/users",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(user),
            }
          );

          if (response.ok) {
            imported++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      }

      await fetchUsers();

      setImportPreview([]);

      setShowImportModal(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSuccess(
        `${imported} user(s) imported successfully${
          failed > 0
            ? `, ${failed} failed.`
            : "."
        }`
      );
    } catch (error) {
      console.error(error);

      setError(
        "An error occurred while importing users."
      );
    } finally {
      setImporting(false);
    }
  }

  // ============================================================
  // FILTER USERS
  // ============================================================

  const filteredUsers = users.filter((user) => {
    const name = user.display_name || "";

    const email = user.email || "";

    const role = user.role || "";

    const searchTerm =
      search.toLowerCase();

    const matchesSearch =
      name
        .toLowerCase()
        .includes(searchTerm) ||
      email
        .toLowerCase()
        .includes(searchTerm);

    let matchesRole = true;

    if (roleFilter === "parent") {
      matchesRole = role === "parent";
    }

    if (roleFilter === "staff") {
      matchesRole = role === "staff";
    }

    if (roleFilter === "admin") {
      matchesRole =
        user.is_admin === true;
    }

    return (
      matchesSearch &&
      matchesRole
    );
  });

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalUsers = users.length;

  const parentCount = users.filter(
    (user) => user.role === "parent"
  ).length;

  const staffCount = users.filter(
    (user) => user.role === "staff"
  ).length;

  const adminCount = users.filter(
    (user) => user.is_admin === true
  ).length;

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <StaffSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main
        className={`flex-1 p-6 md:p-8 lg:p-10 transition-all duration-300 ${
          isSidebarOpen
            ? "md:ml-64"
            : "ml-0"
        }`}
      >

        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="mb-6 rounded-lg bg-white p-2 text-navy shadow-sm md:hidden"
          >
            <Menu size={26} />
          </button>
        )}

        <div className="space-y-8">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-sm text-text-muted">
                Manage system users and access
              </p>

              <h1 className="mt-1 text-4xl font-bold text-navy">
                User Management
              </h1>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">

              <button
                onClick={() =>
                  setShowImportModal(true)
                }
                className="flex items-center justify-center gap-2 rounded-lg border border-gold px-4 py-2 font-semibold text-gold hover:bg-gold hover:text-navy"
              >
                <Upload size={18} />
                Import Users
              </button>

              <button
                onClick={openAddUser}
                className="flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2 font-semibold text-navy hover:opacity-90"
              >
                <Plus size={18} />
                Add User
              </button>

            </div>

          </div>

          {/* ==================================================
              ALERTS
          ================================================== */}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ==================================================
              STATS
          ================================================== */}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Total Users"
              value={totalUsers}
              icon={<Users size={22} />}
            />

            <StatCard
              title="Parents"
              value={parentCount}
              icon={<UserRound size={22} />}
            />

            <StatCard
              title="Staff"
              value={staffCount}
              icon={
                <GraduationCap size={22} />
              }
            />

            <StatCard
              title="Admins"
              value={adminCount}
              icon={<Shield size={22} />}
            />

          </div>

          {/* ==================================================
              FILTERS
          ================================================== */}

          <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">

            <div className="flex flex-wrap gap-2">

              {[
                ["all", "All Users"],
                ["parent", "Parents"],
                ["staff", "Staff"],
                ["admin", "Admins"],
              ].map(([value, label]) => (

                <button
                  key={value}
                  onClick={() =>
                    setRoleFilter(value)
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    roleFilter === value
                      ? "bg-navy text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>

              ))}

            </div>

            <div className="flex w-full items-center rounded-lg border border-slate-200 px-3 py-2 lg:max-w-sm">

              <Search
                size={18}
                className="text-gray-400"
              />

              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                className="ml-2 w-full bg-transparent text-sm outline-none"
              />

            </div>

          </div>

          {/* ==================================================
              USERS TABLE
          ================================================== */}

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-200 p-6">

              <div>
                <h2 className="text-xl font-bold text-navy">
                  Users
                </h2>

                <p className="mt-1 text-sm text-text-muted">
                  {filteredUsers.length} users displayed
                </p>
              </div>

              <button
                onClick={fetchUsers}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                title="Refresh users"
              >
                <RefreshCw
                  size={18}
                />
              </button>

            </div>

            {loading ? (

              <div className="p-16 text-center">
                <p className="text-sm text-gray-500">
                  Loading users...
                </p>
              </div>

            ) : filteredUsers.length === 0 ? (

              <div className="p-16 text-center">

                <UserRound
                  size={40}
                  className="mx-auto mb-4 text-slate-300"
                />

                <h3 className="font-semibold text-navy">
                  No users found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Try changing your search
                  or filter.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-left">

                  <thead>
                    <tr className="border-b bg-slate-50">

                      <th className="px-6 py-4 text-sm font-semibold text-navy">
                        User
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-navy">
                        Role
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-navy">
                        Email
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-navy">
                        Admin
                      </th>

                      <th className="px-6 py-4 text-right text-sm font-semibold text-navy">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredUsers.map(
                      (user) => (

                        <tr
                          key={user.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-semibold text-navy">
                                {(user.display_name ||
                                  "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <span className="font-medium">
                                {user.display_name ||
                                  "Unnamed User"}
                              </span>

                            </div>

                          </td>

                          <td className="px-6 py-4">

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                              {user.role ||
                                "Unknown"}
                            </span>

                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {user.email ||
                              "—"}
                          </td>

                          <td className="px-6 py-4">

                            {user.is_admin ===
                            true ? (
                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                Yes
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                                No
                              </span>
                            )}

                          </td>

                          <td className="px-6 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                onClick={() =>
                                  setViewingUser(
                                    user
                                  )
                                }
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy"
                                title="View"
                              >
                                <Eye
                                  size={17}
                                />
                              </button>

                              <button
                                onClick={() =>
                                  openEditUser(
                                    user
                                  )
                                }
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy"
                                title="Edit"
                              >
                                <Pencil
                                  size={17}
                                />
                              </button>

                              <button
                                onClick={() =>
                                  setDeletingUser(
                                    user
                                  )
                                }
                                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2
                                  size={17}
                                />
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      </main>

      {/* ======================================================
          ADD / EDIT USER MODAL
      ====================================================== */}

      {showUserModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b p-6">

              <div>
                <h2 className="text-xl font-bold text-navy">
                  {editingUser
                    ? "Edit User"
                    : "Add User"}
                </h2>

                <p className="text-sm text-gray-500">
                  {editingUser
                    ? "Update user information."
                    : "Add a new system user."}
                </p>
              </div>

              <button
                onClick={() =>
                  setShowUserModal(false)
                }
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={saveUser}
              className="space-y-5 p-6"
            >

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Full Name
                </label>

                <input
                  name="display_name"
                  value={form.display_name}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-gold"
                  placeholder="e.g. John Smith"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-gold"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Firebase UID
                </label>

                <input
                  name="firebase_uid"
                  value={form.firebase_uid}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-gold"
                  placeholder="Firebase UID"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Role
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-gold"
                >
                  <option value="parent">
                    Parent
                  </option>

                  <option value="staff">
                    Staff
                  </option>

                  <option value="admin">
                    Admin
                  </option>
                </select>
              </div>

              <label className="flex items-center gap-3">

                <input
                  type="checkbox"
                  name="is_admin"
                  checked={form.is_admin}
                  onChange={handleFormChange}
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium">
                  Administrator access
                </span>

              </label>

              <div className="flex justify-end gap-3 pt-4">

                <button
                  type="button"
                  onClick={() =>
                    setShowUserModal(false)
                  }
                  className="rounded-lg border px-4 py-2 font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-gold px-5 py-2 font-semibold text-navy disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Save Changes"
                    : "Add User"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ======================================================
          IMPORT MODAL
      ====================================================== */}

      {showImportModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b p-6">

              <div>
                <h2 className="text-xl font-bold text-navy">
                  Import Users
                </h2>

                <p className="text-sm text-gray-500">
                  Upload a CSV or Excel file.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowImportModal(false)
                }
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="space-y-6 p-6">

              {/* Upload */}

              <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">

                <FileSpreadsheet
                  size={40}
                  className="mx-auto mb-4 text-slate-400"
                />

                <h3 className="font-semibold text-navy">
                  Upload User File
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  CSV, XLS or XLSX
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFile}
                  className="mx-auto mt-4 block text-sm"
                />

              </div>

              {/* Preview */}

              {importPreview.length >
                0 && (

                <div>

                  <div className="mb-3 flex items-center justify-between">

                    <h3 className="font-semibold text-navy">
                      Import Preview
                    </h3>

                    <span className="text-sm text-gray-500">
                      {importPreview.length} users
                    </span>

                  </div>

                  <div className="max-h-64 overflow-auto rounded-lg border">

                    <table className="w-full text-left text-sm">

                      <thead className="sticky top-0 bg-slate-50">

                        <tr>

                          <th className="p-3">
                            Name
                          </th>

                          <th className="p-3">
                            Email
                          </th>

                          <th className="p-3">
                            Role
                          </th>

                          <th className="p-3">
                            Admin
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {importPreview.map(
                          (user, index) => (

                            <tr
                              key={index}
                              className="border-t"
                            >

                              <td className="p-3">
                                {user.display_name}
                              </td>

                              <td className="p-3">
                                {user.email}
                              </td>

                              <td className="p-3 capitalize">
                                {user.role}
                              </td>

                              <td className="p-3">
                                {user.is_admin
                                  ? "Yes"
                                  : "No"}
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

              )}

              {/* Actions */}

              <div className="flex justify-end gap-3">

                <button
                  onClick={() =>
                    setShowImportModal(false)
                  }
                  className="rounded-lg border px-4 py-2 font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={importUsers}
                  disabled={
                    importing ||
                    importPreview.length ===
                      0
                  }
                  className="rounded-lg bg-gold px-5 py-2 font-semibold text-navy disabled:opacity-50"
                >
                  {importing
                    ? "Importing..."
                    : "Import Users"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ======================================================
          VIEW USER MODAL
      ====================================================== */}

      {viewingUser && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b p-6">

              <h2 className="text-xl font-bold text-navy">
                User Details
              </h2>

              <button
                onClick={() =>
                  setViewingUser(null)
                }
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="space-y-4 p-6">

              <Detail
                label="Name"
                value={
                  viewingUser.display_name
                }
              />

              <Detail
                label="Email"
                value={viewingUser.email}
              />

              <Detail
                label="Firebase UID"
                value={
                  viewingUser.firebase_uid ||
                  "—"
                }
              />

              <Detail
                label="Role"
                value={viewingUser.role}
              />

              <Detail
                label="Administrator"
                value={
                  viewingUser.is_admin
                    ? "Yes"
                    : "No"
                }
              />

            </div>

          </div>

        </div>

      )}

      {/* ======================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {deletingUser && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2
                size={22}
                className="text-red-600"
              />
            </div>

            <h2 className="text-xl font-bold text-navy">
              Delete User?
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <strong>
                {deletingUser.display_name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() =>
                  setDeletingUser(null)
                }
                className="rounded-lg border px-4 py-2 font-medium"
              >
                Cancel
              </button>

              <button
                onClick={deleteUser}
                disabled={saving}
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {saving
                  ? "Deleting..."
                  : "Delete User"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">

      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-navy">
        {icon}
      </div>

      <p className="text-sm text-text-muted">
        {title}
      </p>

      <h2 className="mt-1 text-3xl font-bold text-navy">
        {value}
      </h2>

    </div>
  );
}

// ============================================================
// DETAIL
// ============================================================

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-medium text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

export default function UserManagementPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Fetch Firebase Auth Token for Admin Auth header
      const { auth } = await import("@/lib/firebase");
      const idToken = await auth.currentUser?.getIdToken();

      const res = await fetch("/api/admin/upload-parents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setStatus({ type: "success", message: `Successfully updated ${data.count} records!` });
      setFile(null);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">User Management</h1>

      {/* CSV Sync Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Import Parents List (CSV)</h2>
        <p className="text-sm text-gray-600 mb-4">
          Upload <code>school_parents.csv</code> containing columns: 
          <i>FirstName, LastName, Email, ChildName, ChildGrade, StudentNumber</i>.
        </p>

        <form onSubmit={handleCsvUpload} className="space-y-4">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          <button
            type="submit"
            disabled={!file || uploading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Processing..." : "Upload and Sync Users"}
          </button>
        </form>

        {status && (
          <div className={`mt-4 p-3 rounded-md text-sm flex items-center ${status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {status.type === "success" ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
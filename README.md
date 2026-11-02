# Hidayatul Islam College Web App

**Title:** Hidayatul Islam College Webapp  
**Sponsor/Client:** Mr J. Alexander | Hidayatul Islam College  
**Team Members:** PM - Taslimah Emjedi | SD - Tasha Maclay-Mayers | BA - Lindani Xaba | SS - Khensani Baloyi

## Description
The Hidayatul Islam College web application modernizes the school's digital presence, replacing the legacy Wix site. The system provides a modern public-facing website (including Admissions and Fees pages) alongside secure, role-specific portals for Parents, Staff, and Administrators. Key features include synchronised Microsoft Bookings, dynamic News and Notice management with POPIA consent validation, and a secure learning resource repository.

## Tech Stack
*   **Framework:** Next.js 14 (App Router)
*   **Styling:** Tailwind CSS & Lucide React
*   **Authentication:** Firebase Auth (Email/Password & Google OAuth)
*   **Database:** Neon PostgreSQL (Serverless) via `pg`
*   **Object Storage:** AWS S3 (for secure PDF and image hosting)
*   **Integrations:** Microsoft Graph API (Bookings synchronization)
*   **Data Handling:** `xlsx` (for CSV/Excel user imports), `pdf-lib`

## Getting Started

First, install the dependencies:
```bash
npm install
# or
yarn install

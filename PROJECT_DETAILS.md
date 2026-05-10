# Referral Management System — Project Details

## Overview

The **Referral Management System** is a modern web application that allows business
partners to submit, track, and manage client referrals, while giving administrators
the tools to review, approve, or reject those referrals and monitor performance.

The platform is built as a single-page application (SPA) using React and TypeScript,
with a clean dashboard, real-time pipeline view, and role-based access for Partners
and Admins.

---

## Description

This project provides a centralized portal where:

- **Partners** can submit referrals with full client details, attach supporting
  documents, and track the status of each referral in one place.
- **Admins** can review incoming referrals, approve or reject them, and oversee
  performance metrics, commissions, and recent activity from a single dashboard.

The system is designed to streamline the entire referral lifecycle — from
submission to approval — and to give both partners and administrators clear
visibility into pipeline status, commissions, and conversion rates.

---

## Key Features

### Authentication & Access
- Secure login with JWT-based authentication
- Partner and Admin user registration
- Forgot password and reset password flow
- Protected routes — only logged-in users can access the dashboard
- Role-based UI (Partner vs Admin views)

### Dashboard
- Live summary cards: Total Referrals, Pending Review, Approved Leads, Total Commission
- Monthly Referral Volume chart (approved vs pending) using Recharts
- Recent Activity feed showing the latest referral events
- Referral Pipeline table with search, filter, and sort
- Downloadable CSV report of the current pipeline view

### Referral Submission
- Multi-section form for client and referral details
- Referral types: Real Estate, Insurance, Mortgage, Other
- Estimated value input with USD formatting
- Drag-and-drop document upload (PDF, DOCX, XLSX — up to 10 MB)
- Inline form validation for name, email, phone, value, and file
- Save as draft or submit for review

### Tracking
- Dedicated tracking page for monitoring referral status
- Filters by status (Pending, Approved, Rejected, Draft) and date range
- Sorting by date, name, value, status, or ID
- Search across name, email, and referral type
- CSV export of filtered results

### Admin Tools
- Approve or reject pending referrals from the pipeline
- Confirmation modal for approve/reject actions
- View commission amounts on approved referrals
- Administrator overview separate from the partner overview

---

## Pages

The application has the following pages. Public pages (login, register, forgot/reset
password) are accessible to anyone, while protected pages (dashboard, submit, tracking)
require a valid login session.

### 1. Login Page — `/login`

**File:** [src/pages/LoginPage.tsx](src/pages/LoginPage.tsx)
**Access:** Public

The entry point for existing users to sign in.

- **Inputs:** Email Address, Password
- **Features:**
  - Show / hide password toggle
  - "Forgot password?" link to the reset flow
  - Inline error message for invalid credentials
  - Loading spinner while authenticating
  - Link to the Register page for new users
- **Behavior:** On successful login, the JWT access token and basic user info
  (`role`, `full_name`, `email`) are saved to `localStorage`, then the user is
  redirected to `/dashboard`.
- **API:** `POST /auth/login/`
- **Trust badges:** "Secure 256-bit Encryption" and "Compliance Verified".

---

### 2. Register Page — `/register`

**File:** [src/pages/RegisterPage.tsx](src/pages/RegisterPage.tsx)
**Access:** Public

Allows new users to create an account on the platform.

- **Inputs:** Full Name, Email Address, Password, Account Type (Partner / Administrator)
- **Features:**
  - Role selection dropdown (Partner or Admin)
  - Show / hide password toggle
  - Inline error messages for validation / API errors
  - Link back to the Login page
- **Behavior:** On successful registration, the access token and user object are
  stored in `localStorage` and the user is redirected to `/dashboard` (auto-login).
- **API:** `POST /auth/register/`

---

### 3. Forgot Password Page — `/forgot-password`

**File:** [src/pages/ForgotPasswordPage.tsx](src/pages/ForgotPasswordPage.tsx)
**Access:** Public

Lets a user request a password-reset link by email.

- **Inputs:** Email Address (validated against an email regex)
- **Features:**
  - Email format validation before submitting
  - Success state showing "Reset link sent to ..." with a confirmation icon
  - Reset link expires in 30 minutes (shown in the UI)
  - "Resend Email" button with a 45-second cooldown timer
  - "Use a different email address" option to retry
  - Link to enter a reset code manually (jumps to the reset page)
- **API:** `POST /auth/password-reset/`

---

### 4. Reset Password Page — `/reset-password`

**File:** [src/pages/ResetPasswordPage.tsx](src/pages/ResetPasswordPage.tsx)
**Access:** Public

A multi-step page to actually reset the password. The page accepts `uid` and
`token` query parameters from the email link, or lets the user paste the code manually.

- **Steps:**
  1. **Verify** — Paste the reset code in `uid:token` format (skipped automatically
     when the user arrives via the email link with query params).
  2. **Reset** — Enter and confirm a new password, with a real-time password
     strength meter.
  3. **Success** — Confirmation screen with a "Continue to Sign In" button.
- **Validation:**
  - Password must be at least 8 characters
  - Password must score at least 2 on the strength meter
  - Confirmation must match the new password
- **Features:** Live password strength indicator, show/hide password toggle,
  graceful handling of invalid/expired tokens (sends user back to verify step).
- **API:** `POST /auth/password-reset-confirm/`

---

### 5. Dashboard Page — `/dashboard`

**File:** [src/pages/DashboardPage.tsx](src/pages/DashboardPage.tsx)
**Access:** Protected (logged-in users)

The main landing page after login. Shows different headlines based on role
(Administrator Overview vs Partner Overview).

- **Header:**
  - Role-aware title and subtitle
  - "Download Report" button (CSV export of the current pipeline view)
  - "Submit New Referral" button (Partners only)
- **Stat Cards:**
  - Total Referrals (all time)
  - Pending Review (active)
  - Approved Leads (with conversion rate %)
  - Total Commission (USD)
- **Monthly Referral Volume Chart:** Bar chart (Recharts) showing approved vs
  pending referrals per month for the year.
- **Recent Activity Panel:** Latest events such as referral submitted, approved,
  or rejected — each with an icon, user email, and timestamp.
- **Referral Pipeline Table:**
  - Columns: Name, Date Submitted, Value, Status, Estimate/Commission, Actions (admin only)
  - Filter by status (All, Pending, Approved, Rejected, Draft)
  - Sort by date, name, value, or status
  - Live search via the global header search box
  - Admin-only "Approve" / "Reject" buttons on pending rows (opens a confirmation modal)
- **APIs:**
  - `GET /dashboard/summary/`
  - `GET /dashboard/monthly-stats/`
  - `GET /dashboard/recent-activity/`
  - `GET /referrals/`
  - `GET /auth/profile/`

---

### 6. Submit Referral Page — `/submit`

**File:** [src/pages/SubmitReferralPage.tsx](src/pages/SubmitReferralPage.tsx)
**Access:** Protected (Partners)

A multi-section form for submitting a new referral.

- **Section 1 — Client Information:**
  - Full Name (required, min 2 characters)
  - Email Address (required, validated against email regex)
  - Phone Number (required, validated for at least 7 digits)
- **Section 2 — Referral Details:**
  - Referral Type — Real Estate, Insurance, Mortgage, or Other
  - Estimated Value (USD) — required, must be > 0 and ≤ 1 billion
  - Additional Notes — optional, up to 2000 characters with a live counter
- **Section 3 — Document Upload:**
  - Drag-and-drop or click-to-upload
  - Accepted formats: PDF, DOCX, XLSX
  - Maximum file size: 10 MB
  - Inline file validation (type, size, empty file)
  - Replace or remove the selected file
- **Sidebar — Referral Guidelines:**
  - Verbal interest required before submission
  - Project timelines should be in the notes
  - Standard vetting time: 48 business hours
- **Actions:**
  - **Save Draft** — saves with `action: "draft"` (only validates filled fields)
  - **Submit Referral** — full validation, sends `action: "submit"` and redirects
    to `/dashboard` on success
- **API:** `POST /referrals/` (multipart/form-data)

---

### 7. Tracking Page — `/tracking`

**File:** [src/pages/TrackingPage.tsx](src/pages/TrackingPage.tsx)
**Access:** Protected (logged-in users)

Detailed tracking view of all referrals (own referrals for Partners, all
referrals for Admins).

- **Summary Cards:**
  - Growth Rate (e.g. +12.5% vs last quarter)
  - Avg Response time (e.g. 4.2 days)
  - Reward Pool (allocated rewards pending payout)
- **Filters:**
  - Status — All, Pending, Approved, Rejected, Draft
  - Date Range — Any Date, Last 7 / 30 / 90 days, Year to date
  - Live search across name, email, phone, type, status, and ID
  - "Clear all filters" action when any filter is active
- **Sorting:** By submitted date, name, value, status, or ID (asc/desc)
- **Referrals Table:** Same columns as the dashboard pipeline, with admin
  approve/reject actions on pending rows.
- **Total Value:** Aggregated estimated value of currently displayed referrals.
- **CSV Export:** Downloads the filtered/sorted view as `referral-tracking-YYYY-MM-DD.csv`.
- **APIs:**
  - `GET /referrals/`
  - `GET /auth/profile/`

---

### 8. Layout (shared shell)

**File:** [src/components/layout/Layout.tsx](src/components/layout/Layout.tsx)
**Used by:** All protected pages

A shared layout that wraps the dashboard, submit, and tracking pages. It
typically includes the sidebar navigation, top header with the global search
bar, and the content area where each page is rendered via React Router's
`<Outlet />`.

---

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Linting:** ESLint with TypeScript ESLint

---

## Project Structure

```
src/
├── App.tsx                  # Routes and protected route wrapper
├── main.tsx                 # App entry point
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── DashboardPage.tsx
│   ├── SubmitReferralPage.tsx
│   └── TrackingPage.tsx
├── components/
│   ├── auth/                # Auth-specific components
│   ├── layout/              # App layout (sidebar, header, etc.)
│   ├── ui/                  # Reusable UI primitives
│   └── ReferralActionModal.tsx
├── contexts/
│   └── SearchContext.tsx    # Global search state
├── lib/                     # API client, utilities, CSV export
└── assets/                  # Static assets
```

---

## User Roles

| Role     | Capabilities                                                              |
| -------- | ------------------------------------------------------------------------- |
| Partner  | Submit referrals, view own pipeline, track status, download own report    |
| Admin    | View all referrals, approve/reject, monitor activity, view commissions    |

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Available Scripts

```bash
npm run dev        # Start the development server
npm run build      # Build the project for production
npm run preview    # Preview the production build
npm run lint       # Run ESLint
```

The app runs on `http://localhost:5173` by default.

---

## Backend Integration

The frontend connects to a Django REST API. Key endpoints used:

- `POST   /api/auth/login/`              — Login and receive JWT
- `POST   /api/auth/register/`           — Register a new user
- `GET    /api/auth/profile/`            — Fetch logged-in user profile
- `GET    /api/dashboard/summary/`       — Dashboard summary metrics
- `GET    /api/dashboard/monthly-stats/` — Monthly referral statistics
- `GET    /api/dashboard/recent-activity/` — Recent activity feed
- `GET    /api/referrals/`               — List referrals
- `POST   /api/referrals/`               — Submit a new referral
- `PATCH  /api/referrals/{id}/`          — Approve or reject (admin)

See [integration_plan.md](integration_plan.md) for the full integration plan.

---

## Status

Active development — frontend is feature-complete for core flows
(authentication, dashboard, submission, tracking, admin actions).

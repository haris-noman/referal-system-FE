# Integration Plan — Backend & Frontend

This document outlines the step-by-step process for integrating the Referral Management Platform API (Django) with the Frontend (React).

## Phase 1: Authentication Integration
1.  **API Client Setup**: 
    - Install `axios` in the frontend project.
    - Create an `api.ts` utility for configured axios instances (base URL, interceptors for JWT).
2.  **Auth State Management**:
    - Implement a simple `AuthContext` or use `localStorage` to persist the JWT and user info (`role`, `full_name`).
3.  **Login Page Integration**:
    - Connect the `LoginPage.tsx` form to the `/api/auth/login/` endpoint.
    - Handle loading states and error messages (e.g., "Invalid credentials").
    - Redirect to `/dashboard` upon successful login.
4.  **Registration Page Integration**:
    - Create `RegisterPage.tsx` (it's currently linked but doesn't exist).
    - Connect it to the `/api/auth/register/` endpoint.
    - Implement role selection (Partner vs Admin).
5.  **Route Protection**:
    - Implement a `ProtectedRoute` component to prevent unauthenticated access to the dashboard and other pages.

## Phase 2: Dashboard Integration
1.  **Dashboard Data Fetching**:
    - Update `DashboardPage.tsx` to fetch data from:
        - `/api/dashboard/summary/`
        - `/api/dashboard/monthly-stats/`
        - `/api/dashboard/recent-activity/`
2.  **Stat Cards**:
    - Replace static values in `StatCard` with live data from the `summary` API.
3.  **Monthly Volume Chart**:
    - Replace `chartData` with data from the `monthly-stats` API.
4.  **Recent Activity**:
    - Map `Recent Activity` section to the `recent-activity` API.
5.  **Referral Pipeline**:
    - Connect the table to the `/api/referrals/` list endpoint.
    - Implement basic filtering if possible.

## Phase 3: Referral Submission & Management
1.  **Submit Referral Page**:
    - Connect the form to `POST /api/referrals/`.
    - Handle file uploads (Multipart).
2.  **Tracking Page**:
    - Connect to `/api/referrals/{id}/track/` or `/api/referrals/` list with status tracking.
3.  **Admin Actions (Optional/Future)**:
    - If admin role is logged in, show "Approve/Reject" buttons in the pipeline.

## Phase 4: Refinement & Validation
1.  **Error Handling**: Ensure robust error handling for all API calls.
2.  **Loading States**: Add skeletons or spinners for a better UX.
3.  **Testing**: Verify the full flow from registration to submission and approval.

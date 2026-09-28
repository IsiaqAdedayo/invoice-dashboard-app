# Payvance Frontend — Solution Guide

> A plain-language walkthrough of every change made to the Next.js frontend,
> written so you can easily understand how the application transitioned from static mock data to real-time API integrations.

---

## Table of Contents

1. [The Core Objective](#1-the-core-objective)
2. [Authentication Context Updates](#2-authentication-context-updates)
3. [Service Layer Additions](#3-service-layer-additions)
4. [Data Fetching Hooks](#4-data-fetching-hooks)
5. [Replacing Mock Data Across Dashboards](#5-replacing-mock-data-across-dashboards)
6. [Summary](#6-summary)

---

## 1. The Core Objective
The primary goal of this phase was to connect the fully developed NestJS backend to the frontend React application. This involved completely stripping out all hardcoded JSON arrays and replacing them with asynchronous data fetched using **React Query** (`@tanstack/react-query`), ensuring real-time responsiveness and consistent metrics calculation across admin and customer views.

---

## 2. Authentication Context Updates

### NextAuth Session Modification
**File:** `src/app/api/auth/[...nextauth]/route.tsx`

To allow the frontend to request data scoped specifically to the logged-in user (especially customers), we needed the backend's `id` and `customerId` exposed to the client. We achieved this by appending them to the JWT token and session object.
- **Why it matters**: In the customer dashboard, we now successfully pass the active `customerId` (derived from the NextAuth session) to the API so that customers only see their own invoices (`/customers/:id/invoices`).

---

## 3. Service Layer Additions

All manual `fetch` calls are managed through our centralized `api` utility. We systematically mapped out our API routes into focused services:

### Admin Analytics & Recent Data
**File:** `src/services/admin.service.ts`
- Mapped endpoints for `GET /analytics/overview`, `GET /analytics/revenue-chart`, `GET /analytics/weekly-chart`, and `GET /analytics/full`.
- Mapped `GET /invoices/recent` to quickly populate the admin overview dashboard without pulling down the entire database table.

### Invoice Management
**File:** `src/services/invoice.service.ts`
- Updated the `findInvoices` function to construct URL query strings dynamically. It now passes `search`, `page`, `limit`, and `status` variables to support server-side filtering and pagination.

### Customer Management
**File:** `src/services/customer.service.ts`
- Created to handle `GET /customers` for the admin portal.
- Created `findCustomerInvoices(id)` to retrieve isolated data arrays for individual customers.

---

## 4. Data Fetching Hooks

Instead of executing `.then()` promises inside our components, we created a suite of custom **React Query** hooks.

**Location:** `src/hooks/queries/`
- `useAdminOverview`, `useRevenueChart`, `useWeeklyChart`
- `useRecentInvoices`, `useInvoices`
- `useCustomers`, `useMyInvoices`
- `useFullAnalytics`

**Why it matters**: React Query gives us out-of-the-box caching, background fetching, and loading state management. Our UI components only need to subscribe to the hook (e.g., `const { data, isLoading } = useInvoices()`) and automatically react when data becomes available.

---

## 5. Replacing Mock Data Across Dashboards

This was the most extensive phase, removing static arrays (`MOCK_INVOICES`, `MOCK_CUSTOMERS`, `revenueData`, etc.) and wiring the new hooks to the UI components.

### A. Admin Dashboard (`admin/page.tsx`)
- Transitioned the top four `StatCard` components to use `useAdminOverview` fields (`totalRevenue`, `collected`, `outstanding`, `overdueCount`).
- Replaced the primary Area and Bar charts with `useRevenueChart` and `useWeeklyChart`.
- Swapped the static invoice list with `useRecentInvoices`.

### B. Admin Invoices (`admin/invoices/page.tsx`)
- Hooked up `useInvoices` with state variables for `page`, `statusFilter`, and `search`.
- Configured the Ant Design `<Table />` component to read `meta.total` and `meta.page` from the backend's paginated response, enabling precise server-side data control.
- Replaced the local static summary metrics array with the centralized `useAdminOverview` hook so stats stay accurate despite the pagination.

### C. Admin Customers (`admin/customers/page.tsx`)
- Replaced the static list of customers with `useCustomers`. 
- Adjusted the Ant Design table columns to map to the new API properties (`totalSpentFmt`, `invoiceCount`, `paidRate`). 

### D. Admin Analytics (`admin/analytics/page.tsx`)
- Wired up `useFullAnalytics` which returned all complex aggregate data shapes required for visual reporting.
- Mapped `successTrend`, `ageData`, and `revenueChart` from the endpoint into the respective Recharts data visualization arrays.

### E. Customer Dashboard (`customer/page.tsx`)
- Replaced the mock invoice array with `useMyInvoices(customerId)` utilizing the customer's ID derived from their session state.
- Allowed live dynamic updates to the customer's metrics (total billed, total paid, pending amounts) based dynamically on their live invoice status.

---

## 6. Summary

The codebase has completely stepped away from using static front-end objects. Data validation, calculations, and aggregations are properly offloaded to the NestJS layer, ensuring security and stability, while Next.js focuses entirely on presenting that data responsively using powerful table tools (Ant Design), chart frameworks (Recharts), and state synchronization (React Query).

# FlowBill - Project Status & Context

## Project Overview
FlowBill is a cash flow visibility tool for freelancers and micro-businesses. It focuses on invoice creation, payment tracking, and cash flow forecasting.

## Tech Stack
- **Backend:** Django REST Framework
- **Frontend:** React + Tailwind + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe

## Current Progress
- [x] Read and analyzed SRS (`FlowBill_SRS_v1.0.docx`)
- [x] Extracted Database Schema
- [x] Created `db/schema.sql` with full PostgreSQL table definitions
- [x] Implement Django Backend (Models, Serializers, Views, Custom Auth)
- [x] Integrate Stripe (Payment link generation logic in backend)
- [x] Implement React Frontend Scaffolding (Vite + Tailwind 4)
- [x] Implement Supabase Auth on Frontend
- [x] Create Core Layout & Dashboard View
- [ ] Implement Client Management Page
- [ ] Implement Invoice Builder (Complex Form)
- [ ] Set up Supabase RLS policies

## Frontend Implementation Status
The React frontend is initialized and connected to the backend:
- Built with Vite and React 19.
- Tailwind CSS 4 configured via `@tailwindcss/vite`.
- `AuthContext` provides Supabase session management across the app.
- `apiClient.js` (Axios) automatically injects the Supabase JWT for backend requests.
- Core Layout with sidebar navigation and protected routes implemented.
- Dashboard view displaying summary metrics and recent invoice list.

## Database Schema Status
The database schema is based on Section 7 of the SRS. It includes tables for:
- `users`: Extends Supabase Auth
- `business_profiles`: Business-specific settings
- `tax_rates`: Reusable tax configurations
- `clients`: Customer management
- `invoices`: Core invoice document
- `invoice_items`: Line items for invoices
- `payments`: Payment history (supports partial payments)
- `credit_notes`: For voided invoices
- `reminders`: Overdue notification log
- `invoice_activity`: Audit trail
- `recurring_templates`: Phase 2 recurring billing blueprints

## Next Steps for AI
1. Implement the Client Management page (List, Add, Edit).
2. Implement the Invoice Builder page (Complex form with line items).
3. Build the Settings page to manage the Business Profile.
4. Set up Supabase Row Level Security (RLS) policies to ensure data isolation at the DB level.
5. Implement the PDF generation preview on the frontend.


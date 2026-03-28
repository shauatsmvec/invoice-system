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
- [ ] Implement React Frontend
- [ ] Set up Supabase RLS policies

## Backend Implementation Status
The Django backend has been implemented following the "Backend First" approach:
- Database schema mapped to Django models in `core/models.py`.
- Custom `SupabaseJWTAuthentication` created to decode JWTs from Supabase Auth and map to Django users.
- DRF ViewSets and Serializers built for core entities (Business Profiles, Clients, Tax Rates, Invoices).
- Complex business logic for calculating invoice subtotals, taxes, and discounts is embedded in `InvoiceSerializer`.
- Automated tests verify the creation of invoices and accuracy of financial calculations.

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
1. Initialize the React frontend (e.g., using Vite) and set up Tailwind CSS + shadcn/ui.
2. Implement Supabase Auth on the frontend to manage user sessions and obtain JWTs.
3. Build API integration services to interact with the new Django REST backend, passing the Supabase JWT in the Authorization header.
4. Develop the core UI views (Dashboard, Client Management, Invoice Creation).
5. Set up Supabase Row Level Security (RLS) policies directly in the database.

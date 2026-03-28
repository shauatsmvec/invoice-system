# FlowBill Database (PostgreSQL)

This folder contains the master schema for the FlowBill system.

## 🏗 Schema Setup

1. Open your **Supabase Dashboard**.
2. Go to the **SQL Editor**.
3. Create a **New Query**.
4. Paste the entire content of `schema.sql`.
5. Click **Run**.

## 🛡 Row Level Security (RLS)
The `schema.sql` file includes policies that ensure:
- Users can only see their own data.
- Clients, Invoices, and Profiles are isolated by `user_id`.
- Data is secured at the database layer, even if the API is bypassed.

## 📊 Tables
- `users`: Core profile settings.
- `business_profiles`: Invoice branding data.
- `clients`: Customer registry.
- `invoices`: Core financial documents.
- `payments`: Transaction history.
- `recurring_templates`: Billing automation blueprints.

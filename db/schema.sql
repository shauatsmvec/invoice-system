-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TABLE: users (public.users)
-- Extends auth.users. Stores business profile and settings.
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    onboarding_complete BOOLEAN DEFAULT false,
    razorpay_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: business_profiles
-- Business info used on every invoice PDF. One per user.
CREATE TABLE public.business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) UNIQUE,
    business_name TEXT NOT NULL,
    tagline TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT, -- ISO 3166-1 alpha-2
    phone TEXT,
    website TEXT,
    email TEXT, -- Reply-to on sent invoices
    logo_url TEXT, -- Supabase Storage URL
    default_currency TEXT DEFAULT 'USD', -- ISO 4217
    invoice_prefix TEXT DEFAULT 'INV-',
    invoice_counter INTEGER DEFAULT 1,
    default_payment_terms INTEGER DEFAULT 30, -- Days until due
    default_notes TEXT,
    default_terms TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: tax_rates
-- Named reusable tax rates. Applied per invoice line item.
CREATE TABLE public.tax_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    name TEXT NOT NULL, -- e.g. GST, VAT, Sales Tax
    rate DECIMAL(5,4) NOT NULL, -- e.g. 0.1000 = 10%
    type TEXT CHECK (type IN ('gst', 'vat', 'sales_tax', 'custom')),
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: clients
-- The people and businesses that receive invoices.
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    currency TEXT, -- Overrides business default
    notes TEXT, -- Private notes
    late_payment_count INTEGER DEFAULT 0,
    avg_days_to_pay DECIMAL(6,2),
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: invoices
-- The central entity. One row per invoice document.
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    client_id UUID NOT NULL REFERENCES public.clients(id),
    invoice_number TEXT NOT NULL, -- UNIQUE per user
    status TEXT CHECK (status IN ('draft', 'sent', 'viewed', 'partially_paid', 'paid', 'overdue', 'disputed', 'cancelled', 'voided')),
    currency TEXT NOT NULL DEFAULT 'USD',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_type TEXT CHECK (discount_type IN ('percent', 'fixed')),
    discount_value DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    balance_due DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    terms TEXT,
    pdf_url TEXT,
    portal_token TEXT UNIQUE,
    portal_token_expires_at TIMESTAMPTZ,
    razorpay_payment_link_id TEXT,
    razorpay_payment_link_url TEXT,
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    voided_at TIMESTAMPTZ,
    reminder_count INTEGER DEFAULT 0,
    last_reminder_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, invoice_number)
);

-- TABLE: invoice_items
-- Line items on an invoice.
CREATE TABLE public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    tax_rate_id UUID REFERENCES public.tax_rates(id),
    tax_rate_snapshot DECIMAL(5,4),
    tax_rate_name_snapshot TEXT,
    line_subtotal DECIMAL(12,2) NOT NULL,
    line_tax_amount DECIMAL(12,2) DEFAULT 0,
    line_total DECIMAL(12,2) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: payments
-- Records each payment received against an invoice.
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id),
    user_id UUID NOT NULL REFERENCES public.users(id),
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT NOT NULL,
    payment_date DATE NOT NULL,
    method TEXT CHECK (method IN ('razorpay', 'bank_transfer', 'cash', 'cheque', 'other')),
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: credit_notes
-- Formal reversal document created when a sent invoice is voided.
CREATE TABLE public.credit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID UNIQUE REFERENCES public.invoices(id),
    user_id UUID NOT NULL REFERENCES public.users(id),
    credit_note_number TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    reason TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: reminders
-- Log of reminder emails sent for overdue invoices.
CREATE TABLE public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id),
    user_id UUID NOT NULL REFERENCES public.users(id),
    reminder_type TEXT CHECK (reminder_type IN ('auto', 'manual')),
    days_overdue INTEGER NOT NULL,
    email_sent_to TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: invoice_activity
-- Append-only event log for the invoice activity timeline.
CREATE TABLE public.invoice_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id),
    event_type TEXT NOT NULL, -- e.g. created, sent, viewed, paid, voided, reminder_sent
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: recurring_templates
-- Blueprint for auto-generated invoices on a schedule.
CREATE TABLE public.recurring_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    client_id UUID NOT NULL REFERENCES public.clients(id),
    name TEXT NOT NULL,
    frequency TEXT CHECK (frequency IN ('weekly', 'fortnightly', 'monthly', 'quarterly', 'annually')),
    next_generate_date DATE NOT NULL,
    auto_send BOOLEAN DEFAULT false,
    due_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    items JSONB NOT NULL, -- Array of {description, quantity, unit_price, tax_rate_id}
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE RLS ON ALL TABLES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_templates ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- users: users can only see their own record
CREATE POLICY "Users can view own record" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth.uid() = id);

-- business_profiles: users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.business_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.business_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.business_profiles FOR UPDATE USING (auth.uid() = user_id);

-- tax_rates
CREATE POLICY "Users can view own tax rates" ON public.tax_rates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tax rates" ON public.tax_rates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tax rates" ON public.tax_rates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tax rates" ON public.tax_rates FOR DELETE USING (auth.uid() = user_id);

-- clients
CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- invoices
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own invoices" ON public.invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own invoices" ON public.invoices FOR DELETE USING (auth.uid() = user_id);

-- invoice_items (checked via invoice relationship)
CREATE POLICY "Users can view own invoice items" ON public.invoice_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.invoices WHERE id = invoice_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own invoice items" ON public.invoice_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.invoices WHERE id = invoice_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own invoice items" ON public.invoice_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.invoices WHERE id = invoice_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own invoice items" ON public.invoice_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.invoices WHERE id = invoice_id AND user_id = auth.uid())
);

-- payments
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

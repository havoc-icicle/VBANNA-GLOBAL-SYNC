/*
  # Create Services Table and Related Schema

  1. New Tables
    - `services`
      - Complete service catalog with Documentation and Digital services
      - Pricing, deliverables, revision policies, turnaround times
    - `orders`
      - Order management with status tracking
      - Pricing calculations with discounts and surcharges
    - `questionnaires`
      - Dynamic questionnaires by service, industry, country
    - `user_responses`
      - User questionnaire responses
    - `documents`
      - KYC and service deliverable storage
    - `trade_leads`
      - HSN code-based trade lead management
    - `payments`
      - Payment processing with Stripe/PayPal
    - `invoices`
      - Automated invoice generation
    - `reports`
      - Various report types (financial, trade leads, etc.)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each user role
*/

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Documentation', 'Digital')),
  description text,
  deliverables jsonb NOT NULL DEFAULT '[]',
  revision_policy integer NOT NULL DEFAULT 1,
  standard_turnaround_days integer NOT NULL,
  rush_turnaround_days integer,
  price_min decimal(10,2) NOT NULL,
  price_max decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'SGD',
  rush_surcharge_percent decimal(5,2),
  is_active boolean DEFAULT true,
  features jsonb DEFAULT '[]',
  additional_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are viewable by all authenticated users"
  ON services FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can modify services"
  ON services FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'));

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id),
  service_id uuid NOT NULL REFERENCES services(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'revised', 'cancelled')),
  priority text NOT NULL DEFAULT 'standard' CHECK (priority IN ('standard', 'rush')),
  base_price decimal(10,2) NOT NULL,
  discount decimal(10,2) NOT NULL DEFAULT 0,
  surcharge decimal(10,2) NOT NULL DEFAULT 0,
  tax_amount decimal(10,2) NOT NULL DEFAULT 0,
  total_price decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'SGD',
  start_date timestamptz,
  expected_completion_date timestamptz,
  actual_completion_date timestamptz,
  revision_count integer NOT NULL DEFAULT 0,
  max_revisions integer NOT NULL DEFAULT 1,
  requirements jsonb DEFAULT '{}',
  deliverables jsonb DEFAULT '[]',
  notes text,
  is_partial_payment_allowed boolean DEFAULT false,
  payment_schedule jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'));

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'));

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create questionnaires table
CREATE TABLE IF NOT EXISTS questionnaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES services(id),
  industry_id uuid REFERENCES industries(id),
  country_id uuid REFERENCES countries(id),
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL DEFAULT '[]',
  conditional_logic jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questionnaires are viewable by authenticated users"
  ON questionnaires FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can modify questionnaires"
  ON questionnaires FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'));

CREATE TRIGGER update_questionnaires_updated_at BEFORE UPDATE ON questionnaires
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create user_responses table
CREATE TABLE IF NOT EXISTS user_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  questionnaire_id uuid NOT NULL REFERENCES questionnaires(id),
  order_id uuid REFERENCES orders(id),
  answers jsonb NOT NULL DEFAULT '{}',
  is_complete boolean DEFAULT false,
  submitted_at timestamptz,
  progress integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own responses"
  ON user_responses FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all responses"
  ON user_responses FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'));

CREATE POLICY "Users can create/update own responses"
  ON user_responses FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER update_user_responses_updated_at BEFORE UPDATE ON user_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id),
  uploaded_by uuid NOT NULL REFERENCES users(id),
  file_name text NOT NULL,
  original_file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  document_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  rejection_reason text,
  is_deliverable boolean DEFAULT false,
  is_encrypted boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents for their orders"
  ON documents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all documents"
  ON documents FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'));

CREATE POLICY "Users can upload documents for their orders"
  ON documents FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Admins can update document status"
  ON documents FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'));

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trade_leads table
CREATE TABLE IF NOT EXISTS trade_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id),
  hsn_code text NOT NULL,
  product_name text NOT NULL,
  lead_type text NOT NULL CHECK (lead_type IN ('buyer', 'seller')),
  company_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text,
  country text NOT NULL,
  address text,
  trade_history jsonb DEFAULT '{}',
  compliance_status jsonb DEFAULT '{}',
  outreach_templates jsonb DEFAULT '[]',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'refined')),
  vetted boolean DEFAULT false,
  vetted_by uuid REFERENCES users(id),
  vetted_at timestamptz,
  market_data jsonb DEFAULT '{}',
  priority integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trade_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view trade leads for their orders"
  ON trade_leads FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all trade leads"
  ON trade_leads FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'));

CREATE POLICY "Admins can manage trade leads"
  ON trade_leads FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'));

CREATE TRIGGER update_trade_leads_updated_at BEFORE UPDATE ON trade_leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id),
  payment_intent_id text UNIQUE NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('stripe', 'paypal')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  transaction_id text,
  paid_at timestamptz,
  failure_reason text,
  refund_reason text,
  refund_amount decimal(10,2),
  metadata jsonb DEFAULT '{}',
  is_partial_payment boolean DEFAULT false,
  payment_schedule_index integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payments for their orders"
  ON payments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'));

CREATE POLICY "Users can create payments for their orders"
  ON payments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  order_id uuid NOT NULL REFERENCES orders(id),
  base_amount decimal(10,2) NOT NULL,
  discount_amount decimal(10,2) NOT NULL DEFAULT 0,
  surcharge_amount decimal(10,2) NOT NULL DEFAULT 0,
  tax_amount decimal(10,2) NOT NULL DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  currency text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled')),
  issued_at timestamptz,
  due_date timestamptz,
  paid_at timestamptz,
  paid_amount decimal(10,2) NOT NULL DEFAULT 0,
  remaining_amount decimal(10,2) NOT NULL DEFAULT 0,
  notes text,
  line_items jsonb NOT NULL DEFAULT '[]',
  billing_address jsonb DEFAULT '{}',
  company_details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invoices for their orders"
  ON invoices FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all invoices"
  ON invoices FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'));

CREATE POLICY "System can create invoices"
  ON invoices FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL CHECK (report_type IN ('service_progress', 'trade_lead', 'financial', 'compliance', 'marketing_analytics')),
  title text NOT NULL,
  description text,
  generated_by uuid NOT NULL REFERENCES users(id),
  order_id uuid REFERENCES orders(id),
  filters jsonb DEFAULT '{}',
  data jsonb DEFAULT '{}',
  file_path text,
  format text NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf', 'excel', 'json')),
  status text NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
  generated_at timestamptz,
  expires_at timestamptz,
  is_scheduled boolean DEFAULT false,
  schedule_config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their generated reports"
  ON reports FOR SELECT TO authenticated
  USING (generated_by = auth.uid());

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'));

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT TO authenticated
  WITH CHECK (generated_by = auth.uid());

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
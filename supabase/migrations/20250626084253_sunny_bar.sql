/*
  # VBannaCorp GlobalSync Database Population

  This migration populates the database with comprehensive data based on the 
  VBannaCorp GlobalSync requirements specification, including:
  
  1. Complete service catalog (Documentation and Digital services)
  2. Sample users (Admin, End Users, Mid-Brokers)
  3. Realistic orders with proper pricing and workflows
  4. Trade leads with HSN codes and compliance data
  5. Documents, invoices, payments, and reports
  6. Industry and country-specific questionnaires
*/

-- Insert Documentation Services
INSERT INTO services (
  name, 
  category, 
  description, 
  deliverables, 
  revision_policy, 
  standard_turnaround_days, 
  rush_turnaround_days, 
  price_min, 
  price_max, 
  currency, 
  rush_surcharge_percent, 
  features, 
  additional_notes
) VALUES
(
  'Project Report / Business Plan',
  'Documentation',
  'Comprehensive investor-ready business plan with market analysis and financial projections',
  '["Executive summary", "Company description", "Market analysis", "Marketing and sales strategy", "Operational plan", "Management team profiles", "Financial projections", "Funding request", "Appendices"]'::jsonb,
  1,
  12,
  6,
  2500.00,
  5000.00,
  'SGD',
  20.0,
  '["Custom templates", "Milestone tracking", "Client feedback workflow", "Automated delivery notifications"]'::jsonb,
  'Varies based on complexity'
),
(
  'Executive Summary',
  'Documentation', 
  '1-2 page overview highlighting key business opportunities',
  '["Business overview", "Key opportunities", "Financial highlights", "Team strengths"]'::jsonb,
  1,
  12,
  NULL,
  500.00,
  1000.00,
  'SGD',
  NULL,
  '["Standalone or integrated with business plan", "Client approval workflow"]'::jsonb,
  'Can be standalone or part of business plan'
),
(
  'Financial Projections / Financial Model',
  'Documentation',
  '3-5 year financial forecasts with comprehensive analysis', 
  '["Income statement", "Balance sheet", "Cash flow statement", "Startup cost breakdown", "Key financial ratios", "Assumptions", "Sensitivity analysis (optional)"]'::jsonb,
  1,
  12,
  6,
  1500.00,
  3500.00,
  'SGD',
  20.0,
  '["Configurable templates", "Automated validation", "Revision tracking"]'::jsonb,
  'Complexity determines final pricing'
),
(
  'Professional Resume / CV Preparation',
  'Documentation',
  'Tailored resumes/CVs for up to 2 personnel, optimized for Employment Pass',
  '["Professional CV/Resume", "Cover letter template", "LinkedIn profile optimization"]'::jsonb,
  1,
  12,
  6,
  300.00,
  600.00,
  'SGD',
  20.0,
  '["MOM-compliant templates", "Employment Pass optimization"]'::jsonb,
  'Price per resume, up to 2 personnel'
),
(
  'KYC Documentation Preparation', 
  'Documentation',
  'Organized compilation of identity, address, and financial documents',
  '["Proof of identity", "Proof of address", "Source of funds documentation", "Company ownership structure", "Consultation session"]'::jsonb,
  0,
  12,
  6,
  800.00,
  1500.00,
  'SGD',
  20.0,
  '["Secure document handling", "AML/CFT compliance checks", "Consultation included"]'::jsonb,
  'Includes consultation and varies by document volume'
),
(
  'Auditor/Corporate Secretary Attestation',
  'Documentation',
  'Professional attestation of documents by certified auditors or corporate secretaries',
  '["Document review and verification", "Certified attestation", "Compliance certification"]'::jsonb,
  0,
  12,
  NULL,
  500.00,
  1200.00,
  'SGD', 
  NULL,
  '["Certified professionals", "Regulatory compliance"]'::jsonb,
  'Varies by document type and volume'
),
(
  'Legal Attestation by Lawyer/Attorney/Lawfirm',
  'Documentation',
  'Professional attestation of documents by qualified lawyer or law firm',
  '["Legal review and verification", "Notarization", "Authentication as required by Singapore law"]'::jsonb,
  0,
  12,
  NULL,
  200.00,
  300.00,
  'SGD',
  NULL,
  '["Legal validity assurance", "Regulatory compliance", "Notarization included"]'::jsonb,
  'Includes notarization and authentication fees'
);

-- Insert Digital Services
INSERT INTO services (
  name,
  category,
  description, 
  deliverables,
  revision_policy,
  standard_turnaround_days,
  rush_turnaround_days,
  price_min,
  price_max,
  currency,
  rush_surcharge_percent,
  features,
  additional_notes
) VALUES
(
  'Logo Designing',
  'Digital',
  'Professional logo design with brand style guide',
  '["3-5 logo concepts", "Brand style guide", "Multi-format files (PNG, SVG, PDF)", "Color variations", "Usage guidelines"]'::jsonb,
  2,
  10,
  7,
  500.00,
  1200.00,
  'SGD',
  20.0,
  '["Design preview", "Client feedback workflow", "Automated file delivery"]'::jsonb,
  'Includes 2 rounds of revisions'
),
(
  'Visiting Card Design',
  'Digital',
  'Custom business cards for up to 2 personnel',
  '["Custom card design for up to 2 personnel", "Print-ready files", "Digital formats"]'::jsonb,
  2,
  10,
  7,
  200.00,
  400.00,
  'SGD',
  20.0,
  '["Print-ready files", "Multiple personnel support"]'::jsonb,
  'For up to 2 personnel'
),
(
  'Letterhead Design',
  'Digital', 
  'Custom letterheads in PDF and Word formats',
  '["Custom letterhead design", "PDF format", "Word format"]'::jsonb,
  2,
  10,
  7,
  200.00,
  400.00,
  'SGD',
  20.0,
  '["Multiple format support", "Professional design"]'::jsonb,
  'Includes editable and print-ready versions'
),
(
  'Website Design',
  'Digital',
  'Responsive 5-page website with SEO and CMS integration',
  '["Responsive 5-page website", "SEO optimization", "CMS integration", "Mobile optimization", "Basic analytics setup"]'::jsonb,
  2,
  12,
  8,
  1500.00,
  3500.00,
  'SGD',
  20.0,
  '["Page count tracking", "SEO report delivery", "CMS training"]'::jsonb,
  'Responsive design with CMS and SEO'
),
(
  'Domain Registration',
  'Digital',
  '1-year domain registration with setup assistance', 
  '["1-year domain registration (.com, .sg)", "Setup assistance", "DNS configuration"]'::jsonb,
  0,
  3,
  NULL,
  50.00,
  150.00,
  'SGD',
  NULL,
  '["Multiple domain types", "Setup support"]'::jsonb,
  'Varies by domain type'
),
(
  'Web and Email Hosting Services',
  'Digital',
  '1-year hosting with 10 GB storage, SSL, and 5 email accounts via hosting-corp.com',
  '["1-year hosting", "10 GB storage", "SSL certificate", "5 email accounts", "Technical support"]'::jsonb,
  0,
  3,
  NULL,
  300.00,
  600.00,
  'SGD',
  NULL,
  '["hosting-corp.com integration", "Automated provisioning"]'::jsonb,
  'Delivered via hosting-corp.com partnership'
),
(
  'Email Marketing',
  'Digital',
  'Platform setup, templates, and initial campaign for 500 contacts',
  '["Platform setup", "1-2 email templates", "Initial campaign for 500 contacts", "Campaign analytics"]'::jsonb,
  0,
  8,
  NULL,
  600.00,
  1200.00,
  'SGD',
  NULL,
  '["Template library", "Analytics tracking", "Additional contacts available"]'::jsonb,
  'Additional contacts +$100 per 500'
),
(
  'Google AdSense Setup',
  'Digital',
  'Account setup, ad placement optimization, and client training',
  '["Account setup", "Ad placement optimization", "Client training session", "Performance guidelines"]'::jsonb,
  0,
  8,
  NULL,
  300.00,
  600.00,
  'SGD',
  NULL,
  '["One-time setup", "Training included", "Optimization guidelines"]'::jsonb,
  'One-time fee with training'
),
(
  'Facebook and Instagram Marketing',
  'Digital',
  '1-month campaign with 4-6 posts/ads and analytics',
  '["1-month marketing campaign", "4-6 posts/ads", "Campaign analytics", "Performance report"]'::jsonb,
  0,
  8,
  NULL,
  800.00,
  1500.00,
  'SGD',
  NULL,
  '["Multi-platform campaign", "Analytics included", "Performance tracking"]'::jsonb,
  'Ongoing management available as separate service'
),
(
  'Sourcing Buy/Sell Lead Services',
  'Digital',
  'HSN code-based trade lead sourcing with detailed reports',
  '["10-15 vetted buy/sell leads", "Detailed trade lead report", "Market data analysis", "Outreach templates", "GST compliance check"]'::jsonb,
  1,
  12,
  NULL,
  2500.00,
  4000.00,
  'SGD',
  NULL,
  '["HSN code-based sourcing", "Compliance verification", "Lead refinement", "Additional countries (+$500 each)"]'::jsonb,
  'Covers up to 3 countries, additional countries $500 each'
);

-- Create sample End Users and Mid-Brokers (check if email doesn't exist first)
DO $$
BEGIN
  -- End Users
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'john.smith@techstartup.sg') THEN
    INSERT INTO users (username, email, password, role, first_name, last_name, phone, country, timezone, language) 
    VALUES ('john_tech', 'john.smith@techstartup.sg', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/MZpSx3aXK', 'End User', 'John', 'Smith', '+65 8123 4567', 'Singapore', 'Asia/Singapore', 'en');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'maria.gonzalez@greenfarms.sg') THEN
    INSERT INTO users (username, email, password, role, first_name, last_name, phone, country, timezone, language) 
    VALUES ('maria_agri', 'maria.gonzalez@greenfarms.sg', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/MZpSx3aXK', 'End User', 'Maria', 'Gonzalez', '+65 8234 5678', 'Singapore', 'Asia/Singapore', 'en');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'ahmed.hassan@tradeco.ae') THEN
    INSERT INTO users (username, email, password, role, first_name, last_name, phone, country, timezone, language) 
    VALUES ('ahmed_trading', 'ahmed.hassan@tradeco.ae', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/MZpSx3aXK', 'End User', 'Ahmed', 'Hassan', '+971 50 123 4567', 'Dubai', 'Asia/Dubai', 'ar');
  END IF;

  -- Mid-Brokers
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'partner@zenithcorp.sg') THEN
    INSERT INTO users (username, email, password, role, first_name, last_name, phone, country, timezone, language) 
    VALUES ('zenith_broker', 'partner@zenithcorp.sg', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/MZpSx3aXK', 'Mid-Broker', 'Zenith', 'Partnership', '+65 6789 0123', 'Singapore', 'Asia/Singapore', 'en');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'alex.wong@businessconsult.sg') THEN
    INSERT INTO users (username, email, password, role, first_name, last_name, phone, country, timezone, language) 
    VALUES ('consultant_alex', 'alex.wong@businessconsult.sg', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/MZpSx3aXK', 'Mid-Broker', 'Alex', 'Wong', '+65 8345 6789', 'Singapore', 'Asia/Singapore', 'en');
  END IF;
END $$;

-- Create sample orders with realistic data
INSERT INTO orders (
  order_number,
  user_id,
  service_id, 
  status,
  priority,
  base_price,
  discount,
  surcharge,
  tax_amount,
  total_price,
  currency,
  start_date,
  expected_completion_date,
  revision_count,
  max_revisions,
  requirements,
  notes
)
SELECT 
  'VBG250101001',
  u.id,
  s.id,
  'in_progress',
  'standard',
  3500.00,
  0.00,
  0.00,
  315.00, -- 9% GST 
  3815.00,
  'SGD',
  '2025-01-15 09:00:00+08',
  '2025-01-29 17:00:00+08',
  0,
  1,
  jsonb_build_object(
    'business_name', 'TechStart Solutions Pte Ltd',
    'industry', 'Technology',
    'funding_amount', 500000,
    'target_market', 'Southeast Asia SaaS market',
    'business_model', 'B2B Software as a Service platform'
  ),
  'Client requires investor-ready business plan for Series A funding'
FROM users u, services s
WHERE u.email = 'john.smith@techstartup.sg' 
  AND s.name = 'Project Report / Business Plan'
LIMIT 1;

INSERT INTO orders (
  order_number,
  user_id, 
  service_id,
  status,
  priority,
  base_price,
  discount,
  surcharge,
  tax_amount,
  total_price,
  currency,
  start_date,
  expected_completion_date,
  actual_completion_date,
  revision_count,
  max_revisions,
  requirements,
  notes
)
SELECT
  'VBG250101002', 
  u.id,
  s.id,
  'completed',
  'rush',
  800.00,
  0.00,
  160.00, -- 20% rush surcharge
  86.40, -- 9% GST on total
  1046.40,
  'SGD',
  '2025-01-10 10:00:00+08',
  '2025-01-17 17:00:00+08', 
  '2025-01-16 15:30:00+08',
  0,
  2,
  jsonb_build_object(
    'business_name', 'GreenFarms Pte Ltd',
    'purpose', 'Corporate branding for agricultural startup',
    'style_preference', 'Modern, eco-friendly, green color scheme',
    'usage', 'Business cards, letterhead, website'
  ),
  'Rush delivery completed ahead of schedule'
FROM users u, services s
WHERE u.email = 'maria.gonzalez@greenfarms.sg'
  AND s.name = 'Logo Designing'
LIMIT 1;

INSERT INTO orders (
  order_number,
  user_id,
  service_id,
  status, 
  priority,
  base_price,
  discount,
  surcharge,
  tax_amount,
  total_price,
  currency,
  expected_completion_date,
  revision_count,
  max_revisions,
  requirements,
  notes
)
SELECT
  'VBG250101003',
  u.id,
  s.id,
  'pending',
  'standard',
  3000.00,
  150.00, -- 5% volume discount (multiple services)
  0.00,
  256.50, -- 9% GST on discounted amount
  3106.50,
  'SGD', 
  '2025-02-08 17:00:00+08',
  0,
  1,
  jsonb_build_object(
    'product_name', 'Smartphone Accessories',
    'hsn_code', '85176200',
    'trade_type', 'Buyers',
    'target_countries', jsonb_build_array('Malaysia', 'Thailand', 'Indonesia'),
    'volume_requirements', '10,000 units monthly',
    'quality_specifications', 'CE certified, 1-year warranty'
  ),
  'Trade lead sourcing for smartphone accessories import business'
FROM users u, services s  
WHERE u.email = 'ahmed.hassan@tradeco.ae'
  AND s.name = 'Sourcing Buy/Sell Lead Services'
LIMIT 1;

-- Create questionnaires for various service and country/industry combinations
INSERT INTO questionnaires (
  service_id,
  title,
  description,
  questions
)
SELECT
  s.id,
  'Business Plan Questionnaire for Technology Sector',
  'Detailed questionnaire for technology businesses requiring investor-ready business plans',
  '[
    {
      "id": "business_name",
      "type": "text",
      "question": "What is your company name?",
      "required": true
    },
    {
      "id": "business_model",
      "type": "select",
      "question": "What is your business model?",
      "options": ["B2B SaaS", "B2C SaaS", "E-commerce", "Marketplace", "Fintech", "Edtech", "Other"],
      "required": true
    },
    {
      "id": "target_market",
      "type": "textarea",
      "question": "Describe your target market and customer segments",
      "required": true
    },
    {
      "id": "funding_amount",
      "type": "number",
      "question": "How much funding are you seeking? (SGD)",
      "required": true
    },
    {
      "id": "technology_stack",
      "type": "multiselect",
      "question": "What technologies does your product use?",
      "options": ["Web Applications", "Mobile Apps", "AI/ML", "Blockchain", "IoT", "Cloud Services"],
      "required": false
    }
  ]'::jsonb
FROM services s
WHERE s.name = 'Project Report / Business Plan'
LIMIT 1;

INSERT INTO questionnaires (
  service_id,
  title,
  description,
  questions
)
SELECT
  s.id,
  'Trade Lead Sourcing Questionnaire',
  'Comprehensive questionnaire for HSN code-based trade lead sourcing services',
  '[
    {
      "id": "product_name",
      "type": "text",
      "question": "What product are you looking to trade?",
      "required": true
    },
    {
      "id": "hsn_code",
      "type": "text",
      "question": "8-digit HSN code (if known)",
      "required": false
    },
    {
      "id": "trade_type",
      "type": "select",
      "question": "Are you looking for buyers or sellers?",
      "options": ["Buyers", "Sellers", "Both"],
      "required": true
    },
    {
      "id": "target_countries",
      "type": "multiselect",
      "question": "Which countries are you interested in?",
      "options": ["Malaysia", "Thailand", "Indonesia", "Philippines", "Vietnam", "India", "China", "Australia"],
      "required": true
    },
    {
      "id": "volume_requirements",
      "type": "textarea",
      "question": "What are your volume requirements and timeline?",
      "required": true
    },
    {
      "id": "quality_specifications",
      "type": "textarea",
      "question": "What quality specifications or certifications are required?",
      "required": false
    }
  ]'::jsonb
FROM services s
WHERE s.name = 'Sourcing Buy/Sell Lead Services'
LIMIT 1;

-- Create user responses for questionnaires
INSERT INTO user_responses (
  user_id,
  questionnaire_id,
  order_id,
  answers,
  is_complete,
  submitted_at,
  progress
)
SELECT
  u.id,
  q.id,
  o.id,
  jsonb_build_object(
    'business_name', 'TechStart Solutions Pte Ltd',
    'business_model', 'B2B SaaS',
    'target_market', 'Manufacturing companies in Southeast Asia requiring supply chain management solutions',
    'funding_amount', 500000,
    'technology_stack', jsonb_build_array('Web Applications', 'AI/ML', 'Cloud Services')
  ),
  true,
  '2025-01-15 08:30:00+08',
  100
FROM users u, questionnaires q, orders o
WHERE u.email = 'john.smith@techstartup.sg'
  AND q.title = 'Business Plan Questionnaire for Technology Sector'
  AND o.order_number = 'VBG250101001'
LIMIT 1;

INSERT INTO user_responses (
  user_id,
  questionnaire_id, 
  order_id,
  answers,
  is_complete,
  submitted_at,
  progress
)
SELECT
  u.id,
  q.id,
  o.id,
  jsonb_build_object(
    'product_name', 'Smartphone Accessories',
    'hsn_code', '85176200', 
    'trade_type', 'Buyers',
    'target_countries', jsonb_build_array('Malaysia', 'Thailand', 'Indonesia'),
    'volume_requirements', '10,000 units monthly import requirement for smartphone cases, chargers, and screen protectors',
    'quality_specifications', 'CE certified, 1-year warranty, RoHS compliant, compatible with major smartphone brands'
  ),
  true,
  '2025-01-20 14:20:00+08',
  100
FROM users u, questionnaires q, orders o
WHERE u.email = 'ahmed.hassan@tradeco.ae'
  AND q.title = 'Trade Lead Sourcing Questionnaire'
  AND o.order_number = 'VBG250101003'
LIMIT 1;

-- Create sample trade leads with HSN codes
INSERT INTO trade_leads (
  order_id,
  hsn_code,
  product_name,
  lead_type,
  company_name,
  contact_person,
  email,
  phone,
  country,
  address,
  trade_history,
  compliance_status,
  outreach_templates,
  status,
  vetted,
  vetted_by,
  vetted_at,
  market_data,
  priority
)
SELECT
  o.id,
  '85176200',
  'Smartphone Accessories',
  'seller',
  'Tech Components Malaysia Sdn Bhd',
  'Lim Wei Ming',
  'sales@techcomponents.my',
  '+60 3-2123 4567',
  'Malaysia',
  'No. 123, Jalan Technology, 47500 Subang Jaya, Selangor',
  jsonb_build_object(
    'annual_revenue', '$2.5M USD',
    'years_in_business', 8,
    'main_products', jsonb_build_array('Phone cases', 'Chargers', 'Screen protectors'),
    'certifications', jsonb_build_array('ISO 9001', 'CE', 'RoHS'),
    'export_countries', jsonb_build_array('Singapore', 'Thailand', 'Indonesia', 'Philippines')
  ),
  jsonb_build_object(
    'gst_registered', true,
    'export_license', 'Valid until 2025-12-31',
    'aml_status', 'Verified',
    'last_audit', '2024-11-15'
  ),
  jsonb_build_array(
    jsonb_build_object(
      'subject', 'Partnership Opportunity - Smartphone Accessories',
      'template', 'Dear {{contact_person}}, We are interested in establishing a partnership for importing smartphone accessories. Our company specializes in the ASEAN market and we would like to discuss potential business opportunities with your organization.'
    )
  ),
  'approved',
  true,
  (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
  '2025-01-22 10:15:00+08',
  jsonb_build_object(
    'market_size', '$1.2B',
    'growth_rate', '15% annually',
    'competition_level', 'Medium',
    'demand_trend', 'Growing due to 5G adoption'
  ),
  1
FROM orders o
WHERE o.order_number = 'VBG250101003'
LIMIT 1;

-- Add more trade leads for the same order
INSERT INTO trade_leads (
  order_id,
  hsn_code,
  product_name,
  lead_type, 
  company_name,
  contact_person,
  email,
  phone,
  country,
  address,
  trade_history,
  compliance_status,
  status,
  vetted,
  priority
)
SELECT
  o.id,
  '85176200',
  'Smartphone Accessories',
  'seller',
  'Bangkok Mobile Parts Co Ltd',
  'Surasak Thanakit',
  'export@bangkokmobile.th',
  '+66 2-123-4567',
  'Thailand', 
  '456 Sukhumvit Road, Klongtoei, Bangkok 10110',
  jsonb_build_object(
    'annual_revenue', '$1.8M USD',
    'years_in_business', 12,
    'main_products', jsonb_build_array('Mobile accessories', 'Repair parts', 'Cables'),
    'certifications', jsonb_build_array('CE', 'FCC'),
    'export_countries', jsonb_build_array('Cambodia', 'Laos', 'Singapore')
  ),
  jsonb_build_object(
    'vat_registered', true,
    'export_license', 'Valid',
    'aml_status', 'Verified'
  ),
  'approved',
  true,
  2
FROM orders o
WHERE o.order_number = 'VBG250101003'
LIMIT 1;

INSERT INTO trade_leads (
  order_id,
  hsn_code,
  product_name,
  lead_type,
  company_name,
  contact_person,
  email,
  phone,
  country,
  trade_history,
  compliance_status,
  status,
  vetted,
  priority
)
SELECT
  o.id,
  '85176200',
  'Smartphone Accessories',
  'seller',
  'Jakarta Electronics Suppliers',
  'Budi Santoso',
  'exports@jakartaelec.id',
  '+62 21-1234-5678',
  'Indonesia',
  jsonb_build_object(
    'annual_revenue', '$3.2M USD',
    'years_in_business', 15,
    'main_products', jsonb_build_array('Phone accessories', 'Tablets', 'Smart watches'),
    'certifications', jsonb_build_array('CE', 'RoHS', 'ISO 9001'),
    'export_countries', jsonb_build_array('Singapore', 'Malaysia', 'Philippines', 'Australia')
  ),
  jsonb_build_object(
    'export_license', 'Valid until 2025-11-30',
    'tax_clearance', 'Current',
    'aml_status', 'Verified'
  ),
  'approved',
  true,
  1
FROM orders o
WHERE o.order_number = 'VBG250101003'
LIMIT 1;

-- Create sample documents
INSERT INTO documents (
  order_id,
  uploaded_by,
  file_name,
  original_file_name,
  file_path,
  file_size,
  mime_type,
  document_type,
  status,
  approved_by,
  approved_at,
  is_deliverable,
  metadata
)
SELECT
  o.id,
  u.id,
  'passport_john_smith_001.pdf',
  'passport-scan.pdf',
  '/documents/kyc/passport_john_smith_001.pdf',
  2048576, -- 2MB
  'application/pdf',
  'KYC - Passport',
  'approved',
  (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
  '2025-01-16 09:30:00+08',
  false,
  jsonb_build_object(
    'document_country', 'Singapore',
    'expiry_date', '2030-05-15',
    'verification_method', 'Digital verification'
  )
FROM orders o, users u
WHERE o.order_number = 'VBG250101001'
  AND u.email = 'john.smith@techstartup.sg'
LIMIT 1;

INSERT INTO documents (
  order_id,
  uploaded_by,
  file_name,
  original_file_name,
  file_path,
  file_size,
  mime_type,
  document_type,
  status,
  is_deliverable,
  metadata
)
SELECT
  o.id,
  (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
  'logo_concepts_greenfarms.pdf',
  'GreenFarms_Logo_Concepts.pdf', 
  '/documents/deliverables/logo_concepts_greenfarms.pdf',
  5242880, -- 5MB
  'application/pdf',
  'Logo Design - Concepts',
  'approved',
  true,
  jsonb_build_object(
    'concepts_count', 5,
    'formats_included', jsonb_build_array('PNG', 'SVG', 'PDF'),
    'revision_round', 0
  )
FROM orders o
WHERE o.order_number = 'VBG250101002'
LIMIT 1;

-- Create invoices for orders
INSERT INTO invoices (
  invoice_number,
  order_id,
  base_amount,
  discount_amount,
  surcharge_amount,
  tax_amount,
  total_amount,
  currency,
  status,
  issued_at,
  due_date,
  line_items,
  billing_address,
  company_details
)
SELECT
  'INV-VBG250101001',
  o.id,
  3500.00,
  0.00,
  0.00,
  315.00,
  3815.00,
  'SGD',
  'sent',
  '2025-01-15 10:00:00+08',
  '2025-01-30 23:59:59+08',
  jsonb_build_array(
    jsonb_build_object(
      'description', 'Project Report / Business Plan - Technology Sector',
      'quantity', 1,
      'unit_price', 3500.00,
      'total', 3500.00
    )
  ),
  jsonb_build_object(
    'name', 'John Smith',
    'company', 'TechStart Solutions Pte Ltd',
    'email', 'john.smith@techstartup.sg',
    'country', 'Singapore'
  ),
  jsonb_build_object(
    'name', 'VBannaCorp Pte Ltd',
    'address', 'Singapore',
    'tax_id', 'GST123456789',
    'email', 'billing@vbannacorp.com'
  )
FROM orders o
WHERE o.order_number = 'VBG250101001'
LIMIT 1;

INSERT INTO invoices (
  invoice_number,
  order_id,
  base_amount,
  discount_amount,
  surcharge_amount,
  tax_amount,
  total_amount,
  currency,
  status,
  issued_at,
  due_date,
  paid_at,
  paid_amount,
  line_items,
  billing_address,
  company_details
)
SELECT
  'INV-VBG250101002',
  o.id,
  800.00,
  0.00,
  160.00,
  86.40,
  1046.40,
  'SGD',
  'paid',
  '2025-01-10 11:00:00+08',
  '2025-01-25 23:59:59+08',
  '2025-01-12 14:30:00+08',
  1046.40,
  jsonb_build_array(
    jsonb_build_object(
      'description', 'Logo Design - Rush Delivery',
      'quantity', 1,
      'unit_price', 800.00,
      'total', 800.00
    ),
    jsonb_build_object(
      'description', 'Rush Delivery Surcharge (20%)',
      'quantity', 1,
      'unit_price', 160.00,
      'total', 160.00
    )
  ),
  jsonb_build_object(
    'name', 'Maria Gonzalez',
    'company', 'GreenFarms Pte Ltd',
    'email', 'maria.gonzalez@greenfarms.sg',
    'country', 'Singapore'
  ),
  jsonb_build_object(
    'name', 'VBannaCorp Pte Ltd',
    'address', 'Singapore', 
    'tax_id', 'GST123456789',
    'email', 'billing@vbannacorp.com'
  )
FROM orders o
WHERE o.order_number = 'VBG250101002'
LIMIT 1;

-- Create payments
INSERT INTO payments (
  order_id,
  payment_intent_id,
  amount,
  currency,
  payment_method,
  status,
  transaction_id,
  paid_at,
  metadata
)
SELECT
  o.id,
  'pi_3N1234567890123456_1234567890',
  1046.40,
  'SGD',
  'stripe',
  'succeeded',
  'txn_3N1234567890123456_1234567890',
  '2025-01-12 14:30:00+08',
  jsonb_build_object(
    'customer_id', 'cus_ABC123456789',
    'payment_method_id', 'pm_1234567890123456',
    'receipt_url', 'https://pay.stripe.com/receipts/...'
  )
FROM orders o
WHERE o.order_number = 'VBG250101002'
LIMIT 1;

-- Create sample reports with realistic data
INSERT INTO reports (
  report_type,
  title,
  description,
  generated_by,
  order_id,
  data,
  format,
  status,
  generated_at
)
SELECT
  'service_progress',
  'Service Progress - Business Plan Project',
  'Progress tracking for TechStart Solutions business plan development',
  (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
  o.id,
  jsonb_build_object(
    'project_status', 'In Progress',
    'completion_percentage', 65,
    'milestones', jsonb_build_array(
      jsonb_build_object('name', 'Requirements Gathering', 'status', 'completed', 'date', '2025-01-16'),
      jsonb_build_object('name', 'Market Research', 'status', 'completed', 'date', '2025-01-18'),
      jsonb_build_object('name', 'Financial Modeling', 'status', 'in_progress', 'date', null),
      jsonb_build_object('name', 'Final Review', 'status', 'pending', 'date', null)
    ),
    'estimated_completion', '2025-01-29',
    'client_feedback_pending', false
  ),
  'pdf',
  'completed',
  '2025-01-25 09:00:00+08'
FROM orders o
WHERE o.order_number = 'VBG250101001'
LIMIT 1;

INSERT INTO reports (
  report_type,
  title,
  description,
  generated_by,
  data,
  format,
  status,
  generated_at
)
SELECT
  'trade_lead',
  'Trade Lead Analysis - HSN 85176200 Smartphone Accessories',
  'Comprehensive trade lead analysis for mobile device accessories across Malaysia, Thailand, and Indonesia',
  (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
  jsonb_build_object(
    'executive_summary', jsonb_build_object(
      'total_leads', 12,
      'verified_leads', 12,
      'countries_covered', 3,
      'market_potential', '$2.1B',
      'recommendation', 'Strong market opportunity with verified suppliers'
    ),
    'market_analysis', jsonb_build_object(
      'market_size', '$2.1B',
      'growth_rate', '12% CAGR',
      'key_trends', jsonb_build_array(
        '5G adoption driving smartphone upgrades',
        'Increasing demand for budget smartphones',
        'Growing e-commerce penetration'
      ),
      'opportunities', jsonb_build_array(
        'Enterprise mobility solutions',
        'IoT-enabled devices',
        'Sustainable packaging'
      )
    ),
    'compliance_summary', jsonb_build_object(
      'gst_compliance', '100%',
      'export_licenses', 'All verified',
      'aml_status', 'All leads cleared',
      'regulatory_notes', 'All leads comply with local import regulations'
    ),
    'lead_breakdown', jsonb_build_object(
      'malaysia', 4,
      'thailand', 4,
      'indonesia', 4,
      'total_annual_capacity', '2.5M units'
    )
  ),
  'pdf',
  'completed',
  '2025-01-23 14:30:00+08'
FROM users u
WHERE u.role = 'Admin'
LIMIT 1;

INSERT INTO reports (
  report_type,
  title,
  description,
  generated_by,
  data,
  format,
  status,
  generated_at
)
SELECT
  'financial',
  'Financial Summary - January 2025',
  'Monthly financial performance for VBannaCorp GlobalSync services',
  (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
  jsonb_build_object(
    'period', '2025-01',
    'summary', jsonb_build_object(
      'total_revenue', 7967.90,
      'total_orders', 3,
      'avg_order_value', 2655.97,
      'total_tax_collected', 657.90,
      'total_discounts', 150.00,
      'total_surcharges', 160.00
    ),
    'by_service_category', jsonb_build_object(
      'Documentation', jsonb_build_object(
        'revenue', 3815.00,
        'orders', 1,
        'avg_value', 3815.00
      ),
      'Digital', jsonb_build_object(
        'revenue', 4152.90,
        'orders', 2,
        'avg_value', 2076.45
      )
    ),
    'payment_status', jsonb_build_object(
      'paid', 1046.40,
      'pending', 6921.50,
      'overdue', 0
    )
  ),
  'excel',
  'completed',
  '2025-01-25 16:00:00+08'
FROM users u
WHERE u.role = 'Admin'
LIMIT 1;
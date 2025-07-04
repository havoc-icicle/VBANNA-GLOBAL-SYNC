/*
  # Create industries table with specific requirements

  1. New Tables
    - `industries`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `specific_requirements` (jsonb)
      - `questionnaire_fields` (jsonb array)
      - `compliance_requirements` (jsonb array)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `industries` table
    - Add policies for read access to all authenticated users
    - Add admin-only policies for modifications
*/

CREATE TABLE IF NOT EXISTS industries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  specific_requirements jsonb DEFAULT '{}',
  questionnaire_fields jsonb DEFAULT '[]',
  compliance_requirements jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Industries are viewable by all authenticated users"
  ON industries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify industries"
  ON industries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_industries_updated_at BEFORE UPDATE ON industries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert industry data based on requirements
INSERT INTO industries (name, description, specific_requirements, questionnaire_fields, compliance_requirements) VALUES
(
  'Agriculture',
  'Agricultural and farming businesses',
  '{"environmental_regulations": true, "organic_certification": false}',
  '["crop_types", "export_markets", "farm_size", "organic_certified"]',
  '["environmental_regulations"]'
),
(
  'Manufacturing',
  'Manufacturing and production businesses',
  '{"production_capacity": true, "quality_standards": true}',
  '["production_capacity", "hsn_codes", "quality_standards", "export_countries"]',
  '["quality_standards", "environmental_compliance"]'
),
(
  'Technology',
  'Technology and software businesses',
  '{"data_protection": true, "intellectual_property": true}',
  '["software_type", "data_handling", "intellectual_property", "target_markets"]',
  '["data_protection", "intellectual_property"]'
),
(
  'Retail',
  'Retail and e-commerce businesses',
  '{"consumer_protection": true, "product_liability": true}',
  '["product_categories", "sales_channels", "target_customers", "inventory"]',
  '["consumer_protection", "product_liability"]'
),
(
  'Services',
  'Professional and business services',
  '{"professional_licensing": false, "service_standards": true}',
  '["service_types", "client_base", "professional_licenses", "service_area"]',
  '["service_standards"]'
)
ON CONFLICT (name) DO NOTHING;
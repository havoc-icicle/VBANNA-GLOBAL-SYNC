/*
  # Create countries table with tax and compliance data

  1. New Tables
    - `countries`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `code` (text, unique, 3-character country code)
      - `tax_rate` (decimal, primary tax rate GST/VAT)
      - `tax_name` (text, name of tax)
      - `currency` (text, 3-character currency code)
      - `timezone` (text)
      - `compliance_requirements` (jsonb)
      - `regulatory_bodies` (jsonb array)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `countries` table
    - Add policies for read access to all authenticated users
    - Add admin-only policies for modifications
*/

CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  tax_rate decimal(5,2) NOT NULL,
  tax_name text NOT NULL,
  currency text NOT NULL,
  timezone text NOT NULL,
  compliance_requirements jsonb DEFAULT '{}',
  regulatory_bodies jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Countries are viewable by all authenticated users"
  ON countries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify countries"
  ON countries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert country data based on requirements
INSERT INTO countries (name, code, tax_rate, tax_name, currency, timezone, compliance_requirements, regulatory_bodies) VALUES
(
  'Singapore',
  'SGP',
  9.0,
  'GST',
  'SGD',
  'Asia/Singapore',
  '{"acra": true, "mom": true, "mas": true, "pdpa": true, "aml_cft": true, "hsn_code_compliance": true}',
  '["ACRA", "MOM", "MAS"]'
),
(
  'Dubai',
  'ARE',
  5.0,
  'VAT',
  'AED',
  'Asia/Dubai',
  '{"ded": true, "difc": true, "free_zone_exemptions": true, "vat_calculations": true}',
  '["DED", "DIFC"]'
),
(
  'Malta',
  'MLT',
  18.0,
  'VAT',
  'EUR',
  'Europe/Malta',
  '{"mbr": true, "gdpr": true, "corporate_tax_refunds": true}',
  '["MBR"]'
),
(
  'Cayman Islands',
  'CYM',
  0.0,
  'None',
  'USD',
  'America/Cayman',
  '{"beneficial_ownership": true, "aml_cft": true, "transparency_requirements": true}',
  '["CIMA"]'
)
ON CONFLICT (code) DO NOTHING;
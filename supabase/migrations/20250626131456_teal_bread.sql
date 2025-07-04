/*
  # Enhanced Admin Configuration and Workflows

  1. Partnership Integration
    - Add referral tracking fields to users table
    - Add partner-specific metadata

  2. Enhanced Service Configuration
    - Add milestone templates to services
    - Add rush delivery availability

  3. Country/Industry Management
    - Ensure detailed configuration support
*/

-- Add partnership and referral tracking to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_partner_id uuid REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_specific_metadata jsonb DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_type text;

-- Add enhanced service configuration fields
ALTER TABLE services ADD COLUMN IF NOT EXISTS milestone_template jsonb DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS rush_available boolean DEFAULT false;
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_category_details jsonb DEFAULT '{}';

-- Add revision history tracking to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS revision_history jsonb DEFAULT '[]';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS current_milestone text DEFAULT 'pending';

-- Add indices for performance
CREATE INDEX IF NOT EXISTS idx_users_referred_by_partner ON users(referred_by_partner_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_orders_current_milestone ON orders(current_milestone);

-- Insert sample partnership data
INSERT INTO users (
  username,
  email,
  password,
  role,
  first_name,
  last_name,
  partner_type,
  country,
  timezone,
  language
) VALUES (
  'zenith_partner',
  'partner@zenith.sg',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/MZpSx3aXK',
  'Mid-Broker',
  'Zenith',
  'Partnership',
  'zenith',
  'Singapore',
  'Asia/Singapore',
  'en'
) ON CONFLICT (email) DO NOTHING;

-- Update services with milestone templates
UPDATE services SET 
  milestone_template = '[
    {"name": "Requirements Gathering", "description": "Collect client requirements and documentation", "estimated_days": 1},
    {"name": "Initial Draft", "description": "Create initial version of deliverable", "estimated_days": 7},
    {"name": "Client Review", "description": "Client reviews and provides feedback", "estimated_days": 3},
    {"name": "Revisions", "description": "Implement client feedback and revisions", "estimated_days": 2},
    {"name": "Final Delivery", "description": "Deliver final version to client", "estimated_days": 1}
  ]'::jsonb,
  rush_available = true
WHERE category = 'Documentation';

UPDATE services SET 
  milestone_template = '[
    {"name": "Concept Development", "description": "Develop initial concepts and ideas", "estimated_days": 3},
    {"name": "Design Creation", "description": "Create initial designs", "estimated_days": 5},
    {"name": "Client Review", "description": "Client reviews designs", "estimated_days": 2},
    {"name": "Revisions", "description": "Implement design changes", "estimated_days": 2},
    {"name": "Final Delivery", "description": "Deliver final files and assets", "estimated_days": 1}
  ]'::jsonb,
  rush_available = true
WHERE category = 'Digital' AND name IN ('Logo Designing', 'Visiting Card Design', 'Letterhead Design', 'Website Design');
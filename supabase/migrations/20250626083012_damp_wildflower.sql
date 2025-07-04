/*
  # Create users table with role-based access

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `email` (text, unique)
      - `password` (text, hashed)
      - `role` (enum: Admin, End User, Mid-Broker)
      - `first_name` (text)
      - `last_name` (text)
      - `phone` (text, optional)
      - `country` (text, optional)
      - `timezone` (text, default UTC)
      - `language` (text, default en)
      - `is_active` (boolean, default true)
      - `last_login` (timestamptz, optional)
      - `two_factor_enabled` (boolean, default false)
      - `two_factor_secret` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `users` table
    - Add policies for user management based on roles
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('Admin', 'End User', 'Mid-Broker');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role user_role NOT NULL DEFAULT 'End User',
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  country text,
  timezone text DEFAULT 'UTC',
  language text DEFAULT 'en',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  two_factor_enabled boolean DEFAULT false,
  two_factor_secret text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Admins can create users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user
INSERT INTO users (
  username,
  email,
  password,
  role,
  first_name,
  last_name,
  country,
  timezone,
  language
) VALUES (
  'admin',
  'admin@vbannacorp.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/MZpSx3aXK', -- Admin123!
  'Admin',
  'System',
  'Administrator',
  'Singapore',
  'Asia/Singapore',
  'en'
) ON CONFLICT (email) DO NOTHING;
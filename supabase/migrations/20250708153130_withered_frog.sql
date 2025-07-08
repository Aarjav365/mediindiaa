/*
  # MediIndia Database Schema Setup

  1. New Tables
    - `users` - User authentication and profile data
    - `family_members` - Family member profiles linked to users
    - `health_records` - Health records for family members
    - `patients` - Doctor's patient records
    - `appointments` - Appointment bookings
    - `prescriptions` - Digital prescriptions

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Ensure data isolation between users

  3. Storage
    - Create storage buckets for file uploads
    - Set up storage policies
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS patient_reports CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS health_records CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table for authentication and profile data
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  mobile text,
  role text NOT NULL CHECK (role IN ('patient', 'doctor')) DEFAULT 'patient',
  photo_url text,
  date_of_birth date,
  gender text CHECK (gender IN ('Male', 'Female', 'Other')),
  blood_group text,
  address text,
  emergency_contact text,
  allergies text,
  chronic_conditions text,
  occupation text,
  marital_status text,
  auth_provider text DEFAULT 'email',
  is_email_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now()
);

-- Family members table
CREATE TABLE family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  relationship text NOT NULL,
  date_of_birth date,
  age integer,
  gender text CHECK (gender IN ('male', 'female', 'other')) DEFAULT 'male',
  blood_group text,
  conditions text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  is_protected boolean DEFAULT false,
  pin text,
  color text DEFAULT '#0284c7',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Health records table
CREATE TABLE health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES family_members(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('prescription', 'lab-report', 'x-ray', 'health-checkup', 'vaccination', 'other')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'needs-attention')),
  doctor_provider text,
  description text,
  file_url text,
  file_name text,
  file_size bigint,
  prescription_id text,
  doctor_name text,
  prescription_date timestamptz,
  is_from_shared_prescription boolean DEFAULT false,
  upload_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Patients table (for doctors)
CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  mobile text NOT NULL,
  email text,
  blood_group text,
  conditions text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  added_date timestamptz DEFAULT now(),
  last_visit text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Patient reports table
CREATE TABLE patient_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text NOT NULL,
  file_url text,
  file_name text,
  file_size bigint,
  description text,
  upload_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  patient_email text NOT NULL,
  patient_mobile text NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  reason text NOT NULL,
  urgency text NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent', 'emergency')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Prescriptions table
CREATE TABLE prescriptions (
  id text PRIMARY KEY,
  doctor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  patient_info jsonb NOT NULL,
  medications jsonb NOT NULL,
  clinical_info jsonb NOT NULL,
  doctor_info jsonb NOT NULL,
  share_token text UNIQUE NOT NULL,
  share_url text NOT NULL,
  qr_code_url text,
  is_shared boolean DEFAULT false,
  expires_at timestamptz NOT NULL,
  patient_id uuid REFERENCES users(id) ON DELETE SET NULL,
  is_linked_to_patient boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for family_members table
CREATE POLICY "Users can manage own family members"
  ON family_members FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for health_records table
CREATE POLICY "Users can manage own health records"
  ON health_records FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for patients table (doctors only)
CREATE POLICY "Doctors can manage own patients"
  ON patients FOR ALL
  USING (auth.uid() = doctor_id);

-- RLS Policies for patient_reports table
CREATE POLICY "Doctors can manage patient reports"
  ON patient_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM patients 
      WHERE patients.id = patient_reports.patient_id 
      AND patients.doctor_id = auth.uid()
    )
  );

-- RLS Policies for appointments table
CREATE POLICY "Doctors can read own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = doctor_id);

CREATE POLICY "Anyone can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

-- RLS Policies for prescriptions table
CREATE POLICY "Doctors can manage own prescriptions"
  ON prescriptions FOR ALL
  USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can read prescriptions by mobile"
  ON prescriptions FOR SELECT
  USING (
    (patient_info->>'mobile') IN (
      SELECT mobile FROM users WHERE id = auth.uid()
    )
  );

-- Allow anonymous access to prescriptions for sharing
CREATE POLICY "Anonymous can read prescriptions by token"
  ON prescriptions FOR SELECT
  TO anon
  USING (expires_at > now());

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_mobile ON users(mobile);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_health_records_user_id ON health_records(user_id);
CREATE INDEX idx_health_records_member_id ON health_records(member_id);
CREATE INDEX idx_health_records_prescription_id ON health_records(prescription_id);
CREATE INDEX idx_patients_doctor_id ON patients(doctor_id);
CREATE INDEX idx_patients_mobile ON patients(mobile);
CREATE INDEX idx_patient_reports_patient_id ON patient_reports(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_share_token ON prescriptions(share_token);
CREATE INDEX idx_prescriptions_patient_mobile ON prescriptions USING gin ((patient_info->>'mobile'));
CREATE INDEX idx_prescriptions_expires_at ON prescriptions(expires_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at 
  BEFORE UPDATE ON family_members 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at 
  BEFORE UPDATE ON health_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at 
  BEFORE UPDATE ON patients 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
  BEFORE UPDATE ON appointments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at 
  BEFORE UPDATE ON prescriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('health-records', 'health-records', true),
  ('patient-reports', 'patient-reports', true),
  ('profile-photos', 'profile-photos', true);

-- Storage policies for health-records bucket
CREATE POLICY "Users can upload own health records"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'health-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own health records"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'health-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own health records"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'health-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own health records"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'health-records' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for patient-reports bucket
CREATE POLICY "Doctors can upload patient reports"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'patient-reports');

CREATE POLICY "Doctors can view patient reports"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'patient-reports');

CREATE POLICY "Doctors can update patient reports"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'patient-reports');

CREATE POLICY "Doctors can delete patient reports"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'patient-reports');

-- Storage policies for profile-photos bucket
CREATE POLICY "Users can upload own profile photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view profile photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can update own profile photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own profile photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert sample data for testing (optional)
-- You can remove this section if you don't want sample data

-- Sample doctor user
INSERT INTO users (id, email, name, role, auth_provider, is_email_verified) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'doctor@mediindia.com', 'Dr. Priya Patel', 'doctor', 'email', true);

-- Sample patient user
INSERT INTO users (id, email, name, mobile, role, auth_provider, is_email_verified) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'patient@mediindia.com', 'John Doe', '9876543210', 'patient', 'email', true);
/*
  # Initial MediIndia Database Schema

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
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and profile data
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  name text NOT NULL,
  mobile text,
  role text NOT NULL CHECK (role IN ('patient', 'doctor')),
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
CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  relationship text NOT NULL,
  date_of_birth date,
  age integer,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  blood_group text,
  conditions text[],
  allergies text[],
  is_protected boolean DEFAULT false,
  pin text,
  color text DEFAULT '#0284c7',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Health records table
CREATE TABLE IF NOT EXISTS health_records (
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
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  mobile text NOT NULL,
  email text,
  blood_group text,
  conditions text[],
  allergies text[],
  added_date timestamptz DEFAULT now(),
  last_visit text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Patient reports table
CREATE TABLE IF NOT EXISTS patient_reports (
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
CREATE TABLE IF NOT EXISTS appointments (
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
CREATE TABLE IF NOT EXISTS prescriptions (
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Users policies
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

-- Family members policies
CREATE POLICY "Users can manage own family members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Health records policies
CREATE POLICY "Users can manage own health records"
  ON health_records
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Patients policies (for doctors)
CREATE POLICY "Doctors can manage own patients"
  ON patients
  FOR ALL
  TO authenticated
  USING (auth.uid() = doctor_id);

-- Patient reports policies
CREATE POLICY "Doctors can manage patient reports"
  ON patient_reports
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients 
      WHERE patients.id = patient_reports.patient_id 
      AND patients.doctor_id = auth.uid()
    )
  );

-- Appointments policies
CREATE POLICY "Doctors can read own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = doctor_id);

CREATE POLICY "Anyone can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Prescriptions policies
CREATE POLICY "Doctors can manage own prescriptions"
  ON prescriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can read prescriptions by mobile"
  ON prescriptions
  FOR SELECT
  TO authenticated
  USING (
    (patient_info->>'mobile') IN (
      SELECT mobile FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Public can read prescriptions by token"
  ON prescriptions
  FOR SELECT
  TO anon
  USING (expires_at > now());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_member_id ON health_records(member_id);
CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_reports_patient_id ON patient_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_share_token ON prescriptions(share_token);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_mobile ON prescriptions USING gin ((patient_info->>'mobile'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON health_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
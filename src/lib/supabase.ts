import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          name: string;
          mobile: string | null;
          role: 'patient' | 'doctor';
          photo_url: string | null;
          date_of_birth: string | null;
          gender: 'Male' | 'Female' | 'Other' | null;
          blood_group: string | null;
          address: string | null;
          emergency_contact: string | null;
          allergies: string | null;
          chronic_conditions: string | null;
          occupation: string | null;
          marital_status: string | null;
          auth_provider: string;
          is_email_verified: boolean;
          created_at: string;
          updated_at: string;
          last_login: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          name: string;
          mobile?: string | null;
          role: 'patient' | 'doctor';
          photo_url?: string | null;
          date_of_birth?: string | null;
          gender?: 'Male' | 'Female' | 'Other' | null;
          blood_group?: string | null;
          address?: string | null;
          emergency_contact?: string | null;
          allergies?: string | null;
          chronic_conditions?: string | null;
          occupation?: string | null;
          marital_status?: string | null;
          auth_provider?: string;
          is_email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string;
          mobile?: string | null;
          role?: 'patient' | 'doctor';
          photo_url?: string | null;
          date_of_birth?: string | null;
          gender?: 'Male' | 'Female' | 'Other' | null;
          blood_group?: string | null;
          address?: string | null;
          emergency_contact?: string | null;
          allergies?: string | null;
          chronic_conditions?: string | null;
          occupation?: string | null;
          marital_status?: string | null;
          auth_provider?: string;
          is_email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
        };
      };
      family_members: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          relationship: string;
          date_of_birth: string | null;
          age: number | null;
          gender: 'male' | 'female' | 'other' | null;
          blood_group: string | null;
          conditions: string[] | null;
          allergies: string[] | null;
          is_protected: boolean;
          pin: string | null;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          relationship: string;
          date_of_birth?: string | null;
          age?: number | null;
          gender?: 'male' | 'female' | 'other' | null;
          blood_group?: string | null;
          conditions?: string[] | null;
          allergies?: string[] | null;
          is_protected?: boolean;
          pin?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          relationship?: string;
          date_of_birth?: string | null;
          age?: number | null;
          gender?: 'male' | 'female' | 'other' | null;
          blood_group?: string | null;
          conditions?: string[] | null;
          allergies?: string[] | null;
          is_protected?: boolean;
          pin?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      health_records: {
        Row: {
          id: string;
          user_id: string;
          member_id: string | null;
          title: string;
          type: 'prescription' | 'lab-report' | 'x-ray' | 'health-checkup' | 'vaccination' | 'other';
          priority: 'normal' | 'important' | 'needs-attention';
          doctor_provider: string | null;
          description: string | null;
          file_url: string | null;
          file_name: string | null;
          file_size: number | null;
          prescription_id: string | null;
          doctor_name: string | null;
          prescription_date: string | null;
          is_from_shared_prescription: boolean;
          upload_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          member_id?: string | null;
          title: string;
          type: 'prescription' | 'lab-report' | 'x-ray' | 'health-checkup' | 'vaccination' | 'other';
          priority?: 'normal' | 'important' | 'needs-attention';
          doctor_provider?: string | null;
          description?: string | null;
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          prescription_id?: string | null;
          doctor_name?: string | null;
          prescription_date?: string | null;
          is_from_shared_prescription?: boolean;
          upload_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          member_id?: string | null;
          title?: string;
          type?: 'prescription' | 'lab-report' | 'x-ray' | 'health-checkup' | 'vaccination' | 'other';
          priority?: 'normal' | 'important' | 'needs-attention';
          doctor_provider?: string | null;
          description?: string | null;
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          prescription_id?: string | null;
          doctor_name?: string | null;
          prescription_date?: string | null;
          is_from_shared_prescription?: boolean;
          upload_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          doctor_id: string;
          name: string;
          age: number;
          gender: 'Male' | 'Female' | 'Other';
          mobile: string;
          email: string | null;
          blood_group: string | null;
          conditions: string[] | null;
          allergies: string[] | null;
          added_date: string;
          last_visit: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          name: string;
          age: number;
          gender: 'Male' | 'Female' | 'Other';
          mobile: string;
          email?: string | null;
          blood_group?: string | null;
          conditions?: string[] | null;
          allergies?: string[] | null;
          added_date?: string;
          last_visit?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          name?: string;
          age?: number;
          gender?: 'Male' | 'Female' | 'Other';
          mobile?: string;
          email?: string | null;
          blood_group?: string | null;
          conditions?: string[] | null;
          allergies?: string[] | null;
          added_date?: string;
          last_visit?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          doctor_id: string | null;
          patient_name: string;
          patient_email: string;
          patient_mobile: string;
          date: string;
          time: string;
          reason: string;
          urgency: 'normal' | 'urgent' | 'emergency';
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          submitted_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          doctor_id?: string | null;
          patient_name: string;
          patient_email: string;
          patient_mobile: string;
          date: string;
          time: string;
          reason: string;
          urgency?: 'normal' | 'urgent' | 'emergency';
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          submitted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string | null;
          patient_name?: string;
          patient_email?: string;
          patient_mobile?: string;
          date?: string;
          time?: string;
          reason?: string;
          urgency?: 'normal' | 'urgent' | 'emergency';
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          submitted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      prescriptions: {
        Row: {
          id: string;
          doctor_id: string | null;
          patient_info: any;
          medications: any;
          clinical_info: any;
          doctor_info: any;
          share_token: string;
          share_url: string;
          qr_code_url: string | null;
          is_shared: boolean;
          expires_at: string;
          patient_id: string | null;
          is_linked_to_patient: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          doctor_id?: string | null;
          patient_info: any;
          medications: any;
          clinical_info: any;
          doctor_info: any;
          share_token: string;
          share_url: string;
          qr_code_url?: string | null;
          is_shared?: boolean;
          expires_at: string;
          patient_id?: string | null;
          is_linked_to_patient?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string | null;
          patient_info?: any;
          medications?: any;
          clinical_info?: any;
          doctor_info?: any;
          share_token?: string;
          share_url?: string;
          qr_code_url?: string | null;
          is_shared?: boolean;
          expires_at?: string;
          patient_id?: string | null;
          is_linked_to_patient?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
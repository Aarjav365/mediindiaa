import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface DoctorPatient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  email: string;
  bloodGroup?: string;
  conditions?: string[];
  allergies?: string[];
  addedDate: string;
  lastVisit?: string;
  reports: DoctorReport[];
  doctorId: string;
}

export interface DoctorReport {
  id: string;
  title: string;
  type: string;
  uploadDate: string;
  file?: File;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  description?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientMobile: string;
  date: string;
  time: string;
  reason: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  submittedAt: string;
  doctorId?: string;
}

interface DoctorState {
  patients: DoctorPatient[];
  appointments: Appointment[];
  isLoading: boolean;
  addPatient: (patient: Omit<DoctorPatient, 'id' | 'addedDate' | 'reports'>, doctorId: string) => Promise<void>;
  updatePatient: (id: string, updates: Partial<DoctorPatient>) => Promise<void>;
  removePatient: (id: string) => Promise<void>;
  addReportToPatient: (patientId: string, report: Omit<DoctorReport, 'id' | 'uploadDate'>) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'submittedAt' | 'status'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  getAppointmentsByDate: (date: string) => Appointment[];
  getAppointmentsByStatus: (status: string) => Appointment[];
  loadPatients: (doctorId: string) => Promise<void>;
  loadAppointments: (doctorId?: string) => Promise<void>;
  subscribeToAppointments: (doctorId?: string) => (() => void) | null;
}

export const useDoctorStore = create<DoctorState>((set, get) => ({
  patients: [],
  appointments: [],
  isLoading: false,
  
  addPatient: async (patient, doctorId) => {
    set({ isLoading: true });
    try {
      const patientData = {
        doctor_id: doctorId,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        mobile: patient.mobile,
        email: patient.email,
        blood_group: patient.bloodGroup,
        conditions: patient.conditions || [],
        allergies: patient.allergies || []
      };
      
      const { data, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();

      if (error) throw error;
      
      const newPatient: DoctorPatient = {
        id: data.id,
        name: data.name,
        age: data.age,
        gender: data.gender,
        mobile: data.mobile,
        email: data.email || '',
        bloodGroup: data.blood_group,
        conditions: data.conditions || [],
        allergies: data.allergies || [],
        addedDate: data.added_date,
        lastVisit: data.last_visit,
        reports: [],
        doctorId: data.doctor_id
      };
      
      set((state) => ({
        patients: [...state.patients, newPatient],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding patient:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  updatePatient: async (id, updates) => {
    set({ isLoading: true });
    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.age) updateData.age = updates.age;
      if (updates.gender) updateData.gender = updates.gender;
      if (updates.mobile) updateData.mobile = updates.mobile;
      if (updates.email) updateData.email = updates.email;
      if (updates.bloodGroup) updateData.blood_group = updates.bloodGroup;
      if (updates.conditions) updateData.conditions = updates.conditions;
      if (updates.allergies) updateData.allergies = updates.allergies;
      if (updates.lastVisit) updateData.last_visit = updates.lastVisit;

      const { error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        patients: state.patients.map((patient) =>
          patient.id === id ? { ...patient, ...updates } : patient
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating patient:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  removePatient: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        patients: state.patients.filter((patient) => patient.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error removing patient:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  addReportToPatient: async (patientId, report) => {
    try {
      let fileUrl = '';
      
      // Upload file to Supabase Storage if file exists
      if (report.file) {
        const fileExt = report.file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `patient-reports/${patientId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('patient-reports')
          .upload(filePath, report.file);

        if (uploadError) {
          console.error('File upload error:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('patient-reports')
            .getPublicUrl(filePath);
          fileUrl = publicUrl;
        }
      }
      
      const reportData = {
        patient_id: patientId,
        title: report.title,
        type: report.type,
        file_url: fileUrl,
        file_name: report.fileName,
        file_size: report.fileSize,
        description: report.description
      };
      
      const { data, error } = await supabase
        .from('patient_reports')
        .insert(reportData)
        .select()
        .single();

      if (error) throw error;
      
      const newReport: DoctorReport = {
        id: data.id,
        title: data.title,
        type: data.type,
        uploadDate: data.upload_date,
        file: undefined,
        fileUrl: data.file_url,
        fileName: data.file_name,
        fileSize: data.file_size,
        description: data.description
      };
      
      // Update patient's last visit and add report
      const lastVisit = new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      await supabase
        .from('patients')
        .update({ last_visit: lastVisit })
        .eq('id', patientId);
      
      set((state) => ({
        patients: state.patients.map((patient) =>
          patient.id === patientId 
            ? { 
                ...patient, 
                reports: [...patient.reports, newReport],
                lastVisit
              }
            : patient
        )
      }));
    } catch (error) {
      console.error('Error adding report to patient:', error);
      throw error;
    }
  },
  
  addAppointment: async (appointment) => {
    set({ isLoading: true });
    try {
      const appointmentData = {
        doctor_id: appointment.doctorId,
        patient_name: appointment.patientName,
        patient_email: appointment.patientEmail,
        patient_mobile: appointment.patientMobile,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        urgency: appointment.urgency
      };
      
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (error) throw error;
      
      const newAppointment: Appointment = {
        id: data.id,
        patientName: data.patient_name,
        patientEmail: data.patient_email,
        patientMobile: data.patient_mobile,
        date: data.date,
        time: data.time,
        reason: data.reason,
        urgency: data.urgency,
        status: data.status,
        submittedAt: data.submitted_at,
        doctorId: data.doctor_id
      };
      
      set((state) => ({
        appointments: [...state.appointments, newAppointment],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding appointment:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  updateAppointment: async (id, updates) => {
    set({ isLoading: true });
    try {
      const updateData: any = {};
      
      if (updates.status) updateData.status = updates.status;
      if (updates.doctorId) updateData.doctor_id = updates.doctorId;

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        appointments: state.appointments.map((appointment) =>
          appointment.id === id ? { ...appointment, ...updates } : appointment
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating appointment:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  getAppointmentsByDate: (date) => {
    const { appointments } = get();
    return appointments.filter(apt => apt.date === date);
  },

  getAppointmentsByStatus: (status) => {
    const { appointments } = get();
    return appointments.filter(apt => apt.status === status);
  },

  loadPatients: async (doctorId) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          patient_reports (*)
        `)
        .eq('doctor_id', doctorId)
        .order('added_date', { ascending: false });

      if (error) throw error;
      
      const patients: DoctorPatient[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        age: item.age,
        gender: item.gender,
        mobile: item.mobile,
        email: item.email || '',
        bloodGroup: item.blood_group,
        conditions: item.conditions || [],
        allergies: item.allergies || [],
        addedDate: item.added_date,
        lastVisit: item.last_visit,
        reports: (item.patient_reports || []).map((report: any) => ({
          id: report.id,
          title: report.title,
          type: report.type,
          uploadDate: report.upload_date,
          fileUrl: report.file_url,
          fileName: report.file_name,
          fileSize: report.file_size,
          description: report.description
        })),
        doctorId: item.doctor_id
      }));
      
      set({ 
        patients, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error loading patients:', error);
      set({ isLoading: false });
    }
  },

  loadAppointments: async (doctorId) => {
    set({ isLoading: true });
    try {
      let query = supabase
        .from('appointments')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      
      const appointments: Appointment[] = (data || []).map(item => ({
        id: item.id,
        patientName: item.patient_name,
        patientEmail: item.patient_email,
        patientMobile: item.patient_mobile,
        date: item.date,
        time: item.time,
        reason: item.reason,
        urgency: item.urgency,
        status: item.status,
        submittedAt: item.submitted_at,
        doctorId: item.doctor_id
      }));
      
      set({ 
        appointments, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error loading appointments:', error);
      set({ isLoading: false });
    }
  },

  subscribeToAppointments: (doctorId) => {
    // Load initial data
    get().loadAppointments(doctorId);
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: doctorId ? `doctor_id=eq.${doctorId}` : undefined
        },
        () => {
          // Reload data when changes occur
          get().loadAppointments(doctorId);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}));
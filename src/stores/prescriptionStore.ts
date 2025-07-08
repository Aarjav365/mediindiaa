import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface PrescriptionMedication {
  id: string;
  name: string;
  dosage: string;
  timing: 'before-meals' | 'after-meals' | 'with-meals';
  duration: string;
  days?: string[];
}

export interface PrescriptionData {
  id: string;
  patientInfo: {
    name: string;
    age: string;
    gender: 'Male' | 'Female' | 'Other';
    mobile: string;
  };
  medications: PrescriptionMedication[];
  clinicalInfo: {
    diagnosis: string;
    notes: string;
    followUpDate: string;
  };
  doctorInfo: {
    name: string;
    qualification: string;
    registration: string;
  };
  createdAt: string;
  shareToken: string;
  shareUrl: string;
  qrCodeUrl?: string;
  isShared: boolean;
  expiresAt: string;
  patientId?: string;
  doctorId?: string;
  isLinkedToPatient: boolean;
}

interface PrescriptionState {
  prescriptions: PrescriptionData[];
  isLoading: boolean;
  createPrescription: (data: Omit<PrescriptionData, 'id' | 'createdAt' | 'shareToken' | 'shareUrl' | 'expiresAt' | 'isShared' | 'isLinkedToPatient'>) => Promise<{ prescriptionId: string; shareToken: string; shareUrl: string }>;
  getPrescription: (id: string) => Promise<PrescriptionData | null>;
  getPrescriptionByToken: (token: string) => Promise<PrescriptionData | null>;
  getPrescriptionsByMobile: (mobile: string) => PrescriptionData[];
  updatePrescription: (id: string, updates: Partial<PrescriptionData>) => Promise<void>;
  deletePrescription: (id: string) => Promise<void>;
  linkPrescriptionToPatient: (prescriptionId: string, patientId: string) => Promise<void>;
  generateQRCode: (shareUrl: string) => Promise<string>;
  markAsShared: (prescriptionId: string) => void;
  loadPrescriptions: () => Promise<void>;
  loadPrescriptionsByDoctor: (doctorId: string) => Promise<void>;
  subscribeToUserPrescriptions: (mobile: string) => (() => void) | null;
  getActivePrescriptions: () => PrescriptionData[];
  getExpiredPrescriptions: () => PrescriptionData[];
}

// Generate secure share token
const generateShareToken = (): string => {
  return `RX_${Date.now()}_${Math.random().toString(36).substr(2, 12).toUpperCase()}`;
};

// Generate QR code using QR Server API
const generateQRCodeUrl = async (shareUrl: string): Promise<string> => {
  try {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}&format=png&margin=10`;
    return qrApiUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};

export const usePrescriptionStore = create<PrescriptionState>((set, get) => ({
  prescriptions: [],
  isLoading: false,
  
  createPrescription: async (data) => {
    set({ isLoading: true });
    try {
      const prescriptionId = `RX${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const shareToken = generateShareToken();
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const shareUrl = `${baseUrl}/prescription/view?token=${shareToken}`;
      
      // Generate expiry date (48 hours from now)
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      
      // Generate QR code
      const qrCodeUrl = await generateQRCodeUrl(shareUrl);
      
      const prescriptionData = {
        id: prescriptionId,
        doctor_id: data.doctorId,
        patient_info: data.patientInfo,
        medications: data.medications,
        clinical_info: data.clinicalInfo,
        doctor_info: data.doctorInfo,
        share_token: shareToken,
        share_url: shareUrl,
        qr_code_url: qrCodeUrl,
        expires_at: expiresAt,
        is_shared: false,
        is_linked_to_patient: false
      };
      
      const { data: insertedData, error } = await supabase
        .from('prescriptions')
        .insert(prescriptionData)
        .select()
        .single();

      if (error) throw error;
      
      const newPrescription: PrescriptionData = {
        id: insertedData.id,
        patientInfo: insertedData.patient_info,
        medications: insertedData.medications,
        clinicalInfo: insertedData.clinical_info,
        doctorInfo: insertedData.doctor_info,
        createdAt: insertedData.created_at,
        shareToken: insertedData.share_token,
        shareUrl: insertedData.share_url,
        qrCodeUrl: insertedData.qr_code_url,
        expiresAt: insertedData.expires_at,
        isShared: insertedData.is_shared,
        isLinkedToPatient: insertedData.is_linked_to_patient,
        doctorId: insertedData.doctor_id,
        patientId: insertedData.patient_id
      };
      
      set((state) => ({
        prescriptions: [...state.prescriptions, newPrescription],
        isLoading: false
      }));
      
      return { prescriptionId, shareToken, shareUrl };
    } catch (error) {
      console.error('Error creating prescription:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  getPrescription: async (id) => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        const prescription: PrescriptionData = {
          id: data.id,
          patientInfo: data.patient_info,
          medications: data.medications,
          clinicalInfo: data.clinical_info,
          doctorInfo: data.doctor_info,
          createdAt: data.created_at,
          shareToken: data.share_token,
          shareUrl: data.share_url,
          qrCodeUrl: data.qr_code_url,
          expiresAt: data.expires_at,
          isShared: data.is_shared,
          isLinkedToPatient: data.is_linked_to_patient,
          doctorId: data.doctor_id,
          patientId: data.patient_id
        };

        // Add to local state if not already present
        const existingIndex = get().prescriptions.findIndex(p => p.id === id);
        if (existingIndex === -1) {
          set((state) => ({
            prescriptions: [...state.prescriptions, prescription]
          }));
        }

        return prescription;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting prescription:', error);
      return null;
    }
  },

  getPrescriptionByToken: async (token) => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('share_token', token)
        .single();

      if (error) throw error;
      
      if (!data) {
        return null;
      }
      
      // Check if prescription has expired
      const now = new Date();
      const expiryDate = new Date(data.expires_at);
      
      if (now > expiryDate) {
        throw new Error('Prescription link has expired');
      }
      
      const prescription: PrescriptionData = {
        id: data.id,
        patientInfo: data.patient_info,
        medications: data.medications,
        clinicalInfo: data.clinical_info,
        doctorInfo: data.doctor_info,
        createdAt: data.created_at,
        shareToken: data.share_token,
        shareUrl: data.share_url,
        qrCodeUrl: data.qr_code_url,
        expiresAt: data.expires_at,
        isShared: data.is_shared,
        isLinkedToPatient: data.is_linked_to_patient,
        doctorId: data.doctor_id,
        patientId: data.patient_id
      };
      
      return prescription;
    } catch (error) {
      console.error('Error getting prescription by token:', error);
      throw error;
    }
  },

  getPrescriptionsByMobile: (mobile) => {
    const { prescriptions } = get();
    return prescriptions.filter(p => p.patientInfo.mobile === mobile);
  },
  
  updatePrescription: async (id, updates) => {
    set({ isLoading: true });
    try {
      const updateData: any = {};
      
      if (updates.patientInfo) updateData.patient_info = updates.patientInfo;
      if (updates.medications) updateData.medications = updates.medications;
      if (updates.clinicalInfo) updateData.clinical_info = updates.clinicalInfo;
      if (updates.doctorInfo) updateData.doctor_info = updates.doctorInfo;
      if (updates.isShared !== undefined) updateData.is_shared = updates.isShared;
      if (updates.isLinkedToPatient !== undefined) updateData.is_linked_to_patient = updates.isLinkedToPatient;
      if (updates.patientId) updateData.patient_id = updates.patientId;

      const { error } = await supabase
        .from('prescriptions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        prescriptions: state.prescriptions.map(p =>
          p.id === id ? { ...p, ...updates } : p
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating prescription:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  deletePrescription: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        prescriptions: state.prescriptions.filter(p => p.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting prescription:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  linkPrescriptionToPatient: async (prescriptionId, patientId) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({ 
          patient_id: patientId, 
          is_linked_to_patient: true 
        })
        .eq('id', prescriptionId);

      if (error) throw error;
      
      set((state) => ({
        prescriptions: state.prescriptions.map(p =>
          p.id === prescriptionId 
            ? { ...p, patientId, isLinkedToPatient: true }
            : p
        )
      }));
    } catch (error) {
      console.error('Error linking prescription to patient:', error);
      throw error;
    }
  },

  generateQRCode: async (shareUrl) => {
    try {
      return await generateQRCodeUrl(shareUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  },

  markAsShared: async (prescriptionId) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({ is_shared: true })
        .eq('id', prescriptionId);

      if (error) throw error;
      
      set((state) => ({
        prescriptions: state.prescriptions.map(p =>
          p.id === prescriptionId ? { ...p, isShared: true } : p
        )
      }));
    } catch (error) {
      console.error('Error marking prescription as shared:', error);
    }
  },

  loadPrescriptions: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const prescriptions: PrescriptionData[] = (data || []).map(item => ({
        id: item.id,
        patientInfo: item.patient_info,
        medications: item.medications,
        clinicalInfo: item.clinical_info,
        doctorInfo: item.doctor_info,
        createdAt: item.created_at,
        shareToken: item.share_token,
        shareUrl: item.share_url,
        qrCodeUrl: item.qr_code_url,
        expiresAt: item.expires_at,
        isShared: item.is_shared,
        isLinkedToPatient: item.is_linked_to_patient,
        doctorId: item.doctor_id,
        patientId: item.patient_id
      }));
      
      set({ 
        prescriptions, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      set({ isLoading: false });
    }
  },

  loadPrescriptionsByDoctor: async (doctorId) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const prescriptions: PrescriptionData[] = (data || []).map(item => ({
        id: item.id,
        patientInfo: item.patient_info,
        medications: item.medications,
        clinicalInfo: item.clinical_info,
        doctorInfo: item.doctor_info,
        createdAt: item.created_at,
        shareToken: item.share_token,
        shareUrl: item.share_url,
        qrCodeUrl: item.qr_code_url,
        expiresAt: item.expires_at,
        isShared: item.is_shared,
        isLinkedToPatient: item.is_linked_to_patient,
        doctorId: item.doctor_id,
        patientId: item.patient_id
      }));
      
      set({ 
        prescriptions, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error loading doctor prescriptions:', error);
      set({ isLoading: false });
    }
  },

  subscribeToUserPrescriptions: (mobile) => {
    // For mobile-based subscriptions, we need to query by patient_info
    const subscription = supabase
      .channel('user_prescriptions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prescriptions'
        },
        () => {
          // Reload all prescriptions and filter locally
          get().loadPrescriptions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  getActivePrescriptions: () => {
    const { prescriptions } = get();
    const now = new Date();
    return prescriptions.filter(p => new Date(p.expiresAt) > now);
  },

  getExpiredPrescriptions: () => {
    const { prescriptions } = get();
    const now = new Date();
    return prescriptions.filter(p => new Date(p.expiresAt) <= now);
  }
}));
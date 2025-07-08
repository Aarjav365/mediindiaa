import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type RecordType = 'prescription' | 'lab-report' | 'x-ray' | 'health-checkup' | 'vaccination' | 'other';
export type PriorityLevel = 'normal' | 'important' | 'needs-attention';

export interface HealthRecord {
  id: string;
  title: string;
  type: RecordType;
  priority: PriorityLevel;
  doctorProvider: string;
  description: string;
  file: File | null;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadDate: string;
  memberId: string;
  prescriptionId?: string;
  doctorName?: string;
  prescriptionDate?: string;
  isFromSharedPrescription?: boolean;
  userId?: string;
}

interface HealthRecordsState {
  records: HealthRecord[];
  isLoading: boolean;
  addRecord: (record: Omit<HealthRecord, 'id' | 'uploadDate'>) => Promise<void>;
  addPrescriptionRecord: (prescriptionData: any, patientMobile: string, userId?: string) => Promise<void>;
  updateRecord: (id: string, updates: Partial<HealthRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  getRecordsByMember: (memberId: string) => HealthRecord[];
  getRecordsByPriority: (priority: PriorityLevel) => HealthRecord[];
  getPrescriptionsByMobile: (mobile: string) => HealthRecord[];
  loadRecords: (userId?: string) => Promise<void>;
  subscribeToRecords: (userId: string) => (() => void) | null;
}

export const useHealthRecordsStore = create<HealthRecordsState>((set, get) => ({
  records: [],
  isLoading: false,
  
  addRecord: async (record) => {
    set({ isLoading: true });
    try {
      let fileUrl = '';
      
      // Upload file to Supabase Storage if file exists
      if (record.file) {
        const fileExt = record.file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `health-records/${record.userId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('health-records')
          .upload(filePath, record.file);

        if (uploadError) {
          console.error('File upload error:', uploadError);
          // Continue without file if upload fails
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('health-records')
            .getPublicUrl(filePath);
          fileUrl = publicUrl;
        }
      }
      
      const recordData = {
        user_id: record.userId!,
        member_id: record.memberId === 'self' ? null : record.memberId,
        title: record.title,
        type: record.type,
        priority: record.priority,
        doctor_provider: record.doctorProvider,
        description: record.description,
        file_url: fileUrl,
        file_name: record.fileName,
        file_size: record.fileSize,
        prescription_id: record.prescriptionId,
        doctor_name: record.doctorName,
        prescription_date: record.prescriptionDate,
        is_from_shared_prescription: record.isFromSharedPrescription || false
      };
      
      const { data, error } = await supabase
        .from('health_records')
        .insert(recordData)
        .select()
        .single();

      if (error) throw error;
      
      const newRecord: HealthRecord = {
        id: data.id,
        title: data.title,
        type: data.type,
        priority: data.priority,
        doctorProvider: data.doctor_provider || '',
        description: data.description || '',
        file: null,
        fileUrl: data.file_url,
        fileName: data.file_name,
        fileSize: data.file_size,
        uploadDate: data.upload_date,
        memberId: data.member_id || 'self',
        prescriptionId: data.prescription_id,
        doctorName: data.doctor_name,
        prescriptionDate: data.prescription_date,
        isFromSharedPrescription: data.is_from_shared_prescription,
        userId: data.user_id
      };
      
      set((state) => ({
        records: [newRecord, ...state.records],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding health record:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  addPrescriptionRecord: async (prescriptionData, patientMobile, userId) => {
    set({ isLoading: true });
    try {
      // Check if prescription already exists in records
      const { data: existingRecord } = await supabase
        .from('health_records')
        .select('id')
        .eq('prescription_id', prescriptionData.id)
        .eq('user_id', userId)
        .single();
      
      if (!existingRecord) {
        const recordData = {
          user_id: userId || 'guest',
          member_id: null, // Self record
          title: `Prescription - ${prescriptionData.clinicalInfo.diagnosis}`,
          type: 'prescription' as RecordType,
          priority: 'important' as PriorityLevel,
          doctor_provider: prescriptionData.doctorInfo.name,
          description: `Digital prescription for ${prescriptionData.clinicalInfo.diagnosis}. ${prescriptionData.medications.length} medications prescribed.`,
          prescription_id: prescriptionData.id,
          doctor_name: prescriptionData.doctorInfo.name,
          prescription_date: prescriptionData.createdAt,
          is_from_shared_prescription: true
        };
        
        const { data, error } = await supabase
          .from('health_records')
          .insert(recordData)
          .select()
          .single();

        if (error) throw error;
        
        const prescriptionRecord: HealthRecord = {
          id: data.id,
          title: data.title,
          type: data.type,
          priority: data.priority,
          doctorProvider: data.doctor_provider || '',
          description: data.description || '',
          file: null,
          fileUrl: data.file_url,
          fileName: data.file_name,
          fileSize: data.file_size,
          uploadDate: data.upload_date,
          memberId: data.member_id || 'self',
          prescriptionId: data.prescription_id,
          doctorName: data.doctor_name,
          prescriptionDate: data.prescription_date,
          isFromSharedPrescription: data.is_from_shared_prescription,
          userId: data.user_id
        };
        
        set((state) => ({
          records: [prescriptionRecord, ...state.records],
          isLoading: false
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error adding prescription record:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  updateRecord: async (id, updates) => {
    set({ isLoading: true });
    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.type) updateData.type = updates.type;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.doctorProvider) updateData.doctor_provider = updates.doctorProvider;
      if (updates.description) updateData.description = updates.description;

      const { error } = await supabase
        .from('health_records')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        records: state.records.map((record) =>
          record.id === id ? { ...record, ...updates } : record
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating health record:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  deleteRecord: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        records: state.records.filter((record) => record.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting health record:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  getRecordsByMember: (memberId) => {
    return get().records.filter((record) => record.memberId === memberId);
  },
  
  getRecordsByPriority: (priority) => {
    return get().records.filter((record) => record.priority === priority);
  },

  getPrescriptionsByMobile: (mobile) => {
    return get().records.filter(r => 
      r.type === 'prescription' && r.isFromSharedPrescription
    );
  },

  loadRecords: async (userId) => {
    set({ isLoading: true });
    try {
      if (userId && userId !== 'guest') {
        const { data, error } = await supabase
          .from('health_records')
          .select('*')
          .eq('user_id', userId)
          .order('upload_date', { ascending: false });

        if (error) throw error;
        
        const records: HealthRecord[] = (data || []).map(item => ({
          id: item.id,
          title: item.title,
          type: item.type,
          priority: item.priority,
          doctorProvider: item.doctor_provider || '',
          description: item.description || '',
          file: null,
          fileUrl: item.file_url,
          fileName: item.file_name,
          fileSize: item.file_size,
          uploadDate: item.upload_date,
          memberId: item.member_id || 'self',
          prescriptionId: item.prescription_id,
          doctorName: item.doctor_name,
          prescriptionDate: item.prescription_date,
          isFromSharedPrescription: item.is_from_shared_prescription,
          userId: item.user_id
        }));
        
        set({ 
          records, 
          isLoading: false 
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading health records:', error);
      set({ isLoading: false });
    }
  },

  subscribeToRecords: (userId) => {
    // Load initial data
    get().loadRecords(userId);
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('health_records_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'health_records',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Reload data when changes occur
          get().loadRecords(userId);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}));
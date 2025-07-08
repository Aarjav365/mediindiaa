import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  conditions?: string[];
  allergies?: string[];
  isProtected: boolean;
  pin?: string;
  avatar?: string;
  color: string;
  userId: string;
}

interface FamilyState {
  members: FamilyMember[];
  activeMemberId: string | null;
  isLoading: boolean;
  addMember: (member: Omit<FamilyMember, 'id' | 'color'>, userId: string) => Promise<void>;
  updateMember: (id: string, updates: Partial<FamilyMember>) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  setActiveMember: (id: string) => void;
  getActiveMember: () => FamilyMember | null;
  getMemberById: (id: string) => FamilyMember | null;
  loadMembers: (userId: string) => Promise<void>;
  subscribeToMembers: (userId: string) => (() => void) | null;
}

const memberColors = [
  '#0284c7', '#059669', '#dc2626', '#7c3aed', '#ea580c', '#0891b2', '#16a34a', '#be123c'
];

export const useFamilyStore = create<FamilyState>((set, get) => ({
  members: [],
  activeMemberId: null,
  isLoading: false,
  
  addMember: async (member, userId) => {
    set({ isLoading: true });
    try {
      const memberData = {
        user_id: userId,
        name: member.name,
        relationship: member.relationship,
        date_of_birth: member.dateOfBirth,
        age: member.age,
        gender: member.gender,
        blood_group: member.bloodGroup,
        conditions: member.conditions || [],
        allergies: member.allergies || [],
        is_protected: member.isProtected,
        pin: member.pin,
        color: memberColors[get().members.length % memberColors.length]
      };
      
      const { data, error } = await supabase
        .from('family_members')
        .insert(memberData)
        .select()
        .single();

      if (error) throw error;
      
      const newMember: FamilyMember = {
        id: data.id,
        name: data.name,
        relationship: data.relationship,
        dateOfBirth: data.date_of_birth || '',
        age: data.age || 0,
        gender: data.gender || 'male',
        bloodGroup: data.blood_group || '',
        conditions: data.conditions || [],
        allergies: data.allergies || [],
        isProtected: data.is_protected,
        pin: data.pin || '',
        color: data.color,
        userId: data.user_id
      };
      
      set((state) => ({
        members: [...state.members, newMember],
        activeMemberId: state.activeMemberId || newMember.id,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding family member:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  updateMember: async (id, updates) => {
    set({ isLoading: true });
    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.relationship) updateData.relationship = updates.relationship;
      if (updates.dateOfBirth) updateData.date_of_birth = updates.dateOfBirth;
      if (updates.age !== undefined) updateData.age = updates.age;
      if (updates.gender) updateData.gender = updates.gender;
      if (updates.bloodGroup) updateData.blood_group = updates.bloodGroup;
      if (updates.conditions) updateData.conditions = updates.conditions;
      if (updates.allergies) updateData.allergies = updates.allergies;
      if (updates.isProtected !== undefined) updateData.is_protected = updates.isProtected;
      if (updates.pin) updateData.pin = updates.pin;
      if (updates.color) updateData.color = updates.color;

      const { error } = await supabase
        .from('family_members')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        members: state.members.map((member) =>
          member.id === id ? { ...member, ...updates } : member
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating family member:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  removeMember: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => {
        const newMembers = state.members.filter((member) => member.id !== id);
        return {
          members: newMembers,
          activeMemberId: state.activeMemberId === id 
            ? (newMembers.length > 0 ? newMembers[0].id : null)
            : state.activeMemberId,
          isLoading: false
        };
      });
    } catch (error) {
      console.error('Error removing family member:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  setActiveMember: (id) => {
    set({ activeMemberId: id });
  },
  
  getActiveMember: () => {
    const state = get();
    return state.members.find((member) => member.id === state.activeMemberId) || null;
  },
  
  getMemberById: (id) => {
    return get().members.find((member) => member.id === id) || null;
  },

  loadMembers: async (userId) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const members: FamilyMember[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        relationship: item.relationship,
        dateOfBirth: item.date_of_birth || '',
        age: item.age || 0,
        gender: item.gender || 'male',
        bloodGroup: item.blood_group || '',
        conditions: item.conditions || [],
        allergies: item.allergies || [],
        isProtected: item.is_protected,
        pin: item.pin || '',
        color: item.color,
        userId: item.user_id
      }));
      
      set({ 
        members, 
        activeMemberId: members.length > 0 ? members[0].id : null,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error loading family members:', error);
      set({ isLoading: false });
    }
  },

  subscribeToMembers: (userId) => {
    // Load initial data
    get().loadMembers(userId);
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('family_members_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'family_members',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Reload data when changes occur
          get().loadMembers(userId);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}));
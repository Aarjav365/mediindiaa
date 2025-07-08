import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

type UserRole = 'patient' | 'doctor' | null;

interface UserData {
  uid: string;
  name: string;
  email: string;
  mobile?: string;
  role: UserRole;
  photoURL?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  allergies?: string;
  chronicConditions?: string;
  occupation?: string;
  maritalStatus?: string;
  createdAt: string;
  lastLogin: string;
  authProvider: 'email' | 'guest';
  isEmailVerified?: boolean;
  updatedAt?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  userRole: UserRole;
  userId: string | null;
  userData: UserData | null;
  isLoading: boolean;
  session: Session | null;
  
  // Authentication methods
  signInWithEmail: (email: string, password: string, role: UserRole) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signOutUser: () => Promise<void>;
  
  // Legacy methods for backward compatibility
  login: (role: UserRole, userId: string, userData: Record<string, any>) => Promise<void>;
  logout: () => void;
  
  // Profile management
  updateUserProfile: (profileData: Partial<UserData>) => Promise<void>;
  loadUserProfile: (userId: string) => Promise<void>;
  
  // Auth state management
  initializeAuth: () => () => void;
}

const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'email_already_in_use':
      return 'This email is already registered. Please sign in instead or use a different email address.';
    case 'weak_password':
      return 'Password is too weak. Please choose a stronger password with at least 6 characters.';
    case 'invalid_email':
      return 'Please enter a valid email address.';
    case 'user_not_found':
      return 'No account found with this email address. Please check your email or sign up for a new account.';
    case 'wrong_password':
      return 'Incorrect password. Please try again or reset your password.';
    case 'invalid_credentials':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'too_many_requests':
      return 'Too many failed attempts. Please try again later or reset your password.';
    case 'network_request_failed':
      return 'Network error. Please check your internet connection and try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userRole: null,
      userId: null,
      userData: null,
      isLoading: false,
      session: null,

      signInWithEmail: async (email: string, password: string, role: UserRole) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) throw error;

          if (data.user) {
            // Fetch user profile from users table
            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profileError) {
              console.error('Error fetching user profile:', profileError);
            }

            const userData: UserData = {
              uid: data.user.id,
              name: userProfile?.name || data.user.user_metadata?.name || 'User',
              email: data.user.email || '',
              mobile: userProfile?.mobile || '',
              role: userProfile?.role || role || 'patient',
              photoURL: userProfile?.photo_url || data.user.user_metadata?.avatar_url,
              dateOfBirth: userProfile?.date_of_birth,
              gender: userProfile?.gender,
              bloodGroup: userProfile?.blood_group,
              address: userProfile?.address,
              emergencyContact: userProfile?.emergency_contact,
              allergies: userProfile?.allergies,
              chronicConditions: userProfile?.chronic_conditions,
              occupation: userProfile?.occupation,
              maritalStatus: userProfile?.marital_status,
              createdAt: userProfile?.created_at || new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              authProvider: 'email',
              isEmailVerified: data.user.email_confirmed_at ? true : false
            };

            // Update last login
            await supabase
              .from('users')
              .update({ last_login: new Date().toISOString() })
              .eq('id', data.user.id);

            set({
              isAuthenticated: true,
              userRole: userData.role,
              userId: data.user.id,
              userData,
              session: data.session,
              isLoading: false
            });
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(getErrorMessage(error.message) || error.message);
        }
      },

      signUpWithEmail: async (email: string, password: string, name: string, role: UserRole) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                role
              }
            }
          });

          if (error) throw error;

          if (data.user) {
            // Create user profile in users table
            const { error: profileError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email,
                name,
                role: role || 'patient',
                auth_provider: 'email',
                is_email_verified: false
              });

            if (profileError) {
              console.error('Error creating user profile:', profileError);
            }

            const userData: UserData = {
              uid: data.user.id,
              name,
              email: data.user.email || '',
              role: role || 'patient',
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              authProvider: 'email',
              isEmailVerified: false
            };

            set({
              isAuthenticated: true,
              userRole: role,
              userId: data.user.id,
              userData,
              session: data.session,
              isLoading: false
            });
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(getErrorMessage(error.message) || error.message);
        }
      },

      signOutUser: async () => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          set({
            isAuthenticated: false,
            userRole: null,
            userId: null,
            userData: null,
            session: null,
            isLoading: false
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error('Failed to sign out');
        }
      },

      // Legacy login method for backward compatibility
      login: async (role, userId, userData) => {
        try {
          const userDataTyped = userData as UserData;
          
          // For guest users or legacy compatibility
          if (userId === 'guest_user' || userData.isGuest) {
            set({ 
              isAuthenticated: true, 
              userRole: role, 
              userId, 
              userData: userDataTyped
            });
            return;
          }
          
          // For regular users, this should now go through Supabase auth
          set({ 
            isAuthenticated: true, 
            userRole: role, 
            userId, 
            userData: userDataTyped
          });
        } catch (error) {
          console.error('Error during login:', error);
          // Still allow login even if there's an error
          set({ 
            isAuthenticated: true, 
            userRole: role, 
            userId, 
            userData: userData as UserData
          });
        }
      },
      
      logout: () => {
        supabase.auth.signOut();
        set({ 
          isAuthenticated: false, 
          userRole: null, 
          userId: null, 
          userData: null,
          session: null
        });
      },

      updateUserProfile: async (profileData) => {
        const { userId, userData } = get();
        
        if (!userId || !userData) {
          throw new Error('User not authenticated');
        }

        try {
          set({ isLoading: true });
          
          // Update in Supabase
          const { error } = await supabase
            .from('users')
            .update({
              name: profileData.name,
              mobile: profileData.mobile,
              date_of_birth: profileData.dateOfBirth,
              gender: profileData.gender,
              blood_group: profileData.bloodGroup,
              address: profileData.address,
              emergency_contact: profileData.emergencyContact,
              allergies: profileData.allergies,
              chronic_conditions: profileData.chronicConditions,
              occupation: profileData.occupation,
              marital_status: profileData.maritalStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (error) throw error;
          
          // Update local state
          const updatedUserData = { 
            ...userData, 
            ...profileData,
            updatedAt: new Date().toISOString()
          };
          
          set((state) => ({
            userData: updatedUserData,
            isLoading: false
          }));
          
        } catch (error) {
          console.error('Error updating profile:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      loadUserProfile: async (userId) => {
        try {
          if (userId === 'guest_user') return;
          
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

          if (error) throw error;
          
          if (data) {
            const userData: UserData = {
              uid: data.id,
              name: data.name,
              email: data.email || '',
              mobile: data.mobile || '',
              role: data.role,
              photoURL: data.photo_url || '',
              dateOfBirth: data.date_of_birth || '',
              gender: data.gender || '',
              bloodGroup: data.blood_group || '',
              address: data.address || '',
              emergencyContact: data.emergency_contact || '',
              allergies: data.allergies || '',
              chronicConditions: data.chronic_conditions || '',
              occupation: data.occupation || '',
              maritalStatus: data.marital_status || '',
              createdAt: data.created_at,
              lastLogin: data.last_login,
              authProvider: data.auth_provider as 'email' | 'guest',
              isEmailVerified: data.is_email_verified,
              updatedAt: data.updated_at
            };

            set((state) => ({
              userData: { ...state.userData, ...userData }
            }));
          }
        } catch (error: any) {
          console.warn('Could not load user profile:', error);
        }
      },

      initializeAuth: () => {
        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              // Fetch user profile
              const { data: userProfile } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (userProfile) {
                const userData: UserData = {
                  uid: session.user.id,
                  name: userProfile.name,
                  email: session.user.email || '',
                  mobile: userProfile.mobile || '',
                  role: userProfile.role,
                  photoURL: userProfile.photo_url || session.user.user_metadata?.avatar_url,
                  dateOfBirth: userProfile.date_of_birth,
                  gender: userProfile.gender,
                  bloodGroup: userProfile.blood_group,
                  address: userProfile.address,
                  emergencyContact: userProfile.emergency_contact,
                  allergies: userProfile.allergies,
                  chronicConditions: userProfile.chronic_conditions,
                  occupation: userProfile.occupation,
                  maritalStatus: userProfile.marital_status,
                  createdAt: userProfile.created_at,
                  lastLogin: userProfile.last_login,
                  authProvider: userProfile.auth_provider as 'email' | 'guest',
                  isEmailVerified: session.user.email_confirmed_at ? true : false,
                  updatedAt: userProfile.updated_at
                };

                set({
                  isAuthenticated: true,
                  userRole: userProfile.role,
                  userId: session.user.id,
                  userData,
                  session
                });
              }
            } else if (event === 'SIGNED_OUT') {
              set({
                isAuthenticated: false,
                userRole: null,
                userId: null,
                userData: null,
                session: null
              });
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userRole: state.userRole,
        userId: state.userId,
        userData: state.userData
      })
    }
  )
);
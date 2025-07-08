import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Edit3,
  Save,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Camera,
  Upload
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useFamilyStore } from '../../stores/familyStore';
import { toast } from 'react-toastify';

const PatientProfile: React.FC = () => {
  const { patientId } = useParams();
  const { userRole, userData, updateUserProfile, userId } = useAuthStore();
  const { getMemberById, updateMember } = useFamilyStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileType, setProfileType] = useState<'user' | 'family'>('user');
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: '',
    address: '',
    emergencyContact: '',
    allergies: '',
    chronicConditions: '',
    occupation: '',
    maritalStatus: ''
  });

  // Determine if this is user's own profile or family member profile
  useEffect(() => {
    if (patientId && patientId !== 'self' && patientId !== userId) {
      // This is a family member profile
      setProfileType('family');
      const familyMember = getMemberById(patientId);
      if (familyMember) {
        setProfileData({
          name: familyMember.name || '',
          email: '',
          mobile: '',
          dateOfBirth: familyMember.dateOfBirth || '',
          gender: familyMember.gender === 'male' ? 'Male' : familyMember.gender === 'female' ? 'Female' : 'Other',
          bloodGroup: familyMember.bloodGroup || '',
          address: '',
          emergencyContact: '',
          allergies: familyMember.allergies?.join(', ') || '',
          chronicConditions: familyMember.conditions?.join(', ') || '',
          occupation: '',
          maritalStatus: ''
        });
      }
    } else {
      // This is user's own profile
      setProfileType('user');
      if (userData) {
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          mobile: userData.mobile || '',
          dateOfBirth: userData.dateOfBirth || '',
          gender: userData.gender || 'Male',
          bloodGroup: userData.bloodGroup || '',
          address: userData.address || '',
          emergencyContact: userData.emergencyContact || '',
          allergies: userData.allergies || '',
          chronicConditions: userData.chronicConditions || '',
          occupation: userData.occupation || '',
          maritalStatus: userData.maritalStatus || ''
        });
      }
    }
  }, [patientId, userData, userId, getMemberById]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      if (profileType === 'user') {
        // Update user profile in Firebase
        await updateUserProfile(profileData);
        toast.success('Profile updated successfully!');
      } else {
        // Update family member profile
        if (patientId) {
          const updateData = {
            name: profileData.name,
            dateOfBirth: profileData.dateOfBirth,
            gender: profileData.gender.toLowerCase() as 'male' | 'female' | 'other',
            bloodGroup: profileData.bloodGroup,
            allergies: profileData.allergies ? profileData.allergies.split(',').map(a => a.trim()) : [],
            conditions: profileData.chronicConditions ? profileData.chronicConditions.split(',').map(c => c.trim()) : [],
            // Calculate age from date of birth
            age: profileData.dateOfBirth ? calculateAge(profileData.dateOfBirth) : 0
          };
          
          await updateMember(patientId, updateData);
          toast.success('Family member profile updated successfully!');
        }
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original data
    if (profileType === 'user' && userData) {
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        mobile: userData.mobile || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || 'Male',
        bloodGroup: userData.bloodGroup || '',
        address: userData.address || '',
        emergencyContact: userData.emergencyContact || '',
        allergies: userData.allergies || '',
        chronicConditions: userData.chronicConditions || '',
        occupation: userData.occupation || '',
        maritalStatus: userData.maritalStatus || ''
      });
    } else if (profileType === 'family' && patientId) {
      const familyMember = getMemberById(patientId);
      if (familyMember) {
        setProfileData({
          name: familyMember.name || '',
          email: '',
          mobile: '',
          dateOfBirth: familyMember.dateOfBirth || '',
          gender: familyMember.gender === 'male' ? 'Male' : familyMember.gender === 'female' ? 'Female' : 'Other',
          bloodGroup: familyMember.bloodGroup || '',
          address: '',
          emergencyContact: '',
          allergies: familyMember.allergies?.join(', ') || '',
          chronicConditions: familyMember.conditions?.join(', ') || '',
          occupation: '',
          maritalStatus: ''
        });
      }
    }
    setIsEditing(false);
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getDisplayAge = () => {
    if (profileData.dateOfBirth) {
      const age = calculateAge(profileData.dateOfBirth);
      return age > 0 ? `${age} years` : '';
    }
    return '';
  };

  const isOwnProfile = profileType === 'user' || (userRole === 'patient' && profileType === 'family');
  const displayName = profileData.name || (profileType === 'family' ? 'Family Member' : 'User Profile');

  return (
    <AppLayout title={profileType === 'family' ? `${displayName} - Profile` : 'My Profile'}>
      <div className="max-w-4xl mx-auto">
        <Card>
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-semibold">
                  {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                </div>
                {isOwnProfile && isEditing && (
                  <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors">
                    <Camera size={14} />
                  </button>
                )}
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {displayName}
                </h1>
                <p className="text-gray-500">
                  {getDisplayAge()} • {profileData.gender}
                  {profileType === 'family' && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Family Member
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {isOwnProfile && (
              <div className="flex space-x-2">
                {!isEditing ? (
                  <Button
                    variant="primary"
                    leftIcon={<Edit3 size={16} />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      leftIcon={<X size={16} />}
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      leftIcon={<Save size={16} />}
                      onClick={handleSaveProfile}
                      isLoading={isLoading}
                      disabled={isLoading}
                    >
                      Save Changes
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={profileData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <User size={16} className="text-gray-400 mr-2" />
                      <span className="text-gray-900">{profileData.name || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {profileType === 'user' && (
                  <>
                    <div>
                      <label className="form-label">Email Address</label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          className="form-input"
                          value={profileData.email}
                          onChange={handleInputChange}
                          placeholder="Enter email"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Mail size={16} className="text-gray-400 mr-2" />
                          <span className="text-gray-900">{profileData.email || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="form-label">Mobile Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="mobile"
                          className="form-input"
                          value={profileData.mobile}
                          onChange={handleInputChange}
                          placeholder="Enter mobile number"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Phone size={16} className="text-gray-400 mr-2" />
                          <span className="text-gray-900">{profileData.mobile || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <label className="form-label">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dateOfBirth"
                      className="form-input"
                      value={profileData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Calendar size={16} className="text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {profileData.dateOfBirth 
                          ? new Date(profileData.dateOfBirth).toLocaleDateString()
                          : 'Not provided'
                        }
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Gender</label>
                  {isEditing ? (
                    <select
                      name="gender"
                      className="form-input"
                      value={profileData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <User size={16} className="text-gray-400 mr-2" />
                      <span className="text-gray-900">{profileData.gender || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {profileType === 'user' && (
                  <div>
                    <label className="form-label">Occupation</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="occupation"
                        className="form-input"
                        value={profileData.occupation}
                        onChange={handleInputChange}
                        placeholder="Enter occupation"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <User size={16} className="text-gray-400 mr-2" />
                        <span className="text-gray-900">{profileData.occupation || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Medical & Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Medical & Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Blood Group</label>
                  {isEditing ? (
                    <select
                      name="bloodGroup"
                      className="form-input"
                      value={profileData.bloodGroup}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Shield size={16} className="text-gray-400 mr-2" />
                      <span className="text-gray-900">{profileData.bloodGroup || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {profileType === 'user' && (
                  <>
                    <div>
                      <label className="form-label">Address</label>
                      {isEditing ? (
                        <textarea
                          name="address"
                          rows={3}
                          className="form-input"
                          value={profileData.address}
                          onChange={handleInputChange}
                          placeholder="Enter address"
                        />
                      ) : (
                        <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                          <MapPin size={16} className="text-gray-400 mr-2 mt-0.5" />
                          <span className="text-gray-900">{profileData.address || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="form-label">Emergency Contact</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="emergencyContact"
                          className="form-input"
                          value={profileData.emergencyContact}
                          onChange={handleInputChange}
                          placeholder="Name and phone number"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Phone size={16} className="text-gray-400 mr-2" />
                          <span className="text-gray-900">{profileData.emergencyContact || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <label className="form-label">Known Allergies</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="allergies"
                      className="form-input"
                      value={profileData.allergies}
                      onChange={handleInputChange}
                      placeholder="e.g., Penicillin, Peanuts (comma separated)"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {profileData.allergies ? (
                        <div className="flex flex-wrap gap-2">
                          {profileData.allergies.split(',').map((allergy, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-800">
                              {allergy.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">No known allergies</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Chronic Conditions</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="chronicConditions"
                      className="form-input"
                      value={profileData.chronicConditions}
                      onChange={handleInputChange}
                      placeholder="e.g., Diabetes, Hypertension (comma separated)"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {profileData.chronicConditions ? (
                        <div className="flex flex-wrap gap-2">
                          {profileData.chronicConditions.split(',').map((condition, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                              {condition.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">No chronic conditions</span>
                      )}
                    </div>
                  )}
                </div>

                {profileType === 'user' && (
                  <div>
                    <label className="form-label">Marital Status</label>
                    {isEditing ? (
                      <select
                        name="maritalStatus"
                        className="form-input"
                        value={profileData.maritalStatus}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <User size={16} className="text-gray-400 mr-2" />
                        <span className="text-gray-900">{profileData.maritalStatus || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Security Notice */}
          {isOwnProfile && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Shield size={20} className="text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Profile Security
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Your profile information is securely stored in Firebase and encrypted. 
                        Keep your information up to date for better healthcare management and emergency situations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default PatientProfile;
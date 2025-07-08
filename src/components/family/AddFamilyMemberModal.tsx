import React, { useState } from 'react';
import { X, Plus, Shield } from 'lucide-react';
import { useFamilyStore } from '../../stores/familyStore';
import { useAuthStore } from '../../stores/authStore';
import Button from '../ui/Button';
import { toast } from 'react-toastify';

interface AddFamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddFamilyMemberModal: React.FC<AddFamilyMemberModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female' | 'other',
    bloodGroup: '',
    conditions: '',
    allergies: '',
    isProtected: false,
    pin: ''
  });

  const { addMember } = useFamilyStore();
  const { userId } = useAuthStore();

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.relationship || !formData.dateOfBirth) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.isProtected && !formData.pin) {
      toast.error('Please set a PIN for protected profile');
      return;
    }

    if (!userId) {
      toast.error('Please log in to add family members');
      return;
    }

    // Check if user is a guest user
    if (userId === 'guest_user') {
      toast.error('Please log in or sign up for a full account to add family members');
      return;
    }

    try {
      const age = calculateAge(formData.dateOfBirth);
      
      const memberData = {
        name: formData.name,
        relationship: formData.relationship,
        dateOfBirth: formData.dateOfBirth,
        age,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        conditions: formData.conditions ? formData.conditions.split(',').map(c => c.trim()) : [],
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
        isProtected: formData.isProtected,
        ...(formData.isProtected && { pin: formData.pin })
      };

      await addMember(memberData, userId);

      toast.success(`${formData.name} added successfully!`);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        relationship: '',
        dateOfBirth: '',
        gender: 'male',
        bloodGroup: '',
        conditions: '',
        allergies: '',
        isProtected: false,
        pin: ''
      });
    } catch (error) {
      console.error('Error adding family member:', error);
      toast.error('Failed to add family member. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Add Family Member</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="form-label">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="relationship" className="form-label">Relationship *</label>
                <select
                  id="relationship"
                  name="relationship"
                  className="form-input"
                  value={formData.relationship}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Self">Self</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Grandfather">Grandfather</option>
                  <option value="Grandmother">Grandmother</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="form-label">Date of Birth *</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  className="form-input"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="gender" className="form-label">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  className="form-input"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="bloodGroup" className="form-label">Blood Group</label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  className="form-input"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="conditions" className="form-label">Known Conditions</label>
              <input
                type="text"
                id="conditions"
                name="conditions"
                className="form-input"
                value={formData.conditions}
                onChange={handleChange}
                placeholder="e.g., Diabetes, Hypertension (comma separated)"
              />
            </div>

            <div>
              <label htmlFor="allergies" className="form-label">Allergies</label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                className="form-input"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="e.g., Penicillin, Peanuts (comma separated)"
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isProtected"
                  name="isProtected"
                  checked={formData.isProtected}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isProtected" className="ml-2 text-sm text-gray-700 flex items-center">
                  <Shield size={16} className="mr-1 text-warning-500" />
                  Protect this profile with a PIN
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Useful for sensitive medical information or adult children's records
              </p>
              
              {formData.isProtected && (
                <div className="mt-3">
                  <label htmlFor="pin" className="form-label">4-Digit PIN *</label>
                  <input
                    type="password"
                    id="pin"
                    name="pin"
                    className="form-input"
                    value={formData.pin}
                    onChange={handleChange}
                    placeholder="Enter 4-digit PIN"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    required={formData.isProtected}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Plus size={16} />}
              >
                Add Member
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFamilyMemberModal;
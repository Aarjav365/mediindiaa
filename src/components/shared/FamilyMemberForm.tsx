import React, { useState } from 'react';
import { useFamilyStore } from '../../stores/familyStore';
import Button from '../ui/Button';
import { X, Plus } from 'lucide-react';

interface FamilyMemberFormProps {
  onClose: () => void;
}

const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bloodGroup: '',
    relationship: '',
    doctorName: '',
    doctorSpecialty: '',
  });

  const addMember = useFamilyStore(state => state.addMember);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addMember({
      name: formData.name,
      age: parseInt(formData.age),
      bloodGroup: formData.bloodGroup,
      relationship: formData.relationship,
      doctorsConsulted: [{
        name: formData.doctorName,
        specialty: formData.doctorSpecialty,
        lastVisit: new Date().toISOString(),
      }],
      reports: []
    });

    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Add Family Member</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="form-label">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="age" className="form-label">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              className="form-input"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="bloodGroup" className="form-label">Blood Group</label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              className="form-input"
              value={formData.bloodGroup}
              onChange={handleChange}
              required
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
          <label htmlFor="relationship" className="form-label">Relationship</label>
          <select
            id="relationship"
            name="relationship"
            className="form-input"
            value={formData.relationship}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="Spouse">Spouse</option>
            <option value="Child">Child</option>
            <option value="Parent">Parent</option>
            <option value="Sibling">Sibling</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="doctorName" className="form-label">Primary Doctor</label>
          <input
            type="text"
            id="doctorName"
            name="doctorName"
            className="form-input"
            value={formData.doctorName}
            onChange={handleChange}
            placeholder="Doctor's name"
          />
        </div>

        <div>
          <label htmlFor="doctorSpecialty" className="form-label">Specialty</label>
          <input
            type="text"
            id="doctorSpecialty"
            name="doctorSpecialty"
            className="form-input"
            value={formData.doctorSpecialty}
            onChange={handleChange}
            placeholder="Doctor's specialty"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
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
  );
};

export default FamilyMemberForm;
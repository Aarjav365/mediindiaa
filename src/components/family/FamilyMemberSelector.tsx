import React, { useState } from 'react';
import { ChevronDown, User, Plus, Shield } from 'lucide-react';
import { useFamilyStore } from '../../stores/familyStore';
import Button from '../ui/Button';

interface FamilyMemberSelectorProps {
  onAddMember: () => void;
}

const FamilyMemberSelector: React.FC<FamilyMemberSelectorProps> = ({ onAddMember }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { members, activeMemberId, setActiveMember, getActiveMember } = useFamilyStore();
  const activeMember = getActiveMember();

  const handleMemberSelect = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member?.isProtected) {
      // In a real app, you would show a PIN entry modal here
      // For now, we'll just proceed
    }
    setActiveMember(memberId);
    setIsOpen(false);
  };

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
              <User size={20} className="text-primary-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">No family members</h3>
              <p className="text-xs text-gray-500">Add your first family member</p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={onAddMember}
            className="text-xs px-3 py-1.5"
          >
            Add
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className="h-12 w-12 rounded-full flex items-center justify-center text-white font-medium"
              style={{ backgroundColor: activeMember?.color || '#0284c7' }}
            >
              {activeMember?.name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3 text-left">
              <h3 className="text-sm font-medium text-gray-900">
                {activeMember?.name || 'Select Member'}
              </h3>
              <p className="text-xs text-gray-500 flex items-center">
                {activeMember?.relationship}
                {activeMember?.isProtected && (
                  <Shield size={12} className="ml-1 text-warning-500" />
                )}
              </p>
            </div>
          </div>
          <ChevronDown 
            size={16} 
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => handleMemberSelect(member.id)}
                className={`w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 ${
                  member.id === activeMemberId ? 'bg-primary-50 border border-primary-200' : ''
                }`}
              >
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
                  style={{ backgroundColor: member.color }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 text-left flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{member.name}</h4>
                  <p className="text-xs text-gray-500 flex items-center">
                    {member.relationship} • {member.age} years
                    {member.isProtected && (
                      <Shield size={12} className="ml-1 text-warning-500" />
                    )}
                  </p>
                </div>
              </button>
            ))}
            
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onAddMember();
                }}
                className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 text-primary-600"
              >
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Plus size={14} className="text-primary-600" />
                </div>
                <div className="ml-3 text-left">
                  <h4 className="text-sm font-medium">Add Member</h4>
                  <p className="text-xs text-gray-500">Create new profile</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyMemberSelector;
import React, { useState } from 'react';
import { X, Upload, FileText, Microscope, Stethoscope, Syringe, Activity } from 'lucide-react';
import { useHealthRecordsStore, RecordType, PriorityLevel } from '../../stores/healthRecordsStore';
import { useFamilyStore } from '../../stores/familyStore';
import { useAuthStore } from '../../stores/authStore';
import Button from '../ui/Button';
import FileUpload from '../shared/FileUpload';
import { toast } from 'react-toastify';

interface UploadRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadRecordModal: React.FC<UploadRecordModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<RecordType | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    priority: 'normal' as PriorityLevel,
    doctorProvider: '',
    description: ''
  });

  const { addRecord } = useHealthRecordsStore();
  const { getActiveMember } = useFamilyStore();
  const { userId } = useAuthStore();
  const activeMember = getActiveMember();

  const recordTypes = [
    { type: 'prescription' as RecordType, label: 'Prescription', icon: FileText, color: 'bg-blue-500' },
    { type: 'lab-report' as RecordType, label: 'Lab Report', icon: Microscope, color: 'bg-green-500' },
    { type: 'x-ray' as RecordType, label: 'X-Ray/Scan', icon: Activity, color: 'bg-purple-500' },
    { type: 'health-checkup' as RecordType, label: 'Health Checkup', icon: Stethoscope, color: 'bg-orange-500' },
    { type: 'vaccination' as RecordType, label: 'Vaccination', icon: Syringe, color: 'bg-red-500' },
    { type: 'other' as RecordType, label: 'Other', icon: FileText, color: 'bg-gray-500' }
  ];

  const priorityLevels = [
    { 
      value: 'normal' as PriorityLevel, 
      label: 'Normal', 
      description: 'Routine medical record',
      color: 'border-green-200 bg-green-50 text-green-800'
    },
    { 
      value: 'important' as PriorityLevel, 
      label: 'Important', 
      description: 'Requires attention',
      color: 'border-yellow-200 bg-yellow-50 text-yellow-800'
    },
    { 
      value: 'needs-attention' as PriorityLevel, 
      label: 'Needs Attention', 
      description: 'Urgent or critical',
      color: 'border-red-200 bg-red-50 text-red-800'
    }
  ];

  const handleTypeSelect = (type: RecordType) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setFormData(prev => ({
      ...prev,
      title: prev.title || file.name.split('.')[0]
    }));
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!activeMember) {
      toast.error('Please select a family member first');
      return;
    }

    if (!selectedType || !selectedFile || !formData.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!userId) {
      toast.error('Please log in to upload records');
      return;
    }

    try {
      await addRecord({
        title: formData.title,
        type: selectedType,
        priority: formData.priority,
        doctorProvider: formData.doctorProvider,
        description: formData.description,
        file: selectedFile,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        memberId: activeMember.id,
        userId: userId
      });

      toast.success('Health record uploaded successfully!');
      handleClose();
    } catch (error) {
      console.error('Error uploading record:', error);
      toast.error('Failed to upload record. Please try again.');
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedType(null);
    setSelectedFile(null);
    setFormData({
      title: '',
      priority: 'normal',
      doctorProvider: '',
      description: ''
    });
    onClose();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedType(null);
    } else if (step === 3) {
      setStep(2);
      setSelectedFile(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Upload Health Record</h3>
              {activeMember && (
                <p className="text-sm text-gray-500">for {activeMember.name}</p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                2
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                3
              </div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">Record Type</span>
              <span className="text-xs text-gray-500">Upload File</span>
              <span className="text-xs text-gray-500">Details</span>
            </div>
          </div>

          {/* Step 1: Record Type Selection */}
          {step === 1 && (
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Select Record Type</h4>
              <div className="grid grid-cols-2 gap-3">
                {recordTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.type}
                      onClick={() => handleTypeSelect(type.type)}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
                    >
                      <div className={`h-12 w-12 rounded-full ${type.color} flex items-center justify-center mb-2`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: File Upload */}
          {step === 2 && selectedType && (
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Upload File</h4>
              <FileUpload onFileSelect={handleFileSelect} />
              
              <div className="mt-4 flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Record Details */}
          {step === 3 && selectedFile && (
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Record Details</h4>
              
              {/* File Preview */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText size={16} className="text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="form-label">Title *</label>
                  <input
                    type="text"
                    id="title"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter record title"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Priority Level *</label>
                  <div className="space-y-2">
                    {priorityLevels.map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                        className={`w-full p-3 border rounded-lg text-left transition-all duration-200 ${
                          formData.priority === priority.value
                            ? priority.color
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{priority.label}</div>
                        <div className="text-sm opacity-75">{priority.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="doctorProvider" className="form-label">Doctor/Provider</label>
                  <input
                    type="text"
                    id="doctorProvider"
                    className="form-input"
                    value={formData.doctorProvider}
                    onChange={(e) => setFormData(prev => ({ ...prev, doctorProvider: e.target.value }))}
                    placeholder="Doctor or healthcare provider name"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="form-label">Description/Notes</label>
                  <textarea
                    id="description"
                    rows={3}
                    className="form-input"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional notes or description"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  variant="primary" 
                  leftIcon={<Upload size={16} />}
                  onClick={handleSubmit}
                >
                  Upload Record
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadRecordModal;
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  X, 
  Save, 
  Share2, 
  QrCode, 
  User,
  Calendar,
  Pill,
  FileText,
  ArrowLeft,
  Eye,
  Edit3,
  Brain,
  Sparkles
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PrescriptionShareModal from '../../components/prescription/PrescriptionShareModal';
import AISummaryAssistant from '../../components/medical/AISummaryAssistant';
import { useDoctorStore } from '../../stores/doctorStore';
import { usePrescriptionStore } from '../../stores/prescriptionStore';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-toastify';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  timing: 'before-meals' | 'after-meals' | 'with-meals';
  duration: string;
  days?: string[];
}

const CreatePrescriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const prescriptionId = searchParams.get('prescriptionId');
  
  const { patients, loadPatients } = useDoctorStore();
  const { createPrescription, prescriptions, getPrescription, updatePrescription } = usePrescriptionStore();
  const { userId } = useAuthStore();
  
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    mobile: ''
  });
  
  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: '', dosage: '', timing: 'after-meals', duration: '', days: [] }
  ]);
  
  const [clinicalInfo, setClinicalInfo] = useState({
    diagnosis: '',
    notes: '',
    followUpDate: ''
  });
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [createdPrescription, setCreatedPrescription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPrescriptionsList, setShowPrescriptionsList] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Load doctor's patients on mount
  useEffect(() => {
    if (userId) {
      loadPatients(userId);
    }
  }, [userId, loadPatients]);

  // Load prescription for editing if prescriptionId is provided
  useEffect(() => {
    if (prescriptionId) {
      loadPrescriptionForEdit();
    }
  }, [prescriptionId]);

  const loadPrescriptionForEdit = async () => {
    if (!prescriptionId) return;
    
    try {
      const prescription = await getPrescription(prescriptionId);
      if (prescription) {
        setIsEditMode(true);
        setPatientInfo(prescription.patientInfo);
        setMedications(prescription.medications);
        setClinicalInfo(prescription.clinicalInfo);
        toast.info('Prescription loaded for editing');
      }
    } catch (error) {
      console.error('Error loading prescription:', error);
      toast.error('Failed to load prescription for editing');
    }
  };

  useEffect(() => {
    if (patientId && !isEditMode) {
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        setSelectedPatient(patientId);
        setPatientInfo({
          name: patient.name,
          age: patient.age.toString(),
          gender: patient.gender,
          mobile: patient.mobile
        });
      }
    }
  }, [patientId, patients, isEditMode]);

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedPatient(id);
    
    if (id) {
      const patient = patients.find(p => p.id === id);
      if (patient) {
        setPatientInfo({
          name: patient.name,
          age: patient.age.toString(),
          gender: patient.gender,
          mobile: patient.mobile
        });
      }
    } else {
      setPatientInfo({ name: '', age: '', gender: 'Male', mobile: '' });
    }
  };

  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: '',
      dosage: '',
      timing: 'after-meals',
      duration: '',
      days: []
    };
    setMedications([...medications, newMedication]);
  };

  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(medications.filter(med => med.id !== id));
    }
  };

  const updateMedication = (id: string, field: keyof Medication, value: string | string[]) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const toggleDay = (medicationId: string, day: string) => {
    setMedications(medications.map(med => {
      if (med.id === medicationId) {
        const currentDays = med.days || [];
        const newDays = currentDays.includes(day)
          ? currentDays.filter(d => d !== day)
          : [...currentDays, day];
        return { ...med, days: newDays };
      }
      return med;
    }));
  };

  const validateForm = () => {
    if (!patientInfo.name || !patientInfo.age || !patientInfo.mobile) {
      toast.error('Please fill in all patient information');
      return false;
    }

    if (patientInfo.mobile.length !== 10) {
      toast.error('Mobile number must be 10 digits');
      return false;
    }

    const validMedications = medications.filter(med => 
      med.name && med.dosage && med.duration
    );

    if (validMedications.length === 0) {
      toast.error('Please add at least one complete medication');
      return false;
    }

    if (!clinicalInfo.diagnosis) {
      toast.error('Please enter primary diagnosis');
      return false;
    }

    return true;
  };

  const handleSavePrescription = async () => {
    if (!validateForm()) return;

    if (!userId) {
      toast.error('Please log in to create prescriptions');
      return;
    }

    setIsLoading(true);
    try {
      const validMedications = medications.filter(med => 
        med.name && med.dosage && med.duration
      );

      const prescriptionData = {
        patientInfo,
        medications: validMedications,
        clinicalInfo,
        doctorInfo: {
          name: 'Dr. Priya Patel',
          qualification: 'MBBS, MD',
          registration: 'MH12345'
        },
        doctorId: userId
      };

      if (isEditMode && prescriptionId) {
        // Update existing prescription
        await updatePrescription(prescriptionId, prescriptionData);
        toast.success('Prescription updated successfully!');
        const updatedPrescription = await getPrescription(prescriptionId);
        setCreatedPrescription(updatedPrescription);
      } else {
        // Create new prescription
        const result = await createPrescription(prescriptionData);
        const newPrescription = await getPrescription(result.prescriptionId);
        setCreatedPrescription(newPrescription);
        toast.success('Prescription created successfully!');
      }
      
      setShowShareModal(true);
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast.error('Failed to save prescription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPrescription = async (prescriptionId: string) => {
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (prescription && prescription.shareToken) {
      navigate(`/prescription/view?token=${prescription.shareToken}`);
    } else {
      toast.error('Prescription not found or missing share token');
    }
  };

  const getPatientPrescriptions = () => {
    if (!patientInfo.mobile) return [];
    return prescriptions.filter(p => p.patientInfo.mobile === patientInfo.mobile);
  };

  return (
    <AppLayout title={isEditMode ? "Edit Prescription" : "Create Prescription"}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/doctor/dashboard')}
          >
            Back to Dashboard
          </Button>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              leftIcon={<Brain size={16} />}
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className={showAIAssistant ? "bg-purple-50 border-purple-300 text-purple-700" : ""}
            >
              {showAIAssistant ? 'Hide AI Assistant' : 'AI Summary Assistant'}
            </Button>
            {patientInfo.mobile && getPatientPrescriptions().length > 0 && (
              <Button
                variant="outline"
                leftIcon={<Eye size={16} />}
                onClick={() => setShowPrescriptionsList(!showPrescriptionsList)}
              >
                View Prescriptions ({getPatientPrescriptions().length})
              </Button>
            )}
            <Button
              variant="outline"
              leftIcon={<Save size={16} />}
              onClick={handleSavePrescription}
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isEditMode ? 'Update Prescription' : 'Create & Share Prescription'}
            </Button>
          </div>
        </div>

        {/* AI Summary Assistant */}
        <AISummaryAssistant
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
          patientName={patientInfo.name}
        />

        {/* Patient Prescriptions List */}
        {showPrescriptionsList && patientInfo.mobile && (
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Previous Prescriptions for {patientInfo.name}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrescriptionsList(false)}
              >
                <X size={16} />
              </Button>
            </div>
            
            <div className="space-y-3">
              {getPatientPrescriptions().map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <h4 className="font-medium text-gray-900">{prescription.clinicalInfo.diagnosis}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(prescription.createdAt).toLocaleDateString()} • {prescription.medications.length} medications
                    </p>
                    <p className="text-xs text-gray-400">ID: {prescription.id}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye size={14} />}
                      onClick={() => handleViewPrescription(prescription.id)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Share2 size={14} />}
                      onClick={() => {
                        setCreatedPrescription(prescription);
                        setShowShareModal(true);
                      }}
                    >
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Edit3 size={14} />}
                      onClick={() => {
                        navigate(`/doctor/create-prescription?prescriptionId=${prescription.id}`);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Patient Information */}
        <Card>
          <div className="flex items-center mb-4">
            <User size={20} className="text-primary-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Patient Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isEditMode && (
              <div className="md:col-span-2">
                <label htmlFor="existingPatient" className="form-label">Select Existing Patient (Optional)</label>
                <select
                  id="existingPatient"
                  className="form-input"
                  value={selectedPatient}
                  onChange={handlePatientSelect}
                >
                  <option value="">Select a patient or enter new details</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.mobile}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="patientName" className="form-label">Full Name *</label>
              <input
                id="patientName"
                type="text"
                className="form-input"
                value={patientInfo.name}
                onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                placeholder="Enter patient's full name"
                required
                disabled={isEditMode}
              />
            </div>

            <div>
              <label htmlFor="patientAge" className="form-label">Age *</label>
              <input
                id="patientAge"
                type="number"
                className="form-input"
                value={patientInfo.age}
                onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                placeholder="Enter age"
                required
                disabled={isEditMode}
              />
            </div>

            <div>
              <label htmlFor="patientGender" className="form-label">Gender *</label>
              <select
                id="patientGender"
                className="form-input"
                value={patientInfo.gender}
                onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                required
                disabled={isEditMode}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="patientMobile" className="form-label">Contact Number *</label>
              <input
                id="patientMobile"
                type="tel"
                className="form-input"
                value={patientInfo.mobile}
                onChange={(e) => setPatientInfo({ ...patientInfo, mobile: e.target.value })}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                required
                disabled={isEditMode}
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for prescription sharing and patient onboarding
              </p>
            </div>
          </div>
        </Card>

        {/* Medications */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Pill size={20} className="text-primary-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Medications</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus size={16} />}
              onClick={addMedication}
            >
              Add Medication
            </Button>
          </div>

          <div className="space-y-4">
            {medications.map((medication, index) => (
              <div key={medication.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Medication {index + 1}</h4>
                  {medications.length > 1 && (
                    <button
                      onClick={() => removeMedication(medication.id)}
                      className="text-error-500 hover:text-error-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="form-label">Medicine Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={medication.name}
                      onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                      placeholder="e.g., Amoxicillin"
                    />
                  </div>

                  <div>
                    <label className="form-label">Dosage *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={medication.dosage}
                      onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                      placeholder="e.g., 500mg"
                    />
                  </div>

                  <div>
                    <label className="form-label">Timing *</label>
                    <select
                      className="form-input"
                      value={medication.timing}
                      onChange={(e) => updateMedication(medication.id, 'timing', e.target.value)}
                    >
                      <option value="before-meals">Before Meals</option>
                      <option value="after-meals">After Meals</option>
                      <option value="with-meals">With Meals</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Duration *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={medication.duration}
                      onChange={(e) => updateMedication(medication.id, 'duration', e.target.value)}
                      placeholder="e.g., 7 days"
                    />
                  </div>
                </div>

                {/* Days Selection */}
                <div className="mt-3">
                  <label className="form-label">Select Days (Optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(medication.id, day)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          medication.days?.includes(day)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  {medication.days && medication.days.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {medication.days.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Clinical Information */}
        <Card>
          <div className="flex items-center mb-4">
            <FileText size={20} className="text-primary-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Clinical Information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="diagnosis" className="form-label">Primary Diagnosis *</label>
              <input
                id="diagnosis"
                type="text"
                className="form-input"
                value={clinicalInfo.diagnosis}
                onChange={(e) => setClinicalInfo({ ...clinicalInfo, diagnosis: e.target.value })}
                placeholder="Enter primary diagnosis"
                required
              />
            </div>

            <div>
              <label htmlFor="notes" className="form-label">Additional Notes/Instructions</label>
              <textarea
                id="notes"
                rows={3}
                className="form-input"
                value={clinicalInfo.notes}
                onChange={(e) => setClinicalInfo({ ...clinicalInfo, notes: e.target.value })}
                placeholder="Any additional instructions for the patient"
              />
            </div>

            <div>
              <label htmlFor="followUpDate" className="form-label">Follow-up Date (Optional)</label>
              <input
                id="followUpDate"
                type="date"
                className="form-input"
                value={clinicalInfo.followUpDate}
                onChange={(e) => setClinicalInfo({ ...clinicalInfo, followUpDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/doctor/dashboard')}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={<Save size={16} />}
            onClick={handleSavePrescription}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isEditMode ? 'Update Prescription' : 'Create & Share Prescription'}
          </Button>
        </div>
      </div>

      {/* Prescription Share Modal */}
      {createdPrescription && (
        <PrescriptionShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          prescriptionId={createdPrescription.id}
          shareToken={createdPrescription.shareToken}
          shareUrl={createdPrescription.shareUrl}
          qrCodeUrl={createdPrescription.qrCodeUrl}
          patientName={patientInfo.name}
          patientMobile={patientInfo.mobile}
          expiresAt={createdPrescription.expiresAt}
        />
      )}
    </AppLayout>
  );
};

export default CreatePrescriptionPage;
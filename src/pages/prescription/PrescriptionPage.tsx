import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, 
  Share2, 
  Calendar, 
  User, 
  Phone,
  Pill,
  FileText,
  Shield,
  ArrowLeft,
  Printer
} from 'lucide-react';
import Button from '../../components/ui/Button';
import PatientOnboardingModal from '../../components/auth/PatientOnboardingModal';
import { usePrescriptionStore } from '../../stores/prescriptionStore';
import { useHealthRecordsStore } from '../../stores/healthRecordsStore';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-toastify';

const PrescriptionPage: React.FC = () => {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const { getPrescription } = usePrescriptionStore();
  const { addPrescriptionRecord } = useHealthRecordsStore();
  const { isAuthenticated, login, userData } = useAuthStore();
  
  const [prescription, setPrescription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    loadPrescription();
  }, [prescriptionId]);

  const loadPrescription = async () => {
    if (!prescriptionId) return;
    
    try {
      const data = await getPrescription(prescriptionId);
      setPrescription(data);
      
      // Check if user needs onboarding
      if (!isAuthenticated) {
        setNeedsOnboarding(true);
        setShowOnboardingModal(true);
      } else {
        // If user is authenticated and mobile matches, add to health records
        if (userData?.mobile === data?.patientInfo.mobile) {
          await addPrescriptionRecord(data, userData.mobile);
          toast.success('Prescription added to your health records!');
        }
      }
    } catch (error) {
      toast.error('Prescription not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    setNeedsOnboarding(false);
    if (prescription) {
      await addPrescriptionRecord(prescription, prescription.patientInfo.mobile);
      toast.success('Prescription added to your health records!');
    }
  };

  const handleDirectAccess = async () => {
    // Allow direct access without registration
    const userData = { 
      name: prescription?.patientInfo.name || 'Guest User',
      mobile: prescription?.patientInfo.mobile || '',
      isGuest: true
    };
    
    login('patient', 'guest-user', userData);
    
    if (prescription) {
      await addPrescriptionRecord(prescription, prescription.patientInfo.mobile);
    }
    
    setShowOnboardingModal(false);
    setNeedsOnboarding(false);
    toast.info('Accessing as guest. Sign up for full features!');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Prescription link copied to clipboard!');
  };

  const formatTiming = (timing: string) => {
    switch (timing) {
      case 'before-meals':
        return 'Before Meals';
      case 'after-meals':
        return 'After Meals';
      case 'with-meals':
        return 'With Meals';
      default:
        return timing;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prescription...</p>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Prescription Not Found</h2>
          <p className="text-gray-600 mb-4">The prescription you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Button
                variant="ghost"
                leftIcon={<ArrowLeft size={16} />}
                onClick={() => isAuthenticated ? navigate('/patient/dashboard') : navigate('/')}
                className="mr-4"
              >
                Back
              </Button>
              <div className="flex items-center">
                <img className="h-8 w-auto" src="/WhatsApp Image 2025-05-29 at 23.45.29_6f1f4ad0.jpg" alt="MediIndia" />
                <span className="ml-2 text-xl font-semibold text-primary-600">MediIndia</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                leftIcon={<Printer size={16} />}
                onClick={handlePrint}
              >
                Print
              </Button>
              <Button
                variant="outline"
                leftIcon={<Share2 size={16} />}
                onClick={handleShare}
              >
                Share
              </Button>
              {isAuthenticated && (
                <Button
                  variant="primary"
                  onClick={() => navigate('/patient/dashboard')}
                >
                  Go to Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Prescription Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Prescription Header */}
          <div className="bg-primary-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">Medical Prescription</h1>
                <p className="text-primary-100">Prescription ID: {prescriptionId}</p>
                <p className="text-primary-100">Date: {new Date(prescription.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-semibold">{prescription.doctorInfo.name}</h2>
                <p className="text-primary-100">{prescription.doctorInfo.qualification}</p>
                <p className="text-primary-100">Reg. No: {prescription.doctorInfo.registration}</p>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center mb-4">
              <User size={20} className="text-primary-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{prescription.patientInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age / Gender</p>
                <p className="font-medium text-gray-900">{prescription.patientInfo.age} years / {prescription.patientInfo.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium text-gray-900">{prescription.patientInfo.mobile}</p>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center mb-4">
              <FileText size={20} className="text-primary-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Diagnosis</h3>
            </div>
            <p className="text-gray-900 font-medium">{prescription.clinicalInfo.diagnosis}</p>
            {prescription.clinicalInfo.notes && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 mb-1">Additional Notes:</p>
                <p className="text-gray-700">{prescription.clinicalInfo.notes}</p>
              </div>
            )}
          </div>

          {/* Medications */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center mb-4">
              <Pill size={20} className="text-primary-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Prescribed Medications</h3>
            </div>
            
            <div className="space-y-4">
              {prescription.medications.map((medication: any, index: number) => (
                <div key={medication.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 text-lg">{index + 1}. {medication.name}</h4>
                    <span className="text-sm text-gray-500">{medication.duration}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Dosage:</span>
                      <span className="ml-2 font-medium text-gray-900">{medication.dosage}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Timing:</span>
                      <span className="ml-2 font-medium text-gray-900">{formatTiming(medication.timing)}</span>
                    </div>
                  </div>
                  
                  {medication.days && medication.days.length > 0 && (
                    <div className="mt-2">
                      <span className="text-gray-500 text-sm">Days:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {medication.days.map((day: string, dayIndex: number) => (
                          <span key={dayIndex} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up */}
          {prescription.clinicalInfo.followUpDate && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center mb-2">
                <Calendar size={20} className="text-primary-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Follow-up</h3>
              </div>
              <p className="text-gray-900">
                Next appointment: {new Date(prescription.clinicalInfo.followUpDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Shield size={16} className="mr-2" />
                <span>This is a digitally generated prescription</span>
              </div>
              <div className="text-sm text-gray-500">
                Generated on {new Date(prescription.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Call-to-Action for Unregistered Users */}
        {needsOnboarding && !isAuthenticated && (
          <div className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Save this prescription to your health records!</h3>
              <p className="text-blue-100 mb-4">
                Create a free MediIndia account to manage all your prescriptions and health records in one place.
              </p>
              <div className="flex justify-center space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowOnboardingModal(true)}
                  className="bg-white text-primary-600 hover:bg-gray-100"
                >
                  Create Account
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDirectAccess}
                  className="border-white text-white hover:bg-white hover:text-primary-600"
                >
                  Continue as Guest
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patient Onboarding Modal */}
      <PatientOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        prescriptionData={prescription}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};

export default PrescriptionPage;
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Printer,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import PatientRegistrationModal from '../../components/auth/PatientRegistrationModal';
import { usePrescriptionStore } from '../../stores/prescriptionStore';
import { useHealthRecordsStore } from '../../stores/healthRecordsStore';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-toastify';

const PrescriptionViewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const { getPrescriptionByToken, linkPrescriptionToPatient } = usePrescriptionStore();
  const { addPrescriptionRecord } = useHealthRecordsStore();
  const { isAuthenticated, login, userData } = useAuthStore();
  
  const [prescription, setPrescription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [needsRegistration, setNeedsRegistration] = useState(false);

  useEffect(() => {
    loadPrescription();
  }, [token]);

  const loadPrescription = async () => {
    if (!token) {
      setError('Invalid prescription link');
      setLoading(false);
      return;
    }
    
    try {
      const data = await getPrescriptionByToken(token);
      
      if (!data) {
        setError('Prescription not found or link has expired');
        setLoading(false);
        return;
      }
      
      setPrescription(data);
      
      // Check if user needs registration
      if (!isAuthenticated) {
        setNeedsRegistration(true);
        setShowRegistrationModal(true);
      } else {
        // If user is authenticated and mobile matches, auto-link prescription
        if (userData?.mobile === data.patientInfo.mobile) {
          await handleAutoLinkPrescription(data);
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoLinkPrescription = async (prescriptionData: any) => {
    try {
      if (userData?.uid && !prescriptionData.isLinkedToPatient) {
        await linkPrescriptionToPatient(prescriptionData.id, userData.uid);
        await addPrescriptionRecord(prescriptionData, userData.mobile, userData.uid);
        toast.success('Prescription added to your health records!');
      }
    } catch (error) {
      console.error('Error auto-linking prescription:', error);
    }
  };

  const handleRegistrationComplete = async (patientData: any) => {
    try {
      // Create patient account
      const patientId = `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Login the patient
      await login('patient', patientId, {
        uid: patientId,
        name: patientData.name,
        mobile: patientData.mobile,
        email: patientData.email || '',
        role: 'patient',
        createdAt: new Date().toISOString(),
        authProvider: 'prescription-link'
      });
      
      // Link prescription to patient
      if (prescription) {
        await linkPrescriptionToPatient(prescription.id, patientId);
        await addPrescriptionRecord(prescription, patientData.mobile, patientId);
      }
      
      setShowRegistrationModal(false);
      setNeedsRegistration(false);
      toast.success('Account created and prescription saved to your health records!');
    } catch (error) {
      console.error('Error completing registration:', error);
      toast.error('Failed to complete registration. Please try again.');
    }
  };

  const handleGuestAccess = async () => {
    // Allow guest access without registration
    const guestData = { 
      name: prescription?.patientInfo.name || 'Guest User',
      mobile: prescription?.patientInfo.mobile || '',
      isGuest: true
    };
    
    await login('patient', 'guest_user', guestData);
    
    if (prescription) {
      await addPrescriptionRecord(prescription, prescription.patientInfo.mobile);
    }
    
    setShowRegistrationModal(false);
    setNeedsRegistration(false);
    toast.info('Accessing as guest. Create an account to save your prescriptions!');
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

  const getTimeRemaining = () => {
    if (!prescription) return '';
    
    const now = new Date();
    const expiry = new Date(prescription.expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Home
            </Button>
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact your healthcare provider.
            </p>
          </div>
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
            
            <div className="flex items-center space-x-2">
              {/* Link Status */}
              <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Clock size={14} className="mr-1" />
                {getTimeRemaining()}
              </div>
              
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
                <h1 className="text-2xl font-bold mb-2">Digital Prescription</h1>
                <p className="text-primary-100">ID: {prescription.id}</p>
                <p className="text-primary-100">Date: {new Date(prescription.createdAt).toLocaleDateString()}</p>
                <p className="text-primary-100">Token: {prescription.shareToken}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-semibold">{prescription.doctorInfo.name}</h2>
                <p className="text-primary-100">{prescription.doctorInfo.qualification}</p>
                <p className="text-primary-100">Reg. No: {prescription.doctorInfo.registration}</p>
              </div>
            </div>
          </div>

          {/* Link Status Banner */}
          {prescription.isLinkedToPatient ? (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex items-center">
                <CheckCircle size={20} className="text-green-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Prescription Linked to Patient Account
                  </p>
                  <p className="text-sm text-green-700">
                    This prescription has been successfully added to the patient's health records.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex items-center">
                <Clock size={20} className="text-blue-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Secure Prescription Access
                  </p>
                  <p className="text-sm text-blue-700">
                    This prescription is available for secure viewing. Create an account to save it to your health records.
                  </p>
                </div>
              </div>
            </div>
          )}

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
        {needsRegistration && !isAuthenticated && (
          <div className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Save this prescription to your health records!</h3>
              <p className="text-blue-100 mb-4">
                Create a free MediIndia account to manage all your prescriptions and health records in one place.
              </p>
              <div className="flex justify-center space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowRegistrationModal(true)}
                  className="bg-white text-primary-600 hover:bg-gray-100"
                >
                  Create Account
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGuestAccess}
                  className="border-white text-white hover:bg-white hover:text-primary-600"
                >
                  Continue as Guest
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patient Registration Modal */}
      <PatientRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        prescriptionData={prescription}
        onComplete={handleRegistrationComplete}
      />
    </div>
  );
};

export default PrescriptionViewPage;
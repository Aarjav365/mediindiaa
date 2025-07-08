import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Phone, Mail, FileText, Check, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useDoctorStore } from '../../stores/doctorStore';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-toastify';

const BookAppointmentPage: React.FC = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { addAppointment } = useDoctorStore();
  const { isAuthenticated } = useAuthStore();
  
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientMobile: '',
    date: '',
    time: '',
    reason: '',
    urgency: 'normal' as 'normal' | 'urgent' | 'emergency'
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientName || !formData.patientEmail || !formData.patientMobile || 
        !formData.date || !formData.time || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.patientMobile.length !== 10) {
      toast.error('Mobile number must be 10 digits');
      return;
    }

    if (!doctorId) {
      toast.error('Invalid doctor ID');
      return;
    }

    setIsLoading(true);
    try {
      await addAppointment({
        ...formData,
        doctorId
      });

      setIsSubmitted(true);
      
      // Show signup prompt if user is not authenticated
      if (!isAuthenticated) {
        setShowSignupPrompt(true);
      }
      
      toast.success('Appointment request submitted successfully!');
    } catch (error) {
      console.error('Error submitting appointment:', error);
      toast.error('Failed to submit appointment request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupRedirect = () => {
    navigate('/signup');
  };

  const handlePatientDashboard = () => {
    navigate('/patient/dashboard');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'border-yellow-300 bg-yellow-50';
      case 'emergency':
        return 'border-red-300 bg-red-50';
      default:
        return 'border-green-300 bg-green-50';
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white bg-opacity-20 mb-4">
                <Check size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Appointment Requested!</h2>
              <p className="text-green-100">
                Your appointment request has been submitted successfully
              </p>
            </div>
            
            <div className="p-8">
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User size={18} className="mr-3 text-gray-400" />
                    <span className="font-medium text-gray-900">{formData.patientName}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={18} className="mr-3 text-gray-400" />
                    <span className="text-gray-700">
                      {new Date(formData.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {formData.time}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FileText size={18} className="mr-3 text-gray-400" />
                    <span className="text-gray-700">{formData.reason}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={18} className="mr-3 text-gray-400" />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      formData.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                      formData.urgency === 'urgent' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Doctor will review your appointment request</li>
                  <li>• You'll receive confirmation via email and SMS</li>
                  <li>• Appointment details will be sent 24 hours before</li>
                  <li>• You can reschedule if needed</li>
                </ul>
              </div>
              
              {showSignupPrompt && !isAuthenticated ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-4">
                    <h4 className="font-semibold text-purple-900 mb-2">
                      🎉 Want to manage your health records?
                    </h4>
                    <p className="text-sm text-purple-800 mb-3">
                      Sign up for MediIndia to access your patient dashboard, track appointments, and manage your complete health timeline.
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="primary"
                      onClick={handleSignupRedirect}
                      className="flex-1"
                    >
                      Sign Up for MediIndia
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/')}
                      className="flex-1"
                    >
                      Back to Home
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    onClick={handlePatientDashboard}
                    className="flex-1"
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="flex-1"
                  >
                    Back to Home
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Button
                variant="ghost"
                leftIcon={<ArrowLeft size={16} />}
                onClick={() => navigate('/')}
                className="mr-4"
              >
                Back
              </Button>
              <div className="flex items-center">
                <img className="h-8 w-auto" src="/WhatsApp Image 2025-05-29 at 23.45.29_6f1f4ad0.jpg" alt="MediIndia" />
                <span className="ml-2 text-xl font-semibold text-primary-600">MediIndia</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 p-8 text-white text-center">
            <Calendar size={48} className="mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl font-bold mb-2">Book Appointment</h1>
            <p className="text-primary-100">
              Schedule your consultation with our healthcare professionals
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Patient Information
                </h3>
                
                <div>
                  <label htmlFor="patientName" className="form-label">Full Name *</label>
                  <input
                    id="patientName"
                    name="patientName"
                    type="text"
                    className="form-input"
                    placeholder="Enter your full name"
                    value={formData.patientName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="patientEmail" className="form-label">Email Address *</label>
                    <input
                      id="patientEmail"
                      name="patientEmail"
                      type="email"
                      className="form-input"
                      placeholder="Enter your email"
                      value={formData.patientEmail}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="patientMobile" className="form-label">Mobile Number *</label>
                    <input
                      id="patientMobile"
                      name="patientMobile"
                      type="tel"
                      className="form-input"
                      placeholder="10-digit mobile number"
                      value={formData.patientMobile}
                      onChange={handleChange}
                      maxLength={10}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Appointment Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="form-label">Preferred Date *</label>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      className="form-input"
                      value={formData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="time" className="form-label">Preferred Time *</label>
                    <select
                      id="time"
                      name="time"
                      className="form-input"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    >
                      <option value="">Select time slot</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="urgency" className="form-label">Urgency Level</label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {[
                      { value: 'normal', label: 'Normal', desc: 'Routine consultation' },
                      { value: 'urgent', label: 'Urgent', desc: 'Needs attention soon' },
                      { value: 'emergency', label: 'Emergency', desc: 'Immediate care needed' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, urgency: option.value as any }))}
                        className={`p-3 border-2 rounded-lg text-left transition-all duration-200 ${
                          formData.urgency === option.value
                            ? getUrgencyColor(option.value) + ' border-opacity-100'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        disabled={isLoading}
                      >
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-gray-600 mt-1">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="reason" className="form-label">Reason for Visit *</label>
                  <textarea
                    id="reason"
                    name="reason"
                    rows={4}
                    className="form-input"
                    placeholder="Please describe your health concern, symptoms, or reason for consultation in detail..."
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Important Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Clock size={20} className="text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Important Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Appointment requests are reviewed within 2-4 hours</li>
                        <li>You'll receive confirmation via email and SMS</li>
                        <li>Please arrive 15 minutes before your appointment</li>
                        <li>Bring any relevant medical documents</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 text-lg"
                isLoading={isLoading}
                disabled={isLoading}
                leftIcon={<Calendar size={20} />}
              >
                {isLoading ? 'Submitting Request...' : 'Submit Appointment Request'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentPage;
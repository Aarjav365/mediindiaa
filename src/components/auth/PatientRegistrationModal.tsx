import React, { useState } from 'react';
import { X, User, Phone, Check, ArrowRight, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../ui/Button';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescriptionData: any;
  onComplete: (patientData: any) => void;
}

const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({ 
  isOpen, 
  onClose, 
  prescriptionData,
  onComplete 
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: prescriptionData?.patientInfo?.name || '',
    mobile: prescriptionData?.patientInfo?.mobile || '',
    email: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.mobile) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.mobile.length !== 10) {
      toast.error('Mobile number must be 10 digits');
      return;
    }

    setIsLoading(true);
    
    // Simulate OTP sending
    setTimeout(() => {
      setOtpSent(true);
      setStep(2);
      setIsLoading(false);
      toast.success('OTP sent to your mobile number!');
    }, 1500);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.otp || formData.otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    
    // Simulate OTP verification
    setTimeout(async () => {
      if (formData.otp === '123456') { // Mock OTP
        setStep(3);
        setIsLoading(false);
        toast.success('Account created successfully!');
        
        // Auto-complete after showing success
        setTimeout(() => {
          onComplete(formData);
          onClose();
        }, 2000);
      } else {
        setIsLoading(false);
        toast.error('Invalid OTP. Please try again.');
      }
    }, 1500);
  };

  const handleSkipRegistration = () => {
    // Allow access without registration but with limited features
    const guestData = {
      name: formData.name || 'Guest User',
      mobile: formData.mobile || '',
      email: '',
      isGuest: true
    };
    
    onComplete(guestData);
    toast.info('Accessing as guest. Sign up later for full features.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {step === 1 ? 'Create Your Account' : step === 2 ? 'Verify Mobile' : 'Welcome to MediIndia!'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {step > 1 ? <Check size={16} /> : '1'}
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {step > 2 ? <Check size={16} /> : '2'}
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {step >= 3 ? <Check size={16} /> : '3'}
              </div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">Details</span>
              <span className="text-xs text-gray-500">Verify</span>
              <span className="text-xs text-gray-500">Complete</span>
            </div>
          </div>

          {step === 1 && (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 mb-2">
                  🎉 Your prescription is ready to view!
                </p>
                <p className="text-xs text-blue-600">
                  Create a free account to save it to your health records and access the full MediIndia platform.
                </p>
              </div>

              <form onSubmit={handleSendOtp}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="form-label">Full Name *</label>
                    <input
                      id="name"
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      required
                      disabled={!!prescriptionData?.patientInfo?.name}
                    />
                  </div>

                  <div>
                    <label htmlFor="mobile" className="form-label">Mobile Number *</label>
                    <input
                      id="mobile"
                      type="tel"
                      className="form-input"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      required
                      disabled={!!prescriptionData?.patientInfo?.mobile}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label">Email Address (Optional)</label>
                    <input
                      id="email"
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isLoading}
                    disabled={isLoading}
                    rightIcon={<ArrowRight size={16} />}
                  >
                    Create Account & Send OTP
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleSkipRegistration}
                  >
                    Continue as Guest
                  </Button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="text-center mb-4">
                <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone size={24} className="text-primary-600" />
                </div>
                <p className="text-sm text-gray-600">
                  We've sent a 6-digit OTP to <strong>{formData.mobile}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp}>
                <div className="mb-4">
                  <label htmlFor="otp" className="form-label">Enter OTP *</label>
                  <input
                    id="otp"
                    type="text"
                    className="form-input text-center text-lg tracking-widest"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Use <strong>123456</strong> for demo
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    Verify & Complete Registration
                  </Button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        toast.info('OTP resent!');
                      }}
                      className="text-sm text-primary-600 hover:text-primary-500"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-green-600" />
              </div>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Welcome to MediIndia!
              </h4>
              
              <p className="text-sm text-gray-600 mb-4">
                Your account has been created successfully. Your prescription has been added to your health records.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  ✅ Prescription saved to your health timeline<br/>
                  ✅ Account created with mobile verification<br/>
                  ✅ Ready to access your patient dashboard
                </p>
              </div>
              
              <p className="text-xs text-gray-500">
                Redirecting to your dashboard...
              </p>
            </div>
          )}

          {step < 3 && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRegistrationModal;
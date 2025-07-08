import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  UserRound, 
  Stethoscope, 
  ArrowLeft,
  Check,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';

type UserType = 'patient' | 'doctor';

const SignupPage: React.FC = () => {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);
  
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithEmail } = useAuthStore();
  
  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setEmailAlreadyExists(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Reset email already exists state when user changes email
    if (name === 'email') {
      setEmailAlreadyExists(false);
    }
  };
  
  const handleSignInInstead = async () => {
    if (!userType) {
      toast.error('Please select account type first');
      return;
    }
    
    if (!formData.email || !formData.password) {
      toast.error('Please enter your email and password');
      return;
    }
    
    setIsLoading(true);
    try {
      await signInWithEmail(formData.email, formData.password, userType);
      
      const redirectPath = userType === 'patient' ? '/patient/dashboard' : '/doctor/dashboard';
      navigate(redirectPath);
      toast.success('Signed in successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType) {
      toast.error('Please select account type first');
      return;
    }
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    setEmailAlreadyExists(false);
    
    try {
      await signUpWithEmail(formData.email, formData.password, formData.name, userType);
      
      const redirectPath = userType === 'patient' ? '/patient/dashboard' : '/doctor/dashboard';
      navigate(redirectPath);
      toast.success('Account created successfully!');
    } catch (error: any) {
      if (error.message.includes('already registered') || error.message.includes('email is already')) {
        setEmailAlreadyExists(true);
      } else {
        toast.error(error.message || 'Failed to create account');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render the appropriate form based on user type selection
  const renderForm = () => {
    if (!userType) {
      return (
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Choose Account Type</h2>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              onClick={() => handleUserTypeSelect('patient')}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
            >
              <UserRound size={36} className="text-primary-500 mb-3" />
              <span className="font-medium text-gray-900">Patient</span>
              <span className="text-xs text-gray-500 mt-1">Manage your health records</span>
            </button>
            
            <button
              onClick={() => handleUserTypeSelect('doctor')}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
            >
              <Stethoscope size={36} className="text-primary-500 mb-3" />
              <span className="font-medium text-gray-900">Doctor</span>
              <span className="text-xs text-gray-500 mt-1">Create prescriptions & manage patients</span>
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 animate-fade-in">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setUserType(null)}
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to account types
          </button>
        </div>
        
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
            {userType === 'patient' ? <UserRound size={24} className="text-primary-600" /> : <Stethoscope size={24} className="text-primary-600" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Create {userType === 'patient' ? 'Patient' : 'Doctor'} Account
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Join MediIndia and start managing your {userType === 'patient' ? 'health records' : 'patients'} today.
          </p>
        </div>

        {/* Email Already Exists Alert */}
        {emailAlreadyExists && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800 mb-1">
                  Account Already Exists
                </h3>
                <p className="text-sm text-amber-700 mb-3">
                  An account with this email address already exists. Would you like to sign in instead?
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSignInInstead}
                    isLoading={isLoading}
                    disabled={isLoading}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    Sign In with This Email
                  </Button>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-amber-700 hover:text-amber-800 underline"
                  >
                    Go to Login Page
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Sign Up Form */}
        <form onSubmit={handleEmailSignUp}>
          <div className="mb-4">
            <label htmlFor="name" className="form-label">Full Name</label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                className="form-input pl-10"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className={`form-input pl-10 ${emailAlreadyExists ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-200' : ''}`}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                className="form-input pl-10 pr-10"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 6 characters long
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className="form-input pl-10 pr-10"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Create Account
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">Privacy Policy</a>
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <img className="h-12 w-auto" src="/WhatsApp Image 2025-05-29 at 23.45.29_6f1f4ad0.jpg" alt="MediIndia" />
        </Link>
        <h2 className="mt-3 text-center text-3xl font-extrabold text-gray-900">
          MediIndia
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your secure digital health record platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {renderForm()}
      </div>
    </div>
  );
};

export default SignupPage;
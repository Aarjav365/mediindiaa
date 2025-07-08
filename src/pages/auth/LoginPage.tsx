import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-toastify';
import { 
  UserRound, 
  Stethoscope, 
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import Button from '../../components/ui/Button';

type UserType = 'patient' | 'doctor';

const LoginPage: React.FC = () => {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signInWithEmail } = useAuthStore();
  
  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setEmail('');
    setPassword('');
  };
  
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType) {
      toast.error('Please select account type first');
      return;
    }
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      await signInWithEmail(email, password, userType);
      
      const redirectPath = userType === 'patient' ? '/patient/dashboard' : '/doctor/dashboard';
      navigate(redirectPath);
      toast.success('Signed in successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
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
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
                Sign up
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
            Sign In as {userType === 'patient' ? 'Patient' : 'Doctor'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Welcome back! Please sign in to your account.
          </p>
        </div>

        {/* Email Sign In Form */}
        <form onSubmit={handleEmailSignIn}>
          <div className="mb-4">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="form-input pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="form-input pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="mt-1 text-right">
              <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                Forgot password?
              </a>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Sign In
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up
            </Link>
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

export default LoginPage;
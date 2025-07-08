import React, { useEffect } from 'react';
import { ArrowLeft, MessageCircle, Sparkles, Clock, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

const ClinicPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Botpress webchat
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.botpress.cloud/webchat/v3.0/inject.js';
    script1.async = true;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = 'https://files.bpcontent.cloud/2025/06/19/13/20250619133658-PAF0A4IU.js';
    script2.async = true;
    document.head.appendChild(script2);

    return () => {
      // Cleanup scripts on unmount
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Button
                variant="ghost"
                leftIcon={<ArrowLeft size={16} />}
                onClick={() => navigate('/patient/dashboard')}
                className="mr-4"
              >
                Back
              </Button>
              <div className="flex items-center">
                <img className="h-8 w-auto" src="/WhatsApp Image 2025-05-29 at 23.45.29_6f1f4ad0.jpg" alt="MediIndia" />
                <span className="ml-2 text-xl font-semibold text-primary-600">MediIndia Clinic</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                AI Assistant Online
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Welcome Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <MessageCircle size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Welcome to MediIndia AI Clinic</h1>
                  <p className="text-gray-600">Your intelligent healthcare companion</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <Sparkles size={32} className="mx-auto text-blue-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
                  <p className="text-sm text-gray-600">Get intelligent health recommendations and insights</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <Clock size={32} className="mx-auto text-purple-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">24/7 Availability</h3>
                  <p className="text-sm text-gray-600">Access healthcare guidance anytime, anywhere</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <Shield size={32} className="mx-auto text-green-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
                  <p className="text-sm text-gray-600">Your health data is protected and confidential</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                <h2 className="text-xl font-semibold mb-3">How to Get Started</h2>
                <div className="space-y-2 text-blue-100">
                  <p>• Click the chat icon in the bottom right corner</p>
                  <p>• Ask questions about your health, symptoms, or medications</p>
                  <p>• Get personalized recommendations and guidance</p>
                  <p>• Access your medical records and health timeline</p>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Symptom Analysis</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Describe your symptoms and get AI-powered analysis with recommendations for next steps.
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <MessageCircle size={16} className="mr-2" />
                  Start Conversation
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Medication Guidance</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Get information about your medications, dosages, and potential interactions.
                </p>
                <div className="flex items-center text-purple-600 text-sm font-medium">
                  <Sparkles size={16} className="mr-2" />
                  Ask About Medications
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Records Review</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Upload and discuss your medical reports with our AI for better understanding.
                </p>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <Shield size={16} className="mr-2" />
                  Review Records
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Wellness Tips</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Receive personalized wellness recommendations based on your health profile.
                </p>
                <div className="flex items-center text-orange-600 text-sm font-medium">
                  <Clock size={16} className="mr-2" />
                  Get Tips
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full justify-start"
                  leftIcon={<MessageCircle size={16} />}
                  onClick={() => {
                    // Trigger Botpress chat
                    const chatButton = document.querySelector('[data-testid="webchat-button"]') as HTMLElement;
                    if (chatButton) {
                      chatButton.click();
                    }
                  }}
                >
                  Start AI Consultation
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/patient/dashboard')}
                >
                  View Health Records
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/reminders')}
                >
                  Manage Reminders
                </Button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                  <Shield size={16} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Important Notice</h3>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                This AI assistant provides general health information and should not replace professional medical advice.
              </p>
              <p className="text-xs text-gray-600">
                Always consult with healthcare professionals for medical emergencies or serious health concerns.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">AI consultation available</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Health records synced</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">System updated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              MediIndia AI Clinic - Powered by advanced artificial intelligence for better healthcare
            </p>
            <p className="text-gray-500 text-xs mt-2">
              © 2025 MediIndia. All rights reserved. | Privacy Policy | Terms of Service
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClinicPage;
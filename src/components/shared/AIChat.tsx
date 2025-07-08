import React from 'react';
import { ArrowLeft, MessageCircle, Sparkles, Clock, Shield, Zap, Brain, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import Button from '../ui/Button';

const AIChat: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppLayout title="AI Health Assistant">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/patient/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
            <div className="flex items-center mb-6">
              <div className="h-16 w-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                <MessageCircle size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">AI Health Assistant</h1>
                <p className="text-blue-100 text-lg">
                  Advanced AI-powered healthcare guidance and medical insights
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-xl">
                <Brain size={32} className="mx-auto text-white mb-3" />
                <h3 className="font-semibold mb-2">Smart Diagnosis</h3>
                <p className="text-sm text-blue-100">AI-powered symptom analysis and health insights</p>
              </div>
              
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-xl">
                <Heart size={32} className="mx-auto text-white mb-3" />
                <h3 className="font-semibold mb-2">Personalized Care</h3>
                <p className="text-sm text-blue-100">Tailored health recommendations based on your records</p>
              </div>
              
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-xl">
                <Shield size={32} className="mx-auto text-white mb-3" />
                <h3 className="font-semibold mb-2">Secure & Private</h3>
                <p className="text-sm text-blue-100">HIPAA-compliant AI with complete data privacy</p>
              </div>
            </div>
          </div>

          {/* Coming Soon Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-lg font-medium bg-warning-100 text-warning-800 mb-4">
                <Clock size={20} className="mr-2" />
                Coming Soon
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Revolutionary AI Healthcare is Almost Here
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We're developing an intelligent AI assistant that will transform how you interact with your health data. 
                Get ready for personalized medical insights, instant symptom analysis, and proactive health recommendations.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Sparkles size={24} className="text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Symptom Analysis</h3>
                </div>
                <p className="text-gray-700 text-sm mb-3">
                  Describe your symptoms and get AI-powered analysis with potential causes and recommended next steps.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Intelligent symptom checker</li>
                  <li>• Risk assessment and urgency levels</li>
                  <li>• Personalized recommendations</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Brain size={24} className="text-purple-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Medical Report Analysis</h3>
                </div>
                <p className="text-gray-700 text-sm mb-3">
                  Upload your medical reports and get easy-to-understand explanations and insights.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Lab result interpretation</li>
                  <li>• Trend analysis over time</li>
                  <li>• Actionable health insights</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Zap size={24} className="text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Medication Guidance</h3>
                </div>
                <p className="text-gray-700 text-sm mb-3">
                  Get information about medications, interactions, and personalized dosage recommendations.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Drug interaction checker</li>
                  <li>• Side effect monitoring</li>
                  <li>• Adherence tracking</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Heart size={24} className="text-orange-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Wellness Coaching</h3>
                </div>
                <p className="text-gray-700 text-sm mb-3">
                  Receive personalized wellness tips and lifestyle recommendations based on your health profile.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Personalized health tips</li>
                  <li>• Lifestyle recommendations</li>
                  <li>• Preventive care reminders</li>
                </ul>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Development Timeline</h3>
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-gray-900">Research</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
                <div className="flex-1 h-1 bg-green-500 mx-2"></div>
                <div className="text-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-gray-900">Development</p>
                  <p className="text-xs text-gray-500">In Progress</p>
                </div>
                <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
                <div className="text-center">
                  <div className="w-4 h-4 bg-gray-300 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-gray-900">Testing</p>
                  <p className="text-xs text-gray-500">Q2 2025</p>
                </div>
                <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
                <div className="text-center">
                  <div className="w-4 h-4 bg-gray-300 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-gray-900">Launch</p>
                  <p className="text-xs text-gray-500">Q3 2025</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Be the First to Experience AI Healthcare
              </h3>
              <p className="text-gray-600 mb-6">
                Join our early access program to get notified when the AI Health Assistant launches.
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="primary"
                  onClick={() => navigate('/patient/dashboard')}
                >
                  Back to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // In a real app, this would open a notification signup form
                    alert('Thank you for your interest! We\'ll notify you when AI Health Assistant is available.');
                  }}
                >
                  Get Notified
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
          <div className="flex items-center mb-3">
            <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
              <Shield size={16} className="text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Important Medical Disclaimer</h3>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            The AI Health Assistant will provide general health information and insights for educational purposes only. 
            It is not intended to replace professional medical advice, diagnosis, or treatment.
          </p>
          <p className="text-xs text-gray-600">
            Always consult with qualified healthcare professionals for medical emergencies, serious health concerns, 
            or before making any changes to your treatment plan.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default AIChat;
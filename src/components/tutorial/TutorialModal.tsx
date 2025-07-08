import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Upload, Users, Bot, Calendar } from 'lucide-react';
import Button from '../ui/Button';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to MediIndia!",
      content: "Your complete family health management platform. Let's take a quick tour to get you started.",
      image: "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2",
      icon: <Users size={24} className="text-primary-500" />
    },
    {
      title: "Manage Family Members",
      content: "Add and manage health records for your entire family from one account. Perfect for parents, caregivers, and family health management.",
      image: "https://images.pexels.com/photos/3985062/pexels-photo-3985062.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2",
      icon: <Users size={24} className="text-green-500" />
    },
    {
      title: "Upload Health Records",
      content: "Easily upload prescriptions, lab reports, X-rays, and other medical documents. Tag them by priority and organize by family member.",
      image: "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2",
      icon: <Upload size={24} className="text-blue-500" />
    },
    {
      title: "AI Health Assistant",
      content: "Get instant answers to health questions, understand your medical reports, and receive personalized health guidance.",
      image: "https://images.pexels.com/photos/8376277/pexels-photo-8376277.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2",
      icon: <Bot size={24} className="text-purple-500" />
    },
    {
      title: "Smart Reminders",
      content: "Never miss medications, appointments, or health checkups with intelligent reminders for each family member.",
      image: "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2",
      icon: <Calendar size={24} className="text-orange-500" />
    },
    {
      title: "You're All Set!",
      content: "Start by adding your first family member and uploading a health record. Your journey to better health management begins now!",
      image: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2",
      icon: <Users size={24} className="text-primary-500" />
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              {step.icon}
              <h3 className="text-lg font-semibold text-gray-900 ml-2">Tutorial</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Step {currentStep + 1} of {tutorialSteps.length}</span>
              <span className="text-sm text-gray-500">{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Tutorial content */}
          <div className="text-center">
            <img
              src={step.image}
              alt={step.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            
            <h4 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h4>
            <p className="text-gray-600 mb-6 leading-relaxed">{step.content}</p>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              leftIcon={<ChevronLeft size={16} />}
            >
              Previous
            </Button>

            {currentStep === tutorialSteps.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleClose}
              >
                Get Started
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={nextStep}
                rightIcon={<ChevronRight size={16} />}
              >
                Next
              </Button>
            )}
          </div>

          {/* Skip option */}
          <div className="text-center mt-4">
            <button
              onClick={handleClose}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
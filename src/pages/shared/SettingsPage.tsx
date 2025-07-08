import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Bell, 
  User, 
  Shield, 
  LogOut,
  Check
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-toastify';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, userData, logout } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    mobile: userData?.mobile || '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
    whatsapp: false,
    medicationReminders: true,
    appointmentReminders: true,
    reportUploads: true,
  });
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm({ ...profileForm, [name]: value });
  };
  
  const handleNotificationToggle = (setting: string) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting as keyof typeof notificationSettings],
    });
  };
  
  const handleUpdateProfile = () => {
    // Simulate profile update
    toast.success('Profile updated successfully!');
  };
  
  const handleUpdateNotifications = () => {
    // Simulate notification settings update
    toast.success('Notification preferences updated!');
  };
  
  const handleChangePassword = () => {
    // Simulate password change
    toast.success('Password changed successfully!');
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <AppLayout title="Settings">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Card className="h-full">
            <nav className="space-y-1">
              <button
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                  activeTab === 'profile'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={18} className="mr-3" />
                Profile Information
              </button>
              <button
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                  activeTab === 'notifications'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell size={18} className="mr-3" />
                Notification Preferences
              </button>
              <button
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                  activeTab === 'security'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('security')}
              >
                <Shield size={18} className="mr-3" />
                Security Settings
              </button>
              <button
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-gray-700 hover:bg-gray-50 hover:text-gray-900 mt-6"
                onClick={handleLogout}
              >
                <LogOut size={18} className="mr-3" />
                Logout
              </button>
            </nav>
          </Card>
        </div>
        
        {/* Settings Content */}
        <div className="flex-1">
          <Card className="h-full">
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Profile Information</h3>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="form-input"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-input"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="mobile" className="form-label">Mobile Number</label>
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      className="form-input"
                      value={profileForm.mobile}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  {userRole === 'patient' && (
                    <>
                      <div>
                        <label htmlFor="bloodGroup" className="form-label">Blood Group</label>
                        <input
                          id="bloodGroup"
                          name="bloodGroup"
                          type="text"
                          className="form-input"
                          value={profileForm.bloodGroup}
                          onChange={handleProfileChange}
                        />
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label htmlFor="address" className="form-label">Address</label>
                        <input
                          id="address"
                          name="address"
                          type="text"
                          className="form-input"
                          value={profileForm.address}
                          onChange={handleProfileChange}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="emergencyContact" className="form-label">Emergency Contact</label>
                        <input
                          id="emergencyContact"
                          name="emergencyContact"
                          type="tel"
                          className="form-input"
                          placeholder="Name and phone number"
                          value={profileForm.emergencyContact}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="primary"
                    leftIcon={<Save size={16} />}
                    onClick={handleUpdateProfile}
                  >
                    Update Profile
                  </Button>
                </div>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Preferences</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-medium text-gray-800 mb-3">Notification Channels</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                          <p className="text-xs text-gray-500">Receive notifications via email</p>
                        </div>
                        <button
                          type="button"
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            notificationSettings.email ? 'bg-primary-500' : 'bg-gray-200'
                          }`}
                          onClick={() => handleNotificationToggle('email')}
                        >
                          <span className="sr-only">Toggle email notifications</span>
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              notificationSettings.email ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">SMS Notifications</p>
                          <p className="text-xs text-gray-500">Receive notifications via SMS</p>
                        </div>
                        <button
                          type="button"
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            notificationSettings.sms ? 'bg-primary-500' : 'bg-gray-200'
                          }`}
                          onClick={() => handleNotificationToggle('sms')}
                        >
                          <span className="sr-only">Toggle SMS notifications</span>
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              notificationSettings.sms ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">WhatsApp Notifications</p>
                          <p className="text-xs text-gray-500">Receive notifications via WhatsApp</p>
                        </div>
                        <button
                          type="button"
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            notificationSettings.whatsapp ? 'bg-primary-500' : 'bg-gray-200'
                          }`}
                          onClick={() => handleNotificationToggle('whatsapp')}
                        >
                          <span className="sr-only">Toggle WhatsApp notifications</span>
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              notificationSettings.whatsapp ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-base font-medium text-gray-800 mb-3">Notification Types</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Medication Reminders</p>
                          <p className="text-xs text-gray-500">Reminders for taking medications</p>
                        </div>
                        <button
                          type="button"
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            notificationSettings.medicationReminders ? 'bg-primary-500' : 'bg-gray-200'
                          }`}
                          onClick={() => handleNotificationToggle('medicationReminders')}
                        >
                          <span className="sr-only">Toggle medication reminders</span>
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              notificationSettings.medicationReminders ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Appointment Reminders</p>
                          <p className="text-xs text-gray-500">Reminders for upcoming appointments</p>
                        </div>
                        <button
                          type="button"
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            notificationSettings.appointmentReminders ? 'bg-primary-500' : 'bg-gray-200'
                          }`}
                          onClick={() => handleNotificationToggle('appointmentReminders')}
                        >
                          <span className="sr-only">Toggle appointment reminders</span>
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              notificationSettings.appointmentReminders ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Report Uploads</p>
                          <p className="text-xs text-gray-500">Notifications when new reports are uploaded</p>
                        </div>
                        <button
                          type="button"
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            notificationSettings.reportUploads ? 'bg-primary-500' : 'bg-gray-200'
                          }`}
                          onClick={() => handleNotificationToggle('reportUploads')}
                        >
                          <span className="sr-only">Toggle report upload notifications</span>
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              notificationSettings.reportUploads ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="primary"
                    leftIcon={<Save size={16} />}
                    onClick={handleUpdateNotifications}
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-medium text-gray-800 mb-4">Change Password</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="currentPassword" className="form-label">Current Password</label>
                        <input
                          id="currentPassword"
                          type="password"
                          className="form-input"
                          placeholder="Enter your current password"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="form-label">New Password</label>
                        <input
                          id="newPassword"
                          type="password"
                          className="form-input"
                          placeholder="Enter new password"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                        <input
                          id="confirmPassword"
                          type="password"
                          className="form-input"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button
                        variant="primary"
                        onClick={handleChangePassword}
                      >
                        Change Password
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-base font-medium text-gray-800 mb-4">Account Security</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-success-100 rounded-full flex items-center justify-center">
                          <Check size={16} className="text-success-600" />
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h5>
                          <p className="text-xs text-gray-500">Enhance your account security</p>
                        </div>
                        <div className="ml-auto">
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            Enable
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <Shield size={16} className="text-primary-600" />
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-gray-900">Login History</h5>
                          <p className="text-xs text-gray-500">View your recent login activity</p>
                        </div>
                        <div className="ml-auto">
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
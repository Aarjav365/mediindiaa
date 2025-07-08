import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Users,
  Calendar,
  FileText,
  Bell,
  TrendingUp,
  AlertCircle,
  Plus,
  Eye,
  Clock,
  MessageCircle
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import ActionButton from '../../components/ui/ActionButton';
import Button from '../../components/ui/Button';
import FamilyMemberSelector from '../../components/family/FamilyMemberSelector';
import AddFamilyMemberModal from '../../components/family/AddFamilyMemberModal';
import UploadRecordModal from '../../components/health/UploadRecordModal';
import TutorialModal from '../../components/tutorial/TutorialModal';
import HealthRecordCard from '../../components/health/HealthRecordCard';
import { useFamilyStore } from '../../stores/familyStore';
import { useHealthRecordsStore } from '../../stores/healthRecordsStore';
import { usePrescriptionStore } from '../../stores/prescriptionStore';
import { useAuthStore } from '../../stores/authStore';

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const { members, getActiveMember, loadMembers, subscribeToMembers } = useFamilyStore();
  const { records, getRecordsByMember, getRecordsByPriority, loadRecords, subscribeToRecords } = useHealthRecordsStore();
  const { prescriptions, loadPrescriptions, subscribeToUserPrescriptions } = usePrescriptionStore();
  const { userData, userId } = useAuthStore();
  
  const activeMember = getActiveMember();
  const memberRecords = activeMember ? getRecordsByMember(activeMember.id) : [];
  
  // Get prescriptions by mobile number if user has mobile
  const userPrescriptions = userData?.mobile ? prescriptions.filter(p => p.patientInfo.mobile === userData.mobile) : [];
  
  // Combine all records
  const allRecords = [...memberRecords];
  const importantRecords = getRecordsByPriority('important');
  const needsAttentionRecords = getRecordsByPriority('needs-attention');

  // Load data on mount
  useEffect(() => {
    if (userId && userId !== 'guest_user') {
      loadMembers(userId);
      loadRecords(userId);
      
      // Subscribe to real-time updates
      const unsubscribeMembers = subscribeToMembers(userId);
      const unsubscribeRecords = subscribeToRecords(userId);
      
      return () => {
        unsubscribeMembers?.();
        unsubscribeRecords?.();
      };
    }
  }, [userId]);

  // Load prescriptions by mobile
  useEffect(() => {
    if (userData?.mobile) {
      const unsubscribePrescriptions = subscribeToUserPrescriptions(userData.mobile);
      
      return () => {
        unsubscribePrescriptions?.();
      };
    }
  }, [userData?.mobile]);

  // Show tutorial for new users
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial && members.length === 0) {
      setShowTutorial(true);
    }
  }, [members.length]);

  const handleTutorialClose = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  const handleViewRecord = (record: any) => {
    if (record.prescriptionId) {
      navigate(`/prescription/${record.prescriptionId}`);
    } else if (record.fileUrl) {
      window.open(record.fileUrl, '_blank');
    }
  };

  const handleDownloadRecord = (record: any) => {
    if (record.fileUrl && record.fileName) {
      const link = document.createElement('a');
      link.href = record.fileUrl;
      link.download = record.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleBookAppointment = () => {
    navigate('/book-appointment/dr_default');
  };

  const upcomingReminders = [
    {
      id: '1',
      title: 'Amoxicillin',
      time: '08:00 PM',
      type: 'medication',
      description: '500mg, After dinner',
      member: activeMember?.name || 'You'
    },
    {
      id: '2',
      title: 'Dr. Priya Patel',
      time: 'Tomorrow, 10:30 AM',
      type: 'appointment',
      description: 'Follow-up checkup',
      member: activeMember?.name || 'You'
    },
    {
      id: '3',
      title: 'Blood Test',
      time: 'Jun 20, 09:00 AM',
      type: 'test',
      description: 'Fasting blood sugar test',
      member: activeMember?.name || 'You'
    }
  ];

  const getReminderIcon = (type: string) => {
    if (type === 'medication') {
      return <Calendar size={20} className="text-primary-500" />;
    } else if (type === 'appointment') {
      return <Calendar size={20} className="text-secondary-500" />;
    } else if (type === 'test') {
      return <Calendar size={20} className="text-accent-600" />;
    }
    return null;
  };

  // Combine stored prescriptions with health records for display
  const displayRecords = [
    ...allRecords,
    ...userPrescriptions.map(prescription => ({
      id: `prescription_${prescription.id}`,
      title: `Prescription - ${prescription.clinicalInfo.diagnosis}`,
      type: 'prescription' as const,
      priority: 'important' as const,
      doctorProvider: prescription.doctorInfo.name,
      description: `Prescription for ${prescription.clinicalInfo.diagnosis}`,
      file: null,
      uploadDate: prescription.createdAt,
      memberId: 'self',
      prescriptionId: prescription.id,
      doctorName: prescription.doctorInfo.name,
      prescriptionDate: prescription.createdAt,
      fileName: `Prescription_${prescription.id}.pdf`,
      fileSize: 0
    }))
  ];

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Family Member Selector */}
        <div className="flex justify-between items-center">
          <FamilyMemberSelector onAddMember={() => setShowFamilyModal(true)} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTutorial(true)}
          >
            Show Tutorial
          </Button>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActionButton 
              icon={Upload} 
              label="Upload Record" 
              onClick={() => setShowUploadModal(true)}
              variant="primary"
            />
            <div className="relative">
              <ActionButton 
                icon={MessageCircle} 
                label="AI Clinic" 
                onClick={() => {}}
                variant="secondary"
                className="opacity-75"
              />
              <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800 mb-2">
                    Coming Soon
                  </div>
                  <p className="text-white text-xs px-2">
                    AI-powered health assistant
                  </p>
                </div>
              </div>
            </div>
            <ActionButton 
              icon={Bell} 
              label="Add Reminder" 
              onClick={() => navigate('/reminders')}
              variant="outline"
              className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100 text-purple-700"
            />
            <ActionButton 
              icon={Calendar} 
              label="Book Appointment" 
              onClick={handleBookAppointment}
              variant="ghost"
              className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100 text-green-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Records */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Health Records {activeMember && `- ${activeMember.name}`}
                </h3>
                {activeMember && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye size={16} />}
                    onClick={() => navigate(`/profile/${activeMember.id}`)}
                  >
                    View All
                  </Button>
                )}
              </div>

              {displayRecords.length > 0 ? (
                <div className="space-y-3">
                  {displayRecords.slice(0, 5).map((record) => (
                    <HealthRecordCard
                      key={record.id}
                      record={record}
                      onView={() => handleViewRecord(record)}
                      onDownload={() => handleDownloadRecord(record)}
                    />
                  ))}
                  
                  {displayRecords.length > 5 && (
                    <div className="text-center pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => activeMember && navigate(`/profile/${activeMember.id}`)}
                      >
                        View {displayRecords.length - 5} more records
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText size={36} className="mx-auto text-gray-300 mb-3" />
                  <h4 className="text-sm font-medium text-gray-900 mb-1">No records yet</h4>
                  <p className="text-xs text-gray-500 mb-4">
                    {activeMember 
                      ? `Upload the first health record for ${activeMember.name}`
                      : 'Add a family member and upload their first health record'
                    }
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Upload size={16} />}
                    onClick={() => setShowUploadModal(true)}
                    disabled={!activeMember}
                  >
                    Upload First Record
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Health Summary Stats */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Health Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{displayRecords.length}</div>
                  <div className="text-xs text-blue-600">Total Records</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{members.length}</div>
                  <div className="text-xs text-green-600">Family Members</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{importantRecords.length + userPrescriptions.length}</div>
                  <div className="text-xs text-yellow-600">Important Records</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{needsAttentionRecords.length}</div>
                  <div className="text-xs text-red-600">Needs Attention</div>
                </div>
              </div>
            </Card>

            {/* AI Clinic Coming Soon Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <div className="text-center">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MessageCircle size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Health Assistant</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Get instant health insights, symptom analysis, and personalized recommendations
                </p>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning-100 text-warning-800 mb-3">
                  Coming Soon
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• AI-powered symptom checker</p>
                  <p>• Medication interaction alerts</p>
                  <p>• Personalized health tips</p>
                  <p>• Medical report analysis</p>
                </div>
              </div>
            </Card>

            {/* Upcoming Reminders */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Upcoming Reminders</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/reminders')}
                >
                  View All
                </Button>
              </div>

              {upcomingReminders.length > 0 ? (
                <div className="space-y-3">
                  {upcomingReminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-start p-3 border border-gray-100 rounded-lg">
                      <div className="mr-3 mt-1">
                        {getReminderIcon(reminder.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{reminder.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{reminder.description}</p>
                        <p className="text-xs font-medium text-primary-600 mt-1">{reminder.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Bell size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No upcoming reminders</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Priority Alerts */}
        {needsAttentionRecords.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <div className="flex items-start">
              <AlertCircle size={20} className="text-red-500 mr-3 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-900">
                  {needsAttentionRecords.length} record(s) need attention
                </h4>
                <p className="text-xs text-red-700 mt-1">
                  Please review these important health records and consult with your healthcare provider if needed.
                </p>
                <div className="mt-2">
                  <Button variant="outline" size="sm" className="text-red-700 border-red-300 hover:bg-red-100">
                    Review Records
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Modals */}
      <AddFamilyMemberModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
      />

      <UploadRecordModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />

      <TutorialModal
        isOpen={showTutorial}
        onClose={handleTutorialClose}
      />
    </AppLayout>
  );
};

export default PatientDashboard;
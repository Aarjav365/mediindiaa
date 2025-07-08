import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit3,
  Share2
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import ActionButton from '../../components/ui/ActionButton';
import Button from '../../components/ui/Button';
import { useDoctorStore } from '../../stores/doctorStore';
import { usePrescriptionStore } from '../../stores/prescriptionStore';
import { useAuthStore } from '../../stores/authStore';

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { patients, appointments, loadPatients, loadAppointments, subscribeToAppointments } = useDoctorStore();
  const { prescriptions, loadPrescriptionsByDoctor } = usePrescriptionStore();
  const { userId } = useAuthStore();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Load data on mount
  useEffect(() => {
    if (userId) {
      loadPatients(userId);
      loadPrescriptionsByDoctor(userId);
      
      // Subscribe to real-time appointment updates
      const unsubscribe = subscribeToAppointments(userId);
      
      return () => {
        unsubscribe?.();
      };
    }
  }, [userId]);

  const todayAppointments = appointments.filter(apt => apt.date === selectedDate);
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const recentPrescriptions = prescriptions.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'text-red-600 bg-red-100';
      case 'urgent':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  return (
    <AppLayout title="Doctor Dashboard">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActionButton 
              icon={Plus} 
              label="Create Prescription" 
              onClick={() => navigate('/doctor/create-prescription')}
              variant="primary"
            />
            <ActionButton 
              icon={Users} 
              label="Add Patient" 
              onClick={() => navigate('/doctor/create-prescription')}
              variant="secondary"
            />
            <ActionButton 
              icon={Calendar} 
              label="View Appointments" 
              onClick={() => {}}
              variant="outline"
            />
            <ActionButton 
              icon={FileText} 
              label="Medical Literature" 
              onClick={() => {}}
              variant="ghost"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center">
                <div className="text-2xl font-bold text-primary-600">{patients.length}</div>
                <div className="text-sm text-gray-600">Total Patients</div>
              </Card>
              <Card className="text-center">
                <div className="text-2xl font-bold text-secondary-600">{prescriptions.length}</div>
                <div className="text-sm text-gray-600">Prescriptions</div>
              </Card>
              <Card className="text-center">
                <div className="text-2xl font-bold text-accent-600">{pendingAppointments.length}</div>
                <div className="text-sm text-gray-600">Pending Appointments</div>
              </Card>
            </div>

            {/* Today's Appointments */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Today's Appointments</h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input text-sm"
                />
              </div>

              {todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                        <p className="text-sm text-gray-600">{appointment.reason}</p>
                        <div className="flex items-center mt-1 space-x-2">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-500">{appointment.time}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(appointment.urgency)}`}>
                            {appointment.urgency}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar size={36} className="mx-auto text-gray-300 mb-3" />
                  <h4 className="text-sm font-medium text-gray-900">No appointments today</h4>
                  <p className="text-xs text-gray-500 mt-1">Your schedule is clear for {new Date(selectedDate).toLocaleDateString()}</p>
                </div>
              )}
            </Card>

            {/* Recent Prescriptions */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Prescriptions</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/doctor/create-prescription')}
                >
                  View All
                </Button>
              </div>

              {recentPrescriptions.length > 0 ? (
                <div className="space-y-3">
                  {recentPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{prescription.patientInfo.name}</h4>
                        <p className="text-sm text-gray-600">{prescription.clinicalInfo.diagnosis}</p>
                        <div className="flex items-center mt-1 space-x-2">
                          <FileText size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {prescription.medications.length} medication(s)
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(prescription.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {prescription.isShared ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <AlertCircle size={16} className="text-yellow-500" />
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Eye size={14} />}
                          onClick={() => navigate(`/prescription/view?token=${prescription.shareToken}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Share2 size={14} />}
                          onClick={() => {}}
                        >
                          Share
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText size={36} className="mx-auto text-gray-300 mb-3" />
                  <h4 className="text-sm font-medium text-gray-900">No prescriptions yet</h4>
                  <p className="text-xs text-gray-500 mt-1">Create your first prescription</p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-3"
                    leftIcon={<Plus size={16} />}
                    onClick={() => navigate('/doctor/create-prescription')}
                  >
                    Create Prescription
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Appointments */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Appointments</h3>
              
              {pendingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {pendingAppointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="p-3 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 text-sm">{appointment.patientName}</h4>
                      <p className="text-xs text-gray-600 mt-1">{appointment.reason}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {appointment.date} at {appointment.time}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(appointment.urgency)}`}>
                          {appointment.urgency}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {pendingAppointments.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm">
                        View {pendingAppointments.length - 5} more
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle size={24} className="mx-auto text-green-500 mb-2" />
                  <p className="text-sm text-gray-500">No pending appointments</p>
                </div>
              )}
            </Card>

            {/* Recent Patients */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Patients</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {}}
                >
                  View All
                </Button>
              </div>

              {patients.length > 0 ? (
                <div className="space-y-3">
                  {patients.slice(0, 5).map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-primary-600">
                            {patient.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{patient.name}</h4>
                          <p className="text-xs text-gray-500">{patient.age} years • {patient.gender}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye size={14} />}
                        onClick={() => navigate(`/doctor/create-prescription?patientId=${patient.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No patients yet</p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigate('/doctor/create-prescription')}
                  >
                    Add Patient
                  </Button>
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-primary-50 to-secondary-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Appointments</span>
                  <span className="font-semibold text-primary-600">{appointments.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Prescriptions</span>
                  <span className="font-semibold text-secondary-600">{prescriptions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Patients</span>
                  <span className="font-semibold text-accent-600">{patients.filter(p => new Date(p.addedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DoctorDashboard;
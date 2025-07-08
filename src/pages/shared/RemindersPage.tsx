import React, { useState } from 'react';
import { 
  Plus, 
  Pill, 
  Calendar, 
  Microscope, 
  Clock, 
  X, 
  AlertTriangle,
  Bell
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

type ReminderType = 'medication' | 'appointment' | 'test';

interface Reminder {
  id: string;
  title: string;
  type: ReminderType;
  time: string;
  days?: string[];
  description?: string;
  isActive: boolean;
}

const RemindersPage: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [reminderType, setReminderType] = useState<ReminderType | null>(null);
  
  // Sample data for reminders
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'Amoxicillin',
      type: 'medication',
      time: '08:00 AM, 08:00 PM',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      description: '500mg, Take with food',
      isActive: true
    },
    {
      id: '2',
      title: 'Dr. Priya Patel',
      type: 'appointment',
      time: 'Jun 15, 10:30 AM',
      description: 'Follow-up checkup',
      isActive: true
    },
    {
      id: '3',
      title: 'Blood Test',
      type: 'test',
      time: 'Jun 20, 09:00 AM',
      description: 'Fasting blood sugar test',
      isActive: true
    }
  ]);
  
  const [newReminder, setNewReminder] = useState({
    title: '',
    time: '',
    days: [] as string[],
    description: ''
  });
  
  const getReminderIcon = (type: ReminderType) => {
    switch (type) {
      case 'medication':
        return <Pill size={20} className="text-primary-500" />;
      case 'appointment':
        return <Calendar size={20} className="text-secondary-500" />;
      case 'test':
        return <Microscope size={20} className="text-accent-600" />;
      default:
        return <Bell size={20} className="text-gray-400" />;
    }
  };
  
  const toggleReminderActive = (id: string) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, isActive: !reminder.isActive } : reminder
    ));
  };
  
  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };
  
  const handleAddReminder = () => {
    if (!reminderType || !newReminder.title || !newReminder.time) return;
    
    const reminder: Reminder = {
      id: `${Date.now()}`,
      title: newReminder.title,
      type: reminderType,
      time: newReminder.time,
      days: reminderType === 'medication' ? newReminder.days : undefined,
      description: newReminder.description,
      isActive: true
    };
    
    setReminders([...reminders, reminder]);
    setNewReminder({ title: '', time: '', days: [], description: '' });
    setReminderType(null);
    setShowAddForm(false);
  };
  
  const handleDayToggle = (day: string) => {
    if (newReminder.days.includes(day)) {
      setNewReminder({
        ...newReminder,
        days: newReminder.days.filter(d => d !== day)
      });
    } else {
      setNewReminder({
        ...newReminder,
        days: [...newReminder.days, day]
      });
    }
  };
  
  return (
    <AppLayout title="Reminders & Medications">
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">
          Stay on top of your medications, appointments, and tests with reminders
        </p>
        <Button 
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setShowAddForm(true)}
        >
          Add Reminder
        </Button>
      </div>
      
      {showAddForm && (
        <Card className="mb-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Add New Reminder</h3>
            <button 
              className="text-gray-400 hover:text-gray-500"
              onClick={() => {
                setShowAddForm(false);
                setReminderType(null);
              }}
            >
              <X size={20} />
            </button>
          </div>
          
          {!reminderType ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">What type of reminder would you like to add?</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
                  onClick={() => setReminderType('medication')}
                >
                  <Pill size={24} className="text-primary-500 mb-2" />
                  <span className="text-sm font-medium">Medication</span>
                </button>
                
                <button
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
                  onClick={() => setReminderType('appointment')}
                >
                  <Calendar size={24} className="text-secondary-500 mb-2" />
                  <span className="text-sm font-medium">Appointment</span>
                </button>
                
                <button
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
                  onClick={() => setReminderType('test')}
                >
                  <Microscope size={24} className="text-accent-600 mb-2" />
                  <span className="text-sm font-medium">Test/Lab</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <label htmlFor="title" className="form-label">
                  {reminderType === 'medication' ? 'Medication Name' : 
                   reminderType === 'appointment' ? 'Doctor/Clinic Name' : 'Test Name'}
                </label>
                <input
                  id="title"
                  type="text"
                  className="form-input"
                  placeholder={
                    reminderType === 'medication' ? 'e.g. Amoxicillin' : 
                    reminderType === 'appointment' ? 'e.g. Dr. Priya Patel' : 'e.g. Blood Test'
                  }
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="time" className="form-label">
                  {reminderType === 'medication' ? 'Time(s)' : 'Date & Time'}
                </label>
                <input
                  id="time"
                  type="text"
                  className="form-input"
                  placeholder={
                    reminderType === 'medication' ? 'e.g. 8:00 AM, 8:00 PM' : 'e.g. Jun 15, 10:30 AM'
                  }
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                />
              </div>
              
              {reminderType === 'medication' && (
                <div className="mb-4">
                  <label className="form-label">Days</label>
                  <div className="flex flex-wrap gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={`px-2 py-1 text-xs rounded-full ${
                          newReminder.days.includes(day)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => handleDayToggle(day)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <label htmlFor="description" className="form-label">
                  {reminderType === 'medication' ? 'Instructions' : 
                   reminderType === 'appointment' ? 'Notes' : 'Instructions'}
                </label>
                <input
                  id="description"
                  type="text"
                  className="form-input"
                  placeholder={
                    reminderType === 'medication' ? 'e.g. 500mg, Take with food' : 
                    reminderType === 'appointment' ? 'e.g. Follow-up checkup' : 'e.g. Fasting required'
                  }
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => setReminderType(null)}
                >
                  Back
                </Button>
                <Button 
                  variant="primary"
                  onClick={handleAddReminder}
                  disabled={!newReminder.title || !newReminder.time}
                >
                  Add Reminder
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        {/* Active Reminders */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Reminders</h3>
          {reminders.filter(r => r.isActive).length > 0 ? (
            <div className="space-y-4">
              {reminders
                .filter(reminder => reminder.isActive)
                .map((reminder) => (
                  <div key={reminder.id} className="flex items-start p-4 border border-gray-200 rounded-lg">
                    <div className="mr-4 mt-1">
                      {getReminderIcon(reminder.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <h4 className="text-sm font-medium text-gray-900">{reminder.title}</h4>
                        <div className="flex items-center space-x-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                            {reminder.type === 'medication' ? 'Medication' : 
                             reminder.type === 'appointment' ? 'Appointment' : 'Test'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock size={14} className="text-gray-400 mr-1" />
                        <p className="text-xs text-gray-500">{reminder.time}</p>
                      </div>
                      {reminder.days && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {reminder.days.map((day) => (
                            <span key={day} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              {day}
                            </span>
                          ))}
                        </div>
                      )}
                      {reminder.description && (
                        <p className="text-sm text-gray-600 mt-2">{reminder.description}</p>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col space-y-2">
                      <button 
                        className="text-gray-400 hover:text-warning-500"
                        onClick={() => toggleReminderActive(reminder.id)}
                        title="Disable reminder"
                      >
                        <AlertTriangle size={16} />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-error-500"
                        onClick={() => deleteReminder(reminder.id)}
                        title="Delete reminder"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell size={36} className="mx-auto text-gray-300 mb-2" />
              <h4 className="text-sm font-medium text-gray-900">No active reminders</h4>
              <p className="text-xs text-gray-500 mt-1">Add reminders for medications, appointments, or tests</p>
              <Button 
                variant="primary" 
                size="sm"
                className="mt-3"
                leftIcon={<Plus size={16} />}
                onClick={() => setShowAddForm(true)}
              >
                Add Reminder
              </Button>
            </div>
          )}
        </Card>
        
        {/* Inactive Reminders */}
        {reminders.filter(r => !r.isActive).length > 0 && (
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Inactive Reminders</h3>
            <div className="space-y-4">
              {reminders
                .filter(reminder => !reminder.isActive)
                .map((reminder) => (
                  <div key={reminder.id} className="flex items-start p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="mr-4 mt-1">
                      {getReminderIcon(reminder.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <h4 className="text-sm font-medium text-gray-900">{reminder.title}</h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800">
                          Inactive
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock size={14} className="text-gray-400 mr-1" />
                        <p className="text-xs text-gray-500">{reminder.time}</p>
                      </div>
                      {reminder.description && (
                        <p className="text-sm text-gray-600 mt-2">{reminder.description}</p>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col space-y-2">
                      <button 
                        className="text-gray-400 hover:text-primary-500"
                        onClick={() => toggleReminderActive(reminder.id)}
                        title="Enable reminder"
                      >
                        <AlertTriangle size={16} />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-error-500"
                        onClick={() => deleteReminder(reminder.id)}
                        title="Delete reminder"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default RemindersPage;
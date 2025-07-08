import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Home, User, Bell, Settings, LogOut, Menu, X, Calendar, FileText, BarChart, Presentation as Prescription } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, title }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { userRole, userData, signOutUser } = useAuthStore();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback logout
      navigate('/login');
    }
  };
  
  const getDashboardLink = () => {
    switch (userRole) {
      case 'patient':
        return '/patient/dashboard';
      case 'doctor':
        return '/doctor/dashboard';
      default:
        return '/';
    }
  };
  
  const getNavItems = () => {
    const items = [
      {
        to: getDashboardLink(),
        icon: <Home size={20} />,
        label: 'Dashboard'
      },
      {
        to: '/settings',
        icon: <Settings size={20} />,
        label: 'Settings'
      }
    ];
    
    // Role-specific nav items
    if (userRole === 'patient') {
      items.splice(1, 0, {
        to: `/profile/${userData?.uid || 'self'}`,
        icon: <User size={20} />,
        label: 'My Profile'
      });
    } else if (userRole === 'doctor') {
      items.splice(1, 0, {
        to: '/doctor/create-prescription',
        icon: <Prescription size={20} />,
        label: 'Create Prescription'
      });
    }
    
    return items;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button 
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex-shrink-0 flex items-center">
                <img className="h-8 w-auto" src="/WhatsApp Image 2025-05-29 at 23.45.29_6f1f4ad0.jpg" alt="MediIndia" />
                <span className="ml-2 text-xl font-semibold text-primary-600">MediIndia</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User Info */}
              {userData && (
                <div className="hidden md:flex items-center space-x-3">
                  {userData.photoURL ? (
                    <img
                      src={userData.photoURL}
                      alt={userData.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {userData.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{userData.name}</p>
                    <p className="text-gray-500 capitalize">{userRole}</p>
                  </div>
                </div>
              )}
              
              <button
                className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md pt-16 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-auto md:pt-0
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <nav className="mt-5 px-4 space-y-1">
            {getNavItems().map((item, index) => (
              <NavLink
                key={index}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 
                  ${isActive 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                `}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h1>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
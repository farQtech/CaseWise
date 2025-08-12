import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import PatientList from './components/PatientList';
import CaseNotes from './components/CaseNotes';
import AddPatient from './components/AddPatient';
import { 
  Activity, 
  User, 
  LogOut, 
  Settings,
  FileText,
  Users,
  Plus,
  Home
} from 'lucide-react';

interface Patient {
  id: string;
  nhsNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  emergencyContact: string;
  lastVisit: string;
  caseCount: number;
  status: 'active' | 'inactive' | 'urgent';
}

type ViewType = 'patients' | 'case-notes' | 'add-patient';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('patients');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: '1',
      nhsNumber: '1234567890',
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: '1985-03-15',
      address: '123 Main Street, London, SW1A 1AA',
      phone: '07123 456789',
      emergencyContact: 'Jane Smith',
      lastVisit: '2024-01-15',
      caseCount: 3,
      status: 'active'
    },
    {
      id: '2',
      nhsNumber: '0987654321',
      firstName: 'Sarah',
      lastName: 'Johnson',
      dateOfBirth: '1992-07-22',
      address: '456 Oak Avenue, Manchester, M1 1AA',
      phone: '07123 456790',
      emergencyContact: 'Mike Johnson',
      lastVisit: '2024-01-10',
      caseCount: 1,
      status: 'urgent'
    },
    {
      id: '3',
      nhsNumber: '1122334455',
      firstName: 'Michael',
      lastName: 'Brown',
      dateOfBirth: '1978-11-08',
      address: '789 Pine Road, Birmingham, B1 1AA',
      phone: '07123 456791',
      emergencyContact: 'Lisa Brown',
      lastVisit: '2024-01-08',
      caseCount: 5,
      status: 'active'
    }
  ]);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView('case-notes');
  };

  const handleAddNewPatient = () => {
    setCurrentView('add-patient');
  };

  const handleSavePatient = (newPatient: Patient) => {
    setPatients([newPatient, ...patients]);
    setCurrentView('patients');
  };

  const handleBackToPatients = () => {
    setSelectedPatient(null);
    setCurrentView('patients');
  };

  const handleLogout = async () => {
    await logout();
  };

  const renderContent = () => {
    switch (currentView) {
      case 'patients':
        return (
          <PatientList 
            onSelectPatient={handleSelectPatient}
            onAddNewPatient={handleAddNewPatient}
          />
        );
      case 'case-notes':
        return selectedPatient ? (
          <CaseNotes 
            patient={selectedPatient}
            onBack={handleBackToPatients}
          />
        ) : null;
      case 'add-patient':
        return (
          <AddPatient 
            onSave={handleSavePatient}
            onCancel={() => setCurrentView('patients')}
          />
        );
      default:
        return null;
    }
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'patients':
        return 'Patient Registry';
      case 'case-notes':
        return selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName} - Case Notes` : 'Case Notes';
      case 'add-patient':
        return 'Add New Patient';
      default:
        return 'NHS Patient Management';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Activity className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">NHS Patient Management</h1>
                <p className="text-sm text-gray-500">Secure Case Notes System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <User className="w-4 h-4" />
                <span>{user?.email}</span>
                <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 py-3">
            <button
              onClick={() => setCurrentView('patients')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                currentView === 'patients' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Patients</span>
            </button>
            
            {currentView === 'case-notes' && (
              <button
                onClick={handleBackToPatients}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Back to Patients</span>
              </button>
            )}
            
            {currentView === 'add-patient' && (
              <button
                onClick={() => setCurrentView('patients')}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Back to Patients</span>
              </button>
            )}
            
            <div className="flex-1"></div>
            
            <button
              onClick={handleAddNewPatient}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Patient</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Page Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h2>
            <p className="text-gray-600 mt-1">
              {currentView === 'patients' && 'Manage patient records and case notes'}
              {currentView === 'case-notes' && 'View and manage patient case notes'}
              {currentView === 'add-patient' && 'Register a new patient'}
            </p>
          </div>
          
          {currentView === 'patients' && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Active Cases</p>
                <p className="text-2xl font-bold text-green-600">
                  {patients.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Urgent</p>
                <p className="text-2xl font-bold text-red-600">
                  {patients.filter(p => p.status === 'urgent').length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2024 NHS Patient Management System. Built with React, TypeScript, and Node.js
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Secure • Compliant • NHS Standards</span>
              <span>•</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading NHS Patient Management System...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

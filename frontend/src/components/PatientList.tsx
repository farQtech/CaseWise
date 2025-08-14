import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Clock,
  AlertCircle
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

interface PatientListProps {
  onSelectPatient: (patient: Patient) => void;
  onAddNewPatient: () => void;
}

const PatientList: React.FC<PatientListProps> = ({ onSelectPatient, onAddNewPatient }) => {
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'urgent'>('all');

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.nhsNumber.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'urgent': return <AlertCircle className="w-4 h-4" />;
      case 'active': return <Clock className="w-4 h-4" />;
      case 'inactive': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Registry</h2>
          <p className="text-gray-600">Patient Management System</p>
        </div>
        <button
          onClick={onAddNewPatient}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Patient</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or NHS number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Patients</option>
            <option value="active">Active</option>
            <option value="urgent">Urgent</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Patient List */}
      <div className="space-y-4">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-blue-50 to-white"
            onClick={() => onSelectPatient(patient)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">NHS: {patient.nhsNumber}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <FileText className="w-4 h-4" />
                      <span>{patient.caseCount} cases</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border ${getStatusColor(patient.status)}`}>
                  {getStatusIcon(patient.status)}
                  <span className="text-sm font-medium capitalize">{patient.status}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Last Visit</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(patient.lastVisit).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No patients found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default PatientList;

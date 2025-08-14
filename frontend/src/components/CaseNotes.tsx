import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Upload, 
  Save,
  X,
  AlertCircle,
  Stethoscope,
  Pill,
  Activity
} from 'lucide-react';
import FileUpload from './FileUpload';

interface CaseNote {
  id: string;
  date: string;
  time: string;
  doctor: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  attachments: string[];
  status: 'draft' | 'completed' | 'urgent';
}

interface Patient {
  id: string;
  nhsNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  emergencyContact: string;
}

interface CaseNotesProps {
  patient: Patient;
  onBack: () => void;
}

const CaseNotes: React.FC<CaseNotesProps> = ({ patient, onBack }) => {
  const [caseNotes, setCaseNotes] = useState<CaseNote[]>([
    {
      id: '1',
      date: '2024-01-15',
      time: '14:30',
      doctor: 'Dr. Sarah Wilson',
      diagnosis: 'Hypertension',
      prescription: 'Amlodipine 5mg once daily',
      notes: 'Patient presents with elevated blood pressure. Recommended lifestyle changes including reduced salt intake and regular exercise.',
      attachments: ['blood_pressure_chart.pdf'],
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-01-10',
      time: '09:15',
      doctor: 'Dr. Michael Brown',
      diagnosis: 'Type 2 Diabetes',
      prescription: 'Metformin 500mg twice daily',
      notes: 'Initial diagnosis of Type 2 Diabetes. Blood glucose monitoring required. Referral to diabetes nurse specialist.',
      attachments: ['blood_work_results.pdf', 'diabetes_guidelines.pdf'],
      status: 'completed'
    }
  ]);
  const [showNewCase, setShowNewCase] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseNote | null>(null);
  const [newCase, setNewCase] = useState({
    diagnosis: '',
    prescription: '',
    notes: '',
    status: 'draft' as const
  });
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleAddCase = () => {
    const caseNote: CaseNote = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      doctor: 'Dr. Current User',
      diagnosis: newCase.diagnosis,
      prescription: newCase.prescription,
      notes: newCase.notes,
      attachments: [],
      status: newCase.status
    };
    
    setCaseNotes([caseNote, ...caseNotes]);
    setNewCase({ diagnosis: '', prescription: '', notes: '', status: 'draft' });
    setShowNewCase(false);
  };

  const handleFileUpload = () => {
    setShowFileUpload(!showFileUpload);
  };

  const handleUploadComplete = () => {
    setUploadComplete(true);
  }

  const resetForm = () => {
    setNewCase({ diagnosis: '', prescription: '', notes: '', status: 'draft' });
  setShowNewCase(false);
  setShowFileUpload(false);
  setUploadComplete(false);
  setSelectedCase(null);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-primary-500">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {patient.firstName} {patient.lastName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">NHS Number:</span>
                <span className="ml-2 text-gray-900">{patient.nhsNumber}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Date of Birth:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(patient.dateOfBirth).toLocaleDateString('en-GB')}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Phone:</span>
                <span className="ml-2 text-gray-900">{patient.phone}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onBack}
            className="btn-secondary flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Back to Patients</span>
          </button>
        </div>
      </div>

      {/* Case Notes Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Case Notes</h3>
          <p className="text-gray-600">Medical records and prescriptions</p>
        </div>
        <button
          onClick={() => setShowNewCase(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Case Note</span>
        </button>
      </div>

      {/* New Case Note Form */}
      {showNewCase && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-primary-200">
          {!showFileUpload && (<div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900">New Case Note</h4>
            <button
              onClick={() => setShowNewCase(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis
              </label>
              <input
                type="text"
                value={newCase.diagnosis}
                onChange={(e) => setNewCase({...newCase, diagnosis: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter diagnosis..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={newCase.status}
                onChange={(e) => setNewCase({...newCase, status: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prescription
            </label>
            <textarea
              value={newCase.prescription}
              onChange={(e) => setNewCase({...newCase, prescription: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={2}
              placeholder="Enter prescription details..."
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clinical Notes
            </label>
            <textarea
              value={newCase.notes}
              onChange={(e) => setNewCase({...newCase, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={4}
              placeholder="Enter clinical notes..."
            />
          </div>
          </div> )}
          {!uploadComplete ? (
          <div className="flex justify-between items-center">
            <button
              onClick={handleFileUpload}
              className="btn-secondary flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>{showFileUpload ? 'Hide File Upload' : 'Upload Document (OCR)'}</span>
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowNewCase(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCase}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Case Note</span>
              </button>
            </div>
          </div>) : <span className="flex items-center space-x-1 px-3 py-1 border bg-green-100 text-green-800 border-green-200">File is marked for processing, you will see data once it is processed!</span>}
          
          {/* File Upload Section */}
          {showFileUpload && (
            <div>
              {!uploadComplete && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h5 className="font-semibold text-gray-700 mb-3">Upload Patient Documents</h5>
              <FileUpload 
                patientId={patient.id} 
                onUploadComplete={handleUploadComplete}
              />
            </div>
            )}
            {uploadComplete&& (
            <button
                onClick={resetForm}
                className="btn-secondary mt-10 mx-auto block w-48"
              >
                Exit
              </button>
              )}
              </div>
          )}
        </div>
      )}

      {/* Case Notes List */}
      <div className="space-y-4">
        {caseNotes.map((caseNote) => (
          <div
            key={caseNote.id}
            className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-primary-500 hover:shadow-xl transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary-100 rounded-full">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {caseNote.diagnosis}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(caseNote.date).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{caseNote.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{caseNote.doctor}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border ${getStatusColor(caseNote.status)}`}>
                <span className="text-sm font-medium capitalize">{caseNote.status}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h5 className="font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Pill className="w-4 h-4" />
                  <span>Prescription</span>
                </h5>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
                  {caseNote.prescription}
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4" />
                  <span>Clinical Notes</span>
                </h5>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border-l-4 border-green-500">
                  {caseNote.notes}
                </p>
              </div>
            </div>
            
            {caseNote.attachments.length > 0 && (
              <div className="mb-4">
                <h5 className="font-semibold text-gray-700 mb-2">Attachments</h5>
                <div className="flex flex-wrap gap-2">
                  {caseNote.attachments.map((attachment, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {attachment}
                    </span>
                  ))}
                </div>
              </div>
            )}
            

          </div>
        ))}
      </div>



      {caseNotes.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg shadow-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No case notes found for this patient</p>
          <button
            onClick={() => setShowNewCase(true)}
            className="btn-primary mt-4 flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Case Note</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CaseNotes;

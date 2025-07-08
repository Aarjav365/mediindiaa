import React, { useState } from 'react';
import { useFamilyStore } from '../../stores/familyStore';
import { FileText, Trash2, Share2 } from 'lucide-react';
import Button from '../ui/Button';
import QRCodeModal from './QRCodeModal';
import FileUpload from './FileUpload';

interface FamilyMemberCardProps {
  memberId: string;
}

const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({ memberId }) => {
  const [showQR, setShowQR] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const member = useFamilyStore(state => 
    state.members.find(m => m.id === memberId)
  );

  const { removeMember, addReport } = useFamilyStore();

  if (!member) return null;

  const handleFileSelect = (file: File) => {
    // In a real app, you would upload the file to a server
    // and get back a URL. For now, we'll use a fake URL
    addReport(memberId, {
      title: file.name,
      date: new Date().toISOString(),
      file: URL.createObjectURL(file),
      doctor: member.doctorsConsulted[0]?.name || 'Unknown'
    });
    setShowUpload(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
          <p className="text-sm text-gray-500">
            {member.age} years • {member.bloodGroup} • {member.relationship}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Share2 size={16} />}
            onClick={() => setShowQR(true)}
          >
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Trash2 size={16} />}
            onClick={() => removeMember(memberId)}
          >
            Remove
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700">Recent Reports</h4>
        {member.reports.length > 0 ? (
          <div className="mt-2 space-y-2">
            {member.reports.map(report => (
              <div
                key={report.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex items-center">
                  <FileText size={16} className="text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{report.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(report.date).toLocaleDateString()} • {report.doctor}
                    </p>
                  </div>
                </div>
                <a
                  href={report.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-2">No reports uploaded yet</p>
        )}

        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          leftIcon={<FileText size={16} />}
          onClick={() => setShowUpload(true)}
        >
          Upload Report
        </Button>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        data={`https://mediindia.com/family/${memberId}`}
        title={`Share ${member.name}'s Records`}
      />

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Upload Report</h3>
            <FileUpload onFileSelect={handleFileSelect} />
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowUpload(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyMemberCard;
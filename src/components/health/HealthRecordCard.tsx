import React, { useState } from 'react';
import { 
  FileText, 
  Share2, 
  Download, 
  Eye, 
  Calendar,
  User,
  Clock
} from 'lucide-react';
import { HealthRecord } from '../../stores/healthRecordsStore';
import { useFamilyStore } from '../../stores/familyStore';
import Button from '../ui/Button';
import ShareModal from '../shared/ShareModal';

interface HealthRecordCardProps {
  record: HealthRecord;
  onView?: () => void;
  onDownload?: () => void;
}

const HealthRecordCard: React.FC<HealthRecordCardProps> = ({ 
  record, 
  onView, 
  onDownload 
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const { getMemberById } = useFamilyStore();
  
  const member = getMemberById(record.memberId);

  const getPriorityBadge = (priority: string) => {
    if (priority === 'normal') {
      return <span className="badge badge-green">Normal</span>;
    } else if (priority === 'important') {
      return <span className="badge bg-warning-100 text-warning-800">Important</span>;
    } else if (priority === 'needs-attention') {
      return <span className="badge bg-error-100 text-error-800">Needs Attention</span>;
    }
    return null;
  };

  const getRecordIcon = (type: string) => {
    return <FileText size={16} className="text-primary-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <>
      <div className="flex items-start p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-150">
        <div className="mr-3 mt-1">
          {getRecordIcon(record.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">{record.title}</h4>
            {getPriorityBadge(record.priority)}
          </div>
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <User size={12} className="mr-1" />
            <span>{record.doctorProvider || 'Unknown Provider'}</span>
            <span className="mx-2">•</span>
            <Calendar size={12} className="mr-1" />
            <span>{formatDate(record.uploadDate)}</span>
          </div>
          {record.description && (
            <p className="text-xs text-gray-600 mt-1 truncate">{record.description}</p>
          )}
          {record.fileName && (
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <FileText size={12} className="mr-1" />
              <span>{record.fileName}</span>
              {record.fileSize && (
                <>
                  <span className="mx-1">•</span>
                  <span>{(record.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </>
              )}
            </div>
          )}
        </div>
        <div className="ml-4 flex flex-col space-y-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Share2 size={14} />}
            onClick={() => setShowShareModal(true)}
          >
            Share
          </Button>
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Eye size={14} />}
              onClick={onView}
            >
              View
            </Button>
          )}
          {onDownload && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Download size={14} />}
              onClick={onDownload}
            >
              Download
            </Button>
          )}
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        recordId={record.id}
        patientName={member?.name || 'Unknown Patient'}
        recordType={record.type}
      />
    </>
  );
};

export default HealthRecordCard;
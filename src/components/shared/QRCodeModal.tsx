import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: string;
  title: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, data, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex justify-center mb-4">
          <QRCodeSVG
            value={data}
            size={200}
            level="H"
            includeMargin
            className="border p-2 rounded"
          />
        </div>
        
        <p className="text-sm text-gray-500 text-center mb-4">
          Scan this QR code to access the shared record
        </p>
        
        <div className="flex justify-center">
          <button
            onClick={() => {
              navigator.clipboard.writeText(data);
              toast.success('Link copied to clipboard!');
            }}
            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            Copy Share Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
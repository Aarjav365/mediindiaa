import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Share2, Wheat as Whatsapp } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../ui/Button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string;
  patientName: string;
  recordType: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  recordId, 
  patientName,
  recordType 
}) => {
  const [shareType, setShareType] = useState<'qr' | 'link'>('qr');
  const [expiryTime, setExpiryTime] = useState('24');

  if (!isOpen) return null;

  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/share/${recordId}?expires=${Date.now() + parseInt(expiryTime) * 60 * 60 * 1000}`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleWhatsAppShare = () => {
    const message = `View medical ${recordType} for ${patientName} (valid for ${expiryTime} hours): ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Share Record</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex space-x-2 mb-4">
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg ${
                shareType === 'qr'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setShareType('qr')}
            >
              QR Code
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg ${
                shareType === 'link'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setShareType('link')}
            >
              Share Link
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link expires in
            </label>
            <select
              value={expiryTime}
              onChange={(e) => setExpiryTime(e.target.value)}
              className="form-input"
            >
              <option value="1">1 hour</option>
              <option value="4">4 hours</option>
              <option value="12">12 hours</option>
              <option value="24">24 hours</option>
              <option value="48">48 hours</option>
              <option value="72">72 hours</option>
            </select>
          </div>

          {shareType === 'qr' ? (
            <div className="flex justify-center mb-4">
              <QRCodeSVG
                value={shareUrl}
                size={200}
                level="H"
                includeMargin
                className="border p-2 rounded"
              />
            </div>
          ) : (
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="form-input flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Copy size={16} />}
                  onClick={handleCopyLink}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              leftIcon={<Share2 size={16} />}
              onClick={handleCopyLink}
            >
              Copy Link
            </Button>
            <Button
              variant="primary"
              leftIcon={<Whatsapp size={16} />}
              onClick={handleWhatsAppShare}
            >
              Share via WhatsApp
            </Button>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          This link will expire in {expiryTime} hours. Only share with trusted recipients.
        </p>
      </div>
    </div>
  );
};

export default ShareModal;
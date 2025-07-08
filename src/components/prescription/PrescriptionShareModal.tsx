import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Share2, MessageCircle, Mail, Printer, Check, Download, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../ui/Button';

interface PrescriptionShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescriptionId: string;
  shareToken: string;
  shareUrl: string;
  qrCodeUrl?: string;
  patientName: string;
  patientMobile: string;
  expiresAt: string;
}

const PrescriptionShareModal: React.FC<PrescriptionShareModalProps> = ({ 
  isOpen, 
  onClose, 
  prescriptionId,
  shareToken,
  shareUrl,
  qrCodeUrl,
  patientName,
  patientMobile,
  expiresAt
}) => {
  const [shareMethod, setShareMethod] = useState<'qr' | 'link'>('qr');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Prescription link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleWhatsAppShare = () => {
    const message = `Hi ${patientName}, your digital prescription is ready. 

🏥 *MediIndia Digital Prescription*
📋 Prescription ID: ${prescriptionId}
👤 Patient: ${patientName}
📱 Mobile: ${patientMobile}

🔗 *Access your prescription here:*
${shareUrl}

✅ *What you can do:*
• View your complete prescription
• Download PDF copy
• Add to your health records
• Create your MediIndia account

⏰ *Valid until:* ${new Date(expiresAt).toLocaleDateString()} ${new Date(expiresAt).toLocaleTimeString()}

If you don't have a MediIndia account, you'll be guided through a quick registration process.

Best regards,
Your Healthcare Provider`;

    const whatsappUrl = `https://wa.me/${patientMobile.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSMSShare = () => {
    const message = `Hi ${patientName}, your digital prescription is ready. View it here: ${shareUrl} (Valid until ${new Date(expiresAt).toLocaleDateString()})`;
    const smsUrl = `sms:${patientMobile}?body=${encodeURIComponent(message)}`;
    window.open(smsUrl, '_blank');
  };

  const handleEmailShare = () => {
    const subject = `Your Digital Prescription - MediIndia (ID: ${prescriptionId})`;
    const body = `Dear ${patientName},

Your digital prescription is ready and can be accessed using the secure link below:

🔗 Prescription Link: ${shareUrl}

📋 Prescription Details:
• Prescription ID: ${prescriptionId}
• Patient: ${patientName}
• Mobile: ${patientMobile}
• Valid Until: ${new Date(expiresAt).toLocaleDateString()} ${new Date(expiresAt).toLocaleTimeString()}

✅ What you can do with this link:
• View your complete prescription online
• Download a PDF copy for your records
• Add the prescription to your MediIndia health records
• Share with other healthcare providers if needed

🔐 Security Note:
This is a secure, time-limited link that expires in 48 hours. If you don't have a MediIndia account yet, you'll be guided through a quick registration process to save this prescription to your personal health records.

📱 For the best experience, we recommend creating a free MediIndia account to:
• Store all your prescriptions and health records
• Set medication reminders
• Track your health timeline
• Share records securely with doctors

If you have any questions about your prescription or need assistance accessing it, please contact your healthcare provider.

Best regards,
Your Healthcare Provider

---
Powered by MediIndia - Your Digital Health Records Platform
Visit: ${window.location.origin}`;
    
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl, '_blank');
  };

  const handlePrint = () => {
    const printWindow = window.open(shareUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `prescription-qr-${prescriptionId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Share Prescription</h3>
              <p className="text-sm text-gray-500">ID: {prescriptionId}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Patient Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Patient Information</h4>
            <div className="text-sm text-blue-800">
              <p><strong>Name:</strong> {patientName}</p>
              <p><strong>Mobile:</strong> {patientMobile}</p>
              <p><strong>Valid Until:</strong> {new Date(expiresAt).toLocaleString()}</p>
              <p className="mt-2 font-medium text-blue-700">⏰ {getTimeRemaining()}</p>
            </div>
          </div>

          {/* Share Method Toggle */}
          <div className="flex space-x-2 mb-6">
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                shareMethod === 'qr'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setShareMethod('qr')}
            >
              QR Code
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                shareMethod === 'link'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setShareMethod('link')}
            >
              Share Link
            </button>
          </div>

          {/* QR Code Section */}
          {shareMethod === 'qr' && (
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg mb-4">
                <QRCodeSVG
                  value={shareUrl}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Patient can scan this QR code to access their prescription
              </p>
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download size={14} />}
                  onClick={handleDownloadQR}
                >
                  Download QR
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ExternalLink size={14} />}
                  onClick={() => window.open(shareUrl, '_blank')}
                >
                  Preview
                </Button>
              </div>
            </div>
          )}

          {/* Link Section */}
          {shareMethod === 'link' && (
            <div className="mb-6">
              <label className="form-label">Secure Prescription Link</label>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="form-input flex-1 text-sm font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
                  onClick={handleCopyLink}
                  className={copied ? 'text-green-600 border-green-300' : ''}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-600">
                  <strong>Share Token:</strong> {shareToken}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  This secure token ensures only authorized access to the prescription
                </p>
              </div>
            </div>
          )}

          {/* Share Options */}
          <div className="space-y-4 mb-6">
            <h4 className="font-medium text-gray-900">Share via:</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                leftIcon={<MessageCircle size={16} />}
                onClick={handleWhatsAppShare}
                className="w-full text-green-600 border-green-300 hover:bg-green-50"
              >
                WhatsApp
              </Button>
              
              <Button
                variant="outline"
                leftIcon={<Share2 size={16} />}
                onClick={handleSMSShare}
                className="w-full"
              >
                SMS
              </Button>
              
              <Button
                variant="outline"
                leftIcon={<Mail size={16} />}
                onClick={handleEmailShare}
                className="w-full"
              >
                Email
              </Button>
              
              <Button
                variant="outline"
                leftIcon={<Printer size={16} />}
                onClick={handlePrint}
                className="w-full"
              >
                Print
              </Button>
            </div>
          </div>

          {/* How it Works */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h5 className="text-sm font-medium text-gray-900 mb-2">How it works:</h5>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Patient clicks/scans the link to view prescription</li>
              <li>• If not registered, they'll be prompted to create an account</li>
              <li>• Prescription automatically added to their health records</li>
              <li>• Secure access with mobile number verification</li>
              <li>• Link expires in 48 hours for security</li>
            </ul>
          </div>

          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Security Notice</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>This prescription link is secure and time-limited. Only share with the intended patient.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              variant="primary"
              leftIcon={<Copy size={16} />}
              onClick={handleCopyLink}
            >
              Copy Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionShareModal;
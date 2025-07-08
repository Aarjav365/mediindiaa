import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = {
    'application/pdf': ['.pdf'],
    'image/*': ['.png', '.jpg', '.jpeg']
  },
  maxSize = 5242880 // 5MB
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragActive 
          ? 'border-primary-500 bg-primary-50' 
          : 'border-gray-300 hover:border-primary-500 hover:bg-gray-50'
        }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center">
        <Upload 
          size={24} 
          className={`mb-2 ${isDragActive ? 'text-primary-500' : 'text-gray-400'}`} 
        />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PDF or images up to 5MB
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
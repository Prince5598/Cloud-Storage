"use client"

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { fileApi } from '@/lib/api';
import { useFileStore } from '@/lib/store';
import { useUser } from '@clerk/nextjs';

interface FileUploadProps {
  onClose: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function FileUpload({ onClose }: FileUploadProps) {
  const [uploadingFile, setUploadingFile] = useState<UploadingFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { user } = useUser();
  const { currentFolder, addFile } = useFileStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Only allow one file at a time
    if (acceptedFiles.length > 1) {
      toast.error('Please upload only one file at a time');
      return;
    }

    const file = acceptedFiles[0];
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${file.name} is too large. Maximum size is 5MB.`);
      return;
    }
    
    setUploadingFile({
      file,
      progress: 0,
      status: 'pending'
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false, // Restrict to single file
    maxFiles: 1, // Maximum 1 file
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  });

  const removeFile = () => {
    setUploadingFile(null);
  };

  const uploadFile = async () => {
    if (!user || !uploadingFile) return;

    setIsUploading(true);

    try {
      // Update status to uploading
      setUploadingFile(prev => prev ? { ...prev, status: 'uploading', progress: 0 } : null);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadingFile(prev => 
          prev && prev.status === 'uploading' 
            ? { ...prev, progress: Math.min(prev.progress + Math.random() * 25, 90) }
            : prev
        );
      }, 300);

      const uploadedFile = await fileApi.uploadFile(
        uploadingFile.file, 
        user.id, 
        currentFolder || undefined
      );

      clearInterval(progressInterval);

      // Complete the upload
      setUploadingFile(prev => prev ? { ...prev, status: 'completed', progress: 100 } : null);

      addFile(uploadedFile);
      toast.success(`${uploadingFile.file.name} uploaded successfully`);

      // Close after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      // Handle error
      setUploadingFile(prev => prev ? { 
        ...prev, 
        status: 'error', 
        error: 'Upload failed',
        progress: 0 
      } : null);
      toast.error(`Failed to upload ${uploadingFile.file.name}`);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: UploadingFile['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'uploading': return 'text-blue-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (file: UploadingFile) => {
    if (file.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (file.status === 'error') {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
    return file.file.type.startsWith('image/') ? (
      <Image className="h-5 w-5 text-blue-500" />
    ) : (
      <File className="h-5 w-5 text-gray-500" />
    );
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-primary bg-primary/5 scale-105'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/20'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className={`mx-auto h-12 w-12 mb-4 transition-colors ${
          isDragActive ? 'text-primary' : 'text-muted-foreground'
        }`} />
        <p className="text-lg font-medium mb-2">
          {isDragActive ? 'Drop your file here' : 'Drag & drop a file here'}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse files
        </p>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Maximum file size: 5MB
          </p>
          <p className="text-xs text-muted-foreground">
            Only one file at a time
          </p>
        </div>
      </div>

      {uploadingFile && (
        <div className="space-y-4">
          <h3 className="font-medium">Selected File</h3>
          <div className="space-y-3">
            <div className="p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(uploadingFile)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadingFile.file.name}</p>
                  <div className="flex items-center gap-3 text-xs mt-1">
                    <span className="text-muted-foreground">
                      {formatFileSize(uploadingFile.file.size)}
                    </span>
                    <span className={getStatusColor(uploadingFile.status)}>
                      {uploadingFile.status === 'pending' && 'Ready to upload'}
                      {uploadingFile.status === 'uploading' && `Uploading... ${Math.round(uploadingFile.progress)}%`}
                      {uploadingFile.status === 'completed' && 'Upload completed!'}
                      {uploadingFile.status === 'error' && (uploadingFile.error || 'Upload failed')}
                    </span>
                  </div>
                </div>
                {uploadingFile.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={isUploading}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {(uploadingFile.status === 'uploading' || uploadingFile.status === 'completed') && (
                <div className="mt-3">
                  <Progress 
                    value={uploadingFile.progress} 
                    className="h-2"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={uploadFile} 
              disabled={isUploading || uploadingFile.status !== 'pending'} 
              className="flex-1"
            >
              {isUploading ? 'Uploading...' : 'Upload File'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isUploading}
              className="px-6"
            >
              {isUploading ? 'Close when done' : 'Cancel'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
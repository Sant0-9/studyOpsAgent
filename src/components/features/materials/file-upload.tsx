'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  maxSize?: number;
  accept?: Record<string, string[]>;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const defaultAccept = {
  'application/pdf': ['.pdf'],
  'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
};

export function FileUpload({ onUpload, maxSize = MAX_FILE_SIZE, accept = defaultAccept }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-8 w-8" />;
    if (file.type === 'application/pdf') return <File className="h-8 w-8" />;
    return <FileText className="h-8 w-8" />;
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-lg">Drop files here...</p>
        ) : (
          <div>
            <p className="text-lg font-medium mb-2">Drag and drop files here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
            <p className="text-xs text-muted-foreground mt-2">
              Supports PDF, images, text files (max {Math.round(maxSize / 1024 / 1024)}MB each)
            </p>
          </div>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div className="rounded-lg bg-destructive/10 p-3">
          <p className="text-sm text-destructive font-medium">Some files were rejected:</p>
          <ul className="text-xs text-destructive mt-1 space-y-1">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                {file.name}: {errors.map((e) => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Selected files ({selectedFiles.length}):</p>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button onClick={handleUpload} className="w-full">
            Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
}

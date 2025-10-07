'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from './file-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignments?: { id: string; title: string }[];
  defaultAssignmentId?: string;
}

export function UploadDialog({ open, onOpenChange, assignments = [], defaultAssignmentId }: UploadDialogProps) {
  const router = useRouter();
  const [assignmentId, setAssignmentId] = useState(defaultAssignmentId || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      if (assignmentId) {
        formData.append('assignmentId', assignmentId);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      toast.success(`Uploaded ${result.data.length} file(s) successfully`);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error('Failed to upload files');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Study Materials</DialogTitle>
          <DialogDescription>
            Upload PDFs, images, or text files to your study materials library
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {assignments.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="assignment">Link to Assignment (Optional)</Label>
              <Select value={assignmentId} onValueChange={setAssignmentId}>
                <SelectTrigger id="assignment">
                  <SelectValue placeholder="Select assignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {assignments.map((assignment) => (
                    <SelectItem key={assignment.id} value={assignment.id}>
                      {assignment.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <FileUpload onUpload={handleUpload} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { UploadDialog } from '@/components/features/materials/upload-dialog';

export default function MaterialsPage() {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Study Materials</h1>
          <p className="text-muted-foreground">Upload and organize your study materials</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Material
        </Button>
      </div>

      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">
          No materials yet. Upload your first study material!
        </p>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Now
        </Button>
      </div>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}

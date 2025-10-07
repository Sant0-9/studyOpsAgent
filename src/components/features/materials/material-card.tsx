'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { File, FileText, Image as ImageIcon, MoreVertical, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { StudyMaterial } from '@prisma/client';
import { toast } from 'sonner';

interface MaterialCardProps {
  material: StudyMaterial & { assignment?: { title: string; id: string } | null };
}

const typeIcons = {
  PDF: <File className="h-5 w-5" />,
  IMAGE: <ImageIcon className="h-5 w-5" />,
  TEXT: <FileText className="h-5 w-5" />,
  LINK: <FileText className="h-5 w-5" />,
  OTHER: <FileText className="h-5 w-5" />,
};

const typeColors = {
  PDF: 'bg-red-100 text-red-800',
  IMAGE: 'bg-blue-100 text-blue-800',
  TEXT: 'bg-green-100 text-green-800',
  LINK: 'bg-purple-100 text-purple-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export function MaterialCard({ material }: MaterialCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = () => {
    if (material.fileUrl) {
      window.open(material.fileUrl, '_blank');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${material.title}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/materials/${material.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete material');
      }

      toast.success('Material deleted');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete material');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${typeColors[material.type]}`}>
              {typeIcons[material.type]}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{material.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {material.type}
                </Badge>
                {material.fileSize && (
                  <span className="text-xs text-muted-foreground">
                    {(material.fileSize / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {material.fileUrl && (
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {material.assignment && (
            <Link
              href={`/assignments/${material.assignment.id}`}
              className="text-sm text-primary hover:underline"
            >
              Assignment: {material.assignment.title}
            </Link>
          )}
          <p className="text-xs text-muted-foreground">
            Uploaded {format(material.uploadedAt, 'PPP')}
          </p>
          {material.content && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {material.content.substring(0, 150)}...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';

export default function MaterialsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Study Materials</h1>
          <p className="text-muted-foreground">Upload and organize your study materials</p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Material
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Materials</CardTitle>
          <CardDescription>PDFs, images, and documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No materials yet. Upload your first study material!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ErrorLogForm } from '@/components/features/errors/error-log-form';
import { ErrorList } from '@/components/features/errors/error-list';
import { ErrorStats } from '@/components/features/errors/error-stats';
import { CommonMistakes } from '@/components/features/errors/common-mistakes';
import { Download } from 'lucide-react';
import Link from 'next/link';

export default function ErrorsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Error Tracking</h1>
        <div className="flex gap-2">
          <Link href="/api/errors/export?format=csv" target="_blank">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </Link>
          <Link href="/api/errors/export?format=json" target="_blank">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </Link>
          <ErrorLogForm />
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Error List</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="patterns">Common Mistakes</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <ErrorList />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <ErrorStats />
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ErrorStats />
            </div>
            <div>
              <CommonMistakes />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

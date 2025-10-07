import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="study">Study</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic application settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">General settings will be implemented here</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="study" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Study Preferences</CardTitle>
              <CardDescription>Customize your study session settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">Study settings will be implemented here</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure reminders and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">Notification settings will be implemented here</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">Appearance settings will be implemented here</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

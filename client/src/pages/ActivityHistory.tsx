
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

export default function ActivityHistory() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: activityData, isError, isLoading } = useQuery({
    queryKey: ['activity-history'],
    queryFn: async () => {
      const response = await fetch('/api/user/activity-history', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch activity history');
      return response.json();
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDownloadPDF = async (type: string = 'all') => {
    try {
      const response = await fetch(`/api/user/activity-history/pdf?type=${type}`);
      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-history-${type}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <h2 className="text-xl font-semibold mb-4">Please Login First</h2>
            <p className="text-muted-foreground mb-4">You need to be logged in to view your activity history.</p>
            <Button onClick={() => setLocation('/auth')}>Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Activity History</h1>
        <Button onClick={() => handleDownloadPDF()}>Download All Activity (PDF)</Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Activity</TabsTrigger>
          <TabsTrigger value="login">Login History</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="chats">Chat History</TabsTrigger>
          <TabsTrigger value="comparisons">Comparison History</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {!activityData || Object.keys(activityData).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No activity history found. Start exploring our platform to see your activities here!</p>
                </div>
              ) : (
                Object.entries(activityData).map(([type, records]: [string, any]) => (
                  <div key={type} className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 capitalize">{type}</h3>
                    {Array.isArray(records) && records.length > 0 ? (
                      records.map((record: any) => (
                        <div key={record.id} className="border-b py-2">
                          <p>Timestamp: {new Date(record.timestamp || record.loginTimestamp).toLocaleString()}</p>
                          {record.actionType && <p>Action: {record.actionType}</p>}
                          {record.orderTotal && <p>Order Total: ${record.orderTotal}</p>}
                          {record.messageContent && <p>Message: {record.messageContent}</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No {type} records found</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login History</CardTitle>
            </CardHeader>
            <CardContent>
              {!activityData?.loginRecords?.length ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No login history found</p>
                </div>
              ) : (
                activityData.loginRecords.map((record: any) => (
                  <div key={record.id} className="border-b py-2">
                    <p>Login Time: {new Date(record.loginTimestamp).toLocaleString()}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

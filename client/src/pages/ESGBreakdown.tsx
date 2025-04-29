import React from 'react';
import ESGScoreBreakdown from '@/components/dashboard/ESGScoreBreakdown';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ESGBreakdownPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">ESG Score Breakdown</h1>
      <p className="text-slate-500">Detailed view of ESG scores broken down by environmental, social, and governance factors.</p>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Company ESG Score Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ESGScoreBreakdown />
        </CardContent>
      </Card>
    </div>
  );
};

export default ESGBreakdownPage;
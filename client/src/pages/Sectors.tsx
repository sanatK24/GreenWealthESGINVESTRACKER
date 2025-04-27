import React from 'react';
import SectorPerformance from '@/components/dashboard/SectorPerformance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const SectorsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Sector Performance</h1>
      <p className="text-slate-500">Analysis of ESG performance across different industry sectors.</p>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Sector ESG Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <SectorPerformance />
        </CardContent>
      </Card>
    </div>
  );
};

export default SectorsPage;
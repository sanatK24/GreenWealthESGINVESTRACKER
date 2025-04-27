import React from 'react';
import PortfolioComposition from '@/components/dashboard/PortfolioComposition';
import SustainabilityTrend from '@/components/dashboard/SustainabilityTrend';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const PortfolioPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Portfolio</h1>
      <p className="text-slate-500">Manage and monitor your sustainable investment portfolio.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Portfolio Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioComposition />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Sustainability Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <SustainabilityTrend />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioPage;
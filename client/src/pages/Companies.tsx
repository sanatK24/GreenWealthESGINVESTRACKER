import React from 'react';
import { useQuery } from '@tanstack/react-query';
import CompanyTable from '@/components/dashboard/CompanyTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const Companies = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">ESG Companies</h1>
      <p className="text-slate-500">Browse and explore companies with high ESG scores in our database.</p>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Companies List</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default Companies;
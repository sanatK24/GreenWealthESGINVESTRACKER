import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Invest = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">Invest</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Investment Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Choose from our carefully selected green stocks and ESG-focused companies.
            </p>
            <Button 
              className="w-full"
              onClick={() => navigate('/company-prices')}
            >
              Browse Stocks
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invest;
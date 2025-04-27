import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type TimeframeOption = '1d' | '1w' | '1m' | '6m' | '1y' | '5y' | 'max';

interface StockPriceChartProps {
  companyId: number;
  className?: string;
}

export function StockPriceChart({ companyId, className }: StockPriceChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('1m');
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/companies', companyId, 'price-history', selectedTimeframe],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${companyId}/price-history?timeframe=${selectedTimeframe}`);
      if (!res.ok) {
        throw new Error('Failed to fetch price history');
      }
      return res.json();
    }
  });

  // Prepare data for the chart
  const chartData = React.useMemo(() => {
    if (!data?.prices) return [];
    
    // Helper function to extract the actual price value from potentially nested objects
    const getPrice = (priceObj: any) => {
      if (typeof priceObj === 'number') return priceObj;
      if (typeof priceObj === 'object' && priceObj.price && typeof priceObj.price === 'object') {
        return priceObj.price.price;
      }
      if (typeof priceObj === 'object' && typeof priceObj.price === 'number') {
        return priceObj.price;
      }
      return 0;
    };
    
    // Transform price data coming from the API
    return data.prices.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: selectedTimeframe === '5y' || selectedTimeframe === 'max' ? 'numeric' : undefined
      }),
      price: getPrice(item)
    }));
    
  }, [data?.prices, selectedTimeframe]);

  // Calculate price trend percentage change
  const calculatePriceChange = () => {
    if (!data?.prices || data.prices.length < 2) return { value: 0, percentage: 0, isPositive: true };
    
    // Handle nested price objects
    const getPrice = (priceObj: any) => {
      if (typeof priceObj === 'number') return priceObj;
      if (typeof priceObj === 'object' && priceObj.price && typeof priceObj.price === 'object') {
        return priceObj.price.price;
      }
      if (typeof priceObj === 'object' && typeof priceObj.price === 'number') {
        return priceObj.price;
      }
      return 0;
    };
    
    const firstPrice = getPrice(data.prices[0]);
    const lastPrice = getPrice(data.prices[data.prices.length - 1]);
    
    if (!firstPrice || !lastPrice) return { value: 0, percentage: 0, isPositive: true };
    
    const change = lastPrice - firstPrice;
    const percentage = ((change / firstPrice) * 100).toFixed(2);
    
    return {
      value: change.toFixed(2),
      percentage,
      isPositive: change >= 0
    };
  };

  const priceChange = calculatePriceChange();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          {data?.companyName || 'Stock'} Price Chart
          {priceChange && (
            <span className={cn("ml-2 text-sm font-medium", 
              priceChange.isPositive ? "text-green-500" : "text-red-500")}>
              {priceChange.isPositive ? '↑' : '↓'} {priceChange.percentage}%
            </span>
          )}
        </CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue={selectedTimeframe} 
          onValueChange={(value) => setSelectedTimeframe(value as TimeframeOption)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-7 mb-4">
            <TabsTrigger value="1d">1D</TabsTrigger>
            <TabsTrigger value="1w">1W</TabsTrigger>
            <TabsTrigger value="1m">1M</TabsTrigger>
            <TabsTrigger value="6m">6M</TabsTrigger>
            <TabsTrigger value="1y">1Y</TabsTrigger>
            <TabsTrigger value="5y">5Y</TabsTrigger>
            <TabsTrigger value="max">Max</TabsTrigger>
          </TabsList>
          
          {/* All content is rendered inside this single TabsContent since we're just changing the data source */}
          <TabsContent value={selectedTimeframe} className="w-full h-[350px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Error loading price data. Please try again.</p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No price data available for this timeframe.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Price']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    name="Price (₹)" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
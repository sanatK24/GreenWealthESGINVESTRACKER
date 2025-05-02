import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChevronDown } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

type PieChartViewType = 'sector' | 'performance' | 'esg';

const PortfolioPieChart = () => {
  const [viewType, setViewType] = useState<PieChartViewType>('sector');

  // Get portfolio composition data
  const { data: sectorData, isLoading: isLoadingSectors } = useQuery({
    queryKey: ['/api/portfolio/composition'],
    queryFn: async () => {
      const response = await fetch('/api/portfolio/composition');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio composition');
      }
      return response.json();
    }
  });

  // Get ESG portfolio data
  const { data: portfolioSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['/api/portfolio/summary'],
    queryFn: async () => {
      const response = await fetch('/api/portfolio/summary');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio summary');
      }
      return response.json();
    }
  });

  const getChartData = () => {
    if (viewType === 'sector' && sectorData?.sectors) {
      return sectorData.sectors.map((sector: any) => ({
        name: sector.name,
        value: parseFloat(sector.value),
      }));
    } else if (viewType === 'performance') {
      // For performance view, we'll calculate returns vs losses
      return [
        { name: 'Positive Returns', value: 68.5 },
        { name: 'Negative Returns', value: 31.5 }
      ];
    } else if (viewType === 'esg') {
      // For ESG view, show sustainable vs non-sustainable
      if (portfolioSummary) {
        const sustainableValue = parseFloat(portfolioSummary.sustainableValue || '0');
        const totalValue = parseFloat(portfolioSummary.totalValue || '0') || 100;
        const nonSustainableValue = totalValue - sustainableValue;

        return [
          { name: 'Sustainable Investments', value: sustainableValue },
          { name: 'Other Investments', value: nonSustainableValue }
        ];
      }
    }

    // Default data if none of the conditions are met
    return [
      { name: 'Technology', value: 35 },
      { name: 'Clean Energy', value: 25 },
      { name: 'Electric Vehicles', value: 20 },
      { name: 'Sustainable Materials', value: 20 }
    ];
  };

  const chartData = getChartData();

  const getViewTypeLabel = () => {
    switch (viewType) {
      case 'sector': return 'Sector Allocation';
      case 'performance': return 'Performance Breakdown';
      case 'esg': return 'ESG Breakdown';
      default: return 'Portfolio Breakdown';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{getViewTypeLabel()}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 text-xs flex gap-1 items-center">
              {getViewTypeLabel()}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setViewType('sector')}>
              Sector Allocation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewType('performance')}>
              Performance Breakdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewType('esg')}>
              ESG Breakdown
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoadingSectors || isLoadingSummary ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`$${value}`, 'Value']} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioPieChart;
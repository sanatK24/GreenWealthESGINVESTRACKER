import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Area, ComposedChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectLabel,
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2, X, Plus, ArrowUpDown, TrendingUp, TrendingDown, Info, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Company } from '@shared/schema';
import { AIInsights } from '@/components/dashboard/AIInsights';

type TimeframeOption = '1d' | '1w' | '1m' | '6m' | '1y' | '5y' | 'max';
type ChartType = 'line' | 'area';

interface StockComparisonProps {
  className?: string;
  initialCompanyIds?: number[];
}

// Main chart colors for lines
const CHART_COLORS = [
  '#10b981', // green
  '#3b82f6', // blue
  '#f43f5e', // red
  '#a855f7', // purple
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#84cc16', // lime
];

// Light colors for area fills
const CHART_COLORS_LIGHT = [
  'rgba(16, 185, 129, 0.2)',  // green
  'rgba(59, 130, 246, 0.2)',  // blue
  'rgba(244, 63, 94, 0.2)',   // red
  'rgba(168, 85, 247, 0.2)',  // purple
  'rgba(245, 158, 11, 0.2)',  // amber
  'rgba(6, 182, 212, 0.2)',   // cyan
  'rgba(132, 204, 22, 0.2)',  // lime
];

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-md shadow-md">
        <p className="font-medium text-sm mb-2">{`Date: ${label}`}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">{entry.name}</span>
              </div>
              <span className="text-sm font-medium">₹{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function StockComparison({ className, initialCompanyIds = [] }: StockComparisonProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('1m');
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<number[]>(initialCompanyIds);
  const [showAddSelect, setShowAddSelect] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [hasInsights, setHasInsights] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  // Get all companies for the dropdown
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: async () => {
      const res = await fetch('/api/companies?limit=50');
      if (!res.ok) {
        throw new Error('Failed to fetch companies');
      }
      return res.json();
    }
  });

  // Get comparison data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/companies/compare', selectedCompanyIds.join(','), selectedTimeframe],
    queryFn: async () => {
      if (selectedCompanyIds.length === 0) return { companies: [], prices: [] };

      const res = await fetch(`/api/companies/compare?ids=${selectedCompanyIds.join(',')}&timeframe=${selectedTimeframe}`);
      if (!res.ok) {
        throw new Error('Failed to fetch comparison data');
      }
      return res.json();
    },
    enabled: selectedCompanyIds.length > 0,
    onFetch: () => setIsRefetching(true),
    onSuccess: () => setIsRefetching(false),
    onError: () => setIsRefetching(false)
  });

  // Create a lookup map of companies by ID
  const companiesMap = useMemo(() => {
    if (!data?.companies) return new Map();

    const map = new Map();
    data.companies.forEach((company: Company) => {
      map.set(company.id, company);
    });

    return map;
  }, [data?.companies]);

  // Prepare data for the chart
  const chartData = useMemo(() => {
    if (!data?.prices || data.prices.length === 0) return [];

    // Create dates for the x-axis based on timeframe
    let dateLabels: string[] = [];
    const samplePrices = data.prices[0].prices;
    const priceCount = samplePrices.length;

    switch (selectedTimeframe) {
      case '1d':
        dateLabels = ['9:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:00'].slice(0, priceCount);
        break;
      case '1w':
        dateLabels = Array.from({ length: priceCount }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (priceCount - 1 - i));
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        break;
      case '1m':
        dateLabels = Array.from({ length: priceCount }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (priceCount - 1 - i) * 7);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        break;
      case '6m':
        dateLabels = Array.from({ length: priceCount }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (priceCount - 1 - i));
          return date.toLocaleDateString('en-US', { month: 'short' });
        });
        break;
      case '1y':
        dateLabels = Array.from({ length: priceCount }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (priceCount - 1 - i) * 2);
          return date.toLocaleDateString('en-US', { month: 'short' });
        });
        break;
      case '5y':
        dateLabels = Array.from({ length: priceCount }, (_, i) => {
          const date = new Date();
          date.setFullYear(date.getFullYear() - (priceCount - 1 - i));
          return date.getFullYear().toString();
        });
        break;
      case 'max':
        dateLabels = Array.from({ length: priceCount }, (_, i) => {
          return `Year ${i + 1}`;
        });
        break;
    }

    // Create formatted chart data with dates and all company prices
    const formattedData = dateLabels.map((date, index) => {
      const point: any = { date };

      data.prices.forEach((priceData: any) => {
        const company = companiesMap.get(priceData.companyId);
        if (company && priceData.prices[index]) {
          const companyName = company.name;
          // Handle the price object structure from the API
          const pricePoint = priceData.prices[index];
          if (pricePoint) {
            const priceValue = typeof pricePoint === 'object' && 'price' in pricePoint
              ? pricePoint.price
              : pricePoint;
            point[companyName] = priceValue;
          }
        }
      });

      return point;
    });

    return formattedData;
  }, [data?.prices, selectedTimeframe, companiesMap]);

  const handleAddCompany = (id: string) => {
    const numId = parseInt(id);
    if (!selectedCompanyIds.includes(numId)) {
      // Limit to 7 companies (the number of colors we have)
      if (selectedCompanyIds.length < 7) {
        setSelectedCompanyIds([...selectedCompanyIds, numId]);
      }
    }
    setShowAddSelect(false);
  };

  const handleRemoveCompany = (id: number) => {
    setSelectedCompanyIds(selectedCompanyIds.filter(companyId => companyId !== id));
  };

  // Get unique sectors from the companies data
  const sectors = useMemo(() => {
    if (!companiesData?.companies) return [];

    const uniqueSectors = new Set<string>();
    companiesData.companies.forEach((company: Company) => {
      if (company.sector) uniqueSectors.add(company.sector);
    });

    return Array.from(uniqueSectors);
  }, [companiesData?.companies]);

  // Filter companies by selected sector
  const filteredCompanies = useMemo(() => {
    if (!companiesData?.companies) return [];

    return selectedSector === 'all' 
      ? companiesData.companies 
      : companiesData.companies.filter((company: Company) => company.sector === selectedSector);
  }, [companiesData?.companies, selectedSector]);

  // Calculate performance metrics for each company
  const companyPerformanceData = useMemo(() => {
    if (!data?.companies || !chartData || chartData.length < 2) return [];

    return data.companies.map((company: Company, index: number) => {
      const firstPrice = chartData[0][company.name];
      const lastPrice = chartData[chartData.length - 1][company.name];

      if (firstPrice !== undefined && lastPrice !== undefined) {
        const change = lastPrice - firstPrice;
        const percentChange = ((change / firstPrice) * 100).toFixed(2);

        return {
          ...company,
          priceChange: change.toFixed(2),
          percentChange: percentChange,
          isPositive: change >= 0
        };
      }

      return {
        ...company,
        priceChange: '0.00',
        percentChange: '0.00',
        isPositive: true
      };
    });
  }, [data?.companies, chartData]);

  // Effect to select some initial companies if none selected
  useEffect(() => {
    if (selectedCompanyIds.length === 0 && companiesData?.companies && companiesData.companies.length > 0) {
      // Auto-select first 2 companies for comparison
      const initialIds = companiesData.companies.slice(0, 2).map((c: Company) => c.id);
      setSelectedCompanyIds(initialIds);
    }
  }, [companiesData?.companies, selectedCompanyIds.length]);

  const generateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      //  Simulate fetching insights - Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasInsights(true);
    } catch (error) {
      console.error("Error generating insights:", error);
    } finally {
      setIsGeneratingInsights(false);
    }
  };


  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold">Stock Price Comparison</CardTitle>
          <CardDescription>Compare performance across multiple stocks</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setChartType(chartType === 'line' ? 'area' : 'line')}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" /> {chartType === 'line' ? 'Area' : 'Line'} Chart
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isLoading || isRefetching}
          >
            {isLoading || isRefetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {selectedCompanyIds.length > 0 && (
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <Button 
                  onClick={generateInsights}
                  disabled={isGeneratingInsights || isLoading || isRefetching || selectedCompanyIds.length === 0}
                  className="w-full"
                  variant="outline"
                >
                  {(isGeneratingInsights || isLoading || isRefetching) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {hasInsights ? 'Regenerate Insights' : 'Generate Insights'}
                </Button>
              </div>
              {hasInsights && (
                <div className="flex-[2] p-4 border rounded-lg bg-background/50">
                  <AIInsights 
                    companyIds={selectedCompanyIds} 
                    timeframe={selectedTimeframe}
                  />
                </div>
              )}
            </div>
          )}

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

            <TabsContent value={selectedTimeframe} className="w-full h-[400px]">
              {selectedCompanyIds.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p className="mb-4">Select stocks to compare</p>
                  {!showAddSelect && (
                    <Button 
                      variant="outline"
                      onClick={() => setShowAddSelect(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Stock
                    </Button>
                  )}
                </div>
              ) : isLoading || companiesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading price data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Error loading comparison data. Please try again.</p>
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No price data available for this timeframe.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'line' ? (
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <ReferenceLine y={0} stroke="#666" />
                      {data?.companies?.map((company: Company, index: number) => (
                        <Line 
                          key={company.id}
                          type="monotone" 
                          dataKey={company.name} 
                          name={company.name} 
                          stroke={CHART_COLORS[index % CHART_COLORS.length]} 
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  ) : (
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <ReferenceLine y={0} stroke="#666" />
                      {data?.companies?.map((company: Company, index: number) => (
                        <Area 
                          key={company.id}
                          type="monotone" 
                          dataKey={company.name} 
                          name={company.name} 
                          fill={CHART_COLORS_LIGHT[index % CHART_COLORS_LIGHT.length]}
                          stroke={CHART_COLORS[index % CHART_COLORS.length]} 
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              )}
            </TabsContent>
          </Tabs>
        </div>
        <div className="w-full md:w-1/4">
          {data?.companies?.length > 0 ? (
            <div className="border rounded-lg h-full overflow-hidden">
              <div className="bg-muted/30 px-4 py-2 border-b">
                <h4 className="font-medium text-sm">Performance & ESG Metrics</h4>
              </div>
              <ScrollArea className="h-[466px] px-4">
                <div className="space-y-4 py-4">
                  {companyPerformanceData.map((company: Company & { priceChange: string; percentChange: string; isPositive: boolean }, index: number) => (
                    <div key={company.id} className="space-y-2 pb-4 border-b border-border/50 last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="font-medium">{company.name}</span>
                        </div>
                        <Badge 
                          variant="outline"
                          className={cn(
                            "border font-medium",
                            company.isPositive ? "bg-green-100/20 text-green-600 hover:bg-green-100/20" : "bg-red-100/20 text-red-600 hover:bg-red-100/20"
                          )}
                        >
                          {company.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {company.percentChange}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">ESG Score</span>
                          <span className="text-xs font-medium">{company.esgScore}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Env</span>
                          <span className="text-xs font-medium">{company.environmentalScore}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Social</span>
                          <span className="text-xs font-medium">{company.socialScore}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Gov</span>
                          <span className="text-xs font-medium">{company.governanceScore}/100</span>
                        </div>
                      </div>

                      <div className="bg-muted/40 p-2 rounded text-xs">
                        <div className="flex items-start mb-1">
                          <Info className="h-3 w-3 mr-1 mt-0.5 text-muted-foreground" />
                          <span className="font-medium text-muted-foreground">Price Change ({selectedTimeframe}):</span>
                        </div>
                        <div className="pl-4">
                          <span className={cn(
                            "font-medium",
                            company.isPositive ? "text-green-600" : "text-red-600"
                          )}>
                            {company.isPositive ? "+" : ""}{company.priceChange} INR ({company.percentChange}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="border rounded-lg h-full flex items-center justify-center p-4 text-center">
              <div>
                <p className="text-muted-foreground mb-4">Select stocks to view detailed ESG and performance metrics</p>
                {!showAddSelect && selectedCompanyIds.length < 7 && (
                  <Button 
                    variant="outline"
                    onClick={() => setShowAddSelect(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Stock
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
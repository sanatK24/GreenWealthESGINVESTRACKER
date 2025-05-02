import React from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StockPriceChart } from '@/components/dashboard/StockPriceChart';
import { StockNews } from '@/components/dashboard/StockNews';
import { Info, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CompanyDetail = () => {
  const { id } = useParams();

  const { data: companyData, isLoading } = useQuery({
    queryKey: ['/api/companies', id],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${id}`);
      if (!res.ok) throw new Error('Failed to fetch company data');
      return res.json();
    },
    enabled: !!id,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!companyData) {
    return <div>Company not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{companyData.name}</h1>
          <span className="text-sm text-muted-foreground">{companyData.ticker}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{companyData.sector}</span>
          <span className="text-sm font-medium">
            ESG Score: {companyData.esgScore}/100
            <span className={companyData.yearlyTrend > 0 ? "text-green-500" : "text-red-500"}>
              {" "}
              {companyData.yearlyTrend > 0 ? "↑" : "↓"} {Math.abs(companyData.yearlyTrend)}
            </span>
          </span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="sustainability">ESG History</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 p-2 rounded-full">
                    <div className="h-4 w-4 text-green-600">🌿</div>
                  </div>
                  <CardTitle className="text-lg">Environmental</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {companyData.environmentalScore}/100
                </div>
                <p className="text-sm text-muted-foreground">Excellent</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <div className="h-4 w-4 text-blue-600">👥</div>
                  </div>
                  <CardTitle className="text-lg">Social</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {companyData.socialScore}/100
                </div>
                <p className="text-sm text-muted-foreground">Excellent</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <div className="h-4 w-4 text-amber-600">⚖️</div>
                  </div>
                  <CardTitle className="text-lg">Governance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
                  {companyData.governanceScore}/100
                </div>
                <p className="text-sm text-muted-foreground">Excellent</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Company Overview</CardTitle>
              <CardDescription>Key information about {companyData.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Market Cap</span>
                    <span className="font-medium">₹{Number(companyData.marketCap).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Price</span>
                    <span className="font-medium">₹{Number(companyData.currentPrice).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">52 Week High</span>
                    <span className="font-medium">₹{Number(companyData.weekHigh52).toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">P/E Ratio</span>
                    <span className="font-medium">{companyData.peRatio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Dividend Yield</span>
                    <span className="font-medium">{companyData.dividendYield}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">52 Week Low</span>
                    <span className="font-medium">₹{Number(companyData.weekLow52).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{companyData.description}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Investment Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 bg-green-100 p-1 rounded-full">
                      <ArrowUpRight className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm">Strong renewable energy portfolio with focus on offshore wind</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 bg-green-100 p-1 rounded-full">
                      <ArrowUpRight className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm">Leading position in green energy transformation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 bg-green-100 p-1 rounded-full">
                      <ArrowUpRight className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm">Consistent dividend growth and strong financials</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 bg-amber-100 p-1 rounded-full">
                      <Info className="h-3 w-3 text-amber-600" />
                    </div>
                    <span className="text-sm">Regulatory changes in renewable energy policies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 bg-amber-100 p-1 rounded-full">
                      <Info className="h-3 w-3 text-amber-600" />
                    </div>
                    <span className="text-sm">Project execution and construction risks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 bg-amber-100 p-1 rounded-full">
                      <Info className="h-3 w-3 text-amber-600" />
                    </div>
                    <span className="text-sm">Weather-dependent power generation variability</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stock Price History</CardTitle>
                <CardDescription>Historical stock performance and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <StockPriceChart companyId={parseInt(id!)} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sustainability">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ESG Score History</CardTitle>
                <CardDescription>Historical ESG performance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={[
                      { month: 'Jan', environmental: 84, social: 79, governance: 77 },
                      { month: 'Feb', environmental: 85, social: 80, governance: 78 },
                      { month: 'Mar', environmental: 83, social: 81, governance: 79 },
                      { month: 'Apr', environmental: 86, social: 82, governance: 80 },
                      { month: 'May', environmental: 88, social: 83, governance: 81 },
                      { month: 'Jun', environmental: 87, social: 82, governance: 82 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="environmental" name="Environmental" stroke="#22c55e" strokeWidth={2} />
                    <Line type="monotone" dataKey="social" name="Social" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="governance" name="Governance" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Environmental Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Carbon Emissions</span>
                      <span className="font-medium text-green-600">↓ Decreasing</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Renewable Energy Usage</span>
                      <span className="font-medium text-green-600">↑ Increasing</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Waste Management</span>
                      <span className="font-medium text-green-600">↑ Improving</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Employee Satisfaction</span>
                      <span className="font-medium text-blue-600">↑ Strong</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Community Programs</span>
                      <span className="font-medium text-blue-600">→ Stable</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Diversity Metrics</span>
                      <span className="font-medium text-blue-600">↑ Improving</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Governance Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Board Independence</span>
                      <span className="font-medium text-amber-600">→ Maintained</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Transparency</span>
                      <span className="font-medium text-amber-600">↑ Increasing</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Risk Management</span>
                      <span className="font-medium text-amber-600">↑ Improving</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comparisons">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stock Comparison</CardTitle>
                <CardDescription>Compare with other companies</CardDescription>
              </CardHeader>
              <CardContent>
                <StockComparison initialCompanyIds={[parseInt(id!)]} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="news">
          <StockNews companyName={companyData.name} ticker={companyData.ticker} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyDetail;
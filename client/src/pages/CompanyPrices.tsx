import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockPriceChart } from "@/components/dashboard/StockPriceChart";
import { StockComparison } from "@/components/dashboard/StockComparison";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LucideInfo } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMobile } from "@/hooks/use-mobile";

export default function CompanyPrices() {
  const [_, setLocation] = useLocation();
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState("single");
  const [companyId, setCompanyId] = useState<number | null>(null);
  
  // Extract the company ID from the URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setCompanyId(parseInt(id));
    }
  }, []);

  const { data: company, isLoading: isCompanyLoading } = useQuery({
    queryKey: ['/api/company', companyId],
    enabled: companyId !== null,
  });

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLocation('/companies')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">
              {isCompanyLoading ? 'Loading...' : company?.name ? `${company.name} (${company.ticker})` : 'Stock Price Analysis'}
            </h1>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="single">Single Stock</TabsTrigger>
            <TabsTrigger value="compare">Compare Stocks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="space-y-4">
            {companyId ? (
              <Card>
                <CardHeader className="px-6 pt-6 pb-4">
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span>Price History</span>
                    <div className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                      <LucideInfo className="h-4 w-4" />
                      <span>Select timeframe to view different periods</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <StockPriceChart companyId={companyId} className="mt-4 h-[400px]" />
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <p className="text-muted-foreground">Please select a company to view price data</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="compare" className="space-y-4">
            <Card>
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>Stock Comparison</span>
                  <div className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                    <LucideInfo className="h-4 w-4" />
                    <span>Add up to 4 stocks to compare</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <StockComparison initialCompanyIds={companyId ? [companyId] : []} className="mt-4 h-[500px]" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {company && (
          <Card className="mt-4">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle>Stock Details</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Current Price</div>
                  <div className="text-2xl font-semibold mt-1">₹{company.currentPrice?.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Market Cap</div>
                  <div className="text-2xl font-semibold mt-1">₹{company.marketCap?.toLocaleString()} Cr</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">52-Week High</div>
                  <div className="text-2xl font-semibold mt-1">₹{company.yearHigh?.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">YTD Return</div>
                  <div className="text-2xl font-semibold mt-1 text-green-600">+{company.yearlyTrend}%</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">About {company.name}</h3>
                <p className="text-muted-foreground">{company.description}</p>
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex flex-col sm:flex-row sm:justify-between gap-6">
                <div>
                  <h3 className="font-medium mb-2">ESG Rating</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
                      <span className="text-2xl font-bold text-primary">{company.esgScore}</span>
                    </div>
                    <div>
                      <div className="font-medium">Strong Performer</div>
                      <div className="text-sm text-muted-foreground">Top 20% in sector</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">ESG Breakdown</h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="px-3 py-2 rounded-md bg-green-100 text-green-800">
                      <span className="font-medium">E:</span> {company.environmentalScore}
                    </div>
                    <div className="px-3 py-2 rounded-md bg-blue-100 text-blue-800">
                      <span className="font-medium">S:</span> {company.socialScore}
                    </div>
                    <div className="px-3 py-2 rounded-md bg-purple-100 text-purple-800">
                      <span className="font-medium">G:</span> {company.governanceScore}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-start">
                  <h3 className="font-medium mb-2">Actions</h3>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => setLocation(`/buy-stock/${company.id}`)}
                  >
                    Invest Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
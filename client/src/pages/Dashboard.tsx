import React from 'react';
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { 
  LineChart, Sprout, Building2, Recycle, TrendingUp, 
  ArrowUp, ArrowDown, PieChart, BarChart, ShoppingCart
} from "lucide-react";
import { Link } from "wouter";
import PortfolioPieChart from "@/components/dashboard/PortfolioPieChart";
import CompanyTable from "@/components/dashboard/CompanyTable";
import PortfolioComposition from "@/components/dashboard/PortfolioComposition";
import { NewsCard } from "@/components/dashboard/NewsCard";

const Dashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/portfolio/summary"],
    queryFn: getQueryFn()
  });

  const portfolioStats = {
    portfolioScore: data?.portfolioScore || 76,
    scoreChange: data?.scoreChange || 3.2,
    sustainablePercentage: data?.sustainablePercentage || 68,
    sustainableValue: data?.sustainableValue || 23450,
    carbonOffset: data?.carbonOffset || 12.5,
    offsetChange: data?.offsetChange || 2.3,
    esgCompanies: data?.esgCompanies || 14,
    totalCompanies: data?.totalCompanies || 22,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">GreenWealth Investment Dashboard</h1>
          <p className="text-slate-500">Monitor and analyze your sustainable investment portfolio</p>
        </div>
      </div>
      
      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Portfolio ESG Score"
          value={portfolioStats.portfolioScore}
          subValue="/100"
          icon={LineChart}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          trend={{
            value: portfolioStats.scoreChange,
            label: "vs. last quarter"
          }}
        />
        
        <StatCard
          title="Sustainable Assets"
          value={`${portfolioStats.sustainablePercentage}%`}
          icon={Recycle}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          trend={{
            value: portfolioStats.sustainableValue,
            label: "₹ of total portfolio"
          }}
        />
        
        <StatCard
          title="Carbon Offset"
          value={portfolioStats.carbonOffset}
          subValue=" tons"
          icon={Sprout}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          trend={{
            value: portfolioStats.offsetChange,
            label: "vs. last quarter"
          }}
        />
        
        <StatCard
          title="ESG Companies"
          value={portfolioStats.esgCompanies}
          icon={Building2}
          iconBgColor="bg-slate-100"
          iconColor="text-slate-600"
          trend={{
            value: portfolioStats.totalCompanies,
            label: "total holdings"
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Links Card */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle>Quick Navigation</CardTitle>
            <CardDescription>
              Access key sections of your GreenWealth investment dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/companies">
                <div className="border rounded-lg p-3 hover:bg-slate-50 cursor-pointer transition duration-200">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">Companies</h3>
                      <p className="text-sm text-slate-500 truncate">Browse ESG companies</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/esg-breakdown">
                <div className="border rounded-lg p-3 hover:bg-slate-50 cursor-pointer transition duration-200">
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">ESG Breakdown</h3>
                      <p className="text-sm text-slate-500 truncate">Analyze ESG metrics</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/sectors">
                <div className="border rounded-lg p-3 hover:bg-slate-50 cursor-pointer transition duration-200">
                  <div className="flex items-center space-x-2">
                    <div className="bg-purple-100 p-2 rounded-full flex-shrink-0">
                      <LineChart className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">Sectors</h3>
                      <p className="text-sm text-slate-500 truncate">View sector performance</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/green-stocks">
                <div className="border rounded-lg p-3 hover:bg-slate-50 cursor-pointer transition duration-200">
                  <div className="flex items-center space-x-2">
                    <div className="bg-emerald-100 p-2 rounded-full flex-shrink-0">
                      <Sprout className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">Green Stocks</h3>
                      <p className="text-sm text-slate-500 truncate">Green technology stocks</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle>ESG Performance Summary</CardTitle>
            <CardDescription>
              Overview of your sustainable investment performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="bg-green-100 p-1.5 rounded-full flex-shrink-0">
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium truncate">Top ESG Performer</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">Ørsted</span>
                  <p className="text-sm text-slate-500">Score: 84/100</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="bg-red-100 p-1.5 rounded-full flex-shrink-0">
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="font-medium truncate">Needs Improvement</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">Plug Power</span>
                  <p className="text-sm text-slate-500">Score: 67/100</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="bg-blue-100 p-1.5 rounded-full flex-shrink-0">
                    <Recycle className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium truncate">Best Green Sector</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">Renewable Energy</span>
                  <p className="text-sm text-slate-500">Avg Score: 78/100</p>
                </div>
              </div>
              
              <div className="pt-2">
                <Link href="/portfolio" className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1">
                  <span className="truncate">View detailed portfolio analytics</span>
                  <ArrowUp className="h-3 w-3 rotate-45 flex-shrink-0" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Pie Chart and Company Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="overflow-hidden">
          <PortfolioPieChart />
        </div>
        <div className="lg:col-span-2 overflow-x-auto">
          <CompanyTable />
        </div>
      </div>
      
      {/* Additional Charts and News */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Investment Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Link href="/invest">
                  <Button variant="default" className="w-full flex items-center justify-center gap-2">
                    <ShoppingCart className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Invest in ESG Portfolio</span>
                  </Button>
                </Link>
                <Link href="/companies">
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <BarChart className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">View All Companies</span>
                  </Button>
                </Link>
                <Link href="/portfolio">
                  <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                    <PieChart className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">View Your Portfolio</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="overflow-hidden">
          <PortfolioComposition />
        </div>
        <div className="overflow-hidden">
          <NewsCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

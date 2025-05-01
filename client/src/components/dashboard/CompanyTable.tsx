import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueries } from "@tanstack/react-query";
import { 
  ArrowUp, 
  ArrowRight, 
  Car as CarIcon, 
  Sun as SunIcon, 
  Building as BuildingIcon, 
  Zap as ZapIcon,
  ShoppingCart,
  LineChart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { UtensilsCrossed as HandPlatter } from "lucide-react";
import { Link, useLocation } from "wouter";

const CompanyTable = () => {
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const { data, error } = useQuery({
    queryKey: ["/api/companies", page],
    queryFn: async () => {
      const response = await fetch(`/api/companies?page=${page}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      return response.json();
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to load company data",
      variant: "destructive",
    });
    return null;
  }

  if (!data) return null;

  const companyQueries = useQueries({
    queries: data.companies.map((company: any) => ({
      queryKey: ["/api/company", company.id],
      queryFn: async () => {
        const response = await fetch(`/api/company/${company.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      },
      enabled: !!company.id, // Only fetch if company.id is available
      staleTime: Infinity, // Data is always fresh
      retry: 1,
    })),
  });


  const getCompanyIcon = (sector: string) => {
    switch (sector.toLowerCase()) {
      case "electric vehicles":
        return <CarIcon className="text-slate-400" />;
      case "clean energy":
        return <SunIcon className="text-slate-400" />;
      case "food products":
        return <HandPlatter className="text-slate-400" />;
      case "technology":
        return <BuildingIcon className="text-slate-400" />;
      case "renewable energy":
        return <ZapIcon className="text-slate-400" />;
      default:
        return <BuildingIcon className="text-slate-400" />;
    }
  };

  const getScoreClass = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  const handleNextPage = () => {
    if (data && data.pagination && data.pagination.hasNextPage) {
      setPage(p => p + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  };

  // Responsive table content for mobile view
  const renderMobileContent = (companies: any[]) => {
    return companies.map((company: any) => (
      <div key={company.id} className="border-b border-slate-200 py-4 px-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-slate-100 flex items-center justify-center">
              {getCompanyIcon(company.sector)}
            </div>
            <div>
              <Link href={`/company/${company.id}`}>
                <div className="text-sm font-medium text-slate-900 hover:text-primary transition-colors cursor-pointer">
                  {company.name}
                </div>
              </Link>            
              <div className="text-xs text-slate-500 mt-1">
                {company.ticker} • {company.sector}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                {companyQueries.length > 0 && companyQueries[data.companies.indexOf(company)].isSuccess && (
                  <>
                    <div className="text-sm font-medium flex items-center">
                      <span className="text-xs text-slate-500 mr-1">ESG:</span>
                      <span className="font-semibold">{companyQueries[data.companies.indexOf(company)].data.esgScore}</span>
                    </div>
                    <div className="text-sm flex items-center">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${getScoreClass(companyQueries[data.companies.indexOf(company)].data.environmentalScore)}`}>
                        E: {companyQueries[data.companies.indexOf(company)].data.environmentalScore}
                      </span>
                    </div>
                    <div className="text-sm flex items-center">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${getScoreClass(companyQueries[data.companies.indexOf(company)].data.socialScore)}`}>
                        S: {companyQueries[data.companies.indexOf(company)].data.socialScore}
                      </span>
                    </div>
                    <div className="text-sm flex items-center">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${getScoreClass(companyQueries[data.companies.indexOf(company)].data.governanceScore)}`}>
                        G: {companyQueries[data.companies.indexOf(company)].data.governanceScore}
                      </span>
                    </div>
                  </>
                )}
                </div>
              </div>
                <div className="text-xs text-primary flex items-center mt-2">
                <ArrowUp className="h-3 w-3 mr-1" />
                <span>+{company.yearlyTrend} (1Y Trend)</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <Link href={`/company-prices?id=${company.id}`}>
              <Button 
                size="sm" 
                variant="outline"
                className="flex items-center gap-1 w-full"
              >
                <LineChart className="h-3 w-3" />
                Chart
              </Button>
            </Link>
            <Link href={`/buy-stock/${company.id}`}>
              <Button 
                size="sm" 
                className="flex items-center gap-1 w-full"
              >
                <ShoppingCart className="h-3 w-3" />
                Buy
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
    ));
  };

  const renderContent = () => {
    return (
      <>
        {/* Desktop view (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="whitespace-nowrap">Company</TableHead>
                <TableHead className="whitespace-nowrap">Sector</TableHead>
                <TableHead className="whitespace-nowrap">ESG Score</TableHead>
                <TableHead className="whitespace-nowrap">E</TableHead>
                <TableHead className="whitespace-nowrap">S</TableHead>
                <TableHead className="whitespace-nowrap">G</TableHead>
                <TableHead className="whitespace-nowrap">1Y Trend</TableHead>
                <TableHead className="whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.companies.map((company: any) => (
                <TableRow 
                  key={company.id} 
                  className="hover:bg-slate-50" 
                >
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md bg-slate-100 flex items-center justify-center">
                        {getCompanyIcon(company.sector)}
                      </div>
                      <div className="ml-4">
                        <Link href={`/company/${company.id}`}>
                          <div className="text-sm font-medium text-slate-900 hover:text-primary transition-colors cursor-pointer">
                            {company.name}
                          </div>
                        </Link>
                        <div className="text-sm text-slate-500">{company.ticker}</div>
                      </div>
                    </div>
                  </TableCell>            
                  <TableCell className="whitespace-nowrap">
                    <div className="text-sm text-slate-900">{company.sector}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                   {companyQueries.length > 0 && companyQueries[data.companies.indexOf(company)].isSuccess && (
                    <div className="text-sm font-medium text-slate-900">{companyQueries[data.companies.indexOf(company)].data.esgScore}</div>
                   )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                   {companyQueries.length > 0 && companyQueries[data.companies.indexOf(company)].isSuccess && (
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${getScoreClass(companyQueries[data.companies.indexOf(company)].data.environmentalScore)}`}>
                        {companyQueries[data.companies.indexOf(company)].data.environmentalScore}
                      </span>
                     )}

                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {companyQueries.length > 0 && companyQueries[data.companies.indexOf(company)].isSuccess && (
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${getScoreClass(companyQueries[data.companies.indexOf(company)].data.socialScore)}`}>
                        {companyQueries[data.companies.indexOf(company)].data.socialScore}
                      </span>
                    )}
                  </TableCell>
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {companyQueries.length > 0 && companyQueries[data.companies.indexOf(company)].isSuccess && (
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${getScoreClass(companyQueries[data.companies.indexOf(company)].data.governanceScore)}`}>
                        {companyQueries[data.companies.indexOf(company)].data.governanceScore}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="text-sm text-primary flex items-center">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      <span>+{company.yearlyTrend}</span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Link href={`/company-prices?id=${company.id}`}>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <LineChart className="h-3 w-3" />
                          Chart
                        </Button>
                      </Link>
                      <Link href={`/buy-stock/${company.id}`}>
                        <Button 
                          size="sm" 
                          className="flex items-center gap-1"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          Buy
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden">
          {renderMobileContent(data.companies)}
        </div>

        {/* Pagination controls */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Showing {data.pagination?.from || 0} to {data.pagination?.to || 0} of {data.pagination?.total || 0} companies
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline" 
              size="sm"
              className="px-2 py-1 text-sm border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              disabled={page === 1}
              onClick={handlePreviousPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-2 py-1 text-sm border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              disabled={!data?.pagination?.hasNextPage}
              onClick={handleNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <Card>
      <CardHeader className="px-4 py-3 border-b border-slate-200 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">Top ESG Companies</CardTitle>
        <div className="text-sm">
          <Link href="/companies">
            <Button variant="link" className="text-primary hover:underline p-0 flex items-center gap-1">
              View All Companies
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default CompanyTable;

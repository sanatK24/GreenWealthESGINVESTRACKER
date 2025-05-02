import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ArrowUp, LineChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "react-router-dom";

// Function to get score class
const getScoreClass = (score: number) => {
  if (score >= 80) return 'bg-green-100 text-green-800';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

// Function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export function CompanyTable() {
  const { toast } = useToast();
  const [shares, setShares] = useState("");

  const { data, error, isLoading: isCompaniesLoading } = useQuery({
    queryKey: ["/api/companies"],
    queryFn: async () => {
      const response = await fetch(`/api/companies`);
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

  if (isCompaniesLoading || !data?.companies) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-slate-500">Loading companies...</div>
      </div>
    );
  }

  const companies = data.companies;

  const handleBuy = async (company: any) => {
    if (!shares || isNaN(Number(shares))) return;

    try {
      const response = await fetch(`/api/companies/${company.ticker}`);
      if (!response.ok) throw new Error('Failed to fetch company data');
      
      const companyData = await response.json();
      const price = companyData.price || 0;
      const amount = Number(shares) * price;
      
      if (price > 0) {
        window.open(`/certificate/${company.ticker}/${shares}/${amount}`);
      } else {
        toast({
          title: "Error",
          description: "Could not fetch current price for this company",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process purchase",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {companies.map((company: any) => (
        <div key={company.id} className="bg-card rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">{company.name}</h3>
              <p className="text-sm text-muted-foreground">{company.ticker}</p>
              <div className="flex gap-2">
                <div className="text-sm flex items-center">
                  <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${getScoreClass(company.environmentalScore)}`}>
                    E: {company.environmentalScore}
                  </span>
                </div>
                <div className="text-sm flex items-center">
                  <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${getScoreClass(company.socialScore)}`}>
                    S: {company.socialScore}
                  </span>
                </div>
                <div className="text-sm flex items-center">
                  <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${getScoreClass(company.governanceScore)}`}>
                    G: {company.governanceScore}
                  </span>
                </div>
              </div>
              <div className="text-xs text-primary flex items-center mt-2">
                <ArrowUp className="h-3 w-3 mr-1" />
                <span>+{company.yearlyTrend} (1Y Trend)</span>
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter number of shares"
                />
                <div className="text-sm font-semibold text-primary">
                  {shares && company.price ? 
                    formatCurrency(Number(shares) * Number(company.price)) : 
                    formatCurrency(0)
                  }
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleBuy(company)}
                  disabled={!shares || isNaN(Number(shares)) || !company.price}
                >
                  Buy
                </Button>
                <Link to={`/company-prices?id=${company.id}`}>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-1 w-full"
                  >
                    <LineChart className="h-3 w-3" />
                    Chart
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CompanyTable;
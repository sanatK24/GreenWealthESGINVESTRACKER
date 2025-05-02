import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowUp, 
  ArrowRight, 
  Car as CarIcon, 
  Sun as SunIcon, 
  Building as BuildingIcon, 
  Zap as ZapIcon,
  LineChart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { UtensilsCrossed as HandPlatter } from "lucide-react";
import { Link } from "react-router-dom"; //updated import

// Function to get score class
const getScoreClass = (score: number) => {
  if (score >= 80) return 'bg-green-100 text-green-800';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

export function CompanyTable() {
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const { data, error, isLoading: isCompaniesLoading } = useQuery({
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

  if (isCompaniesLoading || !data?.companies) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-slate-500">Loading companies...</div>
      </div>
    );
  }

  const companies = data.companies; // Assuming data.companies contains the array of companies


  return (
    <div className="space-y-4">
      {companies.map((company) => (
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
            <div className="flex flex-col space-y-2">
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
      ))}
    </div>
  );
}

export default CompanyTable;
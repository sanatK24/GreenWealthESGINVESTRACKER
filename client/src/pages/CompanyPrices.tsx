
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockPriceChart } from "@/components/dashboard/StockPriceChart";
import { StockComparison } from "@/components/dashboard/StockComparison";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CompanyPrices() {
  const [_, setLocation] = useLocation();
  const [companyId, setCompanyId] = useState<number | null>(null);

  // Extract the company ID from the URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) {
      setCompanyId(parseInt(id));
    }
  }, [window.location.search]);

  const { data: company, isLoading: isCompanyLoading } = useQuery({
    queryKey: ["/api/companies", companyId],
    queryFn: async () => {
      if (!companyId) return null;
      const response = await fetch(`/api/companies/${companyId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch company data");
      }
      return response.json();
    },
    enabled: companyId !== null,
  });

  const { data: companiesData } = useQuery({
    queryKey: ["/api/companies"],
    queryFn: async () => {
      const response = await fetch("/api/companies");
      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }
      return response.json();
    }
  });

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/companies")}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">
              {isCompanyLoading
                ? "Loading..."
                : company?.name
                  ? `${company.name} (${company.ticker})`
                  : "Stock Price Analysis"}
            </h1>
          </div>
        </div>

        {companyId ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stock Price History</CardTitle>
              </CardHeader>
              <CardContent>
                <StockPriceChart companyId={companyId} className="mt-4 h-[500px]" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Stock Comparison</CardTitle>
                <CardDescription>Compare with other companies</CardDescription>
              </CardHeader>
              <CardContent>
                <StockComparison initialCompanyIds={[companyId]} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4">
            <p className="text-muted-foreground">
              Please select a company to view price data
            </p>
            <Select onValueChange={(value) => {
              setCompanyId(parseInt(value));
              setLocation(`/company-prices?id=${value}`);
            }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Companies</SelectLabel>
                  {companiesData?.companies?.map((company: any) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}

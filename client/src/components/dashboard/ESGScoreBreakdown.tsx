
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ESGScoreBreakdown() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/companies/esg-breakdown"],
    queryFn: async () => {
      const response = await fetch("/api/companies/esg-breakdown");
      if (!response.ok) {
        throw new Error("Failed to fetch ESG breakdown data");
      }
      return response.json();
    },
    staleTime: 60000,
    retry: 2,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ESG Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ESG Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error loading ESG data</div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.companies || data.companies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ESG Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">No ESG data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ESG Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.companies.map((company, index) => (
            <div key={index} className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{company.name}</span>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Environmental</span>
                    <span>{company.environmental}/100</span>
                  </div>
                  <Progress value={company.environmental} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Social</span>
                    <span>{company.social}/100</span>
                  </div>
                  <Progress value={company.social} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Governance</span>
                    <span>{company.governance}/100</span>
                  </div>
                  <Progress value={company.governance} className="h-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ESGScoreBreakdown;

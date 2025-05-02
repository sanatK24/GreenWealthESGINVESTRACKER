import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getQueryFn } from "@/lib/queryClient";

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
          <div>Loading...</div>
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
          <div>Error loading ESG data</div>
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
        <div className="space-y-4">
          {data && data.scores ? (
            <>
              <div>
                <h3>Environmental: {data.scores.environmental}</h3>
              </div>
              <div>
                <h3>Social: {data.scores.social}</h3>
              </div>
              <div>
                <h3>Governance: {data.scores.governance}</h3>
              </div>
            </>
          ) : (
            <div>No ESG data available</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ESGScoreBreakdown;

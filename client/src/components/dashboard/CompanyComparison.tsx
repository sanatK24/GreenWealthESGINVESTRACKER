import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type ComparisonType = "esg" | "environmental" | "social" | "governance";

const CompanyComparison = () => {
  const [comparisonType, setComparisonType] = useState<ComparisonType>("esg");
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/companies/comparison", comparisonType],
    staleTime: 60000,
    refetchOnWindowFocus: false
  });
  
  // Handle errors with useEffect to avoid render loops
  useEffect(() => {
    if (isLoading === false && (!data || (data as any)?.error)) {
      toast({
        title: "Error",
        description: "Failed to load company comparison data",
        variant: "destructive",
      });
    }
  }, [data, isLoading, toast]);

  const handleComparisonTypeChange = (value: string) => {
    setComparisonType(value as ComparisonType);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-sm rounded-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-[350px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!data?.categories || !data?.companies || data.companies.length === 0) {
      return (
        <div className="h-[350px] flex items-center justify-center">
          <p className="text-slate-500">No company comparison data available</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={data.categories}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          
          {data.companies.map((company: any, index: number) => (
            <Radar
              key={company.id}
              name={company.name}
              dataKey={`values.${index}`}
              stroke={`hsl(var(--chart-${(index % 5) + 1}))`}
              fill={`hsl(var(--chart-${(index % 5) + 1}))`}
              fillOpacity={0.2}
            />
          ))}
          
          <Legend />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="px-4 py-3 border-b border-slate-200 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">Company Comparison</CardTitle>
        <Select
          value={comparisonType}
          onValueChange={handleComparisonTypeChange}
        >
          <SelectTrigger className="w-[180px] h-8 text-sm bg-transparent border border-slate-200 rounded-md">
            <SelectValue placeholder="Comparison type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="esg">By ESG Score</SelectItem>
            <SelectItem value="environmental">By Environmental Score</SelectItem>
            <SelectItem value="social">By Social Score</SelectItem>
            <SelectItem value="governance">By Governance Score</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default CompanyComparison;

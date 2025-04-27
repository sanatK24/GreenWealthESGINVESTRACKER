import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, TooltipProps } from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { useToast } from "@/hooks/use-toast";

const ESGScoreBreakdown = () => {
  const [viewOption, setViewOption] = useState<"top5" | "all">("top5");
  const { toast } = useToast();
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/companies/esg-breakdown"],
    staleTime: 60000,
    refetchOnWindowFocus: false
  });
  
  // Handle errors with useEffect to avoid render loops
  useEffect(() => {
    if (isLoading === false && (!data || (data as any)?.error)) {
      toast({
        title: "Error",
        description: "Failed to load ESG score breakdown",
        variant: "destructive",
      });
    }
  }, [data, isLoading, toast]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-sm rounded-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}/100
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
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!data?.companies || data.companies.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-slate-500">No ESG score data available</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data.companies}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="environmental" stackId="a" fill="hsl(var(--chart-1))" name="Environmental" />
          <Bar dataKey="social" stackId="a" fill="hsl(var(--chart-2))" name="Social" />
          <Bar dataKey="governance" stackId="a" fill="hsl(var(--chart-3))" name="Governance" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader className="px-4 py-3 border-b border-slate-200 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">ESG Score Breakdown</CardTitle>
        <Select
          value={viewOption}
          onValueChange={(value) => setViewOption(value as "top5" | "all")}
        >
          <SelectTrigger className="w-[180px] h-8 text-sm bg-transparent border-none">
            <SelectValue placeholder="View option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="top5">Top 5 Holdings</SelectItem>
            <SelectItem value="all">All Holdings</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default ESGScoreBreakdown;

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend, PolarRadiusAxis, PolarAngleAxis, PolarGrid, RadarChart, Radar } from "recharts";
import { useToast } from "@/hooks/use-toast";

type ChartType = "pie" | "tree";

const PortfolioComposition = () => {
  const [chartType, setChartType] = useState<ChartType>("pie");
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/portfolio/composition"],
    queryFn: async () => {
      const response = await fetch("/api/portfolio/composition");
      if (!response.ok) {
        throw new Error("Failed to fetch portfolio composition");
      }
      return response.json();
    },
    staleTime: 60000,
    refetchOnWindowFocus: false
  });
  
  // Handle errors with useEffect to avoid render loops
  useEffect(() => {
    if (isLoading === false && (!data || (data as any)?.error)) {
      toast({
        title: "Error",
        description: "Failed to load portfolio composition data",
        variant: "destructive",
      });
    }
  }, [data, isLoading, toast]);

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-sm rounded-md">
          <p className="font-medium">{payload[0].name}</p>
          <p style={{ color: payload[0].color }}>{payload[0].value}%</p>
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

    if (!data?.sectors || data.sectors.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-slate-500">No portfolio composition data available</p>
        </div>
      );
    }

    if (chartType === "pie") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.sectors}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.sectors.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              wrapperStyle={{ paddingLeft: "20px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius={100} data={data.sectors}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Portfolio Composition"
            dataKey="value"
            stroke="hsl(var(--chart-1))"
            fill="hsl(var(--chart-1))"
            fillOpacity={0.6}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader className="px-4 py-3 border-b border-slate-200 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">Portfolio Composition</CardTitle>
        <div className="flex items-center space-x-2 text-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`px-2 py-1 text-slate-600 hover:text-primary ${chartType === 'tree' ? 'border-b-2 border-primary' : ''}`}
            onClick={() => handleChartTypeChange("tree")}
          >
            Tree Map
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`px-2 py-1 text-slate-600 hover:text-primary ${chartType === 'pie' ? 'border-b-2 border-primary' : ''}`}
            onClick={() => handleChartTypeChange("pie")}
          >
            Pie Chart
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default PortfolioComposition;

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend, PolarRadiusAxis, PolarAngleAxis, PolarGrid, RadarChart, Radar } from "recharts";
import { useToast } from "@/hooks/use-toast";

type ChartType = "pie" | "tree";

interface PortfolioItem {
  name: string;
  value: number;
  sector: string;
}

interface PortfolioResponse {
  portfolio: PortfolioItem[];
}

const mockPortfolioData: PortfolioItem[] = [
  { name: "Technology", value: 30, sector: "Technology" },
  { name: "Healthcare", value: 25, sector: "Healthcare" },
  { name: "Energy", value: 20, sector: "Energy" },
  { name: "Finance", value: 15, sector: "Finance" },
  { name: "Consumer Goods", value: 10, sector: "Consumer Goods" },
];

const PortfolioComposition = () => {
  const [chartType, setChartType] = useState<ChartType>("pie");
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<PortfolioResponse>({
    queryKey: ["/api/portfolio/composition"] as const,
    queryFn: async () => {
      try {
        const response = await fetch("/api/portfolio/composition");
        if (!response.ok) {
          throw new Error("Failed to fetch portfolio composition data");
        }
        const result = await response.json();
        console.log("Portfolio composition API response:", result);
        return result as PortfolioResponse;
      } catch (err) {
        console.error("Portfolio composition API error:", err);
        throw err;
      }
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
    onError: (error: any) => {
      console.error("Portfolio composition API error:", error);
      toast({
        title: "Error",
        description: "Failed to load portfolio composition data",
        variant: "destructive",
      });
    },
  });

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

  const renderChart = () => {
    const chartData = data?.portfolio || mockPortfolioData;
    console.log("Portfolio composition data:", chartData);
    
    if (chartType === "pie") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry: PortfolioItem, index: number) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart outerRadius={120} data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="sector" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Portfolio"
            dataKey="value"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader className="px-4 py-3 border-b border-slate-200 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">Portfolio Composition</CardTitle>
        <div className="flex gap-2">
          <Button
            variant={chartType === "pie" ? "default" : "outline"}
            onClick={() => handleChartTypeChange("pie")}
          >
            Pie Chart
          </Button>
          <Button
            variant={chartType === "tree" ? "default" : "outline"}
            onClick={() => handleChartTypeChange("tree")}
          >
            Tree Map
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-slate-500">Failed to load portfolio composition data</p>
          </div>
        ) : !data?.portfolio || data.portfolio.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-slate-500">No portfolio composition data available</p>
          </div>
        ) : (
          renderChart()
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioComposition;
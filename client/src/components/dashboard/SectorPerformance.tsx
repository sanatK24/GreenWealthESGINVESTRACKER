import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const mockSectorData = [
  { name: "Technology", score: 85 },
  { name: "Healthcare", score: 82 },
  { name: "Energy", score: 78 },
  { name: "Finance", score: 75 },
  { name: "Consumer Goods", score: 70 },
];

const SectorPerformance = () => {
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/sectors/performance"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/sectors/performance");
        if (!response.ok) {
          throw new Error("Failed to fetch sector performance data");
        }
        return response.json();
      } catch (err) {
        // Log error but return mock data for development
        console.error("Sector performance API error:", err);
        return { sectors: mockSectorData };
      }
    },
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load sector performance data",
      variant: "destructive",
    });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-sm rounded-md">
          <p className="font-medium">{label}</p>
          <p style={{ color: payload[0].color }}>ESG Score: {payload[0].value}/100</p>
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

    const sectorData = data?.sectors || mockSectorData;
    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ];

    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          layout="vertical"
          data={sectorData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="name" type="category" width={100} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="score" name="ESG Score">
            {sectorData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader className="px-4 py-3 border-b border-slate-200 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">Sector ESG Performance</CardTitle>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary">
                <InfoIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Average ESG scores across different sectors</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default SectorPerformance;

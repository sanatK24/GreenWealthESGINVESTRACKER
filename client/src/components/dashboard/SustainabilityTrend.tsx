import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface SustainabilityTrend {
  date: string;
  esgScore: number;
  environment: number;
  social: number;
  governance: number;
}

const mockSustainabilityData: SustainabilityTrend[] = [
  { date: "2023-01-01", esgScore: 75, environment: 80, social: 75, governance: 70 },
  { date: "2023-02-01", esgScore: 78, environment: 82, social: 78, governance: 72 },
  { date: "2023-03-01", esgScore: 82, environment: 85, social: 82, governance: 75 },
  { date: "2023-04-01", esgScore: 85, environment: 88, social: 85, governance: 78 },
  { date: "2023-05-01", esgScore: 88, environment: 90, social: 88, governance: 80 },
];

const SustainabilityTrend = () => {
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/portfolio/sustainability-trend"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/portfolio/sustainability-trend");
        if (!response.ok) {
          throw new Error("Failed to fetch sustainability trend data");
        }
        return response.json();
      } catch (err) {
        console.error("Sustainability trend API error:", err);
        return { trends: mockSustainabilityData };
      }
    },
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load sustainability trend data",
      variant: "destructive",
    });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-sm rounded-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
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
        <div className="h-[250px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    const chartData = data?.trends || mockSustainabilityData;

    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="esgScore"
            name="ESG Score"
            stroke="#22c55e"
          />
          <Line
            type="monotone"
            dataKey="environment"
            name="Environment"
            stroke="#3b82f6"
          />
          <Line
            type="monotone"
            dataKey="social"
            name="Social"
            stroke="#f59e0b"
          />
          <Line
            type="monotone"
            dataKey="governance"
            name="Governance"
            stroke="#db2777"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader className="px-4 py-3 border-b border-slate-200 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">Sustainability Trends</CardTitle>
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-slate-600">ESG Score</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
            <span className="text-slate-600">Environment</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-tertiary"></div>
            <span className="text-slate-600">Social</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-quaternary"></div>
            <span className="text-slate-600">Governance</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default SustainabilityTrend;

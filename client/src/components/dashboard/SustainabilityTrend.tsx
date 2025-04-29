import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

const SustainabilityTrend = () => {
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/portfolio/sustainability-trend"],
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

    if (!data?.trends || data.trends.length === 0) {
      return (
        <div className="h-[250px] flex items-center justify-center">
          <p className="text-slate-500">No sustainability trend data available</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={data.trends}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.05)" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="esgScore"
            name="Portfolio ESG Score"
            stroke="hsl(var(--chart-1))"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="greenInvestments"
            name="Green Investments"
            stroke="hsl(var(--chart-2))"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader className="px-4 py-3 border-b border-slate-200 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">Sustainability Trend Over Time</CardTitle>
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-slate-600">ESG Score</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
            <span className="text-slate-600">Green Investments</span>
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

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface AIInsightsProps {
  companyIds: number[];
  timeframe: string;
  className?: string;
}

export function AIInsights({ companyIds, timeframe, className }: AIInsightsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Fetch AI-generated insights
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['/api/ai/insights', companyIds.join(','), timeframe],
    queryFn: async () => {
      if (companyIds.length === 0) return { insights: '' };
      
      const res = await fetch(`/api/ai/insights?ids=${companyIds.join(',')}&timeframe=${timeframe}`);
      if (!res.ok) {
        throw new Error('Failed to fetch AI insights');
      }
      return res.json();
    },
    enabled: false, // Don't fetch on component mount
    staleTime: Infinity // Insights don't change unless explicitly refreshed
  });

  // Generate insights on demand
  const generateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      await refetch();
      setIsOpen(true); // Auto-expand when insights are generated
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Format insights with proper line breaks for headings and lists
  const formattedInsights = data?.insights ? 
    data.insights.split('\n').map((line: string, index: number) => {
      // Check if the line is a heading (starts with #)
      if (line.trim().startsWith('#')) {
        return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace(/^#+\s/, '')}</h3>;
      } 
      // Check if the line is a subheading (starts with ##)
      else if (line.trim().startsWith('##')) {
        return <h4 key={index} className="text-md font-medium mt-3 mb-1">{line.replace(/^#+\s/, '')}</h4>;
      }
      // Check if the line is a bullet point
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={index} className="flex items-start my-1">
            <div className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary"></div>
            <p className="text-sm">{line.replace(/^[-*]\s/, '')}</p>
          </div>
        );
      }
      // Regular paragraph
      else if (line.trim()) {
        return <p key={index} className="text-sm my-2">{line}</p>;
      }
      // Empty line
      return <div key={index} className="h-2"></div>;
    })
    : null;

  const hasInsights = data?.insights && data.insights.trim();

  return (
    <Card className={cn("w-full my-6", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Lightbulb className="h-5 w-5 text-amber-500 mr-2" />
            <CardTitle className="text-lg">AI Investment Insights</CardTitle>
          </div>
          
          {hasInsights && (
            <CollapsibleTrigger 
              asChild
              onClick={() => setIsOpen(!isOpen)}
            >
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          )}
        </div>
        <CardDescription>
          Gemini-powered analysis of selected stocks
        </CardDescription>
      </CardHeader>
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent className="text-sm">
            {isGeneratingInsights || isLoading || isRefetching ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[70%]" />
                <Skeleton className="h-4 w-[85%]" />
                <Skeleton className="h-4 w-[60%]" />
              </div>
            ) : error ? (
              <div className="text-center p-4 text-destructive">
                <p>Unable to generate insights. Please try again.</p>
              </div>
            ) : hasInsights ? (
              <div className="max-h-[500px] overflow-y-auto pr-2">
                {formattedInsights}
                <div className="text-xs text-muted-foreground mt-4 pt-2 border-t">
                  <p>Generated for timeframe: {timeframe} · Analysis provided by Google Gemini AI</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <p className="mb-2">Click 'Generate Insights' to get AI analysis for selected stocks</p>
                <Badge variant="outline" className="font-normal">
                  {companyIds.length} {companyIds.length === 1 ? 'company' : 'companies'} selected
                </Badge>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
      
      <CardFooter className="pt-1">
        <Button 
          onClick={generateInsights}
          disabled={isGeneratingInsights || isLoading || isRefetching || companyIds.length === 0}
          className="w-full"
          variant={hasInsights ? "outline" : "default"}
        >
          {(isGeneratingInsights || isLoading || isRefetching) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {hasInsights ? 'Regenerate Insights' : 'Generate Insights'}
        </Button>
      </CardFooter>
    </Card>
  );
}
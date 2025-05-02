import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getQueryFn } from "@/lib/queryClient";
import { Link } from "wouter";
import { ExternalLink, Calendar, Newspaper } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export function NewsCard() {
  const { data, isLoading, error } = useQuery<NewsApiResponse>({
    queryKey: ["/api/news"],
    queryFn: getQueryFn()
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 flex-shrink-0" />
            <Skeleton className="h-6 w-full max-w-[12rem]" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full max-w-[15rem]" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex flex-wrap justify-between items-center gap-2 pt-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 flex-shrink-0" />
            ESG News & Updates
          </CardTitle>
          <CardDescription>
            Latest news about sustainable investing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-muted-foreground">
            Unable to load news articles.
          </div>
        </CardContent>
      </Card>
    );
  }

  const articles: NewsArticle[] = data?.articles ?? [];

  if (articles.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 flex-shrink-0" />
            ESG News & Updates
          </CardTitle>
          <CardDescription>
            Latest news about sustainable investing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-muted-foreground">
            No news articles available at the moment.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 flex-shrink-0" />
          ESG News & Updates
        </CardTitle>
        <CardDescription>
          Latest news about sustainable investing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 divide-y">
        {articles.slice(0, 3).map((article, index) => (
          <div key={index} className={index > 0 ? "pt-4" : ""}>
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <h3 className="font-medium text-base group-hover:text-primary transition-colors mb-1 flex items-start">
                <span className="line-clamp-2">{article.title}</span>
                <ExternalLink className="h-3.5 w-3.5 ml-1 mt-1 opacity-70 flex-shrink-0" />
              </h3>
            </a>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {article.description}
            </p>
            <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                {formatDate(new Date(article.publishedAt))}
              </span>
              <span className="truncate max-w-[150px]">Source: {article.source.name}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
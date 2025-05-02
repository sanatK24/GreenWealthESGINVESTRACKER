import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function BuyStock() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: buyStockData, error, isLoading } = useQuery({
    queryKey: ['/api/buy-stock-data'],
    queryFn: async () => {
      const res = await fetch('/api/buy-stock-data');
      if (!res.ok) {
        throw new Error('Failed to fetch buy stock data');
      }
      return res.json();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to fetch buy stock data. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Format helpers
  const formatCurrency = (num: number) => {
    return '₹' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent>
            <div className="text-center">
              <p className="text-red-500">Error loading buy stock data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredData = buyStockData?.filter((stock: any) =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Buy Stocks</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Market Cap</TableHead>
                <TableHead>52 Week High</TableHead>
                <TableHead>52 Week Low</TableHead>
                <TableHead>Yearly Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData?.map((stock: any) => (
                <TableRow key={stock.id}>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell>{stock.ticker}</TableCell>
                  <TableCell>{formatCurrency(stock.currentPrice)}</TableCell>
                  <TableCell>{formatCurrency(stock.marketCap)}</TableCell>
                  <TableCell>{formatCurrency(stock.weekHigh52)}</TableCell>
                  <TableCell>{formatCurrency(stock.weekLow52)}</TableCell>
                  <TableCell className={stock.yearlyTrend > 0 ? 'text-green-600' : 'text-red-500'}>
                    {formatPercentage(stock.yearlyTrend)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
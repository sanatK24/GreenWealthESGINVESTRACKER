
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
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
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Search, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function BuyStock() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShares, setSelectedShares] = useState<number>(1);

  const { data: companies, error, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await fetch('/api/companies');
      if (!res.ok) {
        throw new Error('Failed to fetch companies data');
      }
      return res.json();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to fetch companies data. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Format helpers
  const formatCurrency = (value: string | null) => {
    if (!value) return '₹0.00';
    const num = parseFloat(value);
    return '₹' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num}%`;
  };

  const calculateTotalAmount = (price: string, shares: number) => {
    return formatCurrency((parseFloat(price) * shares).toString());
  };

  const handleBuy = (companyId: number) => {
    navigate(`/buy-stock/${companyId}`);
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

  const filteredData = companies?.companies?.filter((company: any) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.ticker.toLowerCase().includes(searchTerm.toLowerCase())
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
                <TableHead>Company Details</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Market Cap</TableHead>
                <TableHead>52 Week High/Low</TableHead>
                <TableHead>Investment Details</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData?.map((stock: any) => (
                <TableRow key={stock.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{stock.name}</p>
                      <p className="text-sm text-muted-foreground">{stock.ticker}</p>
                      <p className="text-xs text-muted-foreground">{stock.sector}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {formatCurrency(stock.currentPrice)}
                      <span className={stock.yearlyTrend > 0 ? 'text-green-600' : 'text-red-500'}>
                        {formatPercentage(stock.yearlyTrend)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(stock.marketCap)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-green-600">{formatCurrency(stock.yearHigh)}</p>
                      <p className="text-red-500">{formatCurrency(stock.yearLow)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={selectedShares}
                          onChange={(e) => setSelectedShares(parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                        <span>shares</span>
                      </div>
                      <p className="text-sm">
                        Total: {calculateTotalAmount(stock.currentPrice, selectedShares)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      onClick={() => handleBuy(stock.id)}
                      className="w-full"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
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

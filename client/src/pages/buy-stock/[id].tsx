import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowUp, ShoppingCart, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const BuyStockPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [shares, setShares] = useState('1');
  const [amount, setAmount] = useState('0');
  const [companyName, setCompanyName] = useState('');

  // Fetch company data
  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${id}`);
      if (!response.ok) throw new Error('Failed to fetch company');
      return response.json();
    },
    enabled: !!id, // Only run query when ID exists
  });

  // Fetch buy stock data
  const { data: buyStockData, isLoading: isLoadingBuyStock } = useQuery({
    queryKey: ['buyStockData', id],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${id}`);
      if (!response.ok) throw new Error('Failed to fetch buy stock data');
      return response.json();
    },
    enabled: !!id, // Only run query when ID exists
    retry: 2
  });

  useEffect(() => {
    if (buyStockData?.currentPrice) {
      const shareCount = parseInt(shares) || 0;
      const calculatedAmount = shareCount * parseFloat(buyStockData.currentPrice);
      setAmount(calculatedAmount.toFixed(2));
    }
  }, [shares, buyStockData?.currentPrice]);

  useEffect(() => {
    if (buyStockData?.name) {
      setCompanyName(buyStockData.name);
    }
  }, [buyStockData?.name]);

  const purchaseMutation = useMutation({
    mutationFn: async (data: { shares: number, amount: number }) => {
      const response = await fetch('/api/buy-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: parseInt(id as string),
          shares: parseInt(shares),
          amount: parseFloat(amount)
        })
      });
      if (!response.ok) throw new Error('Purchase failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Purchased ${shares} shares of ${companyName}`
      });
      navigate('/portfolio');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to purchase stock',
        variant: 'destructive'
      });
    }
  });

  const formatCurrency = (value: string) => {
    return '₹' + parseFloat(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (isLoadingBuyStock || isLoadingCompany) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!buyStockData) {
    return (
      <div className="p-4">
        <Card>
          <CardContent>
            <div className="text-center">
              <p className="text-red-500">Error loading buy stock data</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const minInvestment = parseFloat(buyStockData.minInvestment) || 1000;
  const maxInvestment = parseFloat(buyStockData.maxInvestment) || 1000000;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{companyName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Current Price: {formatCurrency(buyStockData.currentPrice)}
              </p>
            </div>
            <div className="flex gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Market Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Market Cap</span>
                    <span>{formatCurrency(buyStockData.marketCap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>52 Week High</span>
                    <span>{formatCurrency(buyStockData.weekHigh52)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>52 Week Low</span>
                    <span>{formatCurrency(buyStockData.weekLow52)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Purchase Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">Number of Shares</label>
                    <Input
                      type="number"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                      className="w-full"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Investment Amount</label>
                    <div className="px-2">
                      <Slider
                        min={minInvestment}
                        max={maxInvestment}
                        step={1000}
                        value={[parseFloat(amount)]}
                        onValueChange={(value) => {
                          const shareCount = Math.floor(value[0] / parseFloat(buyStockData.currentPrice));
                          setShares(shareCount.toString());
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Min: {formatCurrency(minInvestment.toString())}</span>
                      <span>Max: {formatCurrency(maxInvestment.toString())}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Total Amount</label>
                    <Input
                      type="text"
                      value={formatCurrency(amount)}
                      readOnly
                      className="w-full bg-muted"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={() => purchaseMutation.mutate({
              shares: parseInt(shares),
              amount: parseFloat(amount)
            })}
            disabled={purchaseMutation.isPending || parseFloat(amount) === 0}
          >
            {purchaseMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <ArrowUp className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Confirm Purchase</span>
              </div>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BuyStockPage;
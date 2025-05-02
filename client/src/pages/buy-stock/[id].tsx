import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowUp, ShoppingCart, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";

// Interfaces for API responses
interface CompanyResponse {
  id: number;
  name: string;
  ticker: string;
  current_price: string;
  market_cap: string;
  week_high_52: string;
  week_low_52: string;
  yearly_trend: string;
  min_investment: string;
  max_investment: string;
  created_at: string;
  updated_at: string;
}

interface StockPriceResponse {
  id: number;
  company_id: number;
  current_price: string;
  market_cap: string;
  week_high_52: string;
  week_low_52: string;
  yearly_trend: string;
  min_investment: string;
  max_investment: string;
  created_at: string;
  updated_at: string;
}

interface PurchaseResponse {
  success: boolean;
  message?: string;
}

const BuyStockPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [shares, setShares] = useState('1');
  const [amount, setAmount] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse ID safely
  const companyId = parseInt(id as string);
  if (isNaN(companyId)) {
    setError('Invalid company ID');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">
          <AlertCircle className="h-6 w-6 mr-2" />
          Invalid company ID
        </div>
      </div>
    );
  }

  // Fetch company data using API
  const { data: company, isLoading: isCompanyLoading, error: companyError } = useQuery<CompanyResponse>({
    queryKey: ['/api/companies', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${companyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch company data');
      }
      return response.json();
    },
    enabled: !!companyId,
    retry: 2,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch stock price data using API
  const { data: stockData, isLoading: isStockLoading, error: stockError } = useQuery<StockPriceResponse>({
    queryKey: ['/api/buy-stock-data', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/buy-stock-data/${companyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }
      return response.json();
    },
    enabled: !!companyId,
    retry: 2,
    staleTime: 1 * 60 * 1000 // 1 minute
  });

  // Purchase mutation
  const purchaseMutation = useMutation<PurchaseResponse, Error, { shares: number, amount: number }>({
    mutationFn: async (data) => {
      const response = await fetch(`/api/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: companyId,
          shares: data.shares,
          amount: data.amount,
          date: format(new Date(), 'yyyy-MM-dd')
        })
      });
      if (!response.ok) {
        throw new Error('Purchase failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Success',
          description: `Successfully invested ₹${amount} in ${company?.name}`
        });
        navigate('/portfolio');
      } else {
        throw new Error(data.message || 'Purchase failed');
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Format currency
  const formatCurrency = useCallback((value: string) => {
    return '₹' + parseFloat(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, []);

  // Handle shares input
  const handleSharesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value || value === '') {
      setShares('0');
      setAmount('0');
      return;
    }
    const num = parseInt(value);
    if (num >= 0) {
      setShares(value);
      if (stockData?.current_price) {
        const calculatedAmount = num * parseFloat(stockData.current_price);
        setAmount(calculatedAmount.toFixed(2));
      }
    }
  }, [stockData?.current_price]);

  // Loading state
  useEffect(() => {
    setLoading(isCompanyLoading || isStockLoading);
    if (companyError || stockError) {
      setError('Failed to load stock data');
    }
  }, [isCompanyLoading, isStockLoading, companyError, stockError]);

  // Error handling
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">
          <AlertCircle className="h-6 w-6 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin">
          <ArrowUp className="h-6 w-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{company?.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Current Price: {formatCurrency(stockData?.current_price || '0')}
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
                    <span>{formatCurrency(stockData?.market_cap || '0')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>52 Week High</span>
                    <span>{formatCurrency(stockData?.week_high_52 || '0')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>52 Week Low</span>
                    <span>{formatCurrency(stockData?.week_low_52 || '0')}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Yearly Trend</span>
                    <span>{stockData?.yearly_trend}%</span>
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
                      onChange={handleSharesChange}
                      className="w-full"
                      min="0"
                      placeholder="Enter number of shares"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Investment Amount</label>
                    <div className="px-2">
                      <Slider
                        min={parseFloat(stockData?.min_investment || '1000')}
                        max={parseFloat(stockData?.max_investment || '1000000')}
                        step={1000}
                        value={[parseFloat(amount) || 0]}
                        onValueChange={(value) => {
                          const shareCount = Math.floor(value[0] / parseFloat(stockData?.current_price || '0'));
                          setShares(shareCount.toString());
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Min: {formatCurrency(stockData?.min_investment || '1000')}</span>
                      <span>Max: {formatCurrency(stockData?.max_investment || '1000000')}</span>
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
            onClick={() => purchaseMutation.mutate({ shares: parseInt(shares), amount: parseFloat(amount) })}
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
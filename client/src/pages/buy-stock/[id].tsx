import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { ArrowUp, ShoppingCart, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Companies } from '@/data/companies';
import { BuyStockData } from '@/data/buy_stock_data';

// Interfaces for data types
interface Company {
  id: number;
  name: string;
  ticker: string;
  sector: string;
  esg_score: number;
  environmental_score: number;
  social_score: number;
  governance_score: number;
  yearly_trend: number;
  created_at: string;
  updated_at: string;
  industry: string;
  sustainability_rating: string;
  esg_risk_level: string;
  current_price: string;
  market_cap: string;
}

interface BuyStockData {
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

  // Find company and stock data
  const company = Companies.find(c => c.id === companyId) as Company | undefined;
  const buyStockData = BuyStockData.find(s => s.company_id === companyId) as BuyStockData | undefined;

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (data: { shares: number, amount: number }) => {
      // TODO: Implement actual purchase logic
      // For now, just return success
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Successfully invested ₹${amount} in ${company?.name}`
      });
      navigate('/portfolio');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Purchase failed',
        variant: 'destructive'
      });
    }
  });

  // Format currency
  const formatCurrency = (value: string) => {
    return '₹' + parseFloat(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Handle shares input
  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value || value === '') {
      setShares('0');
      setAmount('0');
      return;
    }
    const num = parseInt(value);
    if (num >= 0) {
      setShares(value);
      if (buyStockData?.current_price) {
        const calculatedAmount = num * parseFloat(buyStockData.current_price);
        setAmount(calculatedAmount.toFixed(2));
      }
    }
  };

  // Loading state
  useEffect(() => {
    setLoading(!company || !buyStockData);
    if (!company) {
      setError('Company not found');
    }
  }, [company, buyStockData]);

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
                Current Price: {formatCurrency(buyStockData?.current_price || '0')}
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
                    <span>{formatCurrency(buyStockData?.market_cap || '0')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>52 Week High</span>
                    <span>{formatCurrency(buyStockData?.week_high_52 || '0')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>52 Week Low</span>
                    <span>{formatCurrency(buyStockData?.week_low_52 || '0')}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>ESG Score</span>
                    <span>{company?.esg_score || '0'}</span>
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
                        min={1000}
                        max={1000000}
                        step={1000}
                        value={[parseFloat(amount) || 0]}
                        onValueChange={(value) => {
                          const shareCount = Math.floor(value[0] / parseFloat(buyStockData?.current_price || '0'));
                          setShares(shareCount.toString());
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Min: ₹1,000</span>
                      <span>Max: ₹1,000,000</span>
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
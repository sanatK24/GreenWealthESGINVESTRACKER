
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

  const { data: companyData, isLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const companiesResponse = await fetch('/db-export/companies.json');
      const companies = await companiesResponse.json();
      const company = companies.find((c: any) => c.id === parseInt(id as string));

      const buyStockResponse = await fetch('/db-export/buy_stock_data.json');
      const buyStockData = await buyStockResponse.json();
      const stockData = buyStockData.find((b: any) => b.company_id === parseInt(id as string));

      if (!company || !stockData) {
        throw new Error('Company not found');
      }

      return {
        ...company,
        buyStockData: stockData
      };
    }
  });

  useEffect(() => {
    if (companyData?.buyStockData?.current_price) {
      const shareCount = parseInt(shares) || 0;
      const calculatedAmount = shareCount * parseFloat(companyData.buyStockData.current_price);
      setAmount(calculatedAmount.toFixed(2));
    }
  }, [shares, companyData]);

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      // Simulate purchase success
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Purchased ${shares} shares of ${companyData?.name}`
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

  if (isLoading || !companyData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const minInvestment = parseFloat(companyData.buyStockData?.min_investment) || 1000;
  const maxInvestment = parseFloat(companyData.buyStockData?.max_investment) || 1000000;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{companyData.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Current Price: {formatCurrency(companyData.buyStockData.current_price)}
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
                    <span>{formatCurrency(companyData.buyStockData.market_cap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>52 Week High</span>
                    <span>{formatCurrency(companyData.buyStockData.week_high_52)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>52 Week Low</span>
                    <span>{formatCurrency(companyData.buyStockData.week_low_52)}</span>
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
                          if (companyData?.buyStockData?.current_price) {
                            const shareCount = Math.floor(value[0] / parseFloat(companyData.buyStockData.current_price));
                            setShares(shareCount.toString());
                          }
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
            onClick={() => purchaseMutation.mutate()}
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

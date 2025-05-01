import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowUp, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

const BuyStockPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [shares, setShares] = useState('1');
  const [amount, setAmount] = useState('0');

  // Fetch company details
  const { data: company, error: companyError, isLoading: companyLoading } = useQuery({
    queryKey: ["/api/company", id],
    queryFn: async () => {
      const response = await fetch(`/api/company/${id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    }
  });

  // Fetch current stock price
  const { data: stockPrice, error: priceError, isLoading: priceLoading } = useQuery({
    queryKey: ["/api/stock-price", id],
    queryFn: async () => {
      const response = await fetch(`/api/stock-price/${id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    }
  });

  useEffect(() => {
    if (stockPrice?.currentPrice) {
      const shareCount = parseInt(shares) || 0;
      const calculatedAmount = shareCount * parseFloat(stockPrice.currentPrice);
      setAmount(calculatedAmount.toFixed(2));
    }
  }, [shares, stockPrice?.currentPrice]);

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
        description: `Purchased ${shares} shares of ${company?.name}`
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

  if (companyLoading || priceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (companyError || priceError) {
    return (
      <div className="p-4">
        <Card>
          <CardContent>
            <div className="text-center">
              <p className="text-red-500">Error loading company data</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
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
                Current Price: ₹{stockPrice?.currentPrice}
              </p>
            </div>
            <div className="flex gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <ArrowUp className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Number of Shares</label>
              <Input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="w-full"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Amount</label>
              <Input
                type="text"
                value={amount}
                readOnly
                className="w-full bg-muted"
              />
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
                <ArrowUp className="h-4 w-4 animate-spin text-green-500" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Buy Now</span>
              </div>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BuyStockPage;
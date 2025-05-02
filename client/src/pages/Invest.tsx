import { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { PayPalButton } from '@/components/payment/PayPalButton';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Info, TrendingUp, Loader2 } from 'lucide-react';
import { getQueryFn } from '@/lib/queryClient';

export default function Invest() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [investmentAmount, setInvestmentAmount] = useState('100');
  
  // Check auth status
  const { 
    data: user, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // Handle investment amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimals
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setInvestmentAmount(value);
  };

  // Handle payment success
  const handleSuccess = (details: any) => {
    toast({
      title: 'Investment Successful!',
      description: `Thank you for investing ₹${investmentAmount} in sustainable companies.`,
    });
    // In a real app, we'd update the user's portfolio here
    setTimeout(() => {
      navigate('/portfolio');
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Invest in Sustainable Companies</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Investment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Make an Investment</CardTitle>
            <CardDescription>
              Support companies that prioritize environmental, social, and governance factors.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="investment-amount">Investment Amount (INR)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground font-bold">₹</span>
                  <Input
                    id="investment-amount"
                    type="text"
                    value={investmentAmount}
                    onChange={handleAmountChange}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <PayPalButton 
              amount={investmentAmount}
              description="Investment in ESG Portfolio"
              onSuccess={handleSuccess}
            />
          </CardFooter>
        </Card>

        {/* ESG Investment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Benefits of ESG Investment</CardTitle>
            <CardDescription>
              Why investing in sustainable companies matters.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Competitive Returns</h3>
                <p className="text-sm text-muted-foreground">
                  ESG investments can provide competitive returns while supporting positive change.
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Risk Management</h3>
                <p className="text-sm text-muted-foreground">
                  Companies with strong ESG practices often have better risk management.
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="bg-muted p-4 rounded-lg mt-4">
              <h3 className="font-medium mb-2">Portfolio Impact</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Carbon Reduction</span>
                  <span className="font-medium text-green-600">12.5 tons/year</span>
                </li>
                <li className="flex justify-between">
                  <span>Renewable Energy Support</span>
                  <span className="font-medium text-green-600">35%</span>
                </li>
                <li className="flex justify-between">
                  <span>Governance Score</span>
                  <span className="font-medium text-blue-600">A+</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
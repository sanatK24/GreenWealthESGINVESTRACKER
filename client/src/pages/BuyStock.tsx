import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';
import { PayPalButton } from '@/components/payment/PayPalButton';
import { PaymentCertificate } from '@/components/payment/PaymentCertificate';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, Leaf, LineChart, Info, ArrowLeft, Loader2, CircleDollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePayment } from '@/context/PaymentContext';

export default function BuyStock() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute('/buy-stock/:id');
  const { toast } = useToast();
  const [shares, setShares] = useState('10');
  const [amount, setAmount] = useState('0');
  const [showCertificate, setShowCertificate] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const { setPaymentData } = usePayment();
  const [paymentMethod, setPaymentMethod] = useState('paypal');

  const { data: company, error: companyError, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['/api/companies', params?.id],
    queryFn: async () => {
      console.log('🔄 Fetching company data...', { companyId: params?.id });
      const startTime = performance.now();
      const res = await fetch(`/api/companies/${params?.id}`);
      const endTime = performance.now();
      
      if (!res.ok) {
        console.error('❌ Failed to fetch company data', { status: res.status });
        throw new Error('Failed to fetch company data');
      }
      
      const data = await res.json();
      console.log('📦 Company data:', data);
      
      // Ensure all required fields are present
      return {
        ...data,
        name: data.name || 'N/A',
        description: data.description || 'No description available',
        esgScore: data.esgScore || 0,
        environmentalScore: data.environmentalScore || 0,
        socialScore: data.socialScore || 0,
        governanceScore: data.governanceScore || 0,
        currentPrice: data.currentPrice || 'N/A',
        marketCap: data.marketCap || 'N/A',
        yearHigh: data.yearHigh || 'N/A',
        yearlyTrend: data.yearlyTrend || 0
      };
    },
    enabled: !!params?.id,
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('❌ Company query error:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch company data. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const { data: user, isLoading: isLoadingUser, error: userError } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      console.log('🔄 Fetching user data...');
      const startTime = performance.now();
      const res = await fetch('/api/user');
      const endTime = performance.now();
      console.log(`✅ User data fetched in ${(endTime - startTime).toFixed(2)}ms`, { 
        status: res.status,
        ok: res.ok 
      });
      if (!res.ok) {
        console.error('❌ Failed to fetch user data', { status: res.status });
        throw new Error('Failed to fetch user data');
      }
      const data = await res.json();
      console.log('👤 User data:', data);
      return data;
    },
    retry: 1,
    onError: (error) => {
      console.error('❌ User query error:', error);
    }
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (data: { companyId: number, shares: number, amount: number }) => {
      const response = await apiRequest('POST', '/api/portfolio/purchase', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Stock purchased!',
        description: `You've successfully purchased ${shares} shares of ${company?.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio/composition'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio/summary'] });

      if (!showCertificate) {
        setTimeout(() => {
          navigate('/portfolio');
        }, 2000);
      }
    },
    onError: () => {
      toast({
        title: 'Purchase failed',
        description: 'There was an error purchasing the stock',
        variant: 'destructive'
      });

      if (showCertificate) {
        setShowCertificate(false);
      }
    }
  });

  const [minInvestment] = useState(1000);
  const [maxInvestment] = useState(1000000);
  const [formData, setFormData] = useState({
    investor_name: user?.username || '',
    investor_email: user?.email || '',
    amount: 0,
    payment_method: 'upi'
  });

  // Format helpers
  const formatNumber = (num: number | string) => {
    if (!num) return 'N/A';
    return num.toLocaleString('en-IN');
  };

  const formatCurrency = (num: number | string) => {
    if (!num) return 'N/A';
    return '₹' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  useEffect(() => {
    if (company?.currentPrice) {
      const shareCount = parseInt(shares) || 0;
      const calculatedAmount = shareCount * parseFloat(company.currentPrice);
      if (calculatedAmount >= minInvestment && calculatedAmount <= maxInvestment) {
        setFormData(prev => ({ ...prev, amount: calculatedAmount }));
      }
    }
  }, [shares, company?.currentPrice, minInvestment, maxInvestment]);

  const formatPercentage = (num: number | string) => {
    if (!num) return 'N/A';
    const value = parseFloat(num.toString());
    return `${value > 0 ? '+' : ''}${value}%`;
  };

  const getScoreColor = (score: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  useEffect(() => {
    if (company?.currentPrice) {
      const shareCount = parseInt(shares) || 0;
      const calculatedAmount = shareCount * parseFloat(company.currentPrice);
      setAmount(calculatedAmount.toFixed(2));
    } else {
      setAmount('0');
    }
  }, [shares, company?.currentPrice]);

  const handlePaymentSuccess = (details: any) => {
    if (company && company.id) {
      const paymentInfo = {
        companyName: company.name,
        shares: parseInt(shares),
        amount: parseFloat(amount),
        date: new Date(),
        esgScore: company.esgScore || 0,
        paymentId: details.id || details.orderID || 'PAYMENT-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        investor_name: user?.username,
        investor_email: user?.email,
        payment_method: paymentMethod,
        roi: company.yearlyTrend,
        risk_level: company.esgRiskLevel || 'Medium',
      };

      setPaymentData(paymentInfo);
      setPaymentDetails(paymentInfo);
      setShowCertificate(true);

      purchaseMutation.mutate({
        companyId: company.id,
        shares: parseInt(shares),
        amount: parseFloat(amount)
      });
    }
  };

  // Show payment processing screen
  if (showProcessing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Payment Processing</CardTitle>
            <CardDescription>Complete your investment in {company?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="netbanking">Net Banking</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Investment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Company:</span>
                    <span className="font-medium">{company?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shares:</span>
                    <span className="font-medium">{shares}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ESG Score:</span>
                    <span className="font-medium">{company?.esgScore}/100</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <PayPalButton 
              amount={amount}
              description={`Purchase of ${shares} shares of ${company?.name}`}
              onSuccess={handlePaymentSuccess}
              disabled={!company?.currentPrice || parseFloat(amount) <= 0}
            />
            <Button variant="outline" onClick={() => setShowProcessing(false)}>
              Back to Purchase Details
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show certificate after successful payment
  if (showCertificate && paymentDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <Button 
            variant="ghost" 
            className="flex items-center gap-1"
            onClick={() => navigate('/portfolio')}
          >
            <ArrowLeft className="h-4 w-4" />
            View Your Portfolio
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setShowCertificate(false)}
          >
            Back to Purchase Details
          </Button>
        </div>

        <div className="max-w-3xl mx-auto">
          <PaymentCertificate transactionDetails={paymentDetails} />
        </div>
      </div>
    );
  }

  // Rest of your existing BuyStock component code remains the same
  // Error handling, loading states, and main purchase form
  if (companyError || userError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Error loading data
          </h2>
          <p className="text-muted-foreground">
            Please try refreshing the page or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingCompany || isLoadingUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center h-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user && !isLoadingUser) {
    setTimeout(() => {
      navigate('/auth');
    }, 0);
    return <div className="flex items-center justify-center min-h-screen">Redirecting to login...</div>;
  }

  if (!company && !isLoadingCompany && !!params?.id) {
    setTimeout(() => {
      navigate('/companies');
    }, 0);
    return <div className="flex items-center justify-center min-h-screen">Company not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center gap-1"
        onClick={() => navigate('/companies')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Companies
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Company Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{company?.name}</CardTitle>
                  <CardDescription>{company?.ticker} • {company?.sector}</CardDescription>
                </div>
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Company Description</h3>
                  <p className="text-muted-foreground">
                    {company?.description || "No description available"}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">ESG Performance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">ESG Score</div>
                      <div className={`text-xl font-bold ${getScoreColor(company?.esgScore || 0)}`}>
                        {company?.esgScore}/100
                      </div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Environmental</div>
                      <div className={`text-xl font-bold ${getScoreColor(company?.environmentalScore || 0)}`}>
                        {company?.environmentalScore}/100
                      </div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Social</div>
                      <div className={`text-xl font-bold ${getScoreColor(company?.socialScore || 0)}`}>
                        {company?.socialScore}/100
                      </div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Governance</div>
                      <div className={`text-xl font-bold ${getScoreColor(company?.governanceScore || 0)}`}>
                        {company?.governanceScore}/100
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Financial Overview</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stock Price</TableHead>
                        <TableHead>Market Cap</TableHead>
                        <TableHead>52-week High</TableHead>
                        <TableHead>Yearly Trend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          {formatCurrency(company?.currentPrice)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(company?.marketCap)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(company?.yearHigh)}
                        </TableCell>
                        <TableCell className={
                          company?.yearlyTrend && parseFloat(company.yearlyTrend) > 0 
                            ? 'text-green-600' 
                            : 'text-red-500'
                        }>
                          {formatPercentage(company?.yearlyTrend)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Buy {company?.name || 'Stock'}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-500" />
                ESG Score: {company?.esgScore || 0}/100 - Invest in sustainable growth
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shares" className="text-base">Number of Shares</Label>
                  <div className="mt-1.5">
                    <Input
                      id="shares"
                      type="text"
                      value={shares}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setShares(value);
                      }}
                      className="text-lg"
                      placeholder="Enter number of shares"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Current Share Price</div>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(company?.currentPrice)}
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Market Cap</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(company?.marketCap)}
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-medium mb-1">Purchase Summary</h3>
                      <p className="text-sm text-muted-foreground">Review your investment details</p>
                    </div>
                    <CircleDollarSign className="h-6 w-6 text-primary" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Share Price</span>
                      <span className="font-medium">{formatCurrency(company?.currentPrice)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Number of Shares</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={shares}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = parseInt(value);
                            if (!isNaN(numValue) && company?.currentPrice) {
                              const total = numValue * parseFloat(company.currentPrice);
                              if (total >= minInvestment && total <= maxInvestment) {
                                setShares(value);
                              }
                            }
                          }}
                          className="w-24 text-right"
                        />
                      </div>
                    </div>

                    <Slider
                      min={minInvestment / (company?.currentPrice || 1)}
                      max={maxInvestment / (company?.currentPrice || 1)}
                      value={[parseInt(shares) || 0]}
                      onValueChange={(value) => setShares(value[0].toString())}
                      className="my-6"
                    />

                    <div className="text-center text-sm text-muted-foreground">
                      Min Investment: {formatCurrency(minInvestment)}<br />
                      Max Investment: {formatCurrency(maxInvestment)}
                    </div>

                    <Separator className="my-3" />

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(company?.currentPrice ? (parseFloat(company.currentPrice) * parseInt(shares)).toFixed(2) : 'N/A')}
                      </span>
                    </div>

                    <div className="mt-4">
                      <Label>Payment Method</Label>
                      <Select value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="card">Credit/Debit Card</SelectItem>
                          <SelectItem value="netbanking">Net Banking</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button 
                className="w-full"
                onClick={() => setShowProcessing(true)}
                disabled={!company?.currentPrice || parseFloat(amount) <= 0}
              >
                Proceed to Payment
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Secure payment powered by PayPal
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
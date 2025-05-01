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
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, Leaf, LineChart, Info, ArrowLeft, Loader2, CircleDollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function BuyStock() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute('/buy-stock/:id');
  const { toast } = useToast();
  const [shares, setShares] = useState('10');
  const [amount, setAmount] = useState('0');
  const [showCertificate, setShowCertificate] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  // Get company data
  const { 
    data: company, 
    error: companyError,
    isLoading: isLoadingCompany
  } = useQuery({
    queryKey: ['/api/companies', params?.id],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!params?.id,
    retry: 2,
    refetchOnWindowFocus: false
  });

  // Get current user
  const { 
    data: user, 
    isLoading: isLoadingUser,
    error: userError
  } = useQuery({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    retry: 2,
    refetchOnWindowFocus: false
    isLoading: isLoadingUser 
  } = useQuery({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // Purchase stock mutation
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

      // Only redirect if we're not showing the certificate
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

      // If purchase fails but we were showing a certificate, hide it
      if (showCertificate) {
        setShowCertificate(false);
      }
    }
  });

  // Calculate amount whenever shares change
  useEffect(() => {
    if (company?.currentPrice) {
      const shareCount = parseInt(shares) || 0;
      const calculatedAmount = shareCount * parseFloat(company.currentPrice);
      setAmount(calculatedAmount.toFixed(2));
    } else {
      setAmount('0');
    }
  }, [shares, company?.currentPrice]);

  // Format numbers
  const formatNumber = (num: number | string) => {
    if (!num) return 'N/A';
    return num.toLocaleString('en-IN');
  };

  // Format currency
  const formatCurrency = (num: number | string) => {
    if (!num) return 'N/A';
    return '₹' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Format percentage
  const formatPercentage = (num: number | string) => {
    if (!num) return 'N/A';
    const value = parseFloat(num.toString());
    return `${value > 0 ? '+' : ''}${value}%`;
  };

  // Handle errors
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
    }
  }, [shares, company]);

  // Handle number of shares change
  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow positive numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setShares(value);
  };

  // Handle PayPal payment success
  const handlePaymentSuccess = (details: any) => {
    if (company && company.id) {
      // Save payment details for certificate
      setPaymentDetails({
        companyName: company.name,
        shares: parseInt(shares),
        amount: parseFloat(amount),
        date: new Date(),
        esgScore: company.esgScore || 0,
        paymentId: details.id || details.orderID || 'PAYMENT-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      });

      // Show certificate
      setShowCertificate(true);

      // Update portfolio in the background
      purchaseMutation.mutate({
        companyId: company.id,
        shares: parseInt(shares),
        amount: parseFloat(amount)
      });
    }
  };

  // Show loading while fetching data
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user && !isLoadingUser) {
    setTimeout(() => {
      navigate('/auth');
    }, 0);
    return <div className="flex items-center justify-center min-h-screen">Redirecting to login...</div>;
  }

  // Redirect to companies if no company found
  if (!company && !isLoadingCompany && !!params?.id) {
    setTimeout(() => {
      navigate('/companies');
    }, 0);
    return <div className="flex items-center justify-center min-h-screen">Company not found</div>;
    return <div className="flex items-center justify-center min-h-screen">Redirecting to companies list...</div>;
  }

  // Calculate ESG score style
  const getScoreColor = (score: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Format ESG score
  const formatESGScore = (score: number | undefined) => {
    if (!score) return 'N/A';
    return `${score}/100`;
  };

  // If we have payment details, show the certificate
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

  // Otherwise show the purchase form
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
                  <CardTitle className="text-2xl">{company?.name || 'Loading...'}</CardTitle>
                  <CardDescription>
                    {company?.ticker} • {company?.sector || 'N/A'}
                  </CardDescription>
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
                    {company?.description || "Loading company description..."}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">ESG Performance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">ESG Score</div>

                      <div className={`text-xl font-bold ${getScoreColor(company?.esgScore)}`}>
                        {formatESGScore(company?.esgScore)}

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
                      <div className={`text-xl font-bold ${getScoreColor(company?.socialScore)}`}>
                        {formatESGScore(company?.socialScore)}
                      <div className={`text-xl font-bold ${getScoreColor(company?.socialScore || 0)}`}>
                        {company?.socialScore}/100
                      </div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Governance</div>
                      <div className={`text-xl font-bold ${getScoreColor(company?.governanceScore)}`}>
                        {formatESGScore(company?.governanceScore)}
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
                          ₹{company?.currentPrice || '8,500.00'}
                        </TableCell>
                        <TableCell>
                          ₹{company?.marketCap || '1,125B'}
                        </TableCell>
                        <TableCell>
                          ₹{company?.yearHigh || '9,710.50'}
                        </TableCell>
                        <TableCell className={company?.yearlyTrend > 0 ? 'text-green-600' : 'text-red-500'}>
                          {company?.yearlyTrend > 0 ? '+' : ''}{company?.yearlyTrend}%
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
                {company?.esgScore ? (
                  <>
                    ESG Score: {formatESGScore(company.esgScore)} - Invest in sustainable growth
                  </>
                ) : (
                  'Loading ESG Score...'
                )}
                Buy {company?.name} Stock
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

                      type="number"
                      min="1"
                      value={shares}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setShares(value);
                      }}

                      type="text"
                      value={shares}
                      onChange={handleSharesChange}

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

                    <div className="text-2xl font-bold text-primary">₹{company?.currentPrice || '8,500.00'}</div>

                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Market Cap</div>

                    <div className="text-2xl font-bold">
                      {formatCurrency(company?.marketCap)}
                    </div>

                    <div className="text-2xl font-bold">₹{company?.marketCap || '1.2T'}</div>

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

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Share Price</span>

                      <span className="font-medium">
                        {formatCurrency(company?.currentPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Number of Shares</span>
                      <span className="font-medium">
                        {formatNumber(shares)}
                      </span>

                      <span className="font-medium">₹{company?.currentPrice?.toLocaleString() || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Number of Shares</span>
                      <span className="font-medium">{parseInt(shares).toLocaleString()}</span>

                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Amount</span>

                      <span className="text-primary">
                        {amount && parseFloat(amount) > 0 
                          ? formatCurrency(amount) 
                          : '₹0.00'}
                      </span>

                      <span className="text-primary">₹{(company?.currentPrice ? (parseInt(shares) * parseFloat(company.currentPrice)).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }) : '0.00')}</span>

                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <PayPalButton 
                amount={amount}

                description={`Purchase of ${shares} shares of ${company?.name || 'Stock'}`}
                onSuccess={(details: any) => {
                  if (company && company.id) {
                    // Save payment details for certificate
                    setPaymentDetails({
                      companyName: company.name,
                      shares: parseInt(shares),
                      amount: parseFloat(amount),
                      date: new Date(),
                      esgScore: company.esgScore || 0,
                      paymentId: details.id || details.orderID || 'PAYMENT-' + Math.random().toString(36).substring(2, 10).toUpperCase()
                    });

                    // Show certificate
                    setShowCertificate(true);

                    // Update portfolio in the background
                    purchaseMutation.mutate({
                      companyId: company.id,
                      shares: parseInt(shares),
                      amount: parseFloat(amount)
                    });
                  }
                }}
                disabled={!company?.currentPrice || parseFloat(amount) <= 0}

                description={`Purchase of ${shares} shares of ${company?.name}`}
                onSuccess={handlePaymentSuccess}
  
              />
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
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LineChart, ArrowLeft, IndianRupee, TrendingUp, Shield, Globe, Clock, ChartBar, BookOpen, Save } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeContext } from '@/context/ThemeContext';
import { Navbar } from '@/components/Navbar';
import { usePayment } from '@/context/PaymentContext';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { apiRequest } from '@/lib/api';
import { Company } from '@/shared/schema';

// Constants
const timeFrames = [
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
  { label: '5Y', value: '5Y' },
  { label: 'MAX', value: 'MAX' }
];

export default function InvestmentDetails() {
  const navigate = useNavigate();
  const { companyName } = useParams();
  const { paymentData, setPaymentData, savePayment } = usePayment();
  const { isDarkMode } = useContext(ThemeContext);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('1M');
  const [shares, setShares] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [investment, setInvestment] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvestment = async () => {
      try {
        const response = await apiRequest(`/api/companies?name=${encodeURIComponent(companyName || '')}`);
        if (!response.ok) {
          throw new Error('Failed to fetch investment data');
        }
        const data = await response.json();
        setInvestment(data[0] || null);
        setError(null);
      } catch (err) {
        console.error('Error fetching investment:', err);
        setError('Failed to load investment data');
      }
    };

    fetchInvestment();
  }, [companyName]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (!investment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
        </div>
      </div>
    );
  }

  const handleInvest = async () => {
    try {
      setIsLoading(true);
      const amount = parseFloat(investment.currentPrice) * parseFloat(shares);
      const payment = {
        amount,
        currency: 'USD',
        payment_method: 'card',
        status: 'pending',
        created_at: new Date().toISOString()
      };

      await savePayment(payment);
      toast.success('Payment initiated successfully');
      navigate(`/investments/${encodeURIComponent(companyName)}/payment/${paymentData.id}`);
    } catch (error) {
      toast.error('Failed to initiate payment');
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{investment.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <IndianRupee className="h-4 w-4" />
                <span className="font-bold">${investment.currentPrice}</span>
              </div>
            </div>
            <CardDescription>{investment.industry}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Investment Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Shares</span>
                    <Input
                      type="number"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                      className="w-24"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Amount</span>
                    <span className="font-bold">
                      ${parseFloat(investment.currentPrice) * parseFloat(shares)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Company Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>{investment.sector}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Founded: {investment.createdAt.split('T')[0]}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>ESG Score: {investment.esgScore}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleInvest}
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Invest Now'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
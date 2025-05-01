// src/pages/investments/[companyname]/payment/[orderid].tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { ThemeContext } from '@/context/ThemeContext';
import { Investment, investments } from '@/data/investmentsData';
import { Button, message } from 'antd';
import { useContext } from 'react';
import { usePayment } from '@/context/PaymentContext';
import PaymentProcessing from './PaymentProcessing';
import { paymentService } from '@/config/paymentService';
import { supabase } from '@/lib/supabase';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { companyName, orderid } = useParams();
  const { isDarkMode } = useContext(ThemeContext);
  const { paymentData, setPaymentData } = usePayment();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const investment = investments.find(
    inv => inv["Company Name"] === decodeURIComponent(companyName as string)
  );

  useEffect(() => {
    const fetchInvestmentDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (investment) {
          setPaymentData({
            ...paymentData,
            amount: Number(investment['Stock Price (USD)']),
            company_name: investment['Company Name'],
            roi: investment['ROI'],
            risk_level: investment['Risk Level']
          });
        }
      } catch (err) {
        console.error('Error fetching investment details:', err);
        setError('Unable to fetch investment details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (companyName) {
      fetchInvestmentDetails();
    }
  }, [companyName, investment, setPaymentData, paymentData]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className={`text-gray-600 ${isDarkMode ? 'text-gray-400' : ''}`}>
          Loading investment details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {error}
        </h1>
        <Button
          className="mt-4"
          onClick={() => {
            setError(null);
            window.location.reload();
          }}
          style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!investment) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Investment not found
        </h1>
        <Button
          className="mt-4"
          onClick={() => navigate('/investments')}
          style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
        >
          Back to Investments
        </Button>
      </div>
    );
  }

  const handlePayment = async () => {
    try {
      // Navigate to success page directly
      const encodedCompanyName = encodeURIComponent(investment['Company Name']);
      navigate(`/investments/${encodedCompanyName}/success?transactionId=${orderid}`);
    } catch (error) {
      console.error('Payment failed:', error);
      message.error('Payment processing failed. Please try again.');
    }
  };

  return (
    <div className={isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Payment for {investment['Company Name']}
          </h1>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <PaymentProcessing />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentPage;

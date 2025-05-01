import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { message } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import InvestmentCertificate from '@/components/InvestmentCertificate';
import { apiRequest } from '@/lib/api';
import { Company } from '@/shared/schema';
import { toast } from 'sonner';

interface PaymentDetails {
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  created_at: string;
  company: Company;
}

export default function PaymentSuccess() {
  const { companyName } = useParams();
  const location = useLocation();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    amount: 0,
    currency: 'USD',
    payment_method: '',
    status: 'pending',
    created_at: new Date().toISOString(),
    company: {
      name: companyName || 'Unknown',
      ticker: '',
      sector: '',
      industry: '',
      esgScore: 0,
      environmentalScore: 0,
      socialScore: 0,
      governanceScore: 0,
      yearlyTrend: 0,
      sustainabilityRating: '',
      esgRiskLevel: '',
      currentPrice: 0,
      marketCap: 0,
      returnOnInvestment: 0,
      carbonNeutralYear: 0,
      weekHigh52: 0,
      weekLow52: 0,
      dividendYield: 0,
      peRatio: 0,
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const response = await apiRequest(`/api/payments?company_name=${encodeURIComponent(companyName)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch payment data');
        }
        const data = await response.json();
        setPaymentDetails(data);
      } catch (error) {
        console.error('Error fetching payment data:', error);
        message.error('Failed to load payment details');
      }
    };
    if (companyName) fetchPaymentData();
  }, [companyName]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Your payment has been processed successfully.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Company</label>
                  <p className="mt-1 text-lg font-medium">{paymentDetails.company.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Amount</label>
                  <p className="mt-1 text-lg font-medium">${paymentDetails.amount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="mt-1 text-lg font-medium">{paymentDetails.payment_method}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1 text-lg font-semibold text-green-600">{paymentDetails.status}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date</label>
                  <p className="mt-1 text-lg font-medium">{new Date(paymentDetails.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Investment Certificate</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <InvestmentCertificate
                  companyName={paymentDetails.company.name}
                  amount={paymentDetails.amount}
                  date={paymentDetails.created_at}
                  paymentMethod={paymentDetails.payment_method}
                />
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    // Print certificate
                    window.print();
                  }}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Print Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

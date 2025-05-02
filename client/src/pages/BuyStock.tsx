import React, { useState } from 'react';
import { PaymentData, usePayment } from '@/context/PaymentContext';
import { PaymentCertificate } from '@/components/payment/PaymentCertificate';
import { Company } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { useCompanies } from '@/hooks/useCompanies';

export const BuyStock = () => {
  const { paymentData, setPaymentData, savePayment, resetPayment } = usePayment();
  const { user } = useAuth();
  const { companies } = useCompanies();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [shares, setShares] = useState<number>(0);

  const handlePayment = async (company: Company, amount: number) => {
    try {
      setIsProcessing(true);
      setPaymentError('');
      
      // Reset previous payment data
      resetPayment();
      
      // Calculate shares based on current price
      if (!company.currentPrice) {
        throw new Error('Company price is not available');
      }
      const calculatedShares = Math.floor(amount / Number(company.currentPrice));
      setShares(calculatedShares);

      // Set initial payment data
      const paymentData: PaymentData = {
        amount: amount,
        currency: 'USD',
        payment_method: 'card',
        status: 'pending',
        created_at: new Date().toISOString(),
        company
      };
      
      setPaymentData(paymentData);

      // Save payment
      const payment = await savePayment(paymentData);
      
      // Handle successful payment
      if (payment.status === 'success') {
        // Create buy stock data record
        const buyStockData = {
          userId: user?.id || 0,
          companyId: company.id,
          shares: calculatedShares,
          pricePerShare: Number(company.currentPrice),
          totalAmount: amount,
          purchaseDate: new Date().toISOString(),
          esgScore: company.esgScore || 0
        };

        // Save buy stock data
        await fetch('/api/buy-stock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(buyStockData)
        });
      }
    } catch (error) {
      setPaymentError('Payment processing failed. Please try again.');
      resetPayment();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        
        {/* Company Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Select Company</h2>
          <select
            value={selectedCompany?.id || ''}
            onChange={(e) => {
              const companyId = Number(e.target.value);
              const selectedCompany = companies?.find((company: Company) => company.id === companyId);
              setSelectedCompany(selectedCompany || null);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select a company</option>
            {companies?.map((company: Company) => (
              <option key={company.id} value={company.id}>
                {company.name} - ${company.currentPrice}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
            </div>

            {selectedCompany && selectedCompany.currentPrice && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Current Price: ${selectedCompany.currentPrice}
                </p>
                <p className="text-sm text-gray-600">
                  Estimated Shares: {shares}
                </p>
              </div>
            )}

            <button
              onClick={() => handlePayment(selectedCompany!, amount)}
              disabled={isProcessing || !selectedCompany || amount <= 0}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>

            {paymentError && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                {paymentError}
              </div>
            )}
          </div>
        </div>

        {/* Payment Certificate */}
        {paymentData && paymentData.status === 'success' && (
          <PaymentCertificate
            transactionDetails={{
              companyName: paymentData.company?.name || '',
              shares: shares,
              amount: paymentData.amount,
              date: new Date(paymentData.created_at),
              esgScore: paymentData.company?.esgScore || 0,
              paymentId: paymentData.id || ''
            }}
          />
        )}
      </div>
    </div>
  );
};
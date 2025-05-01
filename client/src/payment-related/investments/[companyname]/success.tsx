import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { message } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import InvestmentCertificate from '@/components/InvestmentCertificate';
import { investments } from '@/data/investmentsData';
import { supabase } from '@/lib/supabase';

export default function PaymentSuccess() {
  const { companyName } = useParams();
  const location = useLocation();
  const [paymentDetails, setPaymentDetails] = useState({
    investor_name: '',
    investor_email: '',
    company_name: companyName || 'Unknown',
    amount: 0,
    payment_method: '',
    status: '',
    created_at: ''
  });

  useEffect(() => {
    const paymentData = location.state as any;
    if (paymentData) {
      setPaymentDetails(paymentData);
    } else {
      message.error('Payment data not found');
    }
  }, [location.state]);

  const transactionId = new URLSearchParams(location.search).get('transactionId');

  useEffect(() => {
    const fetchPaymentData = async () => {
      const { data, error } = await supabase.from('payments').select('*').eq('transaction_id', transactionId).single();
      setPaymentDetails(error ? null : data);
    };
    if (transactionId) fetchPaymentData();
  }, [transactionId]);

  const investment = investments.find(
    inv => inv["Company Name"] === paymentDetails.company_name
  );

  if (!investment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Investment Not Found</h1>
            <p className="mt-4">Please try again or contact support.</p>
            <button 
              onClick={() => window.history.back()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back
            </button>
          </div>
        </main>
      </div>
    );
  }

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
                  <label className="block text-sm font-medium text-gray-500">Investor Name</label>
                  <p className="mt-1 text-lg font-medium">{paymentDetails.investor_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-lg font-medium">{paymentDetails.investor_email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Company</label>
                  <p className="mt-1 text-lg font-medium">{paymentDetails.company_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Amount</label>
                  <p className="mt-1 text-lg font-medium">₹{paymentDetails.amount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="mt-1 text-lg font-medium">{paymentDetails.payment_method}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date & Time</label>
                  <p className="mt-1 text-lg font-medium">{new Date(paymentDetails.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Investment Certificate</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <InvestmentCertificate
                  investment={investment}
                  transactionId={paymentDetails.created_at}
                  amountInvested={paymentDetails.amount.toString()}
                  investorName={paymentDetails.investor_name}
                  investorEmail={paymentDetails.investor_email}
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

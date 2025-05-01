// src/pages/investments/[companyname]/payment/PaymentProcessing.tsx
import { useState } from 'react';
import { usePayment } from '@/context/PaymentContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Input, Select, Button, message, Slider, Card } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { PaymentData } from '@/types/payment';
import { investments } from '@/data/investmentsData';
import { useInvestments } from '@/context/InvestmentContext';

interface PaymentFormData {
  investor_name: string;
  investor_email: string;
  amount: number;
  payment_method: string;
}

const paymentMethods = [
  { label: 'UPI', value: 'upi' },
  { label: 'Credit/Debit Card', value: 'card' },
  { label: 'Net Banking', value: 'netbanking' },
  { label: 'PayPal', value: 'paypal' }
];

export default function PaymentProcessing() {
  const { companyName } = useParams();
  const navigate = useNavigate();
  const { setPaymentData } = usePayment();
  const { fetchInvestments } = useInvestments();
  const [formData, setFormData] = useState<PaymentFormData>({
    investor_name: '',
    investor_email: '',
    amount: 1000,
    payment_method: 'upi'
  });
  const [minInvestment, setMinInvestment] = useState(1000);
  const [maxInvestment, setMaxInvestment] = useState(1000000);
  const investment = investments.find(inv => inv["Company Name"] === decodeURIComponent(companyName as string));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName) {
      message.error('Company name is required');
      return;
    }

    if (!formData.investor_name || !formData.investor_email || !formData.amount) {
      message.error('Please fill in all required fields');
      return;
    }

    // Create payment data
    const paymentData = {
      investor_name: formData.investor_name,
      investor_email: formData.investor_email,
      company_name: companyName as string,
      amount: formData.amount,
      payment_method: formData.payment_method,
      status: 'success',
      created_at: new Date().toISOString(),
      roi: Number(investment?.['Return on Investment (ROI %)'] || 0),
      risk_level: investment?.['ESG Risk Level'] || 'Medium',
      transaction_id: new Date().toISOString(),
      min_amount: minInvestment,
      max_amount: maxInvestment
    };

    // Store payment data locally
    setPaymentData(paymentData as unknown as PaymentData);
    
    // Navigate to success page with payment data
    navigate(`/investments/${encodeURIComponent(companyName)}/success`, {
      state: paymentData
    });

    // Show success message
    message.success({ 
      content: 'Payment processed successfully!', 
      key: 'payment',
      duration: 2 
    });

    // Refresh investments to update dashboard
    fetchInvestments();
  };

  if (!investment) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Investment Not Found</h1>
        <p className="text-gray-500 mb-4">Please check the company name and try again.</p>
        <Button
          onClick={() => navigate('/investments')}
          className="mt-4"
        >
          Back to Investments
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button type="link" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center ml-4">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
              <p className="text-lg font-semibold text-primary-600">
                {investment["Ticker Symbol"]}
              </p>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Payment Processing
              </h1>
              <p className="text-gray-600">
                {investment["Company Name"]}
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Investor Name</label>
                <Input
                  value={formData.investor_name}
                  onChange={(e) => setFormData({ ...formData, investor_name: e.target.value })}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.investor_email}
                  onChange={(e) => setFormData({ ...formData, investor_email: e.target.value })}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block mb-1">Investment Amount</label>
                <div className="flex items-center">
                  <span className="mr-2">₹</span>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => {
                      const amount = Number(e.target.value);
                      if (amount >= minInvestment && amount <= maxInvestment) {
                        setFormData({ ...formData, amount });
                      }
                    }}
                    required
                    className="w-32"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              <Slider
                min={minInvestment}
                max={maxInvestment}
                value={formData.amount}
                onChange={(value) => setFormData({ ...formData, amount: value })}
                marks={{
                  [minInvestment]: `₹${minInvestment.toLocaleString()}`,
                  [maxInvestment]: `₹${maxInvestment.toLocaleString()}`
                }}
              />

              <div className="text-center text-sm text-gray-500 mt-2">
                Minimum Investment: ₹{minInvestment.toLocaleString()}<br />
                Maximum Investment: ₹{maxInvestment.toLocaleString()}
              </div>
            </div>

            <div>
              <label className="block mb-1">Payment Method</label>
              <Select
                value={formData.payment_method}
                onChange={(value) => setFormData({ ...formData, payment_method: value })}
                options={paymentMethods}
                placeholder="Select payment method"
              />
            </div>

            <Button 
              type="primary" 
              htmlType="submit" 
              block
              className="bg-primary-600 hover:bg-primary-700"
            >
              Process Payment
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
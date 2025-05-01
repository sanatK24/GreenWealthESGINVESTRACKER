// src/pages/investments/[companyname]/payment/InvestmentConfirmation.tsx
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '@/context/PaymentContext';

export default function InvestmentConfirmation() {
  const { paymentData } = usePayment();
  const navigate = useNavigate();

  const handleProceed = () => {
    navigate('/investments/[companyname]/payment/[orderid]');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Investment Confirmation</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{paymentData.company_name}</h2>
        <div className="space-y-4">
          <div>
            <span className="font-medium">Amount:</span>
            <span className="ml-2">₹{paymentData.amount}</span>
          </div>
          <div>
            <span className="font-medium">Estimated ROI:</span>
            <span className="ml-2">{paymentData.roi}%</span>
          </div>
          <div>
            <span className="font-medium">Risk Level:</span>
            <span className="ml-2">{paymentData.risk_level}</span>
          </div>
        </div>
        <Button 
          type="primary" 
          size="large" 
          onClick={handleProceed}
          className="mt-6 w-full"
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}
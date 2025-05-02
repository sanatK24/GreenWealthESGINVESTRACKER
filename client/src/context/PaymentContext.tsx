
import { createContext, useContext, useState, ReactNode } from 'react';
import { Company } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';

interface PaymentData {
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  created_at: string;
  company: Company | null;
}

interface PaymentContextType {
  paymentData: PaymentData;
  setPaymentData: (data: Partial<PaymentData>) => void;
  savePayment: (data: PaymentData) => Promise<PaymentData>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    currency: 'USD',
    payment_method: 'card',
    status: 'pending',
    created_at: new Date().toISOString(),
    company: null
  });

  const savePayment = async (data: PaymentData) => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      const payment = await response.json();
      setPaymentData(payment);
      await queryClient.invalidateQueries({ queryKey: ['payments'] });
      return payment;
    } catch (error) {
      console.error('Error saving payment:', error);
      throw error;
    }
  };

  return (
    <PaymentContext.Provider 
      value={{
        paymentData,
        setPaymentData: (data) => setPaymentData(prev => ({ ...prev, ...data })),
        savePayment
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

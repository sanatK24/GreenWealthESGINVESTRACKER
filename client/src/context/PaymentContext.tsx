import { createContext, useContext, useState, ReactNode } from 'react';
import { Company } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';

export interface PaymentData {
  id?: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  created_at: string;
  company: Company | null;
}

interface PaymentContextType {
  paymentData: PaymentData | null;
  setPaymentData: (data: Partial<PaymentData>) => void;
  savePayment: (data: PaymentData) => Promise<PaymentData>;
  resetPayment: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

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
      console.error('Payment error:', error);
      throw error;
    }
  };

  const resetPayment = () => {
    setPaymentData(null);
  };

  return (
    <PaymentContext.Provider value={{
      paymentData,
      setPaymentData: (data) => setPaymentData(prev => prev ? { ...prev, ...data } : data),
      savePayment,
      resetPayment
    }}>
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

// src/context/PaymentContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Company } from '@/shared/schema';

interface PaymentContextType {
  paymentData: {
    amount: number;
    currency: string;
    payment_method: string;
    status: string;
    created_at: string;
    company: Company;
  };
  setPaymentData: (data: Partial<PaymentContextType['paymentData']>) => void;
  savePayment: (data: PaymentContextType['paymentData']) => Promise<PaymentContextType['paymentData']>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    currency: 'USD',
    payment_method: 'card',
    status: 'pending',
    created_at: new Date().toISOString(),
    company: null as unknown as Company
  });

  const savePayment = async (data: PaymentContextType['paymentData']) => {
    try {
      const response = await apiRequest('/api/payments', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      const payment = await response.json();
      setPaymentData(payment);
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
        setPaymentData,
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
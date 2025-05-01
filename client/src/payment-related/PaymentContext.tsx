// src/context/PaymentContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { PaymentData } from '@/types/payment';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface PaymentContextType {
  paymentData: PaymentData;
  setPaymentData: (data: PaymentData) => void;
  savePayment: (data: PaymentData) => Promise<PaymentData>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    currency: 'USD',
    payment_method: 'card',
    status: 'pending',
    created_at: new Date().toISOString()
  });

  const savePayment = async (data: PaymentData) => {
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
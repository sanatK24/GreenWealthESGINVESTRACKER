// src/context/PaymentContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface PaymentData {
  amount: number;
  shares: number;
  paymentMethod: string;
  transactionId: string;
  roi: number;
  riskLevel: string;
}

interface PaymentContextType {
  paymentData: PaymentData;
  setPaymentData: (data: Partial<PaymentData>) => void;
  savePayment: (data: PaymentData) => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    shares: 0,
    paymentMethod: '',
    transactionId: '',
    roi: 0,
    riskLevel: ''
  });

  const savePayment = async (data: PaymentData) => {
    try {
      const { error } = await supabase
        .from('payments')
        .insert([{
          user_id: 1, // Replace with actual user ID
          company_id: 1, // Replace with actual company ID
          payment_data: data,
          status: 'pending'
        }]);

      if (error) throw error;
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
// src/context/PaymentContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PaymentData } from '@/types/payment';
import { v4 as uuidv4 } from 'uuid';

interface PaymentContextType {
  paymentData: PaymentData;
  setPaymentData: (data: PaymentData) => void;
  savePayment: (data: PaymentData) => Promise<PaymentData>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    id: uuidv4(),
    investor_name: '',
    investor_email: '',
    company_name: '',
    amount: 0,
    roi: 0,
    risk_level: '',
    transaction_id: '',
    payment_method: '',
    status: 'pending',
    created_at: new Date().toISOString()
  });

  const savePayment = async (data: PaymentData) => {
    try {
      const { data: payment, error } = await supabase
        .from('payments')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
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
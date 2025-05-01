import { useState } from 'react';
import { 
  PayPalScriptProvider, 
  PayPalButtons,
  FUNDING
} from '@paypal/react-paypal-js';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface PayPalButtonProps {
  amount: string;
  description?: string;
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
  currency?: string;
  disabled?: boolean;
}

export function PayPalButton({ 
  amount, 
  description = 'ESG Portfolio Investment',
  onSuccess,
  onError,
  currency = 'INR',
  disabled = false
}: PayPalButtonProps) {
  const { toast } = useToast();
  const [orderID, setOrderID] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validate currency
  const validCurrencies = ['INR', 'USD', 'EUR'];
  if (!validCurrencies.includes(currency)) {
    throw new Error(`Invalid currency: ${currency}. Supported currencies: ${validCurrencies.join(', ')}`);
  }

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: { value: string; description: string; currency: string }) => {
      if (!import.meta.env.PAYPAL_CLIENT_ID) {
        throw new Error('PayPal client ID not configured');
      }

      const response = await apiRequest('POST', '/api/create-order', {
        ...data,
        currency
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create order');
      }

      return result;
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to create order');
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to create order',
        variant: 'destructive',
      });
      if (onError) onError(error);
    }
  });

  // Capture order mutation
  const captureOrderMutation = useMutation({
    mutationFn: async (orderID: string) => {
      const response = await apiRequest('POST', '/api/capture-order', { orderID });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to capture payment');
      }

      return result;
    },
    onSuccess: (data: any) => {
      setError(null);
      toast({
        title: 'Payment successful!',
        description: 'Thank you for your investment.',
      });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to capture payment');
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to capture payment',
        variant: 'destructive',
      });
      if (onError) onError(error);
    }
  });

  // Handle PayPal button creation
  const createOrder = async () => {
    try {
      const data = await createOrderMutation.mutateAsync({
        value: amount,
        description,
        currency
      });
      setOrderID(data.id);
      return data.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  // Handle PayPal payment approval
  const onApprove = async (data: any) => {
    try {
      if (!orderID) {
        throw new Error('No order ID available');
      }

      const orderData = await captureOrderMutation.mutateAsync(orderID);
      return orderData;
    } catch (error) {
      console.error('Error capturing order:', error);
      throw error;
    }
  };

  const isPending = createOrderMutation.isPending || captureOrderMutation.isPending;
  const isDisabled = disabled || isPending || !!error;

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 rounded-md text-destructive">
          {error}
        </div>
      )}

      {isPending && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Processing payment...</span>
        </div>
      )}

      <PayPalScriptProvider 
        options={{ 
          clientId: import.meta.env.PAYPAL_CLIENT_ID as string || '', 
          currency,
          intent: 'capture',
          disableFunding: 'card',
        }}
      >
        <PayPalButtons
          style={{ 
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'pay',
            tagline: false
          }}
          disabled={isDisabled}
          forceReRender={[amount, description, currency]}
          fundingSource={FUNDING.PAYPAL}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err: any) => {
            setError(err.message || 'An error occurred with PayPal');
            toast({
              title: 'PayPal Error',
              description: err.message || 'An error occurred with PayPal',
              variant: 'destructive',
            });
            console.error('PayPal error:', err);
            if (onError) onError(err);
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}
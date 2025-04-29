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
}

export function PayPalButton({ 
  amount, 
  description = 'ESG Portfolio Investment',
  onSuccess,
  onError
}: PayPalButtonProps) {
  const { toast } = useToast();
  const [orderID, setOrderID] = useState<string | null>(null);
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: { value: string; description: string }) => {
      const response = await apiRequest('POST', '/api/create-order', data);
      return response.json();
    },
    onError: (error) => {
      toast({
        title: 'Error creating order',
        description: error.message,
        variant: 'destructive',
      });
      if (onError) onError(error);
    }
  });

  // Capture order mutation
  const captureOrderMutation = useMutation({
    mutationFn: async (orderID: string) => {
      const response = await apiRequest('POST', '/api/capture-order', { orderID });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Payment successful!',
        description: 'Thank you for your investment.',
      });
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      toast({
        title: 'Error capturing payment',
        description: error.message,
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
        description
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
      const orderData = await captureOrderMutation.mutateAsync(data.orderID);
      return orderData;
    } catch (error) {
      console.error('Error capturing order:', error);
      throw error;
    }
  };

  const isPending = createOrderMutation.isPending || captureOrderMutation.isPending;

  return (
    <div className="w-full">
      {isPending && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Processing payment...</span>
        </div>
      )}
      
      <PayPalScriptProvider 
        options={{ 
          clientId: import.meta.env.PAYPAL_CLIENT_ID as string || '', 
          currency: 'INR',
          intent: 'capture'
        }}
      >
        <PayPalButtons
          style={{ 
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'pay'
          }}
          disabled={isPending}
          forceReRender={[amount, description]}
          fundingSource={FUNDING.PAYPAL}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err: any) => {
            toast({
              title: 'PayPal Error',
              description: 'An error occurred with PayPal.',
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
import React from "react";
import { AuthProvider } from '@/hooks/use-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PaymentProvider } from '@/context/PaymentContext';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Routes } from '@/routes';

const queryClient = new QueryClient();

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <PaymentProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Routes />
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </PaymentProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
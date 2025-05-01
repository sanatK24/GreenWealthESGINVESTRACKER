// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Investments from "./pages/Investments";
import NotFound from "./pages/NotFound";
import LearnMore from './pages/learn-more';
import { ThemeProvider } from '@/context/ThemeContext';
import InvestmentDetail from './pages/investments/[companyname]';
import PaymentPage from './pages/investments/[companyname]/payment/[orderid]';
import { WatchlistProvider } from '@/context/WatchlistContext';
import Watchlist from './pages/watchlist';  // Add this import
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { DayPickerProvider } from 'react-day-picker';
import Success from "./pages/investments/[companyname]/success";
import { PaymentProvider } from '@/context/PaymentContext';
import { Login } from "./components/Login";
import { AuthCallback } from "./components/AuthCallback";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SignUp } from './components/SignUp';
import { Profile } from "./pages/profile";  
import { InvestmentProvider } from '@/context/InvestmentContext';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PayPalScriptProvider
        options={{
          clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
          currency: 'INR',
          intent: 'capture'
        }}
      >
        <ThemeProvider>
          <WatchlistProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <PaymentProvider>
                  <DayPickerProvider
                    initialProps={{
                      defaultMonth: new Date(),
                      mode: "single",
                      fromYear: 2020,
                      toYear: 2030,
                      classNames: {
                        caption: 'react-day-picker-caption',
                        nav: 'react-day-picker-nav',
                        nav_button: 'react-day-picker-nav-button',
                        nav_button_previous: 'react-day-picker-nav-button-previous',
                        nav_button_next: 'react-day-picker-nav-button-next',
                        month: 'react-day-picker-month',
                        day: 'react-day-picker-day',
                        day_outside: 'react-day-picker-day-outside',
                        day_disabled: 'react-day-picker-day-disabled',
                        day_selected: 'react-day-picker-day-selected',
                        day_range_start: 'react-day-picker-day-range-start',
                        day_range_end: 'react-day-picker-day-range-end',
                        day_today: 'react-day-picker-day-today'
                      }
                    }}
                  >
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <InvestmentProvider>
                        <Routes>
                          <Route path="/login" element={<Login />} />
                          <Route path="/signup" element={<SignUp />} />
                          <Route path="/auth-callback" element={<AuthCallback />} />
                          
                          <Route path="/" element={<Index />} />
                          
                          <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/investments" element={<Investments />} />
                            <Route path="/watchlist" element={<Watchlist />} />
                            <Route path="/investments/:companyName" element={<InvestmentDetail />} />
                            <Route path="/investments/:companyName/payment/:orderid" element={<PaymentPage />} />
                            <Route path="/investments/:companyName/success" element={<Success />} />
                            <Route path="/learn-more" element={<LearnMore />} />
                            <Route path="/profile" element={<Profile />} />
                          </Route>
                          
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </InvestmentProvider>
                    </BrowserRouter>
                  </DayPickerProvider>
                </PaymentProvider>
              </TooltipProvider>
            </QueryClientProvider>
          </WatchlistProvider>
        </ThemeProvider>
      </PayPalScriptProvider>
    </AuthProvider>
  );
};
   
export default App;
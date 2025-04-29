
import React from "react";
import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import MainLayout from "@/components/layout/MainLayout";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { InvestorAssistant } from "@/components/chat/InvestorAssistant";

// Import components
import Companies from "./pages/Companies";
import ESGBreakdown from "./pages/ESGBreakdown";
import Sectors from "./pages/Sectors";
import GreenStocks from "./pages/GreenStocks";
import Portfolio from "./pages/Portfolio";
import CompanyDetail from "./pages/CompanyDetail";
import CompanyPrices from "./pages/CompanyPrices";
import AuthPage from "./pages/auth-page";
import Invest from "./pages/Invest";
import BuyStock from "./pages/BuyStock";
import ActivityHistory from "./pages/ActivityHistory";
import Payments from "./pages/Payments";

function AppRoutes() {
  return (
    <React.Suspense fallback={<div className="p-12 flex justify-center">Loading...</div>}>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/">
          {() => (
            <MainLayout>
              <Dashboard />
            </MainLayout>
          )}
        </Route>
        <Route path="/companies">
          {() => (
            <MainLayout>
              <Companies />
            </MainLayout>
          )}
        </Route>
        <Route path="/company/:id">
          {() => (
            <MainLayout>
              <CompanyDetail />
            </MainLayout>
          )}
        </Route>
        <Route path="/esg-breakdown">
          {() => (
            <MainLayout>
              <ESGBreakdown />
            </MainLayout>
          )}
        </Route>
        <Route path="/sectors">
          {() => (
            <MainLayout>
              <Sectors />
            </MainLayout>
          )}
        </Route>
        <Route path="/green-stocks">
          {() => (
            <MainLayout>
              <GreenStocks />
            </MainLayout>
          )}
        </Route>
        <Route path="/portfolio">
          {() => (
            <MainLayout>
              <Portfolio />
            </MainLayout>
          )}
        </Route>
        <Route path="/invest">
          {() => (
            <MainLayout>
              <Invest />
            </MainLayout>
          )}
        </Route>
        <Route path="/buy-stock/:id">
          {() => (
            <MainLayout>
              <BuyStock />
            </MainLayout>
          )}
        </Route>
        <Route path="/company-prices">
          {() => (
            <MainLayout>
              <CompanyPrices />
            </MainLayout>
          )}
        </Route>
        <Route path="/activity-history">
          {() => (
            <MainLayout>
              <ActivityHistory />
            </MainLayout>
          )}
        </Route>
        <Route path="/payments">
          {() => (
            <MainLayout>
              <Payments />
            </MainLayout>
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </React.Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <InvestorAssistant />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Link, useLocation } from 'wouter';
import { BarChart3, LineChart, TreeDeciduous, Building2, CircleDollarSign, LayoutDashboard, Menu, X, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { isMobile } = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/companies', label: 'Companies', icon: Building2 },
    { path: '/esg-breakdown', label: 'ESG Breakdown', icon: BarChart3 },
    { path: '/sectors', label: 'Sectors', icon: LineChart },
    { path: '/green-stocks', label: 'Green Stocks', icon: TreeDeciduous },
    { path: '/portfolio', label: 'My Portfolio', icon: CircleDollarSign },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Mobile Menu Toggle Button */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            {sidebarOpen ? 'Close Menu' : 'Menu'}
          </Button>
        </div>
        
        {/* Navigation Sidebar */}
        <div className={cn(
          "w-full lg:w-64 shrink-0 transition-all duration-300 ease-in-out",
          isMobile && !sidebarOpen ? "hidden" : "block"
        )}>
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 sticky top-20">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium text-lg">Navigation</h2>
            </div>
            <ul className="p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path} className="my-1">
                    <Link 
                      href={item.path}
                      onClick={() => isMobile && setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                        location === item.path
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
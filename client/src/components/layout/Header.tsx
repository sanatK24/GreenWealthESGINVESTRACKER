import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Leaf, User, LogOut, DollarSign, Menu, X, History } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Header = () => {
  const { isMobile } = useMobile();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get user from API
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      navigate('/auth');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileMenuOpen(false);
  };

  const getUserInitials = () => {
    if (!user?.username) return 'U';
    return user.username.slice(0, 2).toUpperCase();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-1.5 rounded-md">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-green-500 to-emerald-600 text-transparent bg-clip-text">
              GreenWealth
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm font-medium flex space-x-4">
              <Link href="/companies" className="hover:text-primary transition-colors">
                Companies
              </Link>
              <Link href="/esg-breakdown" className="hover:text-primary transition-colors">
                ESG Analysis
              </Link>
              <Link href="/green-stocks" className="hover:text-primary transition-colors">
                Green Tech
              </Link>
              <Link href="/company-prices" className="hover:text-primary transition-colors">
                Stock Prices
              </Link>
              <Link href="/activity-history" className="hover:text-primary transition-colors">
                Recent Activity
              </Link>
              <Link href="/payments" className="hover:text-primary transition-colors">
                Payments
              </Link>

              {user && (
                <Link href="/invest" className="text-primary font-semibold flex items-center">
                  <span className="font-bold mr-1">₹</span>
                  Invest
                </Link>
              )}
            </div>

            {!user ? (
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Login
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">User</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/portfolio')}>
                    <User className="w-4 h-4 mr-2" />
                    My Portfolio
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/invest')}>
                    <span className="font-bold mr-1">₹</span>
                    Invest
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {!user ? (
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                Login
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">User</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/portfolio')}>
                    <User className="w-4 h-4 mr-2" />
                    My Portfolio
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/invest')}>
                    <span className="font-bold mr-1">₹</span>
                    Invest
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="ml-1">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "md:hidden mt-2 overflow-hidden transition-all duration-300",
          mobileMenuOpen ? "max-h-60" : "max-h-0"
        )}>
          <div className="py-2 space-y-1 border-t">
            <Link 
              href="/companies" 
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Companies
            </Link>
            <Link 
              href="/esg-breakdown" 
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              ESG Analysis
            </Link>
            <Link 
              href="/green-stocks" 
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Green Tech
            </Link>
            <Link 
              href="/company-prices" 
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Stock Prices
            </Link>
            <Link 
              href="/payments" 
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Payments
            </Link>
            {user && (
              <Link 
                href="/invest" 
                className="block px-3 py-2 rounded-md text-sm font-medium text-primary hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="font-bold mr-1">₹</span>
                Invest
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
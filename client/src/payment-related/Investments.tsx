import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Leaf, TrendingUp, Building, IndianRupee, Car, Plane, LineChart, Factory, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ChatBubble } from "@/components/ChatBubble";
import { ThemeContext } from '@/context/ThemeContext';
import { Heart, GlassWater, ShoppingCart, Computer } from "lucide-react";
import { Investment, investments } from '@/data/investmentsData';
import { useWatchlist } from '@/context/WatchlistContext';

const Investments = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('');
 
  const [sortedInvestments, setSortedInvestments] = useState<Investment[]>([]);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  // Filter investments based on search
  const filtered = investments.filter(investment => 
    (investment["Company Name"]?.toLowerCase() || '').includes(filter.toLowerCase()) ||
    (investment.Industry?.toLowerCase() || '').includes(filter.toLowerCase()) ||
    (investment["Ticker Symbol"]?.toLowerCase() || '').includes(filter.toLowerCase())
  );

  // Sort the filtered investments
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'return') {
      return (parseFloat(b["Return on Investment (ROI %)"] || '0') || 0) - (parseFloat(a["Return on Investment (ROI %)"] || '0') || 0);
    } else if (sortOrder === 'risk') {
      return (a["ESG Risk Level"] || '').localeCompare(b["ESG Risk Level"] || '');
    }
    return 0;
  });

  // Debug watchlist
  useEffect(() => {
    console.log('Watchlist:', watchlist);
  }, [watchlist]);

  
  // Update the sorted investments state
  useEffect(() => {
    const filtered = investments.filter(investment => 
      (investment["Company Name"]?.toLowerCase() || '').includes(filter.toLowerCase()) ||
      (investment.Industry?.toLowerCase() || '').includes(filter.toLowerCase()) ||
      (investment["Ticker Symbol"]?.toLowerCase() || '').includes(filter.toLowerCase())
    );
  
    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === 'return') {
        return (parseFloat(b["Return on Investment (ROI %)"] || '0') || 0) - (parseFloat(a["Return on Investment (ROI %)"] || '0') || 0);
      } else if (sortOrder === 'risk') {
        return (a["ESG Risk Level"] || '').localeCompare(b["ESG Risk Level"] || '');
      }
      return 0;
    });
  
    setSortedInvestments(sorted);
  }, [filter, sortOrder, investments]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  // Update handleSave function
const handleSave = (ticker: string) => {
  if (watchlist.includes(ticker)) {
    removeFromWatchlist(ticker);
  } else {
    addToWatchlist(ticker);
  }
};

// Update handleInvest function
const handleInvest = (investment: Investment) => {
  const ticker = investment["Ticker Symbol"];
  if (watchlist.includes(ticker)) {
    removeFromWatchlist(ticker);
  } else {
    addToWatchlist(ticker);
  }
  navigate(`/investments/${investment["Company Name"]}`);
};

// Update the saved investments filter
const saved = investments.filter(investment => 
  watchlist.includes(investment["Ticker Symbol"])
);

 const getIndustryIcon = (industry: string | undefined) => {
   if (!industry) return <Building className="w-6 h-6" />;
 
   const industryLower = industry.toLowerCase();
   switch (industryLower) {
     case "energy":
       return <Leaf className="w-6 h-6" />;
     case "manufacturing":
       return <Factory className="w-6 h-6" />;
     case "construction":
       return <Building className="w-6 h-6" />;
     case "transport":
       return <Car className="w-6 h-6" />;
     case "aviation":
       return <Plane className="w-6 h-6" />;
     case "water":
       return <GlassWater className="w-6 h-6" />;
     case "retail":
       return <ShoppingCart className="w-6 h-6" />;
     case "technology":
       return <Computer className="w-6 h-6" />;
     default:
       return <Building className="w-6 h-6" />;
   }
 };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Sustainable Investments
        </h1>

        {/* Watchlist Section */}
        <div className="mb-6">
          <Button
            onClick={() => setIsWatchlistOpen(!isWatchlistOpen)}
            className="w-fit px-4 flex items-center justify-between"
          >
            Watchlist
            <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isWatchlistOpen ? 'rotate-180' : ''}`} />
          </Button>
          {isWatchlistOpen && (
            <div className="mt-4 space-y-4">
              {watchlist.map((ticker) => {
                const savedInvestment = investments.find(i => i["Ticker Symbol"] === ticker);
                if (!savedInvestment) return null;
                
                return (
                  <Card key={ticker} className="p-4 hover:shadow-lg transition-shadow bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{savedInvestment["Company Name"]}</h3>
                <div className="flex items-center space-x-4 mt-2 text-gray-600 dark:text-gray-300">
                  <span>Overall ESG Score: {savedInvestment["Overall ESG Score"]}</span>
                  <span>Stock Price: ${savedInvestment["Stock Price (USD)"]}</span>
                  <span>ROI: {savedInvestment["Return on Investment (ROI %)"]}%</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave(ticker)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Remove from Watchlist
                </Button>
                <Button
                  onClick={() => handleInvest(savedInvestment)}
                  size="sm"
                  variant="default"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Invest Now
                </Button>
              </div>
            </div>
          </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className={`text-gray-600 mt-2 ${isDarkMode ? 'text-gray-400' : ''}`}>
            Explore sustainable investment options
          </p>
          <div className="flex justify-between mb-4">
            <input
              type="text"
              placeholder="Search investments..."
              value={filter}
              onChange={handleFilterChange}
              className={`border rounded p-2 ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
            />
            <select
              value={sortOrder}
              onChange={handleSortChange}
              className={`border rounded p-2 ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
            >
              <option value="">Sort by</option>
              <option value="return">Return</option>
              <option value="risk">Risk Level</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
        {sortedInvestments.map((investment, index) => {
          const isSaved = watchlist.includes(investment["Ticker Symbol"]);
          
          return (
            <motion.div
              key={investment["Ticker Symbol"]}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    {getIndustryIcon(investment["Industry"])}
                    <h2 className={`text-xl font-semibold ml-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {investment["Company Name"]}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <TrendingUp className="mr-2" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Overall ESG Score: {investment["Overall ESG Score"]}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <IndianRupee className="mr-2" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Stock Price: ₹{investment["Stock Price (USD)"]}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <LineChart className="mr-2" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        ROI: {investment["Return on Investment (ROI %)"]}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => handleSave(investment["Ticker Symbol"])}
                  >
                    {isSaved ? "Added to Watchlist" : "Save for Later"}
                  </Button>
                  <Button
                    onClick={() => handleInvest(investment)}
                    variant={isSaved ? "outline" : "default"}
                    >
                    Invest Now
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
        </div>
      </main>
      <ChatBubble />
    </div>
  );
};

export default Investments;
import React, { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LineChart, ArrowLeft, Car, IndianRupee, TrendingUp, Shield, Globe, Clock, ChartBar, BookOpen, Save } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeContext } from '@/context/ThemeContext';
import { Navbar } from '@/components/Navbar';
import { Investment, investments } from '@/data/investmentsData';
import { paymentService } from '@/config/paymentService';
import { toast } from 'sonner';

// Chart.js setup
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useWatchlist } from '@/context/WatchlistContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Constants
const timeFrames = [
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
  { label: '5Y', value: '5Y' },
  { label: 'MAX', value: 'MAX' }
];

const getTimeFrameLabels = (timeFrame: string): string[] => {
  const now = new Date();
  const labels: string[] = [];
  
  switch (timeFrame) {
    case '1D':
      for (let i = 0; i < 24; i++) {
        const date = new Date(now);
        date.setHours(now.getHours() - i);
        labels.push(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      }
      return labels.reverse();
    
    case '1W':
      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      }
      return labels.reverse();
    
    case '1M':
      for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
      return labels.reverse();
    
    case '6M':
      for (let i = 0; i < 6; i++) {
        const date = new Date(now);
        date.setMonth(now.getMonth() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
      }
      return labels.reverse();
    
    case '1Y':
      const monthLabels = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(now.getMonth() - i);
        monthLabels.push(date.toLocaleDateString('en-US', { month: 'short' }));
      }
      return monthLabels;
    
    case '5Y':
      for (let i = 0; i < 5; i++) {
        const date = new Date(now);
        date.setFullYear(now.getFullYear() - i);
        labels.push(date.toLocaleDateString('en-US', { year: 'numeric' }));
      }
      return labels.reverse();
    
    case 'MAX':
      return ['2020', '2018', '2016', '2014', '2012', '2010', '2008', '2006', '2004', '2002', '2000'];
    
    default:
      return Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
  }
};

// Main component
const InvestmentDetails: React.FC = () => {
  const navigate = useNavigate();
  const { companyName } = useParams();
  const { isDarkMode } = useContext(ThemeContext);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('1D');
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [savedInvestments, setSavedInvestments] = useState<string[]>([]);
  const investment = investments.find(inv => inv["Company Name"] === decodeURIComponent(companyName as string));

  if (!investment) {
    return <div className="container mx-auto px-4 py-24 text-center">
      <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        Investment not found
      </h1>
      <p className={`mt-4 text-gray-500 ${isDarkMode ? 'text-gray-400' : ''}`}>
        Please check the company name and try again.
      </p>
      <Button className="mt-4" onClick={() => navigate('/investments')}>
        Back to Investments
      </Button>
    </div>;
  }

  async function handleInvest(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    event.preventDefault();
    try {
      const order = await paymentService.createOrder(parseFloat(investment['Stock Price (USD)']));
      navigate(`/investments/${encodeURIComponent(investment['Company Name'])}/payment/${order.id}`);
    } catch (error) {
      console.error('Payment order creation failed:', error);
    }
  }

  const handleSave = (ticker: string) => {
    if (watchlist.includes(ticker)) {
      removeFromWatchlist(ticker);
    } else {
      addToWatchlist(ticker);
    }
  };

  return (
    <div className={isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-10">
        <div className="flex items-center mb-8">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center ml-4">
              <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-primary-100'} flex items-center justify-center mr-4`}>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-primary-600'}`}>
                  {investment["Ticker Symbol"]}
                </p>
              </div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {investment["Company Name"]}
              </h1>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Key Investment Details */}
            <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stock Price</p>
                  <p className={`text-lg font-semibold ${isDarkMode ? 'text-primary-400' : 'text-primary-600'}`}>
                    ₹{investment["Stock Price (INR)"]}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Return</p>
                  <p className={`text-lg font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    +{investment["Return on Investment (ROI %)"]}%
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Risk Level</p>
                  <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : ''}`}>
                    {investment["ESG Risk Level"]}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Market Cap</p>
                  <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : ''}`}>
                    {investment["Market Cap (INR)"]}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Carbon Neutral Target</p>
                  <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : ''}`}>
                    {investment["Carbon Neutral Target Year"]}
                  </p>
                </div>
              </div>
            </Card>

            {/* Performance Graph */}
            <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Performance
                </h2>
                <div className="flex space-x-2">
                  {timeFrames.map(tf => (
                    <Button
                      key={tf.value}
                      variant="outline"
                      className={`px-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      onClick={() => setSelectedTimeFrame(tf.value)}
                    >
                      {tf.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="h-64">
                <Line
                  data={{
                    labels: getTimeFrameLabels(selectedTimeFrame),
                    datasets: [{
                      label: 'Stock Price',
                      data: Array.from({ length: getTimeFrameLabels(selectedTimeFrame).length }, () => Math.random() * 100),
                      borderColor: isDarkMode ? '#4CAF50' : '#1976d2',
                      tension: 0.1,
                      fill: false,
                      pointBackgroundColor: isDarkMode ? '#4CAF50' : '#1976d2',
                      pointBorderColor: isDarkMode ? '#4CAF50' : '#1976d2'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          color: isDarkMode ? '#ffffff' : '#000000'
                        }
                      },
                      title: {
                        display: true,
                        text: 'Price Chart',
                        color: isDarkMode ? '#ffffff' : '#000000'
                      },
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: selectedTimeFrame === '1D' ? 'Time' : 'Date',
                          color: isDarkMode ? '#ffffff' : '#000000'
                        },
                        ticks: {
                          autoSkip: true,
                          maxTicksLimit: selectedTimeFrame === '1D' ? 6 : 10,
                          color: isDarkMode ? '#ffffff' : '#000000'
                        }
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Price (₹)',
                          color: isDarkMode ? '#ffffff' : '#000000'
                        },
                        beginAtZero: false,
                        ticks: {
                          color: isDarkMode ? '#ffffff' : '#000000'
                        }
                      },
                    },
                  }} />
              </div>
            </Card>
          </div>

          {/* Additional Metrics */}
          <Card className={`p-6 mt-8 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Additional Metrics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>52-Week High/Low</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : ''}`}>
                  ₹{investment["52-Week High"]} / ₹{investment["52-Week Low"]}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dividend Yield</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : ''}`}>
                  {investment["Dividend Yield"] || 'N/A'}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>P/E Ratio</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : ''}`}>
                  {investment["P/E Ratio"] || 'N/A'}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>ESG Score</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : ''}`}>
                  {investment["Overall ESG Score"]} ({investment["Sustainability Rating"]})
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
          <Button 
            onClick={() => handleSave(investment["Ticker Symbol"])}
            className="flex items-center"
          >
            {watchlist.includes(investment["Ticker Symbol"]) ? (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save for Later
              </>
            )}
          </Button>
            <Button 
              onClick={handleInvest} 
              className="flex items-center"
            >
              <IndianRupee className="mr-2 h-4 w-4" />
              Invest ₹{investment['Stock Price (INR)']}
            </Button>
          </div>
        </main>
      </div>
    );
  };
  export default InvestmentDetails;
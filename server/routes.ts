import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import * as storage from "./storage";
import { z } from "zod";
import { 
  insertCompanySchema, 
  insertSectorSchema,
  insertPortfolioCompositionSchema,
  insertPortfolioSummarySchema,
  insertSustainabilityTrendSchema,
  insertStockPriceHistorySchema,
} from "@shared/schema";
import { db } from "../db";
import { setupAuth } from "./auth";
import paypal from "@paypal/checkout-server-sdk";
import { generateInvestmentInsights, chatWithInvestorAssistant } from "./services/gemini";
import { users, userLoginRecords, userActions, orderHistory, chatRecords, comparisonHistory } from "../shared/schema";
import { desc, eq, or } from "drizzle-orm";

// Define database table interfaces
interface UserLoginRecord {
  id: number;
  userId: number;
  loginTimestamp: Date;
  logoutTimestamp: Date | null;
  loginStatus: string;
  ipAddress: string;
  sessionKey: string;
  deviceInfo: string;
}

interface UserAction {
  id: number;
  userId: number;
  timestamp: Date;
  actionType: string;
  actionDetails: string;
  sessionId: string;
  deviceInfo: string;
}

interface Order {
  id: number;
  userId: number;
  orderId: string;
  timestamp: Date;
  companyId: number;
  shares: number;
  amount: number;
  orderDetails: string;
  orderTotal: number;
  paymentMethod: string;
  orderStatus: string;
}

interface ChatRecord {
  id: number;
  senderId: number;
  receiverId: number;
  timestamp: Date;
  message: string;
  sessionId: string;
  deviceInfo: string;
}

interface ComparisonHistory {
  id: number;
  userId: number;
  timestamp: Date;
  companyIds: number[];
}

export async function registerRoutes(app: Express): Promise<Server> {
  const apiPrefix = "/api";

  // Set up authentication
  setupAuth(app);

  // News API endpoint
  app.get(`${apiPrefix}/news`, async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.NEWS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'News API key is not configured' });
      }

      const query = req.query.query || 'ESG investing sustainable';
      const pageSize = Number(req.query.pageSize) || 5;

      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(String(query))}&pageSize=${pageSize}&language=en&sortBy=publishedAt&apiKey=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`News API response not ok: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      res.status(500).json({ error: 'Failed to fetch news articles' });
    }
  });

  // Set up PayPal
  let environment;
  if (process.env.NODE_ENV === 'production') {
    environment = new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_CLIENT_SECRET!
    );
  } else {
    environment = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_CLIENT_SECRET!
    );
  }
  const paypalClient = new paypal.core.PayPalHttpClient(environment);

  // Payment-related endpoints
  app.post(`${apiPrefix}/payments`, async (req: Request, res: Response) => {
    try {
      const { userId, companyId, paymentData, shares, amount } = req.body;

      if (!userId || !companyId || !paymentData || !shares || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const payment = await storage.createPayment(
        userId,
        companyId,
        paymentData,
        shares,
        amount
      );

      return res.json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      return res.status(500).json({ error: "Failed to create payment" });
    }
  });

  app.put(`${apiPrefix}/payments/:id/status`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status, paymentData } = req.body;

      if (!id || !status) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const updatedPayment = await storage.updatePaymentStatus(id, status, paymentData);
      if (!updatedPayment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      return res.json(updatedPayment);
    } catch (error) {
      console.error("Error updating payment status:", error);
      return res.status(500).json({ error: "Failed to update payment status" });
    }
  });

  app.get(`${apiPrefix}/payments/company/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (!id) {
        return res.status(400).json({ error: "Invalid company ID" });
      }

      const payments = await storage.getCompanyPayments(id);
      return res.json(payments);
    } catch (error) {
      console.error("Error fetching company payments:", error);
      return res.status(500).json({ error: "Failed to fetch company payments" });
    }
  });

  // PayPal routes
  app.post(`${apiPrefix}/create-order`, async (req: Request, res: Response) => {
    try {
      const { value, description } = req.body;

      if (!value || isNaN(parseFloat(value))) {
        return res.status(400).json({ error: 'Valid value is required' });
      }

      // Create PayPal order
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'INR',
            value: value.toString()
          },
          description: description || 'ESG Portfolio Investment'
        }]
      });

      const order = await paypalClient.execute(request);
      res.json({ id: order.result.id });
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  app.post(`${apiPrefix}/capture-order`, async (req: Request, res: Response) => {
    try {
      const { orderID } = req.body;

      if (!orderID) {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      // Capture the funds from the transaction
      const request = new paypal.orders.OrdersCaptureRequest(orderID);
      request.requestBody({
        payment_source: {
          paypal: {}
        }
      });

      const capture = await paypalClient.execute(request);

      // Return captured order details
      res.json({ 
        success: true, 
        orderData: capture.result 
      });
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      res.status(500).json({ error: 'Failed to capture order' });
    }
  });

  // Companies
  // The specific routes must come before the parameterized routes

  // ESG Score Breakdown
  app.get(`${apiPrefix}/companies/esg-breakdown`, async (req: Request, res: Response) => {
    try {
      const breakdown = await storage.getCompanyESGBreakdown();
      res.json(breakdown);
    } catch (error) {
      console.error("Error fetching ESG breakdown:", error);
      res.status(500).json({ message: "Failed to fetch ESG breakdown" });
    }
  });

  // Company Comparison - make sure this is before any parameterized routes
  app.get(`${apiPrefix}/companies/comparison`, async (req: Request, res: Response) => {
    try {
      const comparison = await storage.getCompanyComparison();
      res.json(comparison);
    } catch (error) {
      console.error("Error fetching company comparison:", error);
      res.status(500).json({ message: "Failed to fetch company comparison" });
    }
  });

  // Compare companies - must be before :id routes
  app.get(`${apiPrefix}/companies/compare`, async (req: Request, res: Response) => {
    try {
      console.log("API route: /companies/compare called with query params:", req.query);

      // Simple debugging output to confirm route is being hit
      const idsParam = req.query.ids as string;
      console.log("IDs parameter:", idsParam);

      if (!idsParam) {
        console.log("API route: No company IDs provided");
        return res.json({ companies: [], prices: [] });
      }

      // Basic validation
      let companyIds: number[] = [];
      try {
        if (idsParam.includes(',')) {
          companyIds = idsParam.split(',')
            .map(id => parseInt(id.trim()))
            .filter(id => !isNaN(id) && id > 0);
        } else {
          const singleId = parseInt(idsParam.trim());
          if (!isNaN(singleId) && singleId > 0) {
            companyIds = [singleId];
          }
        }
      } catch (e) {
        console.error("Error parsing company IDs:", e);
      }

      console.log("Parsed company IDs:", companyIds);

      if (companyIds.length === 0) {
        return res.json({ companies: [], prices: [] });
      }

      // Get the companies
      const validCompanies = [];
      const validIds = [];

      for (const id of companyIds) {
        const company = await storage.getCompanyById(id);
        if (company) {
          validCompanies.push(company);
          validIds.push(id);
        } else {
          console.log(`Company with ID ${id} not found`);
        }
      }

      if (validCompanies.length === 0) {
        return res.json({ companies: [], prices: [] });
      }

      // Get price histories for each company
      const timeframe = req.query.timeframe as string || "1m";
      const priceHistories = [];

      for (const id of validIds) {
        try {
          const history = await storage.getStockPriceHistory(id, timeframe);
          if (history) {
            // Parse the price data
            const priceData = JSON.parse(history.prices);
            priceHistories.push({
              companyId: id,
              prices: priceData
            });
          }
        } catch (err) {
          console.error(`Error getting price history for company ${id}:`, err);
        }
      }

      // Return the data
      res.json({
        companies: validCompanies,
        prices: priceHistories
      });
    } catch (error) {
      console.error("Error comparing stock prices:", error);
      // Return empty data instead of an error
      res.json({ companies: [], prices: [] });
    }
  });

  // Universal company endpoint that handles both /api/company/:id and /api/companies/:id
  app.get([`${apiPrefix}/company/:id`, `${apiPrefix}/companies/:id`], async (req: Request, res: Response) => {
    try {
      const idParam = req.params.id;
      if (!idParam || isNaN(Number(idParam))) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const id = parseInt(idParam);
      const [company, buyStockData] = await Promise.all([
        storage.getCompanyById(id),
        storage.getBuyStockData(id)
      ]);

      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      if (!buyStockData) {
        return res.status(404).json({ error: "Buy stock data not found" });
      }

      return res.json({
        ...company,
        buyStockData: {
          currentPrice: buyStockData.currentPrice,
          marketCap: buyStockData.marketCap,
          weekHigh52: buyStockData.weekHigh52,
          weekLow52: buyStockData.weekLow52,
          yearlyTrend: buyStockData.yearlyTrend,
          minInvestment: buyStockData.minInvestment,
          maxInvestment: buyStockData.maxInvestment
        }
      });
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  // General company routes
  app.get(`${apiPrefix}/companies`, async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const companies = await storage.getCompanies(page, limit);
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get(`${apiPrefix}/companies/:id`, async (req: Request, res: Response) => {
    try {
      const idParam = req.params.id;
      if (!idParam || isNaN(Number(idParam))) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const id = parseInt(idParam);
      const company = await storage.getCompanyById(id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      const buyStockData = await storage.getBuyStockData(id);

      return res.json({
        ...company,
        buyStockData: buyStockData || {
          currentPrice: company.currentPrice,
          marketCap: company.marketCap,
          weekHigh52: company.yearHigh,
          weekLow52: company.yearLow,
          yearlyTrend: company.yearlyTrend,
          minInvestment: "1000",
          maxInvestment: "1000000"
        }
      });
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.post(`${apiPrefix}/companies`, async (req: Request, res: Response) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const newCompany = await storage.insertCompany(validatedData);
      res.status(201).json(newCompany);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  // Combined company details and stock price endpoint
  app.get(`${apiPrefix}/company-details/:id`, async (req: Request, res: Response) => {
    try {
      const idParam = req.params.id;
      if (!idParam || isNaN(Number(idParam))) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const id = parseInt(idParam);
      const buyStockData = await storage.getBuyStockData(id);
      if (!buyStockData) {
        return res.status(404).json({ error: "Buy stock data not found" });
      }

      // Get company data
      const company = await storage.getCompanyById(id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      return res.json({
        id: company.id,
        name: company.name,
        ticker: company.ticker,
        sector: company.sector,
        industry: company.industry,
        esgScore: company.esgScore,
        environmentalScore: company.environmentalScore,
        socialScore: company.socialScore,
        governanceScore: company.governanceScore,
        description: company.description,
        buyStockData: {
          currentPrice: buyStockData.currentPrice,
          marketCap: buyStockData.marketCap,
          weekHigh52: buyStockData.weekHigh52,
          weekLow52: buyStockData.weekLow52,
          yearlyTrend: buyStockData.yearlyTrend,
          minInvestment: buyStockData.minInvestment,
          maxInvestment: buyStockData.maxInvestment
        }
      });
    } catch (error) {
      console.error("Error fetching company details:", error);
      res.status(500).json({ message: "Failed to fetch company details" });
    }
  });

  // Sectors
  app.get(`${apiPrefix}/sectors`, async (req: Request, res: Response) => {
    try {
      const sectors = await storage.getSectors();
      res.json({ sectors });
    } catch (error) {
      console.error("Error fetching sectors:", error);
      res.status(500).json({ message: "Failed to fetch sectors" });
    }
  });

  app.post(`${apiPrefix}/sectors`, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSectorSchema.parse(req.body);
      const newSector = await storage.insertSector(validatedData);
      res.status(201).json(newSector);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating sector:", error);
      res.status(500).json({ message: "Failed to create sector" });
    }
  });

  // Sector Performance
  app.get(`${apiPrefix}/sectors/performance`, async (req: Request, res: Response) => {
    try {
      const performance = await storage.getSectorPerformance();
      res.json(performance);
    } catch (error) {
      console.error("Error fetching sector performance:", error);
      res.status(500).json({ message: "Failed to fetch sector performance" });
    }
  });

  // Portfolio Composition
  app.get(`${apiPrefix}/portfolio/composition`, async (req: Request, res: Response) => {
    try {
      const composition = await storage.getPortfolioComposition();
      res.json(composition);
    } catch (error) {
      console.error("Error fetching portfolio composition:", error);
      res.status(500).json({ message: "Failed to fetch portfolio composition" });
    }
  });

  app.post(`${apiPrefix}/portfolio/composition`, async (req: Request, res: Response) => {
    try {
      const validatedData = insertPortfolioCompositionSchema.parse(req.body);
      const newComposition = await storage.insertPortfolioComposition(validatedData);
      res.status(201).json(newComposition);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating portfolio composition:", error);
      res.status(500).json({ message: "Failed to create portfolio composition" });
    }
  });

  // Portfolio Summary
  app.get(`${apiPrefix}/portfolio/summary`, async (req: Request, res: Response) => {
    try {
      const summary = await storage.getPortfolioSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching portfolio summary:", error);
      res.status(500).json({ message: "Failed to fetch portfolio summary" });
    }
  });

  app.post(`${apiPrefix}/portfolio/summary`, async (req: Request, res: Response) => {
    try {
      const validatedData = insertPortfolioSummarySchema.parse(req.body);
      const newSummary = await storage.updatePortfolioSummary(validatedData);
      res.status(201).json(newSummary);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating portfolio summary:", error);
      res.status(500).json({ message: "Failed to update portfolio summary" });
    }
  });

  // Sustainability Trends
  app.get(`${apiPrefix}/portfolio/sustainability-trend`, async (req: Request, res: Response) => {
    try {
      const trends = await storage.getSustainabilityTrends();
      res.json(trends);
    } catch (error) {
      console.error("Error fetching sustainability trends:", error);
      res.status(500).json({ message: "Failed to fetch sustainability trends" });
    }
  });

  app.post(`${apiPrefix}/portfolio/sustainability-trend`, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSustainabilityTrendSchema.parse(req.body);
      const newTrend = await storage.insertSustainabilityTrend(validatedData);
      res.status(201).json(newTrend);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating sustainability trend:", error);
      res.status(500).json({ message: "Failed to create sustainability trend" });
    }
  });

  // Purchase Stock API
  app.post(`${apiPrefix}/portfolio/purchase`, async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { companyId, shares, amount } = req.body;

      // Validate request data
      if (!companyId || !shares || !amount) {
        return res.status(400).json({ message: "Missing required fields: companyId, shares, and amount are required" });
      }

      if (shares <= 0 || amount <= 0) {
        return res.status(400).json({ message: "Shares and amount must be positive numbers" });
      }

      // Check if company exists
      const company = await storage.getCompanyById(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      // In a real application, update user's portfolio with purchased stocks
      // Here we'll just return a success response

      // Insert into portfolio_composition if needed
      try {
        // Check if this sector already exists in the portfolio
        const portfolio = await storage.getPortfolioComposition();
        const existingSector = portfolio.sectors.find((s: any) => s.name === company.sector);

        if (!existingSector) {
          // Add this sector to portfolio composition
          await storage.insertPortfolioComposition({
            sector: company.sector,
            percentage: "100", // Will need to be recalculated in real app
          });
        } else {
          // In a real app, you would update the existing sector value and percentage
          // This is just a placeholder for demonstration
        }

        // Update portfolio summary with purchase
        const summary = await storage.getPortfolioSummary();
        if (summary) {
          const esgImpact = (company.esgScore / 100) * amount; // Calculate ESG impact
          const totalValue = parseFloat(summary.totalValue?.toString() || '0') + parseFloat(amount.toString());
          const sustainableValue = parseFloat(summary.sustainableValue?.toString() || '0') + (company.esgScore >= 70 ? parseFloat(amount.toString()) : 0);

          // Calculate sustainable percentage
          const sustainablePercentage = Math.round((sustainableValue / totalValue) * 100);

          await storage.updatePortfolioSummary({
            totalValue: totalValue.toString(),
            sustainableValue: sustainableValue.toString(),
            sustainablePercentage: sustainablePercentage,
            portfolioScore: summary.portfolioScore + Math.round(esgImpact / 100), 
            scoreChange: summary.scoreChange.toString(),
            carbonOffset: (parseFloat(summary.carbonOffset?.toString() || '0') + (company.environmentalScore / 10)).toString(),
            offsetChange: summary.offsetChange.toString(),
            esgCompanies: summary.esgCompanies,
            totalCompanies: summary.totalCompanies
          });
        }
      } catch (err) {
        console.error("Error updating portfolio data:", err);
        // Continue execution - don't fail the purchase if portfolio update fails
      }

      res.status(200).json({ 
        success: true, 
        message: `Successfully purchased ${shares} shares of ${company.name} for ₹${amount}` 
      });
    } catch (error) {
      console.error("Error purchasing stock:", error);
      res.status(500).json({ message: "Failed to process stock purchase" });
    }
  });

  // Stock Price History
  app.get(`${apiPrefix}/companies/:id/price-history`, async (req: Request, res: Response) => {
    try {
      const idParam = req.params.id;
      const timeframe = req.query.timeframe as string || "1m";

      // Validate that id is a valid number
      if (!idParam || isNaN(Number(idParam))) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const id = parseInt(idParam);
      const company = await storage.getCompanyById(id);

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const priceHistory = await storage.getStockPriceHistory(id, timeframe);

      if (!priceHistory) {
        return res.status(404).json({ message: "Price history not found for this timeframe" });
      }

      // Parse the price data string to get the array of price data points
      const priceData = JSON.parse(priceHistory.prices);

      // Transform the raw price data from seed.ts format (which has nested objects) to simple date/price pairs
      const prices = priceData.map((item: { price: number, date: string }, index: number) => {
        return {
          date: new Date(item.date).toISOString().split('T')[0], // Format as YYYY-MM-DD
          price: item.price
        };
      });

      res.json({
        companyId: id,
        companyName: company.name,
        timeframe,
        prices: prices
      });
    } catch (error) {
      console.error("Error fetching price history:", error);
      res.status(500).json({ message: "Failed to fetch price history" });
    }
  });

  app.get(`${apiPrefix}/companies/:id/all-price-history`, async (req: Request, res: Response) => {
    try {
      const idParam = req.params.id;

      // Validate that id is a valid number
      if (!idParam || isNaN(Number(idParam))) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const id = parseInt(idParam);
      const company = await storage.getCompanyById(id);

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const priceHistories = await storage.getAllStockPriceHistory(id);

      res.json({
        companyId: id,
        companyName: company.name,
        ...priceHistories
      });
    } catch (error) {
      console.error("Error fetching all price histories:", error);
      res.status(500).json({ message: "Failed to fetch price histories" });
    }
  });

  app.post(`${apiPrefix}/companies/:id/price-history`, async (req: Request, res: Response) => {
    try {
      const idParam = req.params.id;

      // Validate that id is a valid number
      if (!idParam || isNaN(Number(idParam))) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const id = parseInt(idParam);
      const company = await storage.getCompanyById(id);

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const validatedData = insertStockPriceHistorySchema.parse({
        ...req.body,
        companyId: id
      });

      const priceHistory = await storage.insertStockPriceHistory(validatedData);
      res.status(201).json(priceHistory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating price history:", error);
      res.status(500).json({ message: "Failed to create price history" });
    }
  });

  app.get(`${apiPrefix}/companies/compare`, async (req: Request, res: Response) => {
    try {
      console.log("API route: /companies/compare called with query params:", req.query);
      const companyIdsParam = req.query.ids as string;

      if (!companyIdsParam) {
        console.log("API route: No company IDs provided");
        // Return empty data instead of an error
        return res.json({ companies: [], prices: [] });
      }

      // Handle single ID case - if there's only one ID, it won't be an array
      let companyIds: number[] = [];
      if (companyIdsParam.includes(',')) {
        companyIds = companyIdsParam.split(',')
          .map(id => parseInt(id.trim()))
          .filter(id => !isNaN(id) && id > 0);
      } else {
        const singleId = parseInt(companyIdsParam.trim());
        if (!isNaN(singleId) && singleId > 0) {
          companyIds = [singleId];
        }
      }

      console.log("API route: Parsed company IDs:", companyIds);

      if (companyIds.length === 0) {
        console.log("API route: No valid company IDs found after parsing");
        return res.json({ companies: [], prices: [] });
      }

      // Get company data - do this sequentially to avoid any race conditions
      const validCompanies = [];
      const validCompanyIds = [];

      for (const id of companyIds) {
        const company = await storage.getCompanyById(id);
        if (company) {
          validCompanies.push(company);
          validCompanyIds.push(id);
        }
      }

      console.log("API route: Found", validCompanies.length, "valid companies:", validCompanyIds);

      if (validCompanies.length === 0) {
        console.log("API route: No valid companies found in database");
        return res.json({ companies: [], prices: [] });
      }

      const timeframe = req.query.timeframe as string || "1m";

      // Collect price histories for each company
      const priceHistories = [];

      for (const id of validCompanyIds) {
        try {
          const history = await storage.getStockPriceHistory(id, timeframe);
          if (history) {
            // Parse the price data string to get the array of price data points
            const priceData = JSON.parse(history.prices);

            priceHistories.push({
              companyId: id,
              prices: priceData.map((item: { price: number, date: string }) => ({
                date: new Date(item.date).toISOString().split('T')[0], // Format as YYYY-MM-DD
                price: item.price
              }))
            });
          }
        } catch (err) {
          console.error(`Error getting price history for company ${id}:`, err);
        }
      }

      console.log("API route: Successfully retrieved comparison data with", priceHistories.length, "price histories");

      res.json({
        companies: validCompanies,
        prices: priceHistories || []
      });
    } catch (error) {
      console.error("Error comparing stock prices:", error);
      res.status(500).json({ message: "Failed to compare stock prices" });
    }
  });

  // Buy Stock Data Endpoint
  app.get(`${apiPrefix}/buy-stock-data/:id`, async (req: Request, res: Response) => {
    try {
      const idParam = req.params.id;
      if (!idParam || isNaN(Number(idParam))) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const id = parseInt(idParam);
      const buyStockData = await storage.getBuyStockData(id);
      if (!buyStockData) {
        return res.status(404).json({ error: "Buy stock data not found" });
      }

      // Get company data
      const company = await storage.getCompanyById(id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      return res.json({
        id: company.id,
        name: company.name,
        ticker: company.ticker,
        sector: company.sector,
        esgScore: company.esgScore,
        environmentalScore: company.environmentalScore,
        socialScore: company.socialScore,
        governanceScore: company.governanceScore,
        yearlyTrend: company.yearlyTrend,
        currentPrice: parseFloat(company.currentPrice),
        marketCap: parseFloat(company.marketCap),
        yearHigh: parseFloat(company.yearHigh),
        yearLow: parseFloat(company.yearLow),
        dividendYield: company.dividendYield,
        peRatio: company.peRatio,
        description: company.description,
        buyStockData: {
          currentPrice: buyStockData.currentPrice,
          marketCap: buyStockData.marketCap,
          weekHigh52: buyStockData.weekHigh52,
          weekLow52: buyStockData.weekLow52,
          yearlyTrend: buyStockData.yearlyTrend,
          minInvestment: buyStockData.minInvestment,
          maxInvestment: buyStockData.maxInvestment,
        },
      });
    } catch (error) {
      console.error("Error fetching buy stock data:", error);
      res.status(500).json({ message: "Failed to fetch buy stock data" });
    }
  });

  // Update Buy Stock Data Endpoint (for admin use)
  app.post(`${apiPrefix}/buy-stock-data/:id`, async (req: Request, res: Response) => {
    try {
      const idParam = req.params.id;
      if (!idParam || isNaN(Number(idParam))) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const id = parseInt(idParam);
      const updatedData = await storage.updateBuyStockData(id, req.body);

      if (!updatedData) {
        return res.status(500).json({ message: "Failed to update buy stock data" });
      }

      res.json(updatedData);
    } catch (error) {
      console.error("Error updating buy stock data:", error);
      res.status(500).json({ message: "Failed to update buy stock data" });
    }
  });

  // Gemini-powered AI Features

  // AI Investment Insights for stock comparison
  app.get(`${apiPrefix}/ai/insights`, async (req: Request, res: Response) => {
    try {
      const idsParam = req.query.ids as string;
      const timeframe = req.query.timeframe as string || "1m";

      if (!idsParam) {
        return res.status(400).json({ message: "Company IDs required" });
      }

      // Parse company IDs
      let companyIds: number[] = [];
      if (idsParam.includes(',')) {
        companyIds = idsParam.split(',')
          .map(id => parseInt(id.trim()))
          .filter(id => !isNaN(id) && id > 0);
      } else {
        const singleId = parseInt(idsParam.trim());
        if (!isNaN(singleId) && singleId > 0) {
          companyIds = [singleId];
        }
      }

      if (companyIds.length === 0) {
        return res.status(400).json({ message: "No valid company IDs provided" });
      }

      // Get company data
      const companies = [];
      const priceData = [];

      for (const id of companyIds) {
        const company = await storage.getCompanyById(id);
        if (company) {
          companies.push(company);

          try {
            const history = await storage.getStockPriceHistory(id, timeframe);
            if (history) {
              const prices = JSON.parse(history.prices);
              priceData.push({
                companyId: id,
                prices
              });
            }
          } catch (err) {
            console.error(`Error getting price history for company ${id}:`, err);
          }
        }
      }

      if (companies.length === 0) {
        return res.status(404).json({ message: "No companies found" });
      }

      // Generate insights with Gemini
      const insights = await generateInvestmentInsights({
        companies,
        timeframe,
        priceData
      });

      res.json({ insights });
    } catch (error) {
      console.error("Error generating investment insights:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  // Investor Assistant Chatbot
  app.post(`${apiPrefix}/ai/chat`, async (req: Request, res: Response) => {
    try {
      const { message, userName, previousMessages } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Generate chat response with Gemini
      const chatResponse = await chatWithInvestorAssistant({
        userMessage: message,
        userName: userName || "Investor",
        previousMessages: previousMessages || []
      });

      res.json({ response: chatResponse });
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // User Activity History
  app.get(`${apiPrefix}/user/activity-history`, async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user?.id;
      const type = req.query.type as string;

      let activityData: any = {};

      if (!type || type === 'all') {
        // Fetch all types of activities
        const [
          loginRecords,
          actions,
          orders,
          chats,
          comparisons
        ] = await Promise.all([
          db.query.userLoginRecords.findMany({
            where: eq(userLoginRecords.userId, userId),
            orderBy: [desc(userLoginRecords.loginTimestamp)]
          }),
          db.query.userActions.findMany({
            where: eq(userActions.userId, userId),
            orderBy: [desc(userActions.timestamp)]
          }),
          db.query.orderHistory.findMany({
            where: eq(orderHistory.userId, userId),
            orderBy: [desc(orderHistory.timestamp)]
          }),
          db.query.chatRecords.findMany({
            where: or(
              eq(chatRecords.senderId, userId),
              eq(chatRecords.receiverId, userId)
            ),
            orderBy: [desc(chatRecords.timestamp)]
          }),
          db.query.comparisonHistory.findMany({
            where: eq(comparisonHistory.userId, userId),
            orderBy: [desc(comparisonHistory.timestamp)]
          })
        ]);

        activityData = {
          loginRecords,
          actions,
          orders,
          chats,
          comparisons
        };
      } else {
        // Fetch specific type of activity
        switch(type) {
          case 'login':
            activityData = await db.query.userLoginRecords.findMany({
              where: eq(userLoginRecords.userId, userId),
              orderBy: [desc(userLoginRecords.loginTimestamp)]
            });
            break;
          case 'actions':
            activityData = await db.query.userActions.findMany({
              where: eq(userActions.userId, userId),
              orderBy: [desc(userActions.timestamp)]
            });
            break;
          case 'orders':
            activityData = await db.query.orderHistory.findMany({
              where: eq(orderHistory.userId, userId),
              orderBy: [desc(orderHistory.timestamp)]
            });
            break;
          case 'chats':
            activityData = await db.query.chatRecords.findMany({
              where: or(
                eq(chatRecords.senderId, userId),
                eq(chatRecords.receiverId, userId)
              ),
              orderBy: [desc(chatRecords.timestamp)]
            });
            break;
          case 'comparisons':
            activityData = await db.query.comparisonHistory.findMany({
              where: eq(comparisonHistory.userId, userId),
              orderBy: [desc(comparisonHistory.timestamp)]
            });
            break;
          default:
            return res.status(400).json({ message: "Invalid activity type" });
        }
      }

      res.json(activityData);
    } catch (error) {
      console.error("Error fetching user activity history:", error);
      res.status(500).json({ message: "Failed to fetch activity history" });
    }
  });

  // Generate PDF of activity history
  app.get(`${apiPrefix}/user/activity-history/pdf`, async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user?.id;
      const type = req.query.type as string;

      // Fetch activity data (reuse logic from above)
      // Generate PDF using html-pdf or similar library
      // Send PDF as response

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=activity-history.pdf');

      // Here you would generate and stream the PDF
      // This is a placeholder response
      res.json({ message: "PDF generation endpoint" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
import { db } from "@db";
import { eq, desc, and } from "drizzle-orm";
import fs from 'fs/promises';
import path from 'path';
import { 
  companies,
  sectors,
  portfolioComposition,
  portfolioSummary,
  sustainabilityTrends,
  stockPriceHistory,
  InsertCompany,
  InsertSector,
  InsertPortfolioComposition,
  InsertPortfolioSummary,
  InsertSustainabilityTrend,
  InsertStockPriceHistory,
  buyStockData
} from "@shared/schema";

async function readJsonFile(filename: string) {
  try {
    const filePath = path.join(process.cwd(), 'db-export', filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
}

async function writeJsonFile(filename: string, data: any) {
  try {
    const filePath = path.join(process.cwd(), 'db-export', filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
  }
}

// Companies
export async function getCompanies(page = 1, limit = 5) {
  try {
    const offset = (page - 1) * limit;
    try {
      const companiesData = await db.query.companies.findMany({
        orderBy: [desc(companies.esgScore)],
        limit,
        offset,
      });

      const totalCount = await db.$client.query('SELECT COUNT(*) FROM companies');
      const total = totalCount?.rows?.[0]?.count ? parseInt(totalCount.rows[0].count) : 0;

      return {
        companies: companiesData,
        pagination: {
          total,
          page,
          limit,
          from: total > 0 ? offset + 1 : 0,
          to: Math.min(offset + limit, total),
          hasNextPage: offset + limit < total,
        }
      };
    } catch (dbError) {
      // Fallback to JSON file if database is unavailable
      console.log("Database unavailable, falling back to JSON file");
      const companiesData = await readJsonFile('companies.json');
      if (!companiesData) throw new Error("JSON fallback failed");

      const total = companiesData.length;
      const paginatedCompanies = companiesData.slice(offset, offset + limit);

      return {
        companies: paginatedCompanies,
        pagination: {
          total,
          page,
          limit,
          from: total > 0 ? offset + 1 : 0,
          to: Math.min(offset + limit, total),
          hasNextPage: offset + limit < total,
        }
      };
    }
  } catch (error) {
    console.error("Error in getCompanies:", error);
    return {
      companies: [],
      pagination: {
        total: 0,
        page,
        limit,
        from: 0,
        to: 0,
        hasNextPage: false,
      }
    };
  }
}

export async function getCompanyById(id: number) {
  // Validate ID to prevent NaN errors
  if (isNaN(id) || id <= 0) {
    return null;
  }

  try {
    const company = await db.query.companies.findFirst({
      where: eq(companies.id, id)
    });
    return company;
  } catch (error) {
    console.error("Error in getCompanyById:", error);
    return null;
  }
}

export async function insertCompany(data: InsertCompany) {
  const [newCompany] = await db.insert(companies).values(data).returning();
  return newCompany;
}

// Company ESG Breakdown
export async function getCompanyESGBreakdown(limit = 5) {
  try {
    const result = await db.execute(
      `SELECT name, environmental_score, social_score, governance_score
       FROM companies 
       ORDER BY esg_score DESC 
       LIMIT ${limit}`
    );
    const companiesData = result.rows;

    return {
      companies: companiesData.map(company => ({
        name: company.name,
        environmental: company.environmental_score,
        social: company.social_score,
        governance: company.governance_score,
      })),
    };
  } catch (error) {
    console.error("Error in getCompanyESGBreakdown:", error);
    return { companies: [] };
  }
}

// Company Comparison
export async function getCompanyComparison() {
  try {
    const companiesData = await db.query.companies.findMany({
      limit: 3,
      orderBy: [desc(companies.esgScore)],
    });

    if (!companiesData || companiesData.length === 0) {
      return { companies: [], categories: [] };
    }

    // Categories for radar chart
    const categories = [
      { name: "Environmental", values: companiesData.map(c => c.environmentalScore) },
      { name: "Social", values: companiesData.map(c => c.socialScore) },
      { name: "Governance", values: companiesData.map(c => c.governanceScore) },
      { name: "Carbon Reduction", values: [88, 85, 86] },
      { name: "Innovation", values: [95, 82, 79] },
      { name: "Transparency", values: [79, 84, 75] },
    ];

    return {
      companies: companiesData,
      categories: categories,
    };
  } catch (error) {
    console.error("Error in getCompanyComparison:", error);
    return { companies: [], categories: [] };
  }
}

// Sectors
export async function getSectors() {
  return db.query.sectors.findMany({
    orderBy: [desc(sectors.esgScore)],
  });
}

export async function getSectorById(id: number) {
  // Validate ID to prevent NaN errors
  if (isNaN(id) || id <= 0) {
    return null;
  }

  try {
    return await db.query.sectors.findFirst({
      where: eq(sectors.id, id),
    });
  } catch (error) {
    console.error("Error in getSectorById:", error);
    return null;
  }
}

export async function insertSector(data: InsertSector) {
  const [newSector] = await db.insert(sectors).values(data).returning();
  return newSector;
}

// Sector Performance
export async function getSectorPerformance() {
  const sectorsData = await db.query.sectors.findMany({
    orderBy: [desc(sectors.esgScore)],
  });

  return {
    sectors: sectorsData.map(sector => ({
      name: sector.name,
      score: sector.esgScore,
    })),
  };
}

// Portfolio Composition
export async function getPortfolioComposition() {
  const compositionData = await db.query.portfolioComposition.findMany();

  return {
    sectors: compositionData.map(item => ({
      name: item.sector,
      value: parseFloat(item.percentage.toString()),
    })),
  };
}

export async function insertPortfolioComposition(data: InsertPortfolioComposition) {
  const [newComposition] = await db.insert(portfolioComposition).values(data).returning();
  return newComposition;
}

// Portfolio Summary
export async function getPortfolioSummary() {
  const summary = await db.query.portfolioSummary.findFirst();
  return summary;
}

export async function updatePortfolioSummary(data: InsertPortfolioSummary) {
  // Delete existing summary before inserting new one (only keep one record)
  await db.delete(portfolioSummary);
  const [newSummary] = await db.insert(portfolioSummary).values(data).returning();
  return newSummary;
}

// Sustainability Trends
export async function getSustainabilityTrends() {
  const trends = await db.query.sustainabilityTrends.findMany();

  return {
    trends: trends.map(trend => ({
      month: trend.month,
      esgScore: trend.esgScore,
      greenInvestments: trend.greenInvestments,
    })),
  };
}

export async function insertSustainabilityTrend(data: InsertSustainabilityTrend) {
  const [newTrend] = await db.insert(sustainabilityTrends).values(data).returning();
  return newTrend;
}

// Stock Price History
export async function getStockPriceHistory(companyId: number, timeframe: string = "1m") {
  try {
    // Validate IDs to prevent NaN errors
    if (isNaN(companyId) || companyId <= 0) {
      return null;
    }

    const priceHistory = await db.query.stockPriceHistory.findFirst({
      where: and(
        eq(stockPriceHistory.companyId, companyId),
        eq(stockPriceHistory.timeframe, timeframe)
      )
    });

    return priceHistory;
  } catch (error) {
    console.error("Error getting stock price history:", error);
    return null;
  }
}

export async function getAllStockPriceHistory(companyId: number) {
  try {
    // Validate IDs to prevent NaN errors
    if (isNaN(companyId) || companyId <= 0) {
      return { timeframes: [] };
    }

    const priceHistories = await db.query.stockPriceHistory.findMany({
      where: eq(stockPriceHistory.companyId, companyId)
    });

    return {
      timeframes: priceHistories.map(history => ({
        timeframe: history.timeframe,
        prices: JSON.parse(history.prices)
      }))
    };
  } catch (error) {
    console.error("Error getting all stock price history:", error);
    return { timeframes: [] };
  }
}

export async function compareStockPrices(companyIds: number[], timeframe: string = "1m") {
  try {
    console.log("Storage: compareStockPrices called with IDs:", companyIds, "and timeframe:", timeframe);

    // Filter out invalid IDs
    const validCompanyIds = companyIds.filter(id => !isNaN(id) && id > 0);

    console.log("Storage: validCompanyIds:", validCompanyIds);

    if (validCompanyIds.length === 0) {
      console.log("Storage: No valid company IDs found");
      return { companies: [], prices: [] };
    }

    // Get company data
    const companyData = await Promise.all(
      validCompanyIds.map(id => db.query.companies.findFirst({
        where: eq(companies.id, id)
      }))
    );

    console.log("Storage: companyData retrieved:", companyData.length, "companies");

    // Get price histories - look up each company's price data for the specified timeframe
    const priceHistories = await Promise.all(
      validCompanyIds.map(async (id) => {
        const history = await db.query.stockPriceHistory.findFirst({
          where: and(
            eq(stockPriceHistory.companyId, id),
            eq(stockPriceHistory.timeframe, timeframe)
          )
        });
        console.log(`Storage: Price history for company ID ${id}, timeframe ${timeframe}:`, history ? "Found" : "Not found");
        return history;
      })
    );

    // Filter out null values and map to the required format
    const validCompanies = companyData.filter(company => company !== null);
    const validPrices = priceHistories
      .filter(history => history !== null)
      .map(history => {
        try {
          return {
            companyId: history!.companyId,
            prices: JSON.parse(history!.prices)
          };
        } catch (e) {
          console.error(`Error parsing prices for company ${history!.companyId}:`, e);
          return {
            companyId: history!.companyId,
            prices: []
          };
        }
      });

    console.log("Storage: Returning comparison data with", validCompanies.length, "companies and", validPrices.length, "price histories");

    return {
      companies: validCompanies,
      prices: validPrices
    };
  } catch (error) {
    console.error("Error comparing stock prices:", error);
    return { companies: [], prices: [] };
  }
}

export async function insertStockPriceHistory(data: InsertStockPriceHistory) {
  try {
    // Check if record already exists for this company and timeframe
    const existingRecord = await db.query.stockPriceHistory.findFirst({
      where: and(
        eq(stockPriceHistory.companyId, data.companyId),
        eq(stockPriceHistory.timeframe, data.timeframe)
      )
    });

    if (existingRecord) {
      // Update existing record
      const [updatedRecord] = await db
        .update(stockPriceHistory)
        .set({ 
          prices: data.prices, 
          updatedAt: new Date() 
        })
        .where(and(
          eq(stockPriceHistory.companyId, data.companyId),
          eq(stockPriceHistory.timeframe, data.timeframe)
        ))
        .returning();

      return updatedRecord;
    } else {
      // Insert new record
      const [newRecord] = await db.insert(stockPriceHistory).values(data).returning();
      return newRecord;
    }
  } catch (error) {
    console.error("Error inserting stock price history:", error);
    throw error;
  }
}

// Buy Stock Data Functions
export async function getBuyStockData(companyId: number): Promise<BuyStockData | null> {
  try {
    const data = await db
      .select()
      .from(buyStockData)
      .where(eq(buyStockData.companyId, companyId))
      .orderBy(desc(buyStockData.updatedAt))
      .limit(1);

    if (data && data.length > 0) {
      return data[0];
    }

    // If no data exists, get company data to create default
    const company = await db.query.companies.findFirst({
      where: eq(companies.id, companyId)
    });

    if (!company) {
      throw new Error(`Company with ID ${companyId} not found`);
    }

    const defaultData = {
      companyId,
      currentPrice: company.currentPrice || "0",
      marketCap: company.marketCap || "0",
      weekHigh52: company.yearHigh || "0", 
      weekLow52: company.yearLow || "0",
      yearlyTrend: company.yearlyTrend?.toString() || "0",
      minInvestment: "1000",
      maxInvestment: "1000000",
      updatedAt: new Date()
    };

    const [inserted] = await db.insert(buyStockData)
      .values(defaultData)
      .returning();

    return inserted;
  } catch (error) {
    console.error(`Error fetching buy stock data for company ${companyId}:`, error);
    throw new Error(`Failed to fetch buy stock data: ${error.message}`);
  }
}

export async function updateBuyStockData(
  companyId: number,
  data: {
    currentPrice: number;
    marketCap?: number;
    weekHigh52?: number;
    weekLow52?: number;
    yearlyTrend?: number;
  }
): Promise<BuyStockData | null> {
  // Validate required fields
  if (!data.currentPrice || isNaN(data.currentPrice)) {
    throw new Error("currentPrice is required and must be a valid number");
  }

  try {
    const result = await db.transaction(async (tx) => {
      // First check if company exists
      const company = await db.query.companies.findFirst({
        where: eq(companies.id, companyId)
      });

      if (!company) {
        throw new Error(`Company with ID ${companyId} not found`);
      }

      // Check if buy stock data exists
      const existingData = await db.query.buyStockData.findFirst({
        where: eq(buyStockData.companyId, companyId)
      });

      if (existingData) {
        // Update existing record
        const [updated] = await db.update(buyStockData)
          .set({
            currentPrice: data.currentPrice,
            marketCap: data.marketCap || company.marketCap || "0",
            weekHigh52: data.weekHigh52 || "0",
            weekLow52: data.weekLow52 || "0",
            yearlyTrend: data.yearlyTrend || "0",
            updatedAt: new Date(),
          })
          .where(eq(buyStockData.companyId, companyId))
          .returning();
        return updated;
      } else {
        // Insert new record
        const [inserted] = await db.insert(buyStockData)
          .values({
            companyId,
            currentPrice: data.currentPrice,
            marketCap: data.marketCap || company.marketCap || "0",
            weekHigh52: data.weekHigh52 || "0",
            weekLow52: data.weekLow52 || "0",
            yearlyTrend: data.yearlyTrend || "0",
            minInvestment: "1000",
            maxInvestment: "1000000",
            updatedAt: new Date(),
          })
          .returning();
        return inserted;
      }
    });

    return result;
  } catch (error) {
    console.error(`Error updating buy stock data for company ${companyId}:`, error);
    throw new Error(`Failed to update buy stock data: ${error.message}`);
  }
}

// Payment handling
import { payments, users, companies } from '../shared/schema';
export async function createPayment(userId: number, companyId: number, paymentData: any, shares: number, amount: number) {
  try {
    // Get current buy stock data to validate the purchase
    const buyStock = await getBuyStockData(companyId);
    if (!buyStock) {
      throw new Error('No buy stock data found for this company');
    }

    // Validate the purchase amount against min/max investment
    if (amount < buyStock.minInvestment || amount > buyStock.maxInvestment) {
      throw new Error('Purchase amount is outside allowed range');
    }

    const payment = await db
      .insert(payments)
      .values({
        userId,
        companyId,
        amount: parseFloat(amount.toFixed(2)),
        shares,
        paymentData: JSON.stringify(paymentData),
        status: 'pending',
      })
      .returning();

    return payment[0];
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

export async function updatePaymentStatus(paymentId: number, status: string, paymentData?: any) {
  try {
    const payment = await db
      .update(payments)
      .set({
        status,
        paymentData: paymentData ? JSON.stringify(paymentData) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId))
      .returning();

    return payment[0];
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

export async function getPaymentHistory(userId: number) {
  try {
    const history = await db.select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
    return history;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
}

export async function getCompanyPayments(companyId: number) {
  try {
    const payments = await db
      .select()
      .from(payments)
      .where(eq(payments.companyId, companyId))
      .orderBy(desc(payments.createdAt));
    return payments;
  } catch (error) {
    console.error('Error fetching company payments:', error);
    throw error;
  }
}
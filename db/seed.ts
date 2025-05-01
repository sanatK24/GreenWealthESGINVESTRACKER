import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from "./index.js";
import * as schema from "../shared/schema.js";
import { insertCompanySchema, insertSectorSchema, insertPortfolioCompositionSchema, insertPortfolioSummarySchema, insertSustainabilityTrendSchema, insertBuyStockDataSchema } from "../shared/schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { eq, and } from "drizzle-orm";

async function seed() {
  try {
    console.log("Seeding database...");
    
    // Let's just proceed with seeding - the insert will fail if data already exists 
    // due to unique constraints, which will prevent duplicate data
    console.log("Proceeding with seeding...");
    
    // Seed companies
    const companiesData = [
      {
        name: "Tesla, Inc.",
        ticker: "TSLA",
        sector: "Electric Vehicles",
        industry: "Automotive",
        esgScore: 86,
        environmentalScore: 92,
        socialScore: 76,
        governanceScore: 82,
        yearlyTrend: 8,
        currentPrice: "5425.00",
        marketCap: "1725750000000",
        yearHigh: "6100.50",
        yearLow: "4500.00",
        dividendYield: "0",
        peRatio: "75.2",
        description: "Tesla, Inc. designs, develops, manufactures, and sells electric vehicles, energy generation and storage systems. The company operates in renewable energy and electric vehicle manufacturing with a focus on sustainability.",
      },
      {
        name: "First Solar",
        ticker: "FSLR",
        sector: "Renewable Energy",
        industry: "Solar Energy",
        esgScore: 91,
        environmentalScore: 93,
        socialScore: 89,
        governanceScore: 87,
        yearlyTrend: 4,
        currentPrice: "1825.75",
        marketCap: "195250000000",
        yearHigh: "2250.00",
        yearLow: "1500.00",
        dividendYield: "0.8",
        peRatio: "42.3",
        description: "First Solar, Inc. provides solar energy solutions worldwide. It operates through Modules and Systems segments, focusing on photovoltaic solar energy solutions that help reduce environmental impact.",
      },
      {
        name: "Beyond Meat",
        ticker: "BYND",
        sector: "Food Products",
        industry: "Food Processing",
        esgScore: 78,
        environmentalScore: 82,
        socialScore: 80,
        governanceScore: 72,
        yearlyTrend: 6,
        currentPrice: "825.25",
        marketCap: "52300000000",
        yearHigh: "1150.75",
        yearLow: "600.00",
        dividendYield: "0",
        peRatio: "0",
        description: "Beyond Meat, Inc. offers plant-based meat substitutes. The company produces alternatives to animal-based meat products, including plant-based beef, pork, and poultry with a mission to improve human health, positively impact climate change, and promote animal welfare.",
      },
      {
        name: "Microsoft",
        ticker: "MSFT",
        sector: "Technology",
        industry: "Software",
        esgScore: 75,
        environmentalScore: 80,
        socialScore: 78,
        governanceScore: 68,
        yearlyTrend: 3,
        currentPrice: "32150.50",
        marketCap: "2392000000000",
        yearHigh: "35000.25",
        yearLow: "25000.00",
        dividendYield: "0.85",
        peRatio: "32.7",
        description: "Microsoft Corporation is a technology company that develops and supports software, services, devices, and solutions worldwide. The company has committed to being carbon negative by 2030 and removing all historical carbon emissions by 2050.",
      },
      {
        name: "Ørsted",
        ticker: "ORSTED.CO",
        sector: "Renewable Energy",
        industry: "Electric Utilities",
        esgScore: 88,
        environmentalScore: 95,
        socialScore: 87,
        governanceScore: 89,
        yearlyTrend: 2,
        currentPrice: "4250.75",
        marketCap: "178500000000",
        yearHigh: "5150.25",
        yearLow: "3500.00",
        dividendYield: "3.2",
        peRatio: "16.8",
        description: "Ørsted A/S develops, constructs, and operates offshore and onshore wind farms, solar farms, energy storage facilities, and bioenergy plants. It is one of the world's largest renewable energy companies and has transformed from a fossil-fuel intensive utility to a global green energy leader.",
      },
      // New companies from provided data
      {
        name: "Adani Green Energy",
        ticker: "ADG",
        sector: "Renewable Energy",
        industry: "Renewable Energy",
        esgScore: 75,
        environmentalScore: 79,
        socialScore: 60,
        governanceScore: 54,
        yearlyTrend: 5,
        currentPrice: "1250.00",
        marketCap: "20000000000",
        yearHigh: "1500.00",
        dividendYield: "1.5",
        peRatio: "18.0",
        description: "Adani Green Energy is one of India's largest renewable energy companies focusing on solar and wind power generation with a mission to become the world's largest solar power company by 2025.",
      },
      {
        name: "NextEra Energy",
        ticker: "NEE",
        sector: "Renewable Energy",
        industry: "Electric Utilities",
        esgScore: 85,
        environmentalScore: 90,
        socialScore: 73,
        governanceScore: 78,
        yearlyTrend: 6,
        currentPrice: "85.00",
        marketCap: "200000000000",
        yearHigh: "100.00",
        yearLow: "70.00",
        dividendYield: "2.5",
        peRatio: "25.0",
        description: "NextEra Energy is a leading clean energy company focused on renewable energy generation and distribution, with significant investments in wind and solar power.",
      },
      {
        name: "Iberdrola",
        ticker: "IBE.MC",
        sector: "Renewable Energy",
        industry: "Electric Utilities",
        esgScore: 80,
        environmentalScore: 84,
        socialScore: 76,
        governanceScore: 80,
        yearlyTrend: 3,
        currentPrice: "10.00",
        marketCap: "80000000000",
        yearHigh: "12.00",
        yearLow: "8.00",
        dividendYield: "3.0",
        peRatio: "20.0",
        description: "Iberdrola is a global leader in renewable energy, focusing on wind and solar power generation with operations in multiple countries.",
      },
      {
        name: "Vestas Wind Systems",
        ticker: "VWS.CO",
        sector: "Renewable Energy",
        industry: "Wind Energy",
        esgScore: 82,
        environmentalScore: 87,
        socialScore: 73,
        governanceScore: 66,
        yearlyTrend: 4,
        currentPrice: "150.00",
        marketCap: "40000000000",
        yearHigh: "180.00",
        yearLow: "120.00",
        dividendYield: "1.0",
        peRatio: "15.0",
        description: "Vestas is a global leader in wind turbine manufacturing and wind energy solutions, providing sustainable energy solutions worldwide.",
      },
      {
        name: "Enphase Energy",
        ticker: "ENPH",
        sector: "Renewable Energy",
        industry: "Solar Energy",
        esgScore: 78,
        environmentalScore: 82,
        socialScore: 83,
        governanceScore: 67,
        yearlyTrend: 7,
        currentPrice: "120.00",
        marketCap: "30000000000",
        yearHigh: "150.00",
        yearLow: "90.00",
        dividendYield: "0.5",
        peRatio: "30.0",
        description: "Enphase Energy provides solar microinverter systems and energy management solutions for residential and commercial solar installations.",
      },
      {
        name: "Canadian Solar",
        ticker: "CSIQ",
        sector: "Renewable Energy",
        industry: "Solar Energy",
        esgScore: 76,
        environmentalScore: 80,
        socialScore: 72,
        governanceScore: 69,
        yearlyTrend: 4,
        currentPrice: "50.00",
        marketCap: "6000000000",
        yearHigh: "60.00",
        yearLow: "40.00",
        dividendYield: "1.0",
        peRatio: "20.0",
        description: "Canadian Solar is a leading provider of solar photovoltaic modules and solar energy solutions with operations worldwide.",
      },
      {
        name: "Clearway Energy",
        ticker: "CWEN",
        sector: "Renewable Energy",
        industry: "Electric Utilities",
        esgScore: 81,
        environmentalScore: 84,
        socialScore: 79,
        governanceScore: 77,
        yearlyTrend: 3,
        currentPrice: "25.00",
        marketCap: "10000000000",
        yearHigh: "30.00",
        yearLow: "20.00",
        dividendYield: "2.0",
        peRatio: "18.0",
        description: "Clearway Energy focuses on renewable energy generation, with a portfolio of wind, solar, and natural gas-fired power plants.",
      },
      {
        name: "Brookfield Renewable",
        ticker: "BEPC",
        sector: "Renewable Energy",
        industry: "Electric Utilities",
        esgScore: 83,
        environmentalScore: 88,
        socialScore: 76,
        governanceScore: 83,
        yearlyTrend: 5,
        currentPrice: "45.00",
        marketCap: "15000000000",
        yearHigh: "50.00",
        yearLow: "35.00",
        dividendYield: "2.5",
        peRatio: "22.0",
        description: "Brookfield Renewable operates a diverse portfolio of renewable power generation assets including hydroelectric, wind, and solar facilities.",
      },
      {
        name: "SolarEdge Technologies",
        ticker: "SEDG",
        sector: "Renewable Energy",
        industry: "Solar Energy",
        esgScore: 77,
        environmentalScore: 82,
        socialScore: 74,
        governanceScore: 72,
        yearlyTrend: 6,
        currentPrice: "175.00",
        marketCap: "25000000000",
        yearHigh: "200.00",
        yearLow: "140.00",
        dividendYield: "0.5",
        peRatio: "35.0",
        description: "SolarEdge Technologies provides innovative power electronics solutions for photovoltaic systems, enhancing energy efficiency and system reliability.",
      },
      {
        name: "Sunrun",
        ticker: "RUN",
        sector: "Renewable Energy",
        industry: "Solar Energy",
        esgScore: 79,
        environmentalScore: 83,
        socialScore: 78,
        governanceScore: 75,
        yearlyTrend: 7,
        currentPrice: "25.00",
        marketCap: "5000000000",
        yearHigh: "30.00",
        yearLow: "20.00",
        dividendYield: "0.0",
        peRatio: "25.0",
        description: "Sunrun is a leading provider of residential solar energy systems and energy services, helping homeowners transition to clean energy.",
      },
      {
        name: "SunPower",
        ticker: "SPWR",
        sector: "Renewable Energy",
        industry: "Solar Energy",
        esgScore: 75,
        environmentalScore: 79,
        socialScore: 73,
        governanceScore: 70,
        yearlyTrend: 4,
        currentPrice: "20.00",
        marketCap: "4000000000",
        yearHigh: "25.00",
        yearLow: "15.00",
        dividendYield: "0.0",
        peRatio: "20.0",
        description: "SunPower Corporation designs, manufactures, and delivers solar panels and solar energy solutions worldwide.",
      },
      {
        name: "Renewable Energy Group",
        ticker: "REGI",
        sector: "Renewable Energy",
        industry: "Biofuels",
        esgScore: 80,
        environmentalScore: 86,
        socialScore: 77,
        governanceScore: 75,
        yearlyTrend: 5,
        currentPrice: "50.00",
        marketCap: "2000000000",
        yearHigh: "60.00",
        yearLow: "40.00",
        dividendYield: "0.0",
        peRatio: "20.0",
        description: "Renewable Energy Group, Inc. is a leading provider of cleaner, lower carbon intensity products and services.",
      },
      {
        name: "Plug Power",
        ticker: "PLUG",
        sector: "Green Hydrogen",
        industry: "Electrical Equipment",
        esgScore: 74,
        environmentalScore: 81,
        socialScore: 70,
        governanceScore: 69,
        yearlyTrend: 8,
        currentPrice: "20.00",
        marketCap: "10000000000",
        yearHigh: "25.00",
        yearLow: "15.00",
        dividendYield: "0.0",
        peRatio: "0.0",
        description: "Plug Power Inc. is a leading provider of hydrogen fuel cell turnkey solutions for the global green hydrogen economy.",
      },
    ];

    // Filter out duplicates based on ticker
    const uniqueCompanies = Array.from(
      new Map(companiesData.map(company => [company.ticker, company])).values()
    );

    // Insert companies
    for (const company of uniqueCompanies) {
      // Validate the company data before insertion
      const validatedCompany = insertCompanySchema.parse(company);
      await db.insert(schema.companies).values(validatedCompany);
    }

    // Get all company IDs after inserting
    const companies = await db.select().from(schema.companies);
    const companyMap = new Map(companies.map(c => [c.ticker, c.id]));

    // Create buy stock data from companies
    const buyStockData = companies.map(company => ({
      companyId: company.id,
      currentPrice: parseFloat(company.currentPrice),
      marketCap: parseFloat(company.marketCap),
      weekHigh52: parseFloat(company.yearHigh),
      weekLow52: parseFloat(company.yearLow),
      yearlyTrend: company.yearlyTrend,
      minInvestment: 1000,
      maxInvestment: 1000000
    }));

    // Insert buy stock data
    let seededBuyStockCount = 0;
    for (const stockData of buyStockData) {
      // Check if buy stock data already exists for this company
      const existingBuyStock = await db
        .select()
        .from(schema.buyStockData)
        .where(eq(schema.buyStockData.companyId, stockData.companyId))
        .limit(1);

      if (existingBuyStock.length > 0) {
        console.log(`Buy stock data for company ID ${stockData.companyId} already exists, skipping`);
        continue;
      }

      const validatedData = insertBuyStockDataSchema.parse(stockData);
      await db.insert(schema.buyStockData).values(validatedData);
      seededBuyStockCount++;
    }
    console.log(`Seeded ${seededBuyStockCount} new buy stock data entries`);

    // Seed sectors
    const sectorsData = [
      { name: "Energy", esgScore: 78 },
      { name: "Technology", esgScore: 72 },
      { name: "Consumer", esgScore: 65 },
      { name: "Healthcare", esgScore: 82 },
      { name: "Materials", esgScore: 60 },
    ];

    // Check for existing sectors
    const existingSectors = await db.query.sectors.findMany();
    const existingSectorNames = new Set(existingSectors.map(s => s.name));
    
    let seededSectorsCount = 0;
    for (const sector of sectorsData) {
      // Skip if sector already exists
      if (existingSectorNames.has(sector.name)) {
        console.log(`Sector ${sector.name} already exists, skipping`);
        continue;
      }
      
      const validatedData = insertSectorSchema.parse(sector);
      await db.insert(schema.sectors).values(validatedData);
      seededSectorsCount++;
    }
    console.log(`Seeded ${seededSectorsCount} new sectors`);

    // Seed portfolio composition
    const compositionData = [
      { sector: "Renewable Energy", percentage: "30.00" },
      { sector: "Electric Vehicles", percentage: "25.00" },
      { sector: "Sustainable Food", percentage: "15.00" },
      { sector: "Clean Technology", percentage: "20.00" },
      { sector: "Other", percentage: "10.00" },
    ];

    // Check for existing composition data
    const existingCompositions = await db.query.portfolioComposition.findMany();
    const existingCompositionSectors = new Set(existingCompositions.map(c => c.sector));
    
    let seededCompositionsCount = 0;
    for (const composition of compositionData) {
      // Skip if composition for this sector already exists
      if (existingCompositionSectors.has(composition.sector)) {
        console.log(`Portfolio composition for sector ${composition.sector} already exists, skipping`);
        continue;
      }
      
      const validatedData = insertPortfolioCompositionSchema.parse(composition);
      await db.insert(schema.portfolioComposition).values(validatedData);
      seededCompositionsCount++;
    }
    console.log(`Seeded ${seededCompositionsCount} new portfolio composition items`);

    // Seed portfolio summary
    // First check if we already have a summary record (we only need one)
    const existingSummaries = await db.query.portfolioSummary.findMany({ limit: 1 });
    
    if (existingSummaries.length > 0) {
      console.log("Portfolio summary already exists, updating instead of inserting");
      
      // Update the existing summary
      const summaryData = {
        portfolioScore: 80,
        scoreChange: "4.50",
        sustainablePercentage: 75,
        sustainableValue: "35750.00",
        totalValue: "47666.67",
        carbonOffset: "15.80",
        offsetChange: "3.20",
        esgCompanies: 18,
        totalCompanies: 24,
      };
      
      const validatedSummaryData = insertPortfolioSummarySchema.parse(summaryData);
      await db.update(schema.portfolioSummary)
        .set({
          ...validatedSummaryData,
          lastUpdated: new Date()
        })
        .where(eq(schema.portfolioSummary.id, existingSummaries[0].id));
      
      console.log("Updated portfolio summary");
    } else {
      // Insert a new summary record
      const summaryData = {
        portfolioScore: 80,
        scoreChange: "4.50",
        sustainablePercentage: 75,
        sustainableValue: "35750.00",
        totalValue: "47666.67",
        carbonOffset: "15.80",
        offsetChange: "3.20",
        esgCompanies: 18,
        totalCompanies: 24,
      };
      
      const validatedSummaryData = insertPortfolioSummarySchema.parse(summaryData);
      await db.insert(schema.portfolioSummary).values(validatedSummaryData);
      console.log("Seeded portfolio summary");
    }

    // Seed sustainability trends
    const trendsData = [
      { month: "Jan", esgScore: 65, greenInvestments: 45 },
      { month: "Feb", esgScore: 67, greenInvestments: 48 },
      { month: "Mar", esgScore: 68, greenInvestments: 50 },
      { month: "Apr", esgScore: 70, greenInvestments: 53 },
      { month: "May", esgScore: 72, greenInvestments: 55 },
      { month: "Jun", esgScore: 73, greenInvestments: 58 },
      { month: "Jul", esgScore: 72, greenInvestments: 60 },
      { month: "Aug", esgScore: 74, greenInvestments: 63 },
      { month: "Sep", esgScore: 75, greenInvestments: 64 },
      { month: "Oct", esgScore: 74, greenInvestments: 65 },
      { month: "Nov", esgScore: 76, greenInvestments: 67 },
      { month: "Dec", esgScore: 78, greenInvestments: 68 },
    ];

    // Check for existing trends
    const existingTrends = await db.query.sustainabilityTrends.findMany();
    const existingMonths = new Set(existingTrends.map(t => t.month));
    
    let seededTrendsCount = 0;
    for (const trend of trendsData) {
      // Skip if trend for this month already exists
      if (existingMonths.has(trend.month)) {
        console.log(`Sustainability trend for month ${trend.month} already exists, skipping`);
        continue;
      }
      
      const validatedData = insertSustainabilityTrendSchema.parse(trend);
      await db.insert(schema.sustainabilityTrends).values(validatedData);
      seededTrendsCount++;
    }
    console.log(`Seeded ${seededTrendsCount} new sustainability trends`);

    // Seed stock price history
    const allCompanies = await db.query.companies.findMany();
    
    // For each company, create price history data
    let seededPriceHistoryCount = 0;
    for (const company of allCompanies) {
      // Default to this base price if current price is not set
      const basePrice = parseFloat(company.currentPrice || "1000.0");
      
      // Generate pricing data for different timeframes
      const timeframes = ["1d", "1w", "1m", "6m", "1y", "5y", "max"];
      const now = new Date();
      
      for (const timeframe of timeframes) {
        // Skip if we already have price history for this company and timeframe
        const existingPriceHistory = await db.query.stockPriceHistory.findFirst({
          where: and(
            eq(schema.stockPriceHistory.companyId, company.id),
            eq(schema.stockPriceHistory.timeframe, timeframe)
          )
        });
        
        if (existingPriceHistory) {
          console.log(`Price history for company ${company.name} (${timeframe}) already exists, skipping`);
          continue;
        }
        
        // Create prices array based on timeframe
        const prices = [];
        let numPoints = 0;
        let volatility = 0.0;
        let trendFactor = 0.0;
        let priceMultiplier = 1.0;
        
        // Configure the parameters based on timeframe
        switch (timeframe) {
          case "1d":
            numPoints = 24; // Hourly for a day
            volatility = 0.02;
            trendFactor = 0.001;
            priceMultiplier = 1.0;
            break;
          case "1w":
            numPoints = 7; // Daily for a week
            volatility = 0.05;
            trendFactor = 0.003;
            priceMultiplier = 0.9;
            break;
          case "1m":
            numPoints = 30; // Daily for a month
            volatility = 0.1;
            trendFactor = 0.005;
            priceMultiplier = 0.8;
            break;
          case "6m":
            numPoints = 26; // Weekly for 6 months
            volatility = 0.15;
            trendFactor = 0.01;
            priceMultiplier = 0.7;
            break;
          case "1y":
            numPoints = 12; // Monthly for a year
            volatility = 0.2;
            trendFactor = 0.02;
            priceMultiplier = 0.6;
            break;
          case "5y":
            numPoints = 20; // Quarterly for 5 years
            volatility = 0.25;
            trendFactor = 0.03;
            priceMultiplier = 0.5;
            break;
          case "max":
            numPoints = 15; // Yearly for max timeframe
            volatility = 0.3;
            trendFactor = 0.04;
            priceMultiplier = 0.4;
            break;
        }
        
        // Generate price points
        const adjustedBasePrice = basePrice * priceMultiplier;
        for (let i = 0; i < numPoints; i++) {
          const randomChange = (Math.random() * 2 - 1) * volatility;
          const priceFactor = 1 + randomChange + (trendFactor * i);
          const price = Math.round(adjustedBasePrice * priceFactor * 100) / 100;
          
          prices.push({
            price: price,
            date: new Date().toISOString() // Use current date as placeholder
          });
        }
        
        // Create the price history record with the prices as a JSON string
        const priceHistory = {
          companyId: company.id,
          timeframe: timeframe,
          prices: JSON.stringify(prices),
        };
        
        try {
          const validatedData = schema.insertStockPriceHistorySchema.parse(priceHistory);
          await db.insert(schema.stockPriceHistory).values(validatedData);
          seededPriceHistoryCount++;
          
          console.log(`Added price history record for ${company.name} (${timeframe})`);
        } catch (error) {
          console.error(`Error seeding price history for ${company.name} (${timeframe}):`, error);
        }
      }
    }
    
    console.log(`Seeded ${seededPriceHistoryCount} new stock price history records`);
    
    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();

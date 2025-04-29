
import { db } from "./index";
import fs from 'fs/promises';
import path from 'path';

async function exportToJson() {
  try {
    const exportDir = path.join(process.cwd(), 'db-export');
    await fs.mkdir(exportDir, { recursive: true });

    // Export companies
    const companies = await db.query.companies.findMany();
    await fs.writeFile(
      path.join(exportDir, 'companies.json'),
      JSON.stringify(companies, null, 2)
    );

    // Export sectors
    const sectors = await db.query.sectors.findMany();
    await fs.writeFile(
      path.join(exportDir, 'sectors.json'),
      JSON.stringify(sectors, null, 2)
    );

    // Export portfolio composition
    const portfolioComposition = await db.query.portfolioComposition.findMany();
    await fs.writeFile(
      path.join(exportDir, 'portfolio-composition.json'),
      JSON.stringify(portfolioComposition, null, 2)
    );

    // Export portfolio summary
    const portfolioSummary = await db.query.portfolioSummary.findMany();
    await fs.writeFile(
      path.join(exportDir, 'portfolio-summary.json'),
      JSON.stringify(portfolioSummary, null, 2)
    );

    // Export sustainability trends
    const sustainabilityTrends = await db.query.sustainabilityTrends.findMany();
    await fs.writeFile(
      path.join(exportDir, 'sustainability-trends.json'),
      JSON.stringify(sustainabilityTrends, null, 2)
    );

    // Export stock price history
    const stockPriceHistory = await db.query.stockPriceHistory.findMany();
    await fs.writeFile(
      path.join(exportDir, 'stock-price-history.json'),
      JSON.stringify(stockPriceHistory, null, 2)
    );

    // Export users (excluding sensitive data)
    const users = await db.query.users.findMany();
    const sanitizedUsers = users.map(({ password, ...rest }) => rest);
    await fs.writeFile(
      path.join(exportDir, 'users.json'),
      JSON.stringify(sanitizedUsers, null, 2)
    );

    console.log('Database exported successfully to db-export directory');
  } catch (error) {
    console.error('Error exporting database:', error);
  }
}

exportToJson();

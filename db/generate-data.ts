
import { db } from "./index";
import { companies, buyStockData } from "../shared/schema";
import { eq } from "drizzle-orm";

async function generateData() {
  try {
    console.log("Generating realistic company and stock data...");

    // Get all companies
    const allCompanies = await db.select().from(companies);

    // Update each company with realistic data
    for (const company of allCompanies) {
      const currentPrice = (Math.random() * 1000 + 50).toFixed(2); // $50-1050
      const sharesOutstanding = Math.floor(Math.random() * 1000000000 + 100000000); // 100M-1.1B shares
      const marketCap = (parseFloat(currentPrice) * sharesOutstanding).toFixed(2);
      const weekHigh52 = (parseFloat(currentPrice) * (1 + Math.random() * 0.5)).toFixed(2); // Up to 50% higher
      const weekLow52 = (parseFloat(currentPrice) * (0.6 + Math.random() * 0.2)).toFixed(2); // 40-60% of current
      const dividendYield = (Math.random() * 5).toFixed(2); // 0-5%
      const peRatio = (Math.random() * 50 + 10).toFixed(2); // 10-60
      const carbonNeutralYear = Math.floor(Math.random() * (2050 - 2030) + 2030); // 2030-2050

      // Update company data
      await db.update(companies)
        .set({
          currentPrice: currentPrice,
          marketCap: marketCap,
          returnOnInvestment: (Math.random() * 30 + 5).toFixed(2), // 5-35%
          carbonNeutralYear: carbonNeutralYear,
          weekHigh52: weekHigh52,
          weekLow52: weekLow52,
          dividendYield: dividendYield,
          peRatio: peRatio,
          sustainabilityRating: ['A+', 'A', 'A-', 'B+', 'B'][Math.floor(Math.random() * 5)],
          esgRiskLevel: ['Low', 'Medium-Low', 'Medium', 'Medium-High'][Math.floor(Math.random() * 4)],
          description: generateCompanyDescription(company)
        })
        .where(eq(companies.id, company.id));

      // Update buy stock data
      await db.update(buyStockData)
        .set({
          currentPrice: currentPrice,
          marketCap: marketCap,
          weekHigh52: weekHigh52,
          weekLow52: weekLow52
        })
        .where(eq(buyStockData.companyId, company.id));

      console.log(`Updated data for ${company.name}`);
    }

    console.log("Data generation completed successfully");
  } catch (error) {
    console.error("Error generating data:", error);
  }
}

function generateCompanyDescription(company: any): string {
  const descriptions = {
    'Electric Vehicles': `${company.name} is a leading innovator in the electric vehicle industry, focusing on sustainable transportation solutions. With a strong commitment to reducing carbon emissions, they have achieved an impressive ESG score of ${company.esgScore}. Their environmental initiatives and technological advancement in EV manufacturing demonstrate their dedication to a greener future.`,
    'Renewable Energy': `${company.name} is at the forefront of renewable energy technology, specializing in clean power generation. Their environmental score of ${company.environmentalScore} reflects their commitment to sustainable practices. The company's innovative approach to renewable energy solutions positions them as a key player in the global transition to clean energy.`,
    'Clean Energy': `As a pioneer in clean energy solutions, ${company.name} develops cutting-edge technologies for sustainable power generation. Their high environmental score of ${company.environmentalScore} showcases their dedication to reducing global carbon emissions. The company's innovative projects and research initiatives are driving the advancement of clean energy technology.`,
    'Technology': `${company.name} is a technology leader with a strong focus on sustainable innovation. Their ESG score of ${company.esgScore} demonstrates their commitment to responsible business practices. The company's solutions combine cutting-edge technology with environmental consciousness, setting new standards in sustainable tech development.`,
    'Food Products': `${company.name} is revolutionizing the food industry with sustainable and plant-based alternatives. Their environmental score of ${company.environmentalScore} reflects their commitment to reducing the environmental impact of food production. The company's innovative approach to sustainable food solutions is reshaping the future of nutrition.`,
    'Green Hydrogen': `${company.name} is pioneering the development of green hydrogen solutions, contributing to the clean energy transition. With an environmental score of ${company.environmentalScore}, they are committed to developing sustainable energy alternatives. Their innovative hydrogen technologies are paving the way for a carbon-neutral future.`
  };

  return descriptions[company.sector] || 
    `${company.name} is a leading sustainable company in the ${company.sector} sector, with a strong commitment to environmental, social, and governance practices. Their ESG score of ${company.esgScore} demonstrates their dedication to sustainable business operations and positive environmental impact.`;
}

// Run the script
generateData();

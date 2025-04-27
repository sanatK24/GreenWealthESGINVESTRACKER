import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with your API key
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in the environment variables');
}

// Create the client with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

type InsightsParams = {
  companies: any[];
  timeframe: string;
  priceData: any[];
};

type ChatParams = {
  userMessage: string;
  userName?: string;
  previousMessages?: Array<{role: string, parts: [{text: string}]}>;
};

/**
 * Generates investment insights comparing multiple stocks
 */
export async function generateInvestmentInsights({
  companies,
  timeframe,
  priceData
}: InsightsParams): Promise<string> {
  // Access the generative model (Gemini 1.5 Pro)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  // Format the company data for the prompt
  const companyDetails = companies.map(company => {
    // Calculate price change if price data is available
    let priceChangeText = '';
    const companyPriceData = priceData.find(p => p.companyId === company.id);
    
    if (companyPriceData?.prices?.length > 1) {
      const firstPrice = companyPriceData.prices[0].price;
      const lastPrice = companyPriceData.prices[companyPriceData.prices.length - 1].price;
      const changePercent = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
      priceChangeText = `Price change over ${timeframe}: ${changePercent}%`;
    }
    
    return `
Company: ${company.name} (${company.ticker})
Industry: ${company.industry || company.sector || 'N/A'}
ESG Score: ${company.esgScore || 'N/A'}/100
Environmental Score: ${company.environmentalScore || 'N/A'}/100
Social Score: ${company.socialScore || 'N/A'}/100
Governance Score: ${company.governanceScore || 'N/A'}/100
${priceChangeText}
    `;
  }).join('\n');

  // Create the prompt for the AI
  const prompt = `
You are an expert ESG investment analyst. Based on the following data about ${companies.length} companies, 
provide insightful analysis and comparison focusing on:

1. ESG performance comparison
2. Financial outlook based on price trends
3. Investment recommendations from a sustainable investing perspective
4. Key ESG strengths and areas for improvement
5. Potential risks and opportunities

Format your response with clear headings and bullet points for easy readability.
Focus on actionable insights that would help an investor make informed decisions.
Be balanced and factual in your assessment, highlighting both positives and negatives.

Here's the company data:

${companyDetails}

Timeframe analyzed: ${timeframe}
  `;

  try {
    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error generating investment insights:', error);
    return "Unable to generate insights at this time. Please try again later.";
  }
}

/**
 * Handles investor assistant chat interactions
 */
export async function chatWithInvestorAssistant({
  userMessage,
  userName = "Investor",
  previousMessages = []
}: ChatParams): Promise<string> {
  // Access the generative model (Gemini 1.5 Pro)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  // System prompt to give context to the model
  const systemPrompt = `
You are GreenAdvisor, an expert ESG (Environmental, Social, Governance) investment assistant.
You help new investors understand sustainable investing concepts and provide guidance on ESG investing strategies.
Your expertise is in explaining complex ESG topics in simple terms.

When answering:
- Focus on educational explanations rather than specific investment advice
- Explain ESG terminology when relevant
- Highlight the importance of both financial returns and sustainability impact
- Be conversational and supportive to beginner investors
- Reference general ESG investing principles and frameworks
- If asked about specific stocks, discuss general evaluation factors without making specific buy/sell recommendations
- Keep responses concise but informative

The user you're speaking with is named ${userName}.

${previousMessages.map(msg => `${msg.role === 'user' ? userName : 'GreenAdvisor'}: ${msg.parts[0].text}`).join('\n')}
  `;

  try {
    // Combine the previous context with the current message
    const combinedPrompt = `${systemPrompt}\n\n${userName}: ${userMessage}`;
    
    // Generate a response to the full conversation
    const result = await model.generateContent(combinedPrompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error chatting with investor assistant:', error);
    return "I'm sorry, I'm having trouble connecting at the moment. Please try again later.";
  }
}
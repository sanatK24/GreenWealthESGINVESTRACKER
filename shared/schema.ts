import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table (keeping original definition)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ticker: text("ticker").notNull().unique(),
  sector: text("sector").notNull(),
  industry: text("industry").notNull(),
  esgScore: integer("esg_score").notNull(),
  environmentalScore: integer("environmental_score").notNull(),
  socialScore: integer("social_score").notNull(),
  governanceScore: integer("governance_score").notNull(),
  yearlyTrend: integer("yearly_trend").notNull(),
  sustainabilityRating: text("sustainability_rating"),
  esgRiskLevel: text("esg_risk_level"),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  marketCap: decimal("market_cap", { precision: 15, scale: 2 }),
  returnOnInvestment: decimal("return_on_investment", { precision: 5, scale: 2 }),
  carbonNeutralYear: integer("carbon_neutral_year"),
  weekHigh52: decimal("week_high_52", { precision: 10, scale: 2 }),
  weekLow52: decimal("week_low_52", { precision: 10, scale: 2 }),
  dividendYield: decimal("dividend_yield", { precision: 5, scale: 2 }),
  peRatio: decimal("pe_ratio", { precision: 10, scale: 2 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Sectors table
export const sectors = pgTable("sectors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  esgScore: integer("esg_score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSectorSchema = createInsertSchema(sectors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Portfolio composition table
export const portfolioComposition = pgTable("portfolio_composition", {
  id: serial("id").primaryKey(),
  sector: text("sector").notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPortfolioCompositionSchema = createInsertSchema(portfolioComposition).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Portfolio summary table
export const portfolioSummary = pgTable("portfolio_summary", {
  id: serial("id").primaryKey(),
  portfolioScore: integer("portfolio_score").notNull(),
  scoreChange: decimal("score_change", { precision: 5, scale: 2 }).notNull(),
  sustainablePercentage: integer("sustainable_percentage").notNull(),
  sustainableValue: decimal("sustainable_value", { precision: 10, scale: 2 }).notNull(),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull(),
  carbonOffset: decimal("carbon_offset", { precision: 5, scale: 2 }).notNull(),
  offsetChange: decimal("offset_change", { precision: 5, scale: 2 }).notNull(),
  esgCompanies: integer("esg_companies").notNull(),
  totalCompanies: integer("total_companies").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertPortfolioSummarySchema = createInsertSchema(portfolioSummary).omit({
  id: true,
  lastUpdated: true,
});

// Sustainability trends table
export const sustainabilityTrends = pgTable("sustainability_trends", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(),
  esgScore: integer("esg_score").notNull(),
  greenInvestments: integer("green_investments").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSustainabilityTrendSchema = createInsertSchema(sustainabilityTrends).omit({
  id: true,
  createdAt: true,
});

// Stock price history table
export const stockPriceHistory = pgTable("stock_price_history", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  timeframe: text("timeframe").notNull(), // e.g., "1d", "1w", "1m", "6m", "1y", "5y", "max"
  prices: text("prices").notNull(), // JSON string of prices
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStockPriceHistorySchema = createInsertSchema(stockPriceHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Define relations
export const companiesRelations = relations(companies, ({ many }) => ({
  sectors: many(sectors),
  priceHistory: many(stockPriceHistory),
}));

export const sectorsRelations = relations(sectors, ({ many }) => ({
  companies: many(companies),
}));

export const stockPriceHistoryRelations = relations(stockPriceHistory, ({ one }) => ({
  company: one(companies, {
    fields: [stockPriceHistory.companyId],
    references: [companies.id],
  }),
}));

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Sector = typeof sectors.$inferSelect;
export type InsertSector = z.infer<typeof insertSectorSchema>;

export type PortfolioComposition = typeof portfolioComposition.$inferSelect;
export type InsertPortfolioComposition = z.infer<typeof insertPortfolioCompositionSchema>;

export type PortfolioSummary = typeof portfolioSummary.$inferSelect;
export type InsertPortfolioSummary = z.infer<typeof insertPortfolioSummarySchema>;

export type SustainabilityTrend = typeof sustainabilityTrends.$inferSelect;
export type InsertSustainabilityTrend = z.infer<typeof insertSustainabilityTrendSchema>;

export type StockPriceHistory = typeof stockPriceHistory.$inferSelect;
export type InsertStockPriceHistory = z.infer<typeof insertStockPriceHistorySchema>;

// User Activity Logging Tables

export const userLoginRecords = pgTable("user_login_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  loginTimestamp: timestamp("login_timestamp").notNull().defaultNow(),
  logoutTimestamp: timestamp("logout_timestamp"),
  loginStatus: text("login_status").notNull(),
  ipAddress: text("ip_address").notNull(),
  sessionKey: text("session_key").notNull(),
  deviceInfo: text("device_info").notNull(),
});

export const userActions = pgTable("user_actions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  actionType: text("action_type").notNull(),
  actionDetails: text("action_details").notNull(),
  sessionId: text("session_id").notNull(),
  deviceInfo: text("device_info").notNull(),
});

export const orderHistory = pgTable("order_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  orderId: text("order_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  orderDetails: text("order_details").notNull(),
  orderTotal: decimal("order_total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  orderStatus: text("order_status").notNull(),
  paymentCertificate: text("payment_certificate"),
});

export const chatRecords = pgTable("chat_records", {
  id: serial("id").primaryKey(),
  chatId: text("chat_id").notNull(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  messageContent: text("message_content").notNull(),
  chatSessionId: text("chat_session_id").notNull(),
});

export const comparisonHistory = pgTable("comparison_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  itemsCompared: text("items_compared").notNull(),
  comparisonParams: text("comparison_params").notNull(),
});

// Create insert schemas for each table
export const insertUserLoginRecordSchema = createInsertSchema(userLoginRecords).omit({
  id: true,
  logoutTimestamp: true,
});

export const insertUserActionSchema = createInsertSchema(userActions).omit({
  id: true,
});

export const insertOrderHistorySchema = createInsertSchema(orderHistory).omit({
  id: true,
});

export const insertChatRecordSchema = createInsertSchema(chatRecords).omit({
  id: true,
});

export const insertComparisonHistorySchema = createInsertSchema(comparisonHistory).omit({
  id: true,
});


// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyId: integer("company_id").notNull().references(() => companies.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  shares: integer("shares").notNull(),
  status: text("status").notNull().default('pending'),
  paymentData: text("payment_data").notNull(), // JSON string of PayPal response
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

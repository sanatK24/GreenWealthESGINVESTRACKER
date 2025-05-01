import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Define tables first
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

export const sectors = pgTable("sectors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  esgScore: integer("esg_score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const portfolioComposition = pgTable("portfolio_composition", {
  id: serial("id").primaryKey(),
  sector: text("sector").notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

export const sustainabilityTrends = pgTable("sustainability_trends", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(),
  esgScore: integer("esg_score").notNull(),
  greenInvestments: integer("green_investments").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stockPriceHistory = pgTable("stock_price_history", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  timeframe: text("timeframe").notNull(), // e.g., "1d", "1w", "1m", "6m", "1y", "5y", "max"
  prices: text("prices").notNull(), // JSON string of prices
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const buyStockData = pgTable("buy_stock_data", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }).notNull(),
  weekHigh52: decimal("week_high_52", { precision: 10, scale: 2 }).notNull(),
  weekLow52: decimal("week_low_52", { precision: 10, scale: 2 }).notNull(),
  yearlyTrend: decimal("yearly_trend", { precision: 5, scale: 2 }).notNull(),
  minInvestment: decimal("min_investment", { precision: 10, scale: 2 }).notNull().default("1000"),
  maxInvestment: decimal("max_investment", { precision: 10, scale: 2 }).notNull().default("1000000"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

// Define schemas after tables
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSectorSchema = createInsertSchema(sectors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPortfolioCompositionSchema = createInsertSchema(portfolioComposition).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPortfolioSummarySchema = createInsertSchema(portfolioSummary).omit({
  id: true,
  lastUpdated: true,
});

export const insertSustainabilityTrendSchema = createInsertSchema(sustainabilityTrends).omit({
  id: true,
  createdAt: true,
});

export const insertStockPriceHistorySchema = createInsertSchema(stockPriceHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBuyStockDataSchema = createInsertSchema(buyStockData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

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

// Define relations after tables and schemas
export const companiesRelations = relations(companies, ({ many }) => ({
  sectors: many(sectors),
  priceHistory: many(stockPriceHistory),
  buyStockData: many(buyStockData),
  payments: many(payments),
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

export const buyStockDataRelations = relations(buyStockData, ({ one, many }) => ({
  company: one(companies, {
    fields: [buyStockData.companyId],
    references: [companies.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  company: one(companies, {
    fields: [payments.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

// Define types after everything else
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

export type BuyStockData = typeof buyStockData.$inferSelect;
export type InsertBuyStockData = z.infer<typeof insertBuyStockDataSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

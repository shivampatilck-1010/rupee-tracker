import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { insertUserSchema, insertExpenseSchema } from "@shared/schema";
import { analyzeExpenses, predictFutureSavings } from "./ai-service";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Middleware to check if user is authenticated
async function authMiddleware(req: any, res: any, next: any) {
  const sessionId = req.cookies?.sessionId;
  const userId = req.cookies?.userId;

  if (!sessionId || !userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    // Validate session exists and is not expired
    const session = await storage.getSessionById(sessionId);
    if (!session || session.userId !== userId || session.expiresAt < new Date()) {
      return res.status(401).json({ message: "Session expired or invalid" });
    }

    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Middleware for CORS on mobile requests
  function addMobileCORS(req: any, res: any, next: any) {
    const isMobile = req.headers['user-agent']?.includes('Mobile') ||
                    req.headers['user-agent']?.includes('Android') ||
                    req.headers['capacitor-platform'] === 'android';

    if (isMobile) {
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    }

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }

    next();
  }

  // Authentication Routes
  app.post("/api/signup", addMobileCORS, async (req, res) => {
    try {
      const parsed = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(parsed.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(parsed.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(parsed.password, 10);
      const user = await storage.createUser({
        ...parsed,
        password: hashedPassword,
      });

      // Create session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
      const session = await storage.createSession(user.id, expiresAt);

      // Improved cookie settings for mobile compatibility
      const isMobile = req.headers['user-agent']?.includes('Mobile') ||
                      req.headers['user-agent']?.includes('Android') ||
                      req.headers['capacitor-platform'] === 'android';

      res.cookie("sessionId", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: isMobile ? "none" : "lax", // Allow cross-site for mobile
        maxAge: 30 * 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === "production" ? undefined : undefined, // Let browser handle domain
        path: "/", // Ensure cookie is available for all paths
      });
      res.cookie("userId", user.id, {
        secure: process.env.NODE_ENV === "production",
        sameSite: isMobile ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === "production" ? undefined : undefined,
        path: "/", // Ensure cookie is available for all paths
      });

      res.json({
        user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName },
        session: session.id,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/login", addMobileCORS, async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
      const session = await storage.createSession(user.id, expiresAt);

      // Improved cookie settings for mobile compatibility
      const isMobile = req.headers['user-agent']?.includes('Mobile') ||
                      req.headers['user-agent']?.includes('Android') ||
                      req.headers['capacitor-platform'] === 'android';

      res.cookie("sessionId", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: isMobile ? "none" : "lax", // Allow cross-site for mobile
        maxAge: 30 * 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === "production" ? undefined : undefined,
        path: "/", // Ensure cookie is available for all paths
      });
      res.cookie("userId", user.id, {
        secure: process.env.NODE_ENV === "production",
        sameSite: isMobile ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === "production" ? undefined : undefined,
        path: "/", // Ensure cookie is available for all paths
      });

      res.json({
        user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName },
        session: session.id,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/logout", addMobileCORS, (req, res) => {
    res.clearCookie("sessionId");
    res.clearCookie("userId");
    res.json({ message: "Logged out" });
  });

  app.get("/api/me", addMobileCORS, async (req, res) => {
    const userId = req.cookies?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName } });
  });

  // Expense Routes
  app.get("/api/expenses", addMobileCORS, authMiddleware, async (req, res) => {
    try {
      const userId = req.userId!;
      const expenses = await storage.getExpensesByUserId(userId);
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/expenses", addMobileCORS, authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const parsed = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(userId, parsed);
      res.json(expense);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/expenses/:id", addMobileCORS, authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      await storage.deleteExpense(req.params.id);
      res.json({ message: "Expense deleted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Profile stats
  app.get("/api/profile/stats", async (req, res) => {
    const userId = req.cookies?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add CORS headers for mobile compatibility
    const isMobile = req.headers['user-agent']?.includes('Mobile') ||
                    req.headers['user-agent']?.includes('Android') ||
                    req.headers['capacitor-platform'] === 'android';

    if (isMobile) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    }

    const expenses = await storage.getExpensesByUserId(userId);
    const currentYear = new Date().getFullYear();
    
    const yearlyExpenses = expenses.filter((e) => {
      const expenseYear = new Date(e.date).getFullYear();
      return expenseYear === currentYear;
    });

    const totalYearlySpending = yearlyExpenses.reduce(
      (sum, e) => sum + parseFloat(e.amount.toString()),
      0
    );

    const categorySpending: Record<string, number> = {};
    yearlyExpenses.forEach((e) => {
      categorySpending[e.category] = (categorySpending[e.category] || 0) + parseFloat(e.amount.toString());
    });

    res.json({
      user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName },
      totalYearlySpending,
      categorySpending,
      totalExpenses: yearlyExpenses.length,
    });
  });

  // Budget endpoints
  app.get("/api/budget", addMobileCORS, authMiddleware, async (req, res) => {
    try {
      const userId = req.userId!;
      const budget = await storage.getUserBudget(userId);
      res.json({ budget: budget || 50000 });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/budget", addMobileCORS, authMiddleware, async (req, res) => {
    try {
      const userId = req.userId!;
      const { budget } = req.body;

      if (!budget || budget <= 0) {
        return res.status(400).json({ message: "Invalid budget amount" });
      }

      await storage.setUserBudget(userId, budget);
      res.json({ budget });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI Analysis endpoint
  app.post("/api/ai/analysis", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId!;
      const { months = 3 } = req.body;

      const expenses = await storage.getExpensesByUserId(userId);
      const budget = await storage.getUserBudget(userId);
      const monthlyBudget = budget || 50000;

      // Ensure expenses is an array
      const expensesArray = Array.isArray(expenses) ? expenses : [];

      if (expensesArray.length === 0) {
        return res.json({
          analysis: {
            insights: [],
            predictions: [{ nextMonthSpending: 0, confidence: 0, trend: "stable" }],
            recommendations: [],
            summary: "Add expenses to see AI analysis",
            riskScore: 0,
          },
          futureProjection: [],
        });
      }

      // Analyze expenses with AI
      const analysis = analyzeExpenses(expensesArray, monthlyBudget);
      const futureProjection = predictFutureSavings(expensesArray, monthlyBudget, months);

      res.json({
        analysis,
        futureProjection,
      });
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ message: error.message || "AI analysis failed" });
    }
  });

  // News endpoint
  app.get("/api/news", addMobileCORS, async (req, res) => {
    try {
      const category = Array.isArray(req.query.category) ? req.query.category[0] : req.query.category || "general";
      const country = Array.isArray(req.query.country) ? req.query.country[0] : req.query.country || "us";
      const apiKey = process.env.NEWS_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ message: "News API key not configured" });
      }

      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("News API Error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch news" });
    }
  });

  return httpServer;
}

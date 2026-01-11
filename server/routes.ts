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
function authMiddleware(req: any, res: any, next: any) {
  const sessionId = req.cookies?.sessionId;
  const userId = req.cookies?.userId;
  
  if (!sessionId || !userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  req.userId = userId;
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Authentication Routes
  app.post("/api/signup", async (req, res) => {
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

      res.cookie("sessionId", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      res.cookie("userId", user.id, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName },
        session: session.id,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
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

      res.cookie("sessionId", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      res.cookie("userId", user.id, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName },
        session: session.id,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/logout", (req, res) => {
    res.clearCookie("sessionId");
    res.clearCookie("userId");
    res.json({ message: "Logged out" });
  });

  app.get("/api/me", async (req, res) => {
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
  app.get("/api/expenses", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId!;
      const expenses = await storage.getExpensesByUserId(userId);
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/expenses", authMiddleware, async (req, res) => {
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

  app.delete("/api/expenses/:id", authMiddleware, async (req, res) => {
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
  app.get("/api/budget", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId!;
      const budget = await storage.getUserBudget(userId);
      res.json({ budget: budget || 50000 });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/budget", authMiddleware, async (req, res) => {
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

  return httpServer;
}

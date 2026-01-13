import { MongoClient, Db, Collection } from "mongodb";
import { type User, type InsertUser, type Expense, type InsertExpense, type Session } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Expenses
  getExpensesByUserId(userId: string): Promise<Expense[]>;
  createExpense(userId: string, expense: InsertExpense): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;
  
  // Sessions
  createSession(userId: string, expiresAt: Date): Promise<Session>;
  getSessionById(id: string): Promise<Session | undefined>;
  deleteSession(id: string): Promise<void>;
}

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: Db | null = null;
  private users: Collection<any> | null = null;
  private expenses: Collection<any> | null = null;
  private sessions: Collection<any> | null = null;

  constructor(mongoUrl: string = "mongodb://localhost:27017") {
    this.client = new MongoClient(mongoUrl);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db("rupee-tracker");
      
      // Initialize collections
      this.users = this.db.collection("users");
      this.expenses = this.db.collection("expenses");
      this.sessions = this.db.collection("sessions");

      // Create indexes
      await this.users.createIndex({ username: 1 }, { unique: true });
      await this.users.createIndex({ email: 1 }, { unique: true });
      await this.expenses.createIndex({ userId: 1 });
      await this.sessions.createIndex({ userId: 1 });
      
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  async getUser(id: string): Promise<User | undefined> {
    if (!this.users) throw new Error("MongoDB not connected");
    const user = await this.users.findOne({ id });
    return user ? (user as User) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!this.users) throw new Error("MongoDB not connected");
    const user = await this.users.findOne({ username });
    return user ? (user as User) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!this.users) throw new Error("MongoDB not connected");
    const user = await this.users.findOne({ email });
    return user ? (user as User) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!this.users) throw new Error("MongoDB not connected");
    
    const user: User = {
      id: randomUUID(),
      ...insertUser,
      budget: 50000,
      createdAt: new Date(),
    };

    await this.users.insertOne(user as any);
    return user;
  }

  async getExpensesByUserId(userId: string): Promise<Expense[]> {
    if (!this.expenses) throw new Error("MongoDB not connected");
    const expenses = await this.expenses.find({ userId }).toArray();
    return expenses as Expense[];
  }

  async createExpense(userId: string, insertExpense: InsertExpense): Promise<Expense> {
    if (!this.expenses) throw new Error("MongoDB not connected");

    const expense: Expense = {
      id: randomUUID(),
      userId,
      amount: insertExpense.amount,
      category: insertExpense.category,
      description: insertExpense.description || null,
      date: insertExpense.date instanceof Date ? insertExpense.date : new Date(insertExpense.date),
      createdAt: new Date(),
    };

    await this.expenses.insertOne(expense as any);
    return expense;
  }

  async deleteExpense(id: string): Promise<void> {
    if (!this.expenses) throw new Error("MongoDB not connected");
    await this.expenses.deleteOne({ id });
  }

  async createSession(userId: string, expiresAt: Date): Promise<Session> {
    if (!this.sessions) throw new Error("MongoDB not connected");
    
    const session: Session = {
      id: randomUUID(),
      userId,
      createdAt: new Date(),
      expiresAt,
    };

    await this.sessions.insertOne(session as any);
    return session;
  }

  async getSessionById(id: string): Promise<Session | undefined> {
    if (!this.sessions) throw new Error("MongoDB not connected");
    const session = await this.sessions.findOne({ id });
    return session ? (session as Session) : undefined;
  }

  async deleteSession(id: string): Promise<void> {
    if (!this.sessions) throw new Error("MongoDB not connected");
    await this.sessions.deleteOne({ id });
  }

  async getUserBudget(userId: string): Promise<number | undefined> {
    if (!this.users) throw new Error("MongoDB not connected");
    const user = await this.users.findOne({ id: userId });
    return user?.budget;
  }

  async setUserBudget(userId: string, budget: number): Promise<void> {
    if (!this.users) throw new Error("MongoDB not connected");
    await this.users.updateOne({ id: userId }, { $set: { budget } });
  }
}

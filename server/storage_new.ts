import { MongoStorage } from "./mongodb-storage";

// Initialize MongoDB storage
const mongoUrl = process.env.MONGODB_URL || "mongodb://localhost:27017";
const mongoStorage = new MongoStorage(mongoUrl);

// Connect to MongoDB on startup
(async () => {
  try {
    await mongoStorage.connect();
  } catch (error) {
    console.error("Failed to initialize MongoDB storage:", error);
    process.exit(1);
  }
})();

export const storage = mongoStorage;

// Export the interface for type checking
export interface IStorage {
  getUser(id: string): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  getUserByEmail(email: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  getExpensesByUserId(userId: string): Promise<any[]>;
  createExpense(userId: string, expense: any): Promise<any>;
  deleteExpense(id: string): Promise<void>;
  createSession(userId: string, expiresAt: Date): Promise<any>;
  getSessionById(id: string): Promise<any | undefined>;
  deleteSession(id: string): Promise<void>;
}

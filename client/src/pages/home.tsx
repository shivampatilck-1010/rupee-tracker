import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit2,
  TrendingDown,
  Wallet,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Film,
  Heart,
  GraduationCap,
  Trash2,
  BarChart3,
  PieChart as PieChartIcon,
  User,
  LogOut,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChatBot from "@/components/chat-bot";
import { FinancialTicker } from "@/components/financial-ticker";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/App";
import { validateExpense } from "@/lib/validate";


/* ================= TYPES ================= */

interface Expense {
  id: string;
  amount: number | string;
  category: string;
  description: string;
  date: string;
}

/* ================= CONSTANTS ================= */

const CATEGORIES = [
  { name: "Food", icon: Utensils, color: "#10b981" },
  { name: "Shopping", icon: ShoppingCart, color: "#0ea5e9" },
  { name: "Transport", icon: Car, color: "#8b5cf6" },
  { name: "Entertainment", icon: Film, color: "#f59e0b" },
  { name: "Health", icon: Heart, color: "#ef4444" },
  { name: "Education", icon: GraduationCap, color: "#ec4899" },
  { name: "Housing", icon: Home, color: "#6366f1" },
  { name: "Other", icon: Wallet, color: "#64748b" },
];

const formatINR = (amount: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

/* ================= COMPONENT ================= */

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(50000);
  const [newBudget, setNewBudget] = useState("50000");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { logout } = useAuth();

  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "",
    description: "",
  });

  /* ================= EFFECTS ================= */

  React.useEffect(() => {
    fetch("/api/budget", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setMonthlyBudget(data?.budget ?? 50000);
        setNewBudget(String(data?.budget ?? 50000));
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    fetch("/api/expenses", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setExpenses(data);
        } else {
          setExpenses([]);
        }
      })
      .catch(() => setExpenses([]));
  }, []);

  /* ================= HELPERS ================= */

  const totalExpenses = expenses.reduce((s, e) => {
    const amount = Number(e.amount);
    return s + (isNaN(amount) ? 0 : amount);
  }, 0);
  const remaining = monthlyBudget - totalExpenses;

  const getCategoryIcon = (name: string) =>
    CATEGORIES.find((c) => c.name === name)?.icon || Wallet;

  const getCategoryColor = (name: string) =>
    CATEGORIES.find((c) => c.name === name)?.color || "#64748b";

  // Prepare chart data
  const categoryData = CATEGORIES.map(cat => {
    const amount = expenses
      .filter(e => e.category === cat.name)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return { name: cat.name, value: amount, color: cat.color };
  }).filter(item => item.value > 0);

  // Daily spending for trend chart
  const dailyData = expenses.reduce((acc: any[], expense) => {
    const date = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.amount += Number(expense.amount);
    } else {
      acc.push({ date, amount: Number(expense.amount) });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7); // Last 7 days

  /* ================= ACTIONS ================= */

  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.category || !newExpense.description) {
      toast({ title: "Error", description: "All fields required", variant: "destructive" });
      return;
    }

    const expenseData = {
      ...newExpense,
      amount: Number(newExpense.amount),
      date: new Date().toISOString().split("T")[0],
    };

    if (!validateExpense(expenseData)) {
      toast({ title: "Error", description: "Invalid expense data", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(expenseData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add expense");
      }

      setExpenses([data, ...expenses]);
      setIsDialogOpen(false);
      setNewExpense({ amount: "", category: "", description: "" });
      toast({ title: "Success", description: "Expense added successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add expense",
        variant: "destructive"
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setExpenses(expenses.filter((e) => e.id !== id));
      toast({ title: "Deleted", description: "Expense deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete expense", variant: "destructive" });
    }
  };

  const handleUpdateBudget = async () => {
    const budget = parseInt(newBudget);
    if (isNaN(budget) || budget <= 0) {
      toast({ title: "Error", description: "Invalid budget amount", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ budget }),
      });

      if (res.ok) {
        setMonthlyBudget(budget);
        setIsBudgetDialogOpen(false);
        toast({ title: "Success", description: "Budget updated successfully" });
      } else {
        throw new Error("Failed to update budget");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update budget", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    logout();
  };

  /* ================= JSX ================= */

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <header
        className="sticky top-0 z-50 backdrop-blur-xl bg-background/50 border-b border-border/50 p-4 flex justify-between items-center animate-in slide-in-from-top-5 duration-500"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">Rupee Tracker</h1>
        </div>
        <div className="flex gap-2 items-center">
          <Button onClick={() => setLocation("/calendar")} variant="ghost" className="hover:bg-muted">
            <Calendar className="w-4 h-4 sm:mr-2 text-primary" /> <span className="hidden sm:inline">Calendar</span>
          </Button>
          <Button onClick={() => setLocation("/profile")} variant="ghost" className="hover:bg-muted">
            <User className="w-4 h-4 sm:mr-2 text-primary" /> <span className="hidden sm:inline">Profile</span>
          </Button>
          <ModeToggle />
          <Button onClick={handleLogout} variant="ghost" className="hover:bg-destructive/20 hover:text-destructive">
            <LogOut className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        <FinancialTicker />
        
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-700"
        >
          <div className="animate-in slide-in-from-left-5 duration-500 delay-100">
            <Card className="relative overflow-hidden bg-card border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-6 relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Total Expenses</div>
                    <div className="text-3xl font-bold text-foreground">{formatINR(totalExpenses)}</div>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[70%]" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="animate-in slide-in-from-bottom-5 duration-500 delay-200">
            <Card className="relative overflow-hidden bg-card border-border hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 group">
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-6 relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Monthly Budget</div>
                    <div className="text-3xl font-bold text-foreground">{formatINR(monthlyBudget)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10" 
                      onClick={() => setIsBudgetDialogOpen(true)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Wallet className="w-5 h-5 text-emerald-500" />
                    </div>
                  </div>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[100%]" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="animate-in slide-in-from-bottom-5 duration-500 delay-200">
            <Card className="relative overflow-hidden bg-card border-border hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group">
              <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-6 relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Remaining</div>
                    <div className={`text-3xl font-bold ${remaining < 0 ? 'text-destructive' : 'text-cyan-500'}`}>
                      {formatINR(remaining)}
                    </div>
                  </div>
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <PieChartIcon className="w-5 h-5 text-cyan-500" />
                  </div>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${remaining < 0 ? 'bg-destructive' : 'bg-cyan-500'}`}
                    style={{ width: `${Math.max(0, Math.min(100, (remaining / monthlyBudget) * 100))}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="h-[400px] animate-in slide-in-from-left-5 duration-500 delay-300"
          >
            <Card className="h-full bg-card/50 border-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-card-foreground">Spending Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                        itemStyle={{ color: 'hsl(var(--primary))' }}
                      />
                      <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div
            className="h-[400px] animate-in slide-in-from-right-5 duration-500 delay-400"
          >
            <Card className="h-full bg-card/50 border-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-card-foreground">Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {categoryData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs text-muted-foreground">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>



        <div
          className="animate-in slide-in-from-bottom-5 duration-500 delay-500"
        >
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Recent Transactions</CardTitle>
              </div>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Add Expense</span>
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {expenses.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-16 text-center animate-in zoom-in duration-300"
                >
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
                      <Wallet className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Start Your Rupee Journey!</h3>
                    <p className="text-muted-foreground max-w-sm mb-8">
                      Every big saving starts with a small entry. Track your first expense today.
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                      <Plus className="w-4 h-4 mr-2" /> Add First Expense
                    </Button>
                  </div>
                ) : (
                  expenses.slice().reverse().map((e) => {
                    const Icon = getCategoryIcon(e.category);
                    return (
                      <div
                        key={e.id}
                        className="group flex justify-between items-center p-4 rounded-xl bg-muted/30 hover:bg-muted/80 transition-all border border-transparent hover:border-border animate-in slide-in-from-left-5 duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="p-3 rounded-xl bg-opacity-20 transition-transform group-hover:scale-110"
                            style={{ backgroundColor: `${getCategoryColor(e.category)}20` }}
                          >
                            <Icon className="w-5 h-5" style={{ color: getCategoryColor(e.category) }} />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{e.description}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{e.category}</span>
                              <span>•</span>
                              <span>{new Date(e.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="font-bold text-foreground font-mono">{formatINR(e.amount)}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                            onClick={() => handleDeleteExpense(e.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-card border-border text-card-foreground">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Add a new expense to track your spending.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="col-span-3 bg-input border-border text-foreground"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                >
                  <SelectTrigger className="col-span-3 bg-input border-border text-foreground">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="col-span-3 bg-input border-border text-foreground"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddExpense} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Add Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-card border-border text-card-foreground">
            <DialogHeader>
              <DialogTitle>Set Monthly Budget</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter your target monthly budget limit.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budget" className="text-right">
                  Amount
                </Label>
                <Input
                  id="budget"
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="col-span-3 bg-input border-border text-foreground"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleUpdateBudget} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <ChatBot
        expenses={expenses}
        monthlyBudget={monthlyBudget}
        totalExpenses={totalExpenses}
      />
    </div>
  );
}

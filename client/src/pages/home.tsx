import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  TrendingUp,
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
} from "lucide-react";

interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

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

const formatINR = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const initialExpenses: Expense[] = [
  { id: 1, amount: 2500, category: "Food", description: "Groceries", date: "2026-01-08" },
  { id: 2, amount: 1500, category: "Transport", description: "Petrol", date: "2026-01-07" },
  { id: 3, amount: 5000, category: "Shopping", description: "Clothes", date: "2026-01-06" },
  { id: 4, amount: 800, category: "Entertainment", description: "Movie tickets", date: "2026-01-05" },
  { id: 5, amount: 15000, category: "Housing", description: "Rent", date: "2026-01-01" },
  { id: 6, amount: 3000, category: "Health", description: "Medicine", date: "2026-01-04" },
  { id: 7, amount: 2000, category: "Education", description: "Books", date: "2026-01-03" },
  { id: 8, amount: 1200, category: "Food", description: "Restaurant", date: "2026-01-02" },
];

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "",
    description: "",
  });

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyBudget = 50000;
  const remaining = monthlyBudget - totalExpenses;

  const categoryData = CATEGORIES.map((cat) => ({
    name: cat.name,
    value: expenses
      .filter((exp) => exp.category === cat.name)
      .reduce((sum, exp) => sum + exp.amount, 0),
    color: cat.color,
  })).filter((cat) => cat.value > 0);

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.category || !newExpense.description) return;

    const expense: Expense = {
      id: Date.now(),
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      description: newExpense.description,
      date: new Date().toISOString().split("T")[0],
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({ amount: "", category: "", description: "" });
    setIsDialogOpen(false);
  };

  const handleDeleteExpense = (id: number) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = CATEGORIES.find((c) => c.name === categoryName);
    return category ? category.icon : Wallet;
  };

  const getCategoryColor = (categoryName: string) => {
    const category = CATEGORIES.find((c) => c.name === categoryName);
    return category ? category.color : "#64748b";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold font-display" data-testid="text-app-title">
              Expense Tracker
            </h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-expense" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Add New Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, amount: e.target.value })
                    }
                    data-testid="input-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) =>
                      setNewExpense({ ...newExpense, category: value })
                    }
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="What was this expense for?"
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, description: e.target.value })
                    }
                    data-testid="input-description"
                  />
                </div>
                <Button
                  onClick={handleAddExpense}
                  className="w-full"
                  data-testid="button-submit-expense"
                >
                  Add Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-3xl font-bold font-display text-primary" data-testid="text-total-spent">
                    {formatINR(totalExpenses)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Budget</p>
                  <p className="text-3xl font-bold font-display text-[hsl(var(--chart-2))]" data-testid="text-budget">
                    {formatINR(monthlyBudget)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--chart-2))]/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-[hsl(var(--chart-2))]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${remaining >= 0 ? 'from-green-500/10 to-green-500/5 border-green-500/20' : 'from-destructive/10 to-destructive/5 border-destructive/20'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className={`text-3xl font-bold font-display ${remaining >= 0 ? 'text-green-600' : 'text-destructive'}`} data-testid="text-remaining">
                    {formatINR(remaining)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full ${remaining >= 0 ? 'bg-green-500/20' : 'bg-destructive/20'} flex items-center justify-center`}>
                  <TrendingDown className={`w-6 h-6 ${remaining >= 0 ? 'text-green-600' : 'text-destructive'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatINR(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-muted-foreground">{cat.name}</span>
                    <span className="ml-auto font-medium">{formatINR(cat.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatINR(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Top Category:{" "}
                  <span className="font-semibold text-foreground">
                    {categoryData.length > 0
                      ? categoryData.reduce((a, b) => (a.value > b.value ? a : b)).name
                      : "N/A"}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-display">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenses.map((expense) => {
                const Icon = getCategoryIcon(expense.category);
                const color = getCategoryColor(expense.category);
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                    data-testid={`row-expense-${expense.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.category} • {new Date(expense.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold font-display text-lg" data-testid={`text-amount-${expense.id}`}>
                        -{formatINR(expense.amount)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteExpense(expense.id)}
                        data-testid={`button-delete-${expense.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {expenses.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No expenses yet. Add your first expense!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

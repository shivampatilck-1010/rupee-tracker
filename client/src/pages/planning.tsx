import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, User, Home, TrendingUp, Calculator, PieChart as PieChartIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import AIInsights from "@/components/ai-insights";

const formatINR = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getAmount = (amount: any): number => {
  if (typeof amount === 'string') {
    return parseFloat(amount) || 0;
  }
  return Number(amount) || 0;
};

interface Expense {
  id: string;
  amount: number | string;
  category: string;
  description: string;
  date: string;
}

export default function PlanningPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState(50000);

  // Planning inputs
  const [savingsGoal, setSavingsGoal] = useState("10000");
  const [futureMonths, setFutureMonths] = useState("3");
  const [targetAmount, setTargetAmount] = useState("");

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [expRes, budRes] = await Promise.all([
          fetch("/api/expenses", { credentials: "include" }),
          fetch("/api/budget", { credentials: "include" }),
        ]);

        if (expRes.ok) {
          const data = await expRes.json();
          setExpenses(data || []);
        }
        if (budRes.ok) {
          const { budget } = await budRes.json();
          setMonthlyBudget(budget || 50000);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/");
    } catch (error) {
      toast({ title: "Error", description: "Failed to logout", variant: "destructive" });
    }
  };

  // Calculate average monthly spending
  const calculateAverageSpending = () => {
    if (expenses.length === 0) return 0;
    
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    
    const recentExpenses = expenses.filter(exp => new Date(exp.date) > sixMonthsAgo);
    if (recentExpenses.length === 0) return 0;

    const total = recentExpenses.reduce((sum, exp) => sum + getAmount(exp.amount), 0);
    const months = Math.max(1, 6);
    return total / months;
  };

  // Calculate category spending trends
  const getCategoryTrends = () => {
    const categories: { [key: string]: number[] } = {};
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
      const monthStr = date.toLocaleString("default", { month: "short", year: "2-digit" });
      
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === date.getMonth() && expDate.getFullYear() === date.getFullYear();
      });

      monthExpenses.forEach(exp => {
        if (!categories[exp.category]) {
          categories[exp.category] = Array(12).fill(0);
        }
        const monthIdx = 11 - i;
        categories[exp.category][monthIdx] += getAmount(exp.amount);
      });
    }

    return categories;
  };

  // Build projection data
  const buildProjection = () => {
    const avgMonthly = calculateAverageSpending();
    const months = parseInt(futureMonths) || 3;
    const target = parseInt(targetAmount) || monthlyBudget * months;
    const savings = parseInt(savingsGoal) || 10000;

    const data = [];
    for (let i = 0; i <= months; i++) {
      const dateKey = new Date(new Date().getFullYear(), new Date().getMonth() + i, 1)
        .toLocaleString("default", { month: "short", year: "2-digit" });
      
      data.push({
        month: dateKey,
        projected: i === 0 ? 0 : avgMonthly * i,
        budget: monthlyBudget * i,
        savings: i === 0 ? 0 : Math.max(0, target - (avgMonthly * i)),
      });
    }
    return data;
  };

  const avgMonthly = calculateAverageSpending();
  const categoryTrends = getCategoryTrends();
  const projectionData = buildProjection();
  const months = parseInt(futureMonths) || 3;
  const target = parseInt(targetAmount) || monthlyBudget * months;
  const projectedSpending = avgMonthly * months;
  const projectedSavings = Math.max(0, target - projectedSpending);

  // Build monthly trend chart data
  const monthlyTrendData = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
    const monthStr = date.toLocaleString("default", { month: "short" });
    
    const monthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === date.getMonth() && expDate.getFullYear() === date.getFullYear();
    });

    const total = monthExpenses.reduce((sum, exp) => sum + getAmount(exp.amount), 0);
    monthlyTrendData.push({
      month: monthStr,
      spent: total,
      budget: monthlyBudget,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                Financial Planning
              </h1>
              <p className="text-sm text-slate-400">Analyze, predict, and plan your future finances</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate("/app")}
                variant="outline"
                className="text-slate-300 border-slate-600 hover:bg-slate-800/50 hover:border-slate-500 hover:text-white transition-all duration-300"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                onClick={() => navigate("/profile")}
                variant="outline"
                className="text-slate-300 border-slate-600 hover:bg-slate-800/50 hover:border-slate-500 hover:text-white transition-all duration-300"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-500/20 border-blue-700/50 shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-slate-200 text-sm font-medium">Avg Monthly Spending</CardTitle>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatINR(avgMonthly)}</div>
              <p className="text-xs text-slate-400 mt-2">Based on last 6 months</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-green-500/20 border-green-700/50 shadow-lg hover:shadow-green-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-slate-200 text-sm font-medium">Monthly Budget</CardTitle>
              <Calculator className="w-5 h-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatINR(monthlyBudget)}</div>
              <p className="text-xs text-slate-400 mt-2">Your set limit</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-500/20 border-purple-700/50 shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-slate-200 text-sm font-medium">Monthly Potential</CardTitle>
              <PieChartIcon className="w-5 h-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatINR(Math.max(0, monthlyBudget - avgMonthly))}</div>
              <p className="text-xs text-slate-400 mt-2">Savings available</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600/20 to-orange-500/20 border-orange-700/50 shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-slate-200 text-sm font-medium">Last 30 Days</CardTitle>
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatINR(
                  expenses
                    .filter(exp => new Date(exp.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                    .reduce((sum, exp) => sum + getAmount(exp.amount), 0)
                )}
              </div>
              <p className="text-xs text-slate-400 mt-2">Recent expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* Planning Inputs */}
        <Card className="bg-slate-800/60 border-slate-700 shadow-xl backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              Projection Settings
            </CardTitle>
            <p className="text-sm text-slate-400 mt-2">Configure your financial planning parameters</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="savings" className="text-white font-medium">
                Monthly Savings Goal
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">₹</span>
                <Input
                  id="savings"
                  type="number"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white pl-7 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                  placeholder="10000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="months" className="text-white font-medium">
                Projection Period
              </Label>
              <div className="relative">
                <Input
                  id="months"
                  type="number"
                  value={futureMonths}
                  onChange={(e) => setFutureMonths(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                  placeholder="3"
                />
                <span className="absolute right-3 top-3 text-slate-400">months</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target" className="text-white font-medium">
                Target Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">₹</span>
                <Input
                  id="target"
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white pl-7 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                  placeholder={String(monthlyBudget * parseInt(futureMonths))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <Card className="bg-slate-800/60 border-slate-700 shadow-xl backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                12-Month Spending Trend
              </CardTitle>
              <p className="text-sm text-slate-400 mt-2">Your actual spending vs. budget line</p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      formatter={(value: number) => [formatINR(value), 'Amount']}
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="spent" stroke="#3b82f6" strokeWidth={2.5} name="Actual Spending" dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="budget" stroke="#10b981" strokeWidth={2.5} strokeDasharray="5 5" name="Budget" dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Future Projection */}
          <Card className="bg-slate-800/60 border-slate-700 shadow-xl backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-purple-400" />
                Future Projection
              </CardTitle>
              <p className="text-sm text-slate-400 mt-2">Projected spending for next {months} months</p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      formatter={(value: number) => formatINR(value)}
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="projected" fill="#3b82f6" name="Projected Spending" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="budget" fill="#10b981" name="Budget Limit" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projection Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-500/20 border-blue-700/50 shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-slate-200 text-sm font-medium">Projected Spending</CardTitle>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{formatINR(projectedSpending)}</p>
              <p className="text-xs text-slate-400 mt-2">
                Over next {months} {months === 1 ? 'month' : 'months'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-green-500/20 border-green-700/50 shadow-lg hover:shadow-green-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-slate-200 text-sm font-medium">Target Amount</CardTitle>
              <Calculator className="w-5 h-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{formatINR(target)}</p>
              <p className="text-xs text-slate-400 mt-2">
                {projectedSpending > target ? '❌ Will exceed' : '✅ Will be under'} target
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-500/20 border-purple-700/50 shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-slate-200 text-sm font-medium">Projected Savings</CardTitle>
              <PieChartIcon className="w-5 h-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{formatINR(projectedSavings)}</p>
              <p className="text-xs text-slate-400 mt-2">
                At current spending rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              AI-Powered Financial Analysis
            </h2>
            <p className="text-slate-400">Get intelligent insights powered by advanced financial AI</p>
          </div>
          <AIInsights expenses={expenses} monthlyBudget={monthlyBudget} />
        </div>

        {/* Tips */}
        <Card className="bg-slate-800/60 border-slate-700 shadow-xl backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Planning Tips & Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-700/30">
              <span className="text-blue-400 font-bold">•</span>
              <p className="text-sm text-slate-300">
                Your average monthly spending is <span className="font-semibold text-blue-400">{formatINR(avgMonthly)}</span> based on recent transaction history.
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-700/30">
              <span className="text-green-400 font-bold">•</span>
              <p className="text-sm text-slate-300">
                You can save <span className="font-semibold text-green-400">{formatINR(Math.max(0, monthlyBudget - avgMonthly))}</span> per month at your current spending rate.
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-700/30">
              <span className="text-purple-400 font-bold">•</span>
              <p className="text-sm text-slate-300">
                To reach ₹{targetAmount || (monthlyBudget * months).toString()} in {months} months, maintain spending below <span className="font-semibold text-purple-400">{formatINR(target / months)}</span> per month.
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-700/30">
              <span className="text-orange-400 font-bold">•</span>
              <p className="text-sm text-slate-300">
                Set realistic goals based on your past spending patterns and review them monthly for better outcomes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { LogOut, User, TrendingUp, PieChart as PieChartIcon, Home, Mail, AtSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ModeToggle } from "@/components/mode-toggle";

interface ProfileStats {
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
  };
  totalYearlySpending: number;
  categorySpending: Record<string, number>;
  totalExpenses: number;
}

const COLORS = [
  "#10b981",
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#6366f1",
];

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: stats, isLoading, error } = useQuery<ProfileStats>({
    queryKey: ["profile-stats"],
    queryFn: async () => {
      const response = await fetch("/api/profile/stats", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setLocation("/login");
          throw new Error("Not authenticated");
        }
        throw new Error("Failed to fetch profile stats");
      }

      return response.json();
    },
  });

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    toast({ title: "Success", description: "Logged out successfully" });
    setLocation("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary mx-auto animate-spin"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg">Failed to load profile</div>
          <Button onClick={() => setLocation("/app")} className="bg-primary hover:bg-primary/90">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const chartData = Object.entries(stats.categorySpending).map(([category, amount]) => ({
    name: category,
    value: parseFloat(amount.toString()),
  }));

  const monthlyData = [
    { month: "Jan", amount: stats.totalYearlySpending / 12 },
    { month: "Feb", amount: stats.totalYearlySpending / 12 },
    { month: "Mar", amount: stats.totalYearlySpending / 12 },
    { month: "Apr", amount: stats.totalYearlySpending / 12 },
    { month: "May", amount: stats.totalYearlySpending / 12 },
    { month: "Jun", amount: stats.totalYearlySpending / 12 },
    { month: "Jul", amount: stats.totalYearlySpending / 12 },
    { month: "Aug", amount: stats.totalYearlySpending / 12 },
    { month: "Sep", amount: stats.totalYearlySpending / 12 },
    { month: "Oct", amount: stats.totalYearlySpending / 12 },
    { month: "Nov", amount: stats.totalYearlySpending / 12 },
    { month: "Dec", amount: stats.totalYearlySpending / 12 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary flex items-center justify-center">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                {stats.user.fullName}'s Profile
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setLocation("/app")}
                variant="ghost"
                className="hover:bg-muted"
              >
                <Home className="w-4 h-4 sm:mr-2 text-primary" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <ModeToggle />
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="hover:bg-destructive/20 hover:text-destructive"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* User Info Card */}
        <Card className="bg-card border-border shadow-xl backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Full Name</p>
                  <p className="text-foreground text-lg font-semibold">{stats.user.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <AtSign className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Username</p>
                  <p className="text-foreground text-lg font-semibold">@{stats.user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Email</p>
                  <p className="text-foreground text-lg font-semibold text-ellipsis overflow-hidden">{stats.user.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-muted-foreground text-sm font-medium">Yearly Spending</CardTitle>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-foreground">₹{stats.totalYearlySpending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
              <p className="text-xs text-muted-foreground">Total in {new Date().getFullYear()}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-muted-foreground text-sm font-medium">Total Expenses</CardTitle>
              <PieChartIcon className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-foreground">{stats.totalExpenses}</div>
              <p className="text-xs text-muted-foreground">Transactions recorded</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg hover:shadow-green-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-muted-foreground text-sm font-medium">Monthly Average</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-foreground">₹{((stats.totalYearlySpending / 12).toLocaleString('en-IN', { maximumFractionDigits: 0 }))}</div>
              <p className="text-xs text-muted-foreground">Average per month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card className="bg-card border-border shadow-xl backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-foreground">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                      formatter={(value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No expense data yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Bar Chart */}
          <Card className="bg-card border-border shadow-xl backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-foreground">Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                    formatter={(value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Details */}
        <Card className="bg-card border-border shadow-xl backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-foreground">Spending Details by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {chartData.length > 0 ? (
                chartData.map((item, index) => {
                  const percentage = ((item.value / Object.values(stats.categorySpending).reduce((a, b) => a + parseFloat(b.toString()), 0)) * 100).toFixed(1);
                  return (
                    <div key={item.name} className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 transition-all duration-300">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1">
                        <div
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <div className="flex-1">
                          <span className="text-foreground font-medium text-sm sm:text-base">{item.name}</span>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">{percentage}% of total</p>
                        </div>
                      </div>
                      <span className="text-foreground font-bold text-base sm:text-lg">₹{item.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-8">No expense data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

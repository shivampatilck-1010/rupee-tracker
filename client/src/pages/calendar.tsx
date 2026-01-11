import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Home,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  amount: number | string;
  category: string;
  description: string;
  date: string;
}

const getAmount = (amount: any): number => {
  if (typeof amount === 'string') {
    return parseFloat(amount) || 0;
  }
  return Number(amount) || 0;
};

const formatINR = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CalendarPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 9)); // January 9, 2026
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Load expenses on mount
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const response = await fetch("/api/expenses", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setExpenses(data || []);
        }
      } catch (error) {
        console.error("Failed to load expenses:", error);
      }
    };
    loadExpenses();
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

  // Get expenses for a specific date
  const getExpensesForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return expenses.filter((exp) => exp.date === dateStr);
  };

  // Get total for a specific date
  const getTotalForDate = (date: Date) => {
    return getExpensesForDate(date).reduce((sum, exp) => sum + getAmount(exp.amount), 0);
  };

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const selectedDateStr = selectedDate;
  const selectedDateExpenses = selectedDateStr
    ? expenses.filter((exp) => exp.date === selectedDateStr)
    : [];
  const selectedDateTotal = selectedDateExpenses.reduce((sum, exp) => sum + getAmount(exp.amount), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                Expense Calendar
              </h1>
              <p className="text-sm text-slate-400">View and analyze your daily expenses</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/60 border-slate-700 shadow-xl backdrop-blur-xl">
              <CardHeader className="border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousMonth}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <CardTitle className="text-2xl font-bold text-white">{monthName}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextMonth}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Day labels */}
                <div className="grid grid-cols-7 gap-2 mb-4 pb-4 border-b border-slate-700/50">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div
                      key={day}
                      className="text-center font-semibold text-slate-300 py-3 text-sm"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((date, idx) => {
                    if (!date) {
                      return <div key={`empty-${idx}`} className="aspect-square" />;
                    }

                    const dateStr = date.toISOString().split("T")[0];
                    const dayExpenses = getExpensesForDate(date);
                    const dayTotal = getTotalForDate(date);
                    const isSelected = selectedDateStr === dateStr;
                    const isToday =
                      date.toISOString().split("T")[0] ===
                      new Date(2026, 0, 9).toISOString().split("T")[0];

                    return (
                      <button
                        key={dateStr}
                        onClick={() =>
                          setSelectedDate(isSelected ? null : dateStr)
                        }
                        className={`aspect-square p-2 rounded-lg transition-all text-sm font-medium ${
                          isSelected
                            ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white ring-2 ring-blue-400 shadow-lg shadow-blue-500/20"
                            : dayTotal > 0
                            ? "bg-slate-700/50 text-slate-100 hover:bg-slate-700 border border-slate-600/50"
                            : "bg-slate-700/30 text-slate-400 hover:bg-slate-700/50 border border-slate-700/30"
                        } ${isToday ? "ring-2 ring-green-400 ring-inset" : ""}`}
                      >
                        <div className="font-bold text-lg text-center">{date.getDate()}</div>
                        {dayExpenses.length > 0 && (
                          <div className="text-xs mt-1 text-center opacity-90">
                            {dayExpenses.length}
                          </div>
                        )}
                        {dayTotal > 0 && (
                          <div className={`text-xs font-bold mt-0.5 text-center truncate ${isSelected ? 'text-blue-100' : dayExpenses.length > 0 ? 'text-emerald-300' : 'text-slate-300'}`}>
                            ₹{Math.round(getAmount(dayTotal))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Click to view expenses</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Today's date</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span>Has expenses</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expense details for selected date */}
          <div>
            {selectedDate ? (
              <Card className="bg-slate-800/60 border-slate-700 shadow-xl backdrop-blur-xl sticky top-24">
                <CardHeader className="border-b border-slate-700/50">
                  <CardTitle className="text-white">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {selectedDateExpenses.length > 0 ? (
                    <>
                      <div className="space-y-3">
                        {selectedDateExpenses.map((expense, idx) => (
                          <div
                            key={expense.id}
                            className="bg-gradient-to-r from-slate-700/50 to-slate-700/30 rounded-lg p-4 space-y-2 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white">{expense.category}</p>
                                <p className="text-sm text-slate-400 truncate">{expense.description}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-lg text-emerald-400">
                                  ₹{getAmount(expense.amount).toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-slate-600/50 pt-4 mt-4">
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 rounded-lg border border-emerald-700/50">
                          <p className="text-slate-300 font-semibold">Total:</p>
                          <p className="text-2xl font-bold text-emerald-400">
                            {formatINR(selectedDateTotal)}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-3">
                        <CalendarIcon className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-slate-400">No expenses on this date</p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:text-white transition-all duration-300"
                    onClick={() => setSelectedDate(null)}
                  >
                    Clear Selection
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800/60 border-slate-700 shadow-xl backdrop-blur-xl">
                <CardHeader className="border-b border-slate-700/50">
                  <CardTitle className="text-white text-lg">
                    Monthly Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400 font-medium">Total Expenses</p>
                    <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">
                      {formatINR(
                        expenses
                          .filter((exp) => {
                            const expDate = new Date(exp.date);
                            return (
                              expDate.getMonth() === currentDate.getMonth() &&
                              expDate.getFullYear() === currentDate.getFullYear()
                            );
                          })
                          .reduce((sum, exp) => sum + getAmount(exp.amount), 0)
                      )}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/20 rounded-lg p-4 border border-blue-700/50">
                      <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">Days with expenses</p>
                      <p className="text-2xl font-bold text-white">
                        {new Set(
                          expenses
                            .filter((exp) => {
                              const expDate = new Date(exp.date);
                              return (
                                expDate.getMonth() === currentDate.getMonth() &&
                                expDate.getFullYear() === currentDate.getFullYear()
                              );
                            })
                            .map((exp) => exp.date)
                        ).size}
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-600/20 to-purple-500/20 rounded-lg p-4 border border-purple-700/50">
                      <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-1">Total transactions</p>
                      <p className="text-2xl font-bold text-white">
                        {expenses.filter((exp) => {
                          const expDate = new Date(exp.date);
                          return (
                            expDate.getMonth() === currentDate.getMonth() &&
                            expDate.getFullYear() === currentDate.getFullYear()
                          );
                        }).length}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 text-center pt-4">
                    👆 Select a date to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

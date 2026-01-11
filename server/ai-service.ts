import type { Expense } from "@shared/schema";

export interface AIInsight {
  category: string;
  percentage: number;
  trend: "up" | "down" | "stable";
  advice: string;
}

export interface AIPrediction {
  nextMonthSpending: number;
  confidence: number;
  trend: string;
}

export interface AIRecommendation {
  title: string;
  description: string;
  potentialSavings: number;
  priority: "high" | "medium" | "low";
}

export interface AIAnalysisResult {
  insights: AIInsight[];
  predictions: AIPrediction[];
  recommendations: AIRecommendation[];
  summary: string;
  riskScore: number;
}

function getAmount(amount: any): number {
  if (typeof amount === "string") {
    return parseFloat(amount) || 0;
  }
  if (typeof amount === "number") {
    return amount;
  }
  return 0;
}

function getCategoryStats(expenses: Expense[]) {
  const stats: { [key: string]: { total: number; count: number; dates: Date[] } } = {};

  expenses.forEach((exp) => {
    try {
      const category = (exp.category || "Other").toString();
      const amount = getAmount(exp.amount);
      
      if (!stats[category]) {
        stats[category] = { total: 0, count: 0, dates: [] };
      }
      stats[category].total += amount;
      stats[category].count += 1;
      
      const date = exp.date ? new Date(exp.date) : new Date();
      if (!isNaN(date.getTime())) {
        stats[category].dates.push(date);
      }
    } catch (e) {
      // Skip malformed entries
    }
  });

  return stats;
}

function calculateTrend(
  expenses: Expense[],
  category: string,
  months: number = 3
): "up" | "down" | "stable" {
  const now = new Date();
  const monthData: number[] = [];

  for (let i = 0; i < months; i++) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const monthTotal = expenses
      .filter(
        (exp) => {
          try {
            const expDate = new Date(exp.date);
            return (
              !isNaN(expDate.getTime()) &&
              (exp.category || "Other").toString() === category &&
              expDate >= startOfMonth &&
              expDate <= endOfMonth
            );
          } catch {
            return false;
          }
        }
      )
      .reduce((sum, exp) => sum + getAmount(exp.amount), 0);

    monthData.unshift(monthTotal);
  }

  if (monthData.length < 2) return "stable";

  const recentAvg = (monthData[monthData.length - 1] + monthData[monthData.length - 2]) / 2;
  const olderAvg = monthData.slice(0, -2).reduce((a, b) => a + b, 0) / (monthData.length - 2 || 1);

  const percentChange = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

  if (percentChange > 10) return "up";
  if (percentChange < -10) return "down";
  return "stable";
}

export function analyzeExpenses(expenses: any[], monthlyBudget: number): AIAnalysisResult {
  // Ensure expenses is an array and sanitize data
  const validExpenses = Array.isArray(expenses) ? expenses : [];
  
  if (validExpenses.length === 0) {
    return {
      insights: [],
      predictions: [{ nextMonthSpending: 0, confidence: 0, trend: "stable" }],
      recommendations: [],
      summary: "No expenses to analyze. Add expenses to get AI insights.",
      riskScore: 0,
    };
  }

  const stats = getCategoryStats(validExpenses);
  const totalSpending = Object.values(stats).reduce((sum, s) => sum + s.total, 0);

  // Generate insights
  const insights: AIInsight[] = Object.entries(stats).map(([category, data]) => {
    const percentage = totalSpending > 0 ? (data.total / totalSpending) * 100 : 0;
    const trend = calculateTrend(expenses, category);

    let advice = "";
    if (percentage > 40) {
      advice = `${category} is consuming over 40% of your budget. Consider reducing non-essential spending in this category.`;
    } else if (percentage > 25) {
      advice = `${category} is a significant expense category. Monitor this area for optimization opportunities.`;
    } else {
      advice = `${category} spending is well-controlled at ${percentage.toFixed(1)}%.`;
    }

    if (trend === "up") {
      advice += ` This category shows an upward trend - be mindful of increasing costs.`;
    } else if (trend === "down") {
      advice += ` Good news: ${category} spending is trending downward!`;
    }

    return { category, percentage, trend, advice };
  });

  // Generate predictions
  const last6Months = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return expDate > sixMonthsAgo;
  });

  const monthlyAverages: number[] = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthTotal = last6Months
      .filter((exp) => {
        const expDate = new Date(exp.date);
        return expDate >= monthStart && expDate <= monthEnd;
      })
      .reduce((sum, exp) => sum + getAmount(exp.amount), 0);

    monthlyAverages.unshift(monthTotal);
  }

  const avgMonthly = monthlyAverages.length > 0 ? monthlyAverages.reduce((a, b) => a + b, 0) / monthlyAverages.length : 0;
  const nextMonthSpending = avgMonthly;
  const confidence = Math.min(100, Math.max(50, monthlyAverages.length * 15));
  const trend = monthlyAverages[monthlyAverages.length - 1] > avgMonthly ? "increasing" : "stable";

  const predictions: AIPrediction[] = [
    {
      nextMonthSpending,
      confidence: confidence / 100,
      trend,
    },
  ];

  // Generate recommendations
  const recommendations: AIRecommendation[] = [];

  // High spending categories recommendation
  const highSpending = insights.filter((i) => i.percentage > 30);
  if (highSpending.length > 0) {
    const savings = highSpending.reduce((sum, i) => sum + (getAmount(stats[i.category].total) * 0.1), 0);
    recommendations.push({
      title: "Reduce High-Spending Categories",
      description: `Your top spending categories (${highSpending.map((i) => i.category).join(", ")}) account for ${highSpending.reduce((sum, i) => sum + i.percentage, 0).toFixed(1)}% of expenses. A 10% reduction could save significant money.`,
      potentialSavings: savings,
      priority: "high",
    });
  }

  // Budget vs spending recommendation
  if (avgMonthly > monthlyBudget * 0.9) {
    recommendations.push({
      title: "Current Spending Exceeds Target",
      description: `Your average monthly spending (₹${avgMonthly.toFixed(0)}) is approaching your budget of ₹${monthlyBudget}. Implement cost control measures immediately.`,
      potentialSavings: avgMonthly - monthlyBudget,
      priority: "high",
    });
  } else if (avgMonthly > monthlyBudget * 0.75) {
    recommendations.push({
      title: "Budget Utilization Alert",
      description: `You're using 75%+ of your monthly budget. Plan carefully to avoid exceeding limits.`,
      potentialSavings: monthlyBudget - avgMonthly,
      priority: "medium",
    });
  }

  // Frequent small transactions recommendation
  const smallTransactions = expenses.filter((exp) => getAmount(exp.amount) < 500).length;
  if (smallTransactions > expenses.length * 0.3) {
    const smallTotal = expenses
      .filter((exp) => getAmount(exp.amount) < 500)
      .reduce((sum, exp) => sum + getAmount(exp.amount), 0);
    recommendations.push({
      title: "Monitor Micro-Transactions",
      description: `${Math.round((smallTransactions / expenses.length) * 100)}% of your transactions are small (< ₹500). These can add up quickly. Track them carefully.`,
      potentialSavings: smallTotal * 0.15,
      priority: "medium",
    });
  }

  // Category distribution recommendation
  if (insights.length > 1) {
    const mostVariable = insights.reduce((prev, curr) =>
      Math.abs(curr.percentage - 20) < Math.abs(prev.percentage - 20) ? curr : prev
    );
    if (mostVariable.trend === "up") {
      recommendations.push({
        title: "Address Growing Category",
        description: `${mostVariable.category} is growing rapidly. Implement stricter controls or find alternatives.`,
        potentialSavings: getAmount(stats[mostVariable.category].total) * 0.15,
        priority: "medium",
      });
    }
  }

  // Calculate risk score (0-100)
  let riskScore = 0;

  // If spending is close to or exceeds budget
  if (avgMonthly >= monthlyBudget) {
    riskScore += 40;
  } else if (avgMonthly >= monthlyBudget * 0.8) {
    riskScore += 25;
  }

  // If there are uptrending categories
  const uptrendCount = insights.filter((i) => i.trend === "up").length;
  riskScore += uptrendCount * 15;

  // If spending is volatile
  const variance = monthlyAverages.length > 1
    ? monthlyAverages.reduce((sum, val) => sum + Math.pow(val - avgMonthly, 2), 0) / monthlyAverages.length
    : 0;
  const volatility = Math.sqrt(variance);
  if (volatility > avgMonthly * 0.3) {
    riskScore += 20;
  }

  riskScore = Math.min(100, riskScore);

  // Generate summary
  let summary = `Based on your spending patterns of ₹${totalSpending.toFixed(0)} across ${insights.length} categories, `;

  if (riskScore > 70) {
    summary += `your financial health is at risk. Immediate action is needed to control spending and align with your ₹${monthlyBudget} budget.`;
  } else if (riskScore > 40) {
    summary += `you should be cautious. Review spending habits and implement our recommendations to avoid budget overruns.`;
  } else {
    summary += `your financial situation is stable. Continue monitoring and following the recommended optimizations to maintain control.`;
  }

  return {
    insights: insights.sort((a, b) => b.percentage - a.percentage),
    predictions,
    recommendations,
    summary,
    riskScore,
  };
}

export function predictFutureSavings(expenses: any[], monthlyBudget: number, months: number): { month: string; projected: number }[] {
  const validExpenses = Array.isArray(expenses) ? expenses : [];
  
  if (validExpenses.length === 0) {
    return [];
  }

  const last6Months = validExpenses.filter((exp) => {
    try {
      const expDate = new Date(exp.date);
      if (isNaN(expDate.getTime())) return false;
      
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return expDate > sixMonthsAgo;
    } catch {
      return false;
    }
  });

  const monthlyAverages: number[] = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthTotal = last6Months
      .filter((exp) => {
        const expDate = new Date(exp.date);
        return expDate >= monthStart && expDate <= monthEnd;
      })
      .reduce((sum, exp) => sum + getAmount(exp.amount), 0);

    monthlyAverages.unshift(monthTotal);
  }

  const avgMonthly = monthlyAverages.length > 0 ? monthlyAverages.reduce((a, b) => a + b, 0) / monthlyAverages.length : 0;

  const data: { month: string; projected: number }[] = [];
  for (let i = 0; i <= months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const monthStr = date.toLocaleString("default", { month: "short", year: "2-digit" });

    const projectedSpending = i === 0 ? 0 : avgMonthly * i;
    const projectedSavings = (monthlyBudget * i) - projectedSpending;

    data.push({
      month: monthStr,
      projected: Math.max(0, projectedSavings),
    });
  }

  return data;
}

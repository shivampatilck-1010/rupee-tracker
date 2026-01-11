import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Zap,
  LineChart,
  Shield,
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

interface AIInsight {
  category: string;
  percentage: number;
  trend: "up" | "down" | "stable";
  advice: string;
}

interface AIPrediction {
  nextMonthSpending: number;
  confidence: number;
  trend: string;
}

interface AIRecommendation {
  title: string;
  description: string;
  potentialSavings: number;
  priority: "high" | "medium" | "low";
}

interface AIAnalysis {
  insights: AIInsight[];
  predictions: AIPrediction[];
  recommendations: AIRecommendation[];
  summary: string;
  riskScore: number;
}

interface FutureProjection {
  month: string;
  projected: number;
}

interface AIInsightsProps {
  expenses: any[];
  monthlyBudget: number;
}

const formatINR = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getRiskColor = (score: number) => {
  if (score > 70) return "bg-red-900";
  if (score > 40) return "bg-yellow-900";
  return "bg-green-900";
};

const getRiskBadgeColor = (score: number) => {
  if (score > 70) return "destructive";
  if (score > 40) return "default";
  return "default";
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500/20 border-red-500/50 text-red-300";
    case "medium":
      return "bg-yellow-500/20 border-yellow-500/50 text-yellow-300";
    case "low":
      return "bg-blue-500/20 border-blue-500/50 text-blue-300";
    default:
      return "bg-slate-500/20 border-slate-500/50 text-slate-300";
  }
};

const getTrendIcon = (trend: string) => {
  if (trend === "up") return "📈";
  if (trend === "down") return "📉";
  return "➡️";
};

export default function AIInsights({ expenses, monthlyBudget }: AIInsightsProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [futureProjection, setFutureProjection] = useState<FutureProjection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalysis = async () => {
      if (expenses.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/ai/analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ months: 6 }),
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("API Error:", response.status, errorData);
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.analysis) {
          throw new Error("Invalid response format");
        }
        
        setAnalysis(data.analysis);
        setFutureProjection(data.futureProjection || []);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Load Analysis Error:", errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <p className="text-slate-400 text-center">Add expenses to see AI-powered insights</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <p className="text-slate-400 text-center">Analyzing your expenses with AI...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !analysis) {
    const errorDisplay = error || "Failed to load analysis";
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div>
                <p className="font-semibold mb-1">Unable to Load AI Analysis</p>
                <p className="text-sm mb-3">{errorDisplay}</p>
                <p className="text-xs text-slate-400">Please refresh the page or try again later.</p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk Score and Summary */}
      <Card className={`${getRiskColor(analysis.riskScore)} border-slate-700 bg-opacity-50`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5" />
              Financial Health Score
            </CardTitle>
            <Badge
              variant={getRiskBadgeColor(analysis.riskScore) as any}
              className="text-lg px-3 py-1"
            >
              {analysis.riskScore}/100
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-200 mb-4">{analysis.summary}</p>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all ${
                analysis.riskScore > 70
                  ? "bg-red-500"
                  : analysis.riskScore > 40
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${analysis.riskScore}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Lightbulb className="w-5 h-5" />
            Spending Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.insights.map((insight) => (
            <div key={insight.category} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    {insight.category}
                    <span className="text-sm">{getTrendIcon(insight.trend)}</span>
                  </h4>
                  <p className="text-sm text-slate-300 mt-2">{insight.percentage.toFixed(1)}% of total spending</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    insight.trend === "up"
                      ? "border-red-500 text-red-300"
                      : insight.trend === "down"
                      ? "border-green-500 text-green-300"
                      : "border-slate-500 text-slate-300"
                  }
                >
                  {insight.trend}
                </Badge>
              </div>
              <p className="text-sm text-slate-300">{insight.advice}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Predictions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5" />
            Spending Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.predictions.map((pred) => (
            <div key={pred.trend} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-400">Next Month Estimate</p>
                  <p className="text-2xl font-bold text-blue-400 mt-2">
                    {formatINR(pred.nextMonthSpending)}
                  </p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-400">Budget Remaining</p>
                  <p className={`text-2xl font-bold mt-2 ${
                    monthlyBudget - pred.nextMonthSpending > 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {formatINR(Math.max(0, monthlyBudget - pred.nextMonthSpending))}
                  </p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-400">Forecast Confidence</p>
                  <p className="text-2xl font-bold text-purple-400 mt-2">
                    {Math.round(pred.confidence * 100)}%
                  </p>
                </div>
              </div>
              {futureProjection.length > 0 && (
                <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
                  <p className="text-sm text-slate-300 mb-4">6-Month Savings Projection</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={futureProjection}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                        formatter={(value) => [formatINR(value as number), "Projected Savings"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="projected"
                        stroke="#84cc16"
                        strokeWidth={2}
                        dot={{ fill: "#84cc16" }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="w-5 h-5" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.recommendations.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No immediate recommendations - keep up the good work!</p>
          ) : (
            analysis.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{rec.title}</h4>
                  <Badge
                    variant="outline"
                    className={rec.priority === "high" ? "border-red-500 text-red-300" : ""}
                  >
                    {rec.priority} priority
                  </Badge>
                </div>
                <p className="text-sm mb-3">{rec.description}</p>
                <p className="text-sm font-semibold text-green-300">
                  💰 Potential savings: {formatINR(rec.potentialSavings)}/month
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Category Distribution Chart */}
      {analysis.insights.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <LineChart className="w-5 h-5" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.insights}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="category" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                  formatter={(value) => `${(value as number).toFixed(1)}%`}
                />
                <Bar dataKey="percentage" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

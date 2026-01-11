import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, TrendingUp, PieChart, BarChart3 } from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/me", {
          credentials: "include",
        });
        if (response.ok) {
          // User is authenticated, redirect to app
          setLocation("/app");
        }
      } catch {
        // User is not authenticated, show landing page
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setLocation]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const features = [
    {
      icon: TrendingUp,
      title: "Track Expenses",
      description: "Monitor your spending patterns and trends over time",
    },
    {
      icon: PieChart,
      title: "Category Insights",
      description: "Visualize where your money goes by category",
    },
    {
      icon: BarChart3,
      title: "Budget Management",
      description: "Set and manage budgets for different categories",
    },
    {
      icon: Wallet,
      title: "Smart Analytics",
      description: "Get detailed reports and spending insights",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Rupee Tracker</h1>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setLocation("/login")}
              className="text-white border-slate-600 hover:bg-slate-800"
            >
              Sign In
            </Button>
            <Button
              onClick={() => setLocation("/signup")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-20 text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
          Manage Your Money,
          <span className="text-blue-500"> Smarter</span>
        </h2>
        <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Track expenses, visualize spending patterns, and take control of your finances with Rupee Tracker.
          Simple, powerful, and designed for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button
            onClick={() => setLocation("/signup")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg h-auto w-full sm:w-auto"
          >
            Start Free Today
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/login")}
            className="border-slate-600 text-white hover:bg-slate-800 px-8 py-6 text-lg h-auto w-full sm:w-auto"
          >
            Sign In
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-4xl font-bold text-white text-center mb-16">
          Powerful Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-colors">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Icon className="w-10 h-10 text-blue-500" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-center">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
          <CardHeader>
            <CardTitle className="text-white text-3xl">Ready to get started?</CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Join thousands of users managing their expenses effectively.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setLocation("/signup")}
              size="lg"
              className="bg-white text-blue-600 hover:bg-slate-100"
            >
              Create Your Account
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2026 Rupee Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

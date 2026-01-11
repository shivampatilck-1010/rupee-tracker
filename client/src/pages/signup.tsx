import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Wallet, Mail, Lock, User, CheckCircle2, Smartphone, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const signupMutation = useMutation({
    mutationFn: async (data: {
      username: string;
      email: string;
      fullName: string;
      password: string;
    }) => {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Signup failed");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Account created successfully!" });
      setLocation("/app");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Signup failed",
        variant: "destructive",
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.username || !formData.email || !formData.fullName || !formData.password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    if (formData.password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    const { confirmPassword, ...signupData } = formData;
    signupMutation.mutate(signupData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 bg-slate-900/40 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group transition-all duration-300 hover:opacity-80"
            onClick={() => setLocation("/")}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/30">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Rupee Tracker</h1>
              <p className="text-xs text-slate-400">Financial Management</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation("/login")}
            className="text-slate-300 border-slate-600 hover:bg-slate-800/50 hover:border-slate-500 hover:text-white transition-all duration-300"
          >
            Already have account? <span className="ml-1">Sign in</span>
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* Left Side - Benefits */}
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                  Join Today
                </h2>
                <p className="text-lg text-slate-400">
                  Start your journey to better financial management with powerful tools and AI-driven insights.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold">Easy Expense Tracking</h3>
                    <p className="text-sm text-slate-400">Track all your expenses in one place</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold">Smart Budget Planning</h3>
                    <p className="text-sm text-slate-400">AI-powered recommendations for better savings</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold">Visual Analytics</h3>
                    <p className="text-sm text-slate-400">Beautiful charts to understand your spending</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <Card className="bg-slate-800/60 border-slate-700 shadow-2xl backdrop-blur-xl">
            <CardHeader className="space-y-3 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white">Create Account</CardTitle>
                  <CardDescription className="text-slate-400 mt-1">Join our community today</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-200 font-medium text-sm">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={signupMutation.isPending}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 pl-10 focus:border-green-500 focus:ring-green-500/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-200 font-medium text-sm">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    <Input
                      id="username"
                      name="username"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={signupMutation.isPending}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 pl-10 focus:border-green-500 focus:ring-green-500/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200 font-medium text-sm">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={signupMutation.isPending}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 pl-10 focus:border-green-500 focus:ring-green-500/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200 font-medium text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={signupMutation.isPending}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 pl-10 focus:border-green-500 focus:ring-green-500/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-200 font-medium text-sm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={signupMutation.isPending}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 pl-10 focus:border-green-500 focus:ring-green-500/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-500/30 disabled:opacity-50 mt-2"
                >
                  {signupMutation.isPending ? "Creating account..." : "Create Account"}
                </Button>

                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-800/60 text-slate-400">or</span>
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <p className="text-slate-400 text-sm">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setLocation("/login")}
                      className="text-green-400 hover:text-green-300 font-semibold transition-colors duration-300"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </form>

              {/* Install App CTA for Mobile */}
              <div className="mt-8 pt-6 border-t border-slate-700/50">
                <div 
                  className="bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300 group"
                  onClick={() => setLocation("/install")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white group-hover:text-green-400 transition-colors">Install for Android</p>
                      <p className="text-xs text-slate-400">Get the native app experience</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-green-400 transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

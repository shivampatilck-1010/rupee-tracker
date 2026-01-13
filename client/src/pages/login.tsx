import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Wallet, Mail, Lock, ArrowRight } from "lucide-react";
import SplashScreen from "@/components/splash-screen";
import { useAuth } from "@/App";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showSplash, setShowSplash] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setAuthenticated } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const playVideo = async () => {
        try {
          await video.play();
        } catch (error) {
          console.log('Video autoplay failed:', error);
        }
      };
      playVideo();
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = "Login failed";
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use status text or default message
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: () => {
      setAuthenticated(true);
      // Show splash screen instead of immediate redirect
      setShowSplash(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      });
    },
  });

  const handleSplashComplete = () => {
    setLocation("/app");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-900">
        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          onError={() => {
            console.log('Video failed to load, hiding video');
            if (videoRef.current) {
              videoRef.current.style.display = 'none';
            }
          }}
          onLoadedData={() => {
            console.log('Video loaded successfully');
          }}
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/background-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        {/* Floating Shapes */}
        <div className="floating-shape floating-shape-1"></div>
        <div className="floating-shape floating-shape-2"></div>
        <div className="floating-shape floating-shape-3"></div>
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 bg-slate-900/10 backdrop-blur-sm sticky top-0 z-20">
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
            onClick={() => setLocation("/signup")}
            className="text-slate-300 border-slate-600 hover:bg-slate-800/50 hover:border-slate-500 hover:text-white transition-all duration-300"
          >
            New User? <span className="ml-1">Sign up</span>
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* Left Side - Branding */}
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                  Welcome Back
                </h2>
                <p className="text-lg text-slate-400">
                  Manage your finances smarter with Rupee Tracker. Track expenses, plan budgets, and achieve your financial goals.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Secure & Private</h3>
                    <p className="text-sm text-slate-400">Your data is encrypted and protected</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Smart Analytics</h3>
                    <p className="text-sm text-slate-400">AI-powered insights on your spending</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <Card className="bg-slate-800/30 border-slate-700 shadow-2xl backdrop-blur-xl">
            <CardHeader className="space-y-3 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <LogIn className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white">Sign In</CardTitle>
                  <CardDescription className="text-slate-400 mt-1">Enter your credentials to continue</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2.5">
                  <Label htmlFor="username" className="text-slate-200 font-medium text-sm">Username</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loginMutation.isPending}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 pl-10 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="password" className="text-slate-200 font-medium text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loginMutation.isPending}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 pl-10 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/30 disabled:opacity-50"
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
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
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setLocation("/signup")}
                      className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300"
                    >
                      Create one
                    </button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}

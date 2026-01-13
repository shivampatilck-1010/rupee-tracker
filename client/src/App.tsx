import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import LandingPage from "@/pages/index";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import ProfilePage from "@/pages/profile";
import CalendarPage from "@/pages/calendar";
import PlanningPage from "@/pages/planning";
import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { useLocation } from "wouter";

// Auth Context
interface AuthContextType {
  isAuthenticated: boolean | null;
  checkAuth: () => Promise<void>;
  setAuthenticated: (value: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/me", {
        credentials: "include",
      });
      setIsAuthenticated(response.ok);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const setAuthenticated = (value: boolean) => {
    setIsAuthenticated(value);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setLocation("/");
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, checkAuth, setAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/profile" component={() => <ProtectedRoute component={ProfilePage} />} />
      <Route path="/app" component={() => <ProtectedRoute component={HomePage} />} />
      <Route path="/calendar" component={() => <ProtectedRoute component={CalendarPage} />} />
      <Route path="/planning" component={() => <ProtectedRoute component={PlanningPage} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-slate-800/60 border-slate-700 shadow-2xl backdrop-blur-xl">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
          </div>

          {/* Error Code */}
          <div>
            <h1 className="text-7xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
              404
            </h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Page Not Found
            </h2>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-slate-300 text-base sm:text-lg">
              Oops! The page you're looking for doesn't exist.
            </p>
            <p className="text-slate-400 text-sm">
              It might have been moved or deleted. Let's get you back on track.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              onClick={() => setLocation(-1 as any)}
              variant="outline"
              className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-slate-500 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button
              onClick={() => setLocation("/app")}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </div>

          {/* Footer Message */}
          <div className="pt-4 border-t border-slate-700">
            <p className="text-slate-400 text-sm">
              Need help? <button 
                onClick={() => setLocation("/")}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300"
              >
                Go to home page
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

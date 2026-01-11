import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Smartphone, Wallet, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

export default function InstallPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setLocation("/")}
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
            Rupee Tracker
          </h1>
        </div>
        <Button variant="ghost" className="text-slate-300" onClick={() => setLocation("/login")}>
          Back to Login
        </Button>
      </nav>

      <Card className="w-full max-w-md bg-slate-800/60 border-slate-700 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-blue-500/20">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">Install for Android</CardTitle>
          <CardDescription className="text-slate-400">
            Get the full experience on your mobile device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Offline access to your data</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Faster performance</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Native notifications</span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <a 
              href="/rupee-tracker.apk" 
              download="rupee-tracker.apk"
              className="block w-full"
            >
              <Button 
                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
              >
                <Download className="mr-2 w-5 h-5" />
                Download APK
              </Button>
            </a>
            
            <p className="text-xs text-center text-slate-500">
              Note: You may need to enable "Install from unknown sources" in your settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds total duration

    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Allow fade out animation
    }, 5000); // 5 seconds

    return () => {
      clearInterval(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

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

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-purple-900 to-blue-900">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover contrast-125 brightness-110"
      >
        <source src="/new-background-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo */}
        <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-black via-purple-900 to-blue-900 flex items-center justify-center shadow-2xl animate-bounce">
          <span className="text-white text-4xl">₹</span>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Rupee Tracker</h1>
          <p className="text-slate-300">Loading your financial dashboard...</p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm text-slate-400">{progress}%</p>
        </div>
      </div>
    </div>
  );
}

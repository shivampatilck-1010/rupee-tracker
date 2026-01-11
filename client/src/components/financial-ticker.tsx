import { motion } from "framer-motion";
import { TrendingUp, DollarSign, PieChart, Activity, AlertCircle } from "lucide-react";

const TICKER_ITEMS = [
  {
    icon: TrendingUp,
    text: "Market Update: NIFTY 50 up by 1.2% today",
    color: "text-emerald-400"
  },
  {
    icon: DollarSign,
    text: "Tip: Save at least 20% of your monthly income",
    color: "text-blue-400"
  },
  {
    icon: PieChart,
    text: "Budget Alert: Review your subscription costs",
    color: "text-purple-400"
  },
  {
    icon: Activity,
    text: "Inflation Rate: Current rate stands at 5.4%",
    color: "text-orange-400"
  },
  {
    icon: AlertCircle,
    text: "Security: Update your banking passwords regularly",
    color: "text-red-400"
  }
];

export function FinancialTicker() {
  return (
    <div className="w-full overflow-hidden bg-card/80 border-y border-border backdrop-blur-sm py-3 mb-6">
      <div className="flex relative">
        <motion.div
          className="flex gap-12 whitespace-nowrap"
          animate={{
            x: ["0%", "-33.33%"],
          }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          }}
        >
          {/* Repeat items to create seamless loop effect */}
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <span className="text-sm font-medium text-muted-foreground">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

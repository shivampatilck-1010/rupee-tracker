import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface Expense {
  id: string;
  amount: number | string;
  category: string;
  description: string;
  date: string;
}

interface ChatBotProps {
  expenses: Expense[];
  monthlyBudget: number;
  totalExpenses: number;
}

export default function ChatBot({ expenses, monthlyBudget, totalExpenses }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [hasGreeted, setHasGreeted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Proactive greeting when chat opens
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      const timer = setTimeout(() => {
        const greeting = getSmartGreeting();
        const botMsg: Message = {
          id: Date.now().toString(),
          text: greeting,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setHasGreeted(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasGreeted]);

  // Helper function to convert amount to number
  const getAmount = (amount: any): number => {
    if (typeof amount === 'string') {
      return parseFloat(amount) || 0;
    }
    return Number(amount) || 0;
  };

  const analyzeExpenses = () => {
    if (expenses.length === 0) {
      return {
        categoryTotals: {} as { [key: string]: number },
        topCategory: null,
        remaining: monthlyBudget,
        percentUsed: "0",
      };
    }

    const categories = Array.from(new Set(expenses.map((e) => e.category)));
    const categoryTotals: { [key: string]: number } = {};

    categories.forEach((cat) => {
      categoryTotals[cat] = expenses
        .filter((e) => e.category === cat)
        .reduce((sum, e) => sum + getAmount(e.amount), 0);
    });

    const topCategory = Object.entries(categoryTotals).sort(
      ([, a], [, b]) => b - a
    )[0] || null;
    const remaining = monthlyBudget - totalExpenses;
    const percentUsed = monthlyBudget > 0 ? ((totalExpenses / monthlyBudget) * 100).toFixed(1) : "0";

    return { categoryTotals, topCategory, remaining, percentUsed };
  };

  const getSmartGreeting = (): string => {
    const hour = new Date().getHours();
    let timeGreeting = "Good morning";
    if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
    if (hour >= 17) timeGreeting = "Good evening";

    const { remaining, percentUsed, topCategory } = analyzeExpenses();
    const percent = parseFloat(percentUsed);

    let insight = "I'm here to help you manage your finances.";
    
    if (percent > 90) {
      insight = `⚠️ You've used ${percent}% of your budget! You only have ₹${remaining.toLocaleString()} left.`;
    } else if (percent > 50) {
      insight = `You're halfway through your budget (${percent}% used).`;
    } else if (topCategory) {
      insight = `I noticed your highest spending is on ${topCategory[0]}.`;
    } else if (expenses.length === 0) {
      insight = "Start by adding your first expense!";
    }

    return `${timeGreeting}! 👋 ${insight} How can I assist you today?`;
  };

  const generateResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim();
    const { categoryTotals, topCategory, remaining, percentUsed } = analyzeExpenses();

    if (!message) return "I didn't catch that. 🤔";

    // Greetings
    if (message.match(/^(hi|hello|hey|greetings)/)) {
      return "Hello! 👋 I'm ready to analyze your finances. Ask me about your budget or spending trends!";
    }

    // Budget insights
    if (message.includes("budget") || message.includes("remaining") || message.includes("left") || message.includes("money")) {
      const status = remaining < 0 ? "over budget" : "remaining";
      return `You have ₹${Math.abs(remaining).toLocaleString()} ${status} from your monthly budget of ₹${monthlyBudget.toLocaleString()}. You've used ${percentUsed}% so far.`;
    }

    // Spending insights
    if (message.includes("spent") || message.includes("total") || message.includes("expenses") || message.includes("much")) {
      return `Your total spending this month is ₹${totalExpenses.toLocaleString()}.`;
    }

    // Category insights
    if (message.includes("food") || message.includes("eating")) {
      const amount = categoryTotals["Food"] || 0;
      return `You've spent ₹${amount.toLocaleString()} on Food.`;
    }
    
    // Generic category check
    for (const cat of Object.keys(categoryTotals)) {
      if (message.includes(cat.toLowerCase())) {
        return `You've spent ₹${categoryTotals[cat].toLocaleString()} on ${cat}.`;
      }
    }

    if (message.includes("highest") || message.includes("most") || message.includes("lot")) {
      if (!topCategory) return "You haven't spent anything yet!";
      return `Your highest spending category is ${topCategory[0]} at ₹${topCategory[1].toLocaleString()}.`;
    }

    if (message.includes("saving") || message.includes("tip") || message.includes("advice")) {
      const tips = [
        "💡 Tip: Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings!",
        "💡 Tip: Cook at home more often to save on food expenses.",
        "💡 Tip: Review your subscriptions and cancel ones you don't use.",
        "💡 Tip: Set a daily spending limit to stay on track.",
        "💡 Tip: Wait 24 hours before making big non-essential purchases."
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }

    if (message.includes("thank")) {
      return "You're welcome! Happy to help! 💰";
    }

    return "I can help with: 'How much budget is left?', 'Total spending?', 'Highest expense category?', or 'Give me a saving tip'.";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate typing delay
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(input),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 w-[350px] md:w-[400px] z-50"
          >
            <Card className="border-slate-700 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-indigo-500/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-base">FinAI Assistant</CardTitle>
                    <p className="text-indigo-100 text-xs">Always here to help</p>
                  </div>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4 bg-slate-900/50">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl ${
                            msg.sender === "user"
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <span className="text-[10px] opacity-50 mt-1 block">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>
                
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                  <div className="relative">
                    <Input
                      placeholder="Ask about budget, spending..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="pr-12 bg-slate-800 border-slate-700 focus-visible:ring-indigo-500 rounded-full"
                    />
                    <Button
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8 rounded-full bg-indigo-600 hover:bg-indigo-700"
                      onClick={handleSend}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-50 transition-all duration-300 ${
          isOpen 
            ? "bg-slate-800 text-slate-400 rotate-90" 
            : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/30"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </>
  );
}

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot, User, Sparkles } from "lucide-react";

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
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Proactive greeting when chat opens or expenses change
  useEffect(() => {
    if (isOpen && (!hasGreeted || messages.length === 0)) {
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
  }, [isOpen, hasGreeted, expenses, monthlyBudget, totalExpenses]);

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

  const generateResponse = async (userMessage: string): Promise<string> => {
    const message = userMessage.toLowerCase().trim();
    const { categoryTotals, topCategory, remaining, percentUsed } = analyzeExpenses();

    if (!message) return "I didn't catch that. 🤔";

    // News queries
    if (message.includes("news") || message.includes("headlines") || message.includes("updates")) {
      try {
        const response = await fetch("/api/news");
        if (response.ok) {
          const data = await response.json();
          if (data.articles && data.articles.length > 0) {
            const topArticle = data.articles[0];
            return `📰 Latest news: "${topArticle.title}" - ${topArticle.description || "Read more..."} (Source: ${topArticle.source.name})`;
          }
        }
      } catch (error) {
        console.error("News fetch error:", error);
      }
      return "Sorry, I couldn't fetch the latest news right now. Please try again later.";
    }

    // Weather queries
    if (message.includes("weather") || message.includes("temperature") || message.includes("forecast")) {
      try {
        // Extract city from message if mentioned
        let city = "London"; // default
        const cityMatch = message.match(/(?:weather|temperature|forecast)\s+(?:in|for|at)\s+([a-zA-Z\s]+)/i);
        if (cityMatch) {
          city = cityMatch[1].trim();
        }

        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        if (response.ok) {
          const data = await response.json();
          const temp = Math.round(data.main.temp);
          const description = data.weather[0].description;
          const cityName = data.name;
          return `🌤️ Weather in ${cityName}: ${temp}°C, ${description}.`;
        }
      } catch (error) {
        console.error("Weather fetch error:", error);
      }
      return "Sorry, I couldn't fetch the weather information right now. Please try again later.";
    }

    // Greetings
    if (message.match(/^(hi|hello|hey|greetings)/)) {
      return "Hello! 👋 I'm ready to analyze your finances. Ask me about your budget, spending trends, news, or weather!";
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

    return "I can help with: 'How much budget is left?', 'Total spending?', 'Highest expense category?', 'Give me a saving tip', 'What's the latest news?', or 'What's the weather like?'.";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");

    // Simulate typing delay
    setIsTyping(true);
    setTimeout(async () => {
      const botResponse = await generateResponse(currentInput);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
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
        {isOpen && (
          <div
            className="fixed bottom-24 right-6 w-[350px] md:w-[400px] z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
          >
            <Card className="border-slate-700 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-indigo-500/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 flex flex-row items-center justify-between relative overflow-hidden">
                {/* Cute 3D Robot Face */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {/* Robot Head - Semi-square */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-lg border-3 border-blue-400 shadow-xl relative overflow-hidden">
                      {/* 3D Effect Shadow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>

                      {/* Eyes - Larger and more expressive with sparkle effect */}
                      <div className="absolute top-3 left-2.5 w-4 h-4 bg-white rounded-full shadow-inner relative">
                        <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-blue-800 rounded-full animate-pulse"></div>
                        {/* Eye sparkle */}
                        <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full animate-ping opacity-80"></div>
                      </div>
                      <div className="absolute top-3 right-2.5 w-4 h-4 bg-white rounded-full shadow-inner relative">
                        <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-blue-800 rounded-full animate-pulse"></div>
                        {/* Eye sparkle */}
                        <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full animate-ping opacity-80"></div>
                      </div>

                      {/* Cheek Blushes */}
                      <div className="absolute top-5 left-1 w-2 h-2 bg-pink-300/60 rounded-full blur-sm"></div>
                      <div className="absolute top-5 right-1 w-2 h-2 bg-pink-300/60 rounded-full blur-sm"></div>

                      {/* Mouth - Cute smile */}
                      <div className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 w-4 h-2 border-2 border-white rounded-full transition-all duration-300 ${isTyping ? 'bg-green-400 border-green-400 scale-110' : 'border-white'}`}></div>

                      {/* Antenna - More detailed */}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-full"></div>
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full shadow-lg animate-bounce">
                        <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-yellow-600 rounded-full"></div>
                      </div>

                      {/* Waving Hand - Small hand on the side with wave animation */}
                      <div className={`absolute -right-1 top-6 w-3 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full transform rotate-12 transition-transform duration-500 ${isTyping ? 'animate-wave' : 'animate-pulse'}`}>
                        <div className="absolute top-0 right-0 w-2 h-2 bg-blue-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-white text-base font-bold">FinBot</CardTitle>
                    <p className="text-slate-300 text-xs">Your AI Finance Assistant</p>
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
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
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
                      </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="bg-slate-800 text-slate-100 rounded-2xl rounded-bl-none border border-slate-700 p-3 max-w-[80%]">
                          <div className="flex items-center space-x-1">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="text-xs text-slate-400 ml-2">FinBot is typing...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>
                
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                  <div className="relative">
                    <Input
                      placeholder="Ask about budget, spending, news, weather..."
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
          </div>
        )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110 active:scale-95 animate-bounce ${
          isOpen
            ? "bg-slate-800 text-slate-400 rotate-90"
            : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/30"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative w-6 h-6">
            {/* Cute Robot Face for Button */}
            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-lg border-2 border-blue-400 shadow-lg relative overflow-hidden">
              {/* 3D Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>

              {/* Eyes */}
              <div className="absolute top-1 left-0.5 w-1.5 h-1.5 bg-white rounded-full shadow-inner">
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-blue-800 rounded-full animate-pulse"></div>
              </div>
              <div className="absolute top-1 right-0.5 w-1.5 h-1.5 bg-white rounded-full shadow-inner">
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-blue-800 rounded-full animate-pulse"></div>
              </div>

              {/* Mouth */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 border border-white rounded-full"></div>

              {/* Mini Antenna */}
              <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-full"></div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </button>
    </>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, Sparkles, User, RefreshCw, HelpCircle } from "lucide-react";
import { CityStats } from "../types";

interface ChatMessage {
  id: string;
  sender: "advisor" | "user";
  text: string;
  timestamp: Date;
}

interface AdvisorChatProps {
  stats: CityStats;
}

export default function AdvisorChat({ stats }: AdvisorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "advisor",
      text: `Hello Governor! I am your chief Ecological Advisor. 

Our virtual city **Sustaina** is currently emitting **${stats.co2.toFixed(1)} metric tons CO₂ per capita** with an ecological health index of **${stats.health}%**.

Ask me how to implement carbon reductions, how to reform heavy coal energy, or query me on climate policy recommendations!`,
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [consulting, setConsulting] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Pre-configured policy triggers or quick advice questions
  const SUGGESTED_QUERIES = [
    "How to phase out heavy Coal?",
    "Tell me about Urban Canopy Forestry",
    "How do real-world pledges help our city?",
    "Evaluate standard nuclear energy safety"
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, consulting]);

  const sendQueryToAdvisor = async (queryText: string) => {
    if (!queryText.trim() || consulting) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: queryText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setUserInput("");
    setConsulting(true);

    try {
      const response = await fetch("/api/advisor/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityStats: stats,
          message: queryText
        })
      });

      const data = await response.json();

      const advisorMsg: ChatMessage = {
        id: `advisor-${Date.now()}`,
        sender: "advisor",
        text: data.response || "I had difficulty analyzing that question. Please try asking about our utility framework.",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, advisorMsg]);
    } catch (err) {
      console.error("Failed to query advisor system:", err);
      const errorMsg: ChatMessage = {
        id: `advisor-err-${Date.now()}`,
        sender: "advisor",
        text: "🚨 Communication line cut. Please try again once the server recovers.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setConsulting(false);
    }
  };

  return (
    <div className="bg-[#12141A] rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex flex-col h-[520px]">
      {/* Advisor panel header */}
      <div className="bg-[#1A1D24] p-4 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <MessageSquare className="h-5 w-5" />
            </span>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#12141A]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">AI Climate Advisor</h3>
            <p className="text-[10px] text-emerald-400 font-mono">Governing Board Consultant • Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
          <Sparkles className="h-3 w-3 text-emerald-400" />
          <span>Gemini-Guided Policy</span>
        </div>
      </div>

      {/* Message logs area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-[#12141A]/50">
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const isAdvisor = m.sender === "advisor";
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[85%] ${isAdvisor ? "mr-auto text-left" : "ml-auto flex-row-reverse text-right"}`}
              >
                {/* Advisor/User Avatar icons */}
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isAdvisor ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                  {isAdvisor ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                <div className="space-y-1">
                  <div className={`p-4 rounded-xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                    isAdvisor 
                      ? "bg-[#1A1D24] text-slate-100 border border-white/5"
                      : "bg-emerald-500/10 text-slate-200 border border-emerald-500/15"
                  }`}>
                    {m.text}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 block px-1">
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {consulting && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <RefreshCw className="h-4 w-4 animate-spin" />
            </div>
            <span className="text-xs font-mono text-slate-500 animate-pulse">Drafting policy recommendations...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Recommended dynamic queries suggestions */}
      <div className="px-4 py-2 bg-[#1A1D24]/40 border-t border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
        {SUGGESTED_QUERIES.map((q, idx) => (
          <button
            key={idx}
            disabled={consulting}
            onClick={() => sendQueryToAdvisor(q)}
            className="text-[10px] font-mono border border-white/5 bg-[#12141A] hover:bg-[#1A1D24] text-slate-400 hover:text-white px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Dialogue typing input fields */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendQueryToAdvisor(userInput);
        }}
        className="p-3 bg-[#1A1D24] border-t border-white/5 flex gap-2"
      >
        <input
          type="text"
          id="advisor-text-input"
          aria-label="Ask AI Climate Advisor a question"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask advice on carbon budgets, recycling, or transport grid..."
          className="flex-1 bg-[#12141A] text-xs md:text-sm text-slate-200 border border-white/5 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
        />
        <button
          type="submit"
          id="send-advisor-query-btn"
          aria-label="Send message"
          disabled={!userInput.trim() || consulting}
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            userInput.trim() && !consulting
              ? "bg-emerald-500 text-slate-950 hover:brightness-110"
              : "bg-white/5 text-slate-600 cursor-not-allowed"
          }`}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

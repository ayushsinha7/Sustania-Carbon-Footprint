import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Globe, AlertTriangle, Lightbulb, RefreshCw } from "lucide-react";
import { CarbonFact } from "../types";

interface FactPopupProps {
  onDismiss: () => void;
}

export default function FactPopup({ onDismiss }: FactPopupProps) {
  const [factData, setFactData] = useState<CarbonFact | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function fetchFact(isRegenerate = false) {
    try {
      if (isRegenerate) setGenerating(true);
      else setLoading(true);

      const url = `/api/facts/random${isRegenerate ? "?refresh=true" : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setFactData(data);
    } catch (err) {
      console.error("Error reading carbon fact:", err);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  }

  useEffect(() => {
    fetchFact();
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop glassmorphism */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#020617]/85 backdrop-blur-md"
          onClick={onDismiss}
        />

        {/* Modal body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.5 }}
          id="eco-welcome-modal"
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#1A1D24]/95 p-6 md:p-8 text-[#f8fafc] shadow-2xl ring-1 ring-white/10"
        >
          {/* Top visual graphic accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500" />

          {/* Close trigger */}
          <button
            id="close-welcome-modal"
            aria-label="Close modal"
            onClick={onDismiss}
            className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Globe className="h-5 w-5 animate-spin-slow" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 font-display">Ecological Intelligence</p>
              <h3 className="font-display text-xl font-bold tracking-tight text-white mt-1">Earth Intelligence Briefing</h3>
            </div>
          </div>

          <div className="min-h-[160px] flex flex-col justify-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
                <p className="text-sm font-mono text-slate-400">Polling Environmental Intelligence...</p>
              </div>
            ) : factData ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Topic Pill */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/15">
                  <Sparkles className="h-3 w-3" />
                  Fact: {factData.topic || "Carbon Science"}
                </div>

                {/* Main Fact Card */}
                <p className="font-sans text-base md:text-lg leading-relaxed text-slate-100 font-light bg-slate-900/40 p-4 rounded-xl border border-white/5">
                  "{factData.fact}"
                </p>

                {/* Educational context */}
                <div className="flex gap-2.5 rounded-xl bg-amber-500/5 p-4 border border-amber-500/10">
                  <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-amber-400 font-mono mb-1">Humanity Action Impact</h4>
                    <p className="text-xs leading-relaxed text-slate-300">{factData.impact}</p>
                  </div>
                </div>

                {factData.source === "Gemini" && (
                  <div className="flex justify-end">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-500/70">
                      <Sparkles className="h-2.5 w-2.5" /> Generated fresh by Gemini 3.5
                    </span>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex items-center gap-3 text-red-400 p-4 bg-red-950/20 rounded-2xl border border-red-500/10">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p className="text-sm">Could not connect to the environmental updates system. Please refresh.</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              id="generator-fact-btn"
              disabled={loading || generating}
              onClick={() => fetchFact(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-50 transition-all cursor-pointer font-mono"
            >
              <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
              {generating ? "AI Thinking..." : "Dynamic Fact"}
            </button>
            <button
              id="start-simulator-btn"
              onClick={onDismiss}
              className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-widest text-xs py-3.5 transition-colors shadow-[0_4px_12px_rgba(16,185,129,0.3)] active:scale-98 cursor-pointer"
            >
              Begin Governing Sustaina
            </button>
          </div>

          {/* Educational tiny footer */}
          <p className="text-center text-[10px] text-slate-500 font-mono mt-5">
            Google H2S Challenge 3 • Sustain & Restore • Interactive Simulator
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

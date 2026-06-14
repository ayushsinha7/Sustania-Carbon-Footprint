import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe, 
  MapPin, 
  Gauge, 
  Sparkles, 
  Leaf, 
  MessageSquare, 
  HelpCircle, 
  ArrowRight, 
  Award, 
  RefreshCw, 
  TrendingDown, 
  Coins, 
  UserCheck,
  Zap,
  Landmark,
  Footprints
} from "lucide-react";

import { CityStats, SectorUpgrade } from "./types";
import FactPopup from "./components/FactPopup";
import CityMap from "./components/CityMap";
import PersonalCalculator from "./components/PersonalCalculator";
import AdvisorChat from "./components/AdvisorChat";
import QuizSection from "./components/QuizSection";
import { validatePurchase, applyUpgrade, calculateNetZeroIndex } from "./utils/gameRules";

// Standard initial high-carbon starting stats
const INITIAL_STATS: CityStats = {
  name: "Sustaina Virtual City",
  co2: 15.2, // metric tons per capita per year (heavy polluter)
  health: 38, // 38% eco-health (smoggy atmosphere)
  population: 142000,
  credits: 450, // initial eco-incentive funds
  energyDemand: 220, // MW
  energySupplyType: "Coal-Powered Heavy",
  transportType: "Gasoline Cars",
  industryType: "Coal-Powered Heavy",
  forestryType: "Deforested Logging",
  housingType: "Leaky Standard Suburbs"
};

// Constructible/reformable policies & assets
const INITIAL_UPGRADES: SectorUpgrade[] = [
  // ENERGY
  {
    id: "gaspump",
    name: "Methane Gas Cogeneration",
    category: "energy",
    cost: 120,
    co2Effect: -2.2,
    healthEffect: 8,
    description: "Switch from coal power to cleaner gas cogen boilers. Safe transition step to drop heavy smokestacks.",
    purchased: false
  },
  {
    id: "windsolar",
    name: "Coastal Wind & Solar Parks",
    category: "energy",
    cost: 380,
    co2Effect: -5.4,
    healthEffect: 22,
    description: "Erect a massive off-shore turbine loop coupled with solar fields. Decreases CO2 dramatically.",
    purchased: false
  },
  {
    id: "fusion tokamak",
    name: "Fusion Tokamak Grid Core",
    category: "energy",
    cost: 850,
    co2Effect: -7.5,
    healthEffect: 34,
    description: "Deploy a high-tech nuclear fusion grid. Virtually emission-free. Unlocked globally once you compute your real-world footprint!",
    purchased: false,
    requiresCalculatorUnlock: true
  },
  // TRANSPORT
  {
    id: "biobuses",
    name: "Biogas Hybrid Rapid Transit",
    category: "transport",
    cost: 160,
    co2Effect: -1.8,
    healthEffect: 10,
    description: "Roll out hybrid municipal bus lines fueled with recaptured biological crop waste.",
    purchased: false
  },
  {
    id: "maglevEV",
    name: "High-Speed Maglev & Solar EV Grids",
    category: "transport",
    cost: 440,
    co2Effect: -4.0,
    healthEffect: 20,
    description: "Build rapid elevated electric rails, solar charging paths, and cycle-only green lanes.",
    purchased: false
  },
  // INDUSTRY
  {
    id: "filters",
    name: "Catalytic Exhaust Scrubbers",
    category: "industry",
    cost: 140,
    co2Effect: -1.5,
    healthEffect: 12,
    description: "Retrofit factory chimneys with carbon-retaining chemical catalysts and smoke scrubbers.",
    purchased: false
  },
  {
    id: "biotechs",
    name: "Zero-Waste Biotech Parks",
    category: "industry",
    cost: 420,
    co2Effect: -3.6,
    healthEffect: 24,
    description: "Transform old heavy refineries into high-tech biology hubs focused on seaweed plastics and biodegradable goods.",
    purchased: false
  },
  // FORESTRY
  {
    id: "streetgreen",
    name: "Urban Street Greening",
    category: "forestry",
    cost: 100,
    co2Effect: -1.0,
    healthEffect: 9,
    description: "Add rows of shade-producing canopy trees and bioswales directly along asphalt streets.",
    purchased: false
  },
  {
    id: "redwoods",
    name: "Redwood Sky-Canopy Sanctuary",
    category: "forestry",
    cost: 300,
    co2Effect: -3.2,
    healthEffect: 26,
    description: "Re-forest deforested soils with native redwoods. Secures massive botanical carbon sequestration.",
    purchased: false
  },
  // HOUSING
  {
    id: "condos",
    name: "Insulated Triple-Paned Condos",
    category: "housing",
    cost: 180,
    co2Effect: -1.2,
    healthEffect: 9,
    description: "Impose strict building bylaws. Incentivize construction of triple-glazed high-efficiency condos.",
    purchased: false
  },
  {
    id: "activemicrogrid",
    name: "Active Rooftop Microgrids",
    category: "housing",
    cost: 480,
    co2Effect: -3.4,
    healthEffect: 20,
    description: "Enforce smart solar rooftops feeding local storage. Unlocked once you complete your personal footprint calculations!",
    purchased: false,
    requiresCalculatorUnlock: true
  }
];

// Interactive Random Environmental Crisis Events (To raise awareness of trade-offs)
interface RandomCrisis {
  id: string;
  title: string;
  prompt: string;
  optionA: {
    label: string;
    impact: string;
    action: (stats: CityStats) => CityStats;
  };
  optionB: {
    label: string;
    impact: string;
    action: (stats: CityStats) => CityStats;
  };
}

const SHUFFLABLE_EVENTS: RandomCrisis[] = [
  {
    id: "heatwave",
    title: "Overheating Heatwave",
    prompt: "Surging global greenhouse gas traps heat, sending local temperatures above 104°F. Grid cooling is standardly deficient.",
    optionA: {
      label: "Force Coal Auxiliary Supply",
      impact: "Satisfies thermal power load but spikes heavy carbon. (+1.2 tons CO2, -8% Eco-Health, +50 Credits from power consumption tax)",
      action: (s) => ({
        ...s,
        co2: Math.min(20, s.co2 + 1.2),
        health: Math.max(0, s.health - 8),
        credits: s.credits + 50
      })
    },
    optionB: {
      label: "Subsidize Cool Urban Green Roofs",
      impact: "Combats ambient heat naturally. (-120 Credits, -0.8 tons CO2, +15% Eco-Health)",
      action: (s) => ({
        ...s,
        co2: Math.max(0, s.co2 - 0.8),
        health: Math.min(100, s.health + 15),
        credits: Math.max(0, s.credits - 120)
      })
    }
  },
  {
    id: "fracking",
    title: "Methane Leak Spill",
    prompt: "A chemical pipe leak in the conventional gas grid triggers a heavy atmospheric release of methane (CH4).",
    optionA: {
      label: "Delay Pipeline Upkeep",
      impact: "Avoids budget stress, but methane is highly warming. (+1.8 tons CO2, -15% Eco-Health)",
      action: (s) => ({
        ...s,
        co2: Math.min(20, s.co2 + 1.8),
        health: Math.max(0, s.health - 15)
      })
    },
    optionB: {
      label: "Enforce Swift Vacuum Recapture",
      impact: "Deploys special carbon-vacuum teams immediately. (-150 Credits, +10% Eco-Health)",
      action: (s) => ({
        ...s,
        credits: Math.max(0, s.credits - 150),
        health: Math.min(100, s.health + 10)
      })
    }
  },
  {
    id: "mangroves",
    title: "Ancient Forest Sanctuary Debate",
    prompt: "Construction surveyors locate a pristine Redwood & wetlands block inside a prospective logging sector.",
    optionA: {
      label: "Fell Woods for Quick Credits",
      impact: "Secures logging treasury flow, but wipes carbon capture. (+200 Credits, +1.5 tons CO2, -12% Eco-Health)",
      action: (s) => ({
        ...s,
        credits: s.credits + 200,
        co2: Math.min(25, s.co2 + 1.5),
        health: Math.max(0, s.health - 12)
      })
    },
    optionB: {
      label: "Certify Canopy Protected reserve",
      impact: "Blocks logging permanently, securing vital biodiversity. (-100 Credits, -1.0 tons CO2, +18% Eco-Health)",
      action: (s) => ({
        ...s,
        credits: Math.max(0, s.credits - 100),
        co2: Math.max(0, s.co2 - 1.0),
        health: Math.min(100, s.health + 18)
      })
    }
  }
];

export default function App() {
  const [showWelcomeFact, setShowWelcomeFact] = useState(true);
  const [activeTab, setActiveTab] = useState<"simulator" | "tracker" | "advisor" | "quiz">("simulator");
  
  // Game orchestration state
  const [stats, setStats] = useState<CityStats>(INITIAL_STATS);
  const [upgrades, setUpgrades] = useState<SectorUpgrade[]>(INITIAL_UPGRADES);
  
  // Linkages state
  const [calculatorCompleted, setCalculatorCompleted] = useState(false);
  const [personalTons, setPersonalTons] = useState<number | null>(null);

  // Random Crisis notifications
  const [activeEvent, setActiveEvent] = useState<RandomCrisis | null>(null);
  const [upgradeCount, setUpgradeCount] = useState(0);

  // Core callback: Constructing city sectors
  const handlePurchaseUpgrade = (id: string) => {
    const upgrade = upgrades.find((u) => u.id === id);
    if (!upgrade) return;

    const validation = validatePurchase(stats, upgrade, calculatorCompleted);
    if (!validation.allowed) {
      console.warn(validation.reason);
      return;
    }

    // Mutate city simulator parameters using optimized game-rule helper
    setStats((prev) => applyUpgrade(prev, upgrade));

    // Mark purchased
    setUpgrades((prevList) =>
      prevList.map((u) => (u.id === id ? { ...u, purchased: true } : u))
    );

    // Track built count to trigger dynamic carbon crises (awareness event loop)
    const nextCount = upgradeCount + 1;
    setUpgradeCount(nextCount);

    if (nextCount % 2 === 0) {
      // Pick a random event to slide up after a short micro-timeout
      setTimeout(() => {
        const randEvent = SHUFFLABLE_EVENTS[Math.floor(Math.random() * SHUFFLABLE_EVENTS.length)];
        setActiveEvent(randEvent);
      }, 700);
    }
  };

  // Callback: Interactive tracker pledges committed
  const handleCommitCalculations = (clcTons: number, incentivesCreditsEarned: number) => {
    setPersonalTons(clcTons);
    setStats((prev) => ({
      ...prev,
      credits: prev.credits + incentivesCreditsEarned
    }));
  };

  // Callback: Quiz correct answers rewarded
  const handleEarnCreditsFromQuiz = (amt: number) => {
    setStats((prev) => ({
      ...prev,
      credits: prev.credits + amt
    }));
  };

  // Event resolution
  const handleResolveEvent = (choice: "A" | "B") => {
    if (!activeEvent) return;

    const op = choice === "A" ? activeEvent.optionA : activeEvent.optionB;
    setStats((prev) => op.action(prev));
    setActiveEvent(null);
  };

  return (
    <div className="relative min-h-screen font-sans antialiased text-slate-200 bg-[#0A0B0E] selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Background ambient aesthetic grid glowing blobs with radial dark elegant core */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[radial-gradient(circle_at_center,_#1A2026_0%,_#0A0B0E_100%)]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-emerald-500/5 blur-[140px]" />
      </div>

      {/* Decorative Side Rails from Elegant Dark Theme */}
      <div className="hidden xl:flex absolute left-6 top-1/2 -translate-y-1/2 flex-col gap-6 items-center z-20 pointer-events-none select-none">
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
        <span className="rotate-[270deg] text-[9px] text-slate-600 uppercase tracking-widest whitespace-nowrap font-mono">Eco_System_V4.0</span>
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
      </div>

      <div className="hidden xl:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-6 items-center z-20 pointer-events-none select-none">
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
        <span className="rotate-[90deg] text-[9px] text-slate-600 uppercase tracking-widest whitespace-nowrap font-mono">Global_Ecosystem_Grid</span>
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
      </div>

      {/* Main Structural Navigation Bar Styled with Elegant Dark values */}
      <nav className="relative z-10 border-b border-emerald-900/30 bg-[#12141A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/5">
              <Globe className="h-5.5 w-5.5 animate-spin-slow" />
            </span>
            <div>
              <h1 className="font-display font-black text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-200 to-slate-200 bg-clip-text text-transparent">
                SUSTAINA
              </h1>
              <p className="text-[10px] font-mono tracking-wider uppercase text-emerald-500">
                Carbon Board & City Simulator
              </p>
            </div>
          </div>

          {/* Quick HUD tracker links with animated metrics */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 bg-[#1A1D24] px-3.5 py-1.5 rounded-full border border-white/5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span className="text-slate-400">Net Zero Grid Index:</span>
              <strong className="text-emerald-400">{calculateNetZeroIndex(stats.co2)}%</strong>
            </div>

            {personalTons !== null && (
              <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 text-emerald-400">
                <UserCheck className="h-3.5 w-3.5" />
                <span>My Footprint:</span>
                <strong className="font-mono text-slate-200">{personalTons.toFixed(1)}t</strong>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Container Dashboard Board */}
      <main id="main-content-area" className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Navigation tabs row */}
        <div className="flex bg-[#12141A] p-1.5 rounded-2xl border border-white/5 mb-8 max-w-2xl mx-auto overflow-x-auto whitespace-nowrap">
          {[
            { id: "simulator", label: "Virtual Grid City", icon: Landmark },
            { id: "tracker", label: "My Carbon Footprint", icon: Footprints },
            { id: "advisor", label: "AI Advisor Chat", icon: Sparkles },
            { id: "quiz", label: "CO₂ Science Quiz", icon: HelpCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-selector-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#1E222B] text-emerald-400 border border-emerald-500/20 font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic active tab routing display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 animate-fade-in">
            {activeTab === "simulator" && (
              <CityMap
                stats={stats}
                upgrades={upgrades}
                onTriggerUpgrade={handlePurchaseUpgrade}
                calculatorFinished={calculatorCompleted}
              />
            )}

            {activeTab === "tracker" && (
              <PersonalCalculator
                onCommitCalculations={handleCommitCalculations}
                onUnlockUpgrades={() => setCalculatorCompleted(true)}
              />
            )}

            {activeTab === "advisor" && <AdvisorChat stats={stats} />}

            {activeTab === "quiz" && (
              <QuizSection onEarnCredits={handleEarnCreditsFromQuiz} />
            )}
          </div>

          {/* Right sidebar quick stats of Sustaina summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#12141A] p-5 rounded-3xl border border-white/5 shadow-xl">
              <h3 className="font-display text-xs uppercase tracking-widest text-[#10B981] font-bold mb-4 pl-1">
                Ecosystem Performance
              </h3>

              <div className="space-y-4">
                {/* Visual atmospheric health meter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs font-mono">
                    <span className="text-slate-400">Territory Air Quality</span>
                    <strong className="text-emerald-400 font-mono">{stats.health}% Clean</strong>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 shadow-[0_0_8px_rgba(52,211,153,0.5)] ${stats.health >= 70 ? 'bg-emerald-400' : stats.health >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${stats.health}%` }}
                    />
                  </div>
                </div>

                {/* Simulated CO2 level meter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs font-mono">
                    <span className="text-slate-400">Total Carbon Output</span>
                    <strong className="text-rose-400 font-mono">{stats.co2.toFixed(1)} tons / capita</strong>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] transition-all duration-700 font-mono"
                      style={{ width: `${Math.min(100, Math.max(5, (stats.co2 / 16.0) * 100))}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans italic leading-none pt-0.5">
                    Target is Net Zero (0.0). Keep upgrading conventional systems.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-2 text-xs font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Active Power:</span>
                    <span className="text-slate-200">{stats.energySupplyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Industrial Filter:</span>
                    <span className="text-slate-200">{stats.industryType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Housing State:</span>
                    <span className="text-slate-200">{stats.housingType}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* General Information card */}
            <div className="p-5 bg-gradient-to-tr from-[#12141A] to-[#1A2026] rounded-3xl border border-emerald-500/10 space-y-3">
              <h4 className="font-display text-sm font-bold text-emerald-400 flex items-center gap-1.5 uppercase leading-none">
                <Sparkles className="h-4 w-4 animate-pulse" /> Sustainability Mission
              </h4>
              <p className="text-xs leading-relaxed text-slate-300">
                To evolve Sustaina past its dangerous industrial state, earn Credits by answering quizzes or committing to personal carbon goals. Leverage those Credits to construct net-zero structural blocks! Only by making positive changes can you preserve the prosperity of your virtual territory.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Popups Fact Module on First Load */}
      {showWelcomeFact && (
        <FactPopup onDismiss={() => setShowWelcomeFact(false)} />
      )}

      {/* Clash of Clans styled Dynamic Crisis Notifications Drawer */}
      <AnimatePresence>
        {activeEvent && (
          <div className="fixed inset-0 z-40 flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm">
            {/* Dark dialog */}
            <motion.div
              initial={{ opacity: 0, y: 150 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 150 }}
              className="w-full max-w-xl bg-[#12141A] border-l-4 border-l-amber-500 border border-white/5 rounded-2xl shadow-2xl p-6 text-slate-200 glow-amber relative z-50 mb-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                <h4 className="font-display text-base font-extrabold text-amber-400 uppercase tracking-wide">
                  🔥 Crisis / Event Advisory: {activeEvent.title}
                </h4>
              </div>

              <p className="text-xs md:text-sm leading-relaxed text-slate-300 font-medium bg-slate-900/40 p-3 rounded-xl border border-slate-800/80 mb-5">
                "{activeEvent.prompt}"
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleResolveEvent("A")}
                  className="p-3.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/30 rounded-xl text-left cursor-pointer transition-all"
                >
                  <h5 className="text-xs font-bold text-amber-500 group-hover:underline text-center sm:text-left">
                    {activeEvent.optionA.label}
                  </h5>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    {activeEvent.optionA.impact}
                  </p>
                </button>

                <button
                  onClick={() => handleResolveEvent("B")}
                  className="p-3.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/30 rounded-xl text-left cursor-pointer transition-all"
                >
                  <h5 className="text-xs font-bold text-emerald-400 group-hover:underline text-center sm:text-left">
                    {activeEvent.optionB.label}
                  </h5>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    {activeEvent.optionB.impact}
                  </p>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global custom styled footer elements */}
      <footer className="border-t border-white/5 bg-[#12141A] py-6 text-center text-xs text-slate-500 font-mono mt-12">
        <p>Sustaina Dashboard • Powered by server-side Gemini AI</p>
        <p className="text-[10px] text-slate-600 mt-1">
          Elegant Dark Premium Interface
        </p>
      </footer>
    </div>
  );
}

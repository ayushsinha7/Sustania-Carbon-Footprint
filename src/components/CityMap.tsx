import React from "react";
import { motion } from "motion/react";
import { CityStats, SectorUpgrade } from "../types";
import { Sparkles, Zap, Flame, Trees, Building2, Landmark, HelpCircle, HardHat, TrendingDown, Hammer } from "lucide-react";

interface CityMapProps {
  stats: CityStats;
  upgrades: SectorUpgrade[];
  onTriggerUpgrade: (upgradeId: string) => void;
  calculatorFinished: boolean;
}

export default function CityMap({ stats, upgrades, onTriggerUpgrade, calculatorFinished }: CityMapProps) {
  // Determine global map environmental aesthetic
  const isHealthy = stats.health >= 70;
  const isToxic = stats.health < 40;
  const isWasteland = stats.health < 20;

  // Render SVG scenery for the sectors to create interactive map tiles
  return (
    <div className="space-y-6">
      {/* City Status HUD (Heads-Up Display) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#12141A] p-4 rounded-3xl border border-white/5 shadow-xl">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Ecosystem Title</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Landmark className="h-4 w-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white font-display overflow-hidden text-ellipsis whitespace-nowrap">{stats.name}</h4>
          </div>
        </div>
        
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">CO₂ Cap. Footprint</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-lg font-bold font-mono ${stats.co2 <= 2.0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {stats.co2.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400">tons / yr / cap</span>
          </div>
        </div>

        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Ecological Health</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`text-lg font-bold font-mono ${stats.health >= 70 ? 'text-emerald-400' : stats.health >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
              {stats.health}%
            </span>
            {/* Status light */}
            <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${stats.health >= 70 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : stats.health >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} />
          </div>
        </div>

        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Treasury Balance</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-lg font-bold text-teal-400 font-mono">{stats.credits}</span>
            <span className="text-xs font-mono text-teal-400">Eco-Credits</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Map & Air Visuals */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#12141A] p-6 shadow-2xl min-h-[380px] flex flex-col justify-between">
        {/* Dynamic Translucent Smog Layer Overlay */}
        {isToxic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isWasteland ? 0.75 : 0.45 }}
            className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-slate-950/80 via-yellow-950/20 to-slate-950/60 mix-blend-color-burn animate-pulse-slow"
          />
        )}

        {/* Dynamic toxic smoke particles indicator */}
        {isWasteland && (
          <div className="absolute inset-x-0 top-12 z-20 pointer-events-none flex justify-around select-none">
            <div className="h-4 w-4 rounded-full bg-orange-700/20 blur-md animate-bounce" />
            <div className="h-6 w-6 rounded-full bg-yellow-950/40 blur-lg animate-ping" />
            <div className="h-5 w-5 rounded-full bg-slate-800/30 blur-md animate-bounce" style={{ animationDelay: '1s' }} />
          </div>
        )}

        {/* Dynamic Healthy Particle Streams */}
        {isHealthy && (
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/10 h-1.5 w-1.5 rounded-full bg-emerald-400/40 blur-xs animate-ping" />
            <div className="absolute top-1/2 left-2/3 h-2 w-2 rounded-full bg-teal-400/30 blur-xs animate-pulse" />
            <div className="absolute bottom-1/4 left-1/2 h-1 w-1 rounded-full bg-emerald-300/50 blur-none animate-ping" style={{ animationDelay: '2s' }} />
          </div>
        )}

        {/* Map Header */}
        <div className="z-20 flex justify-between items-center mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase bg-slate-900/80 border border-slate-700 px-2.5 py-1 text-slate-400 rounded-full">
              Sustaina Topographical View
            </span>
          </div>
          <div className="flex gap-2">
            {isHealthy && <span className="text-xs text-emerald-400 font-mono filter drop-shadow flex items-center gap-1">🍃 Ecosystem Purified</span>}
            {isWasteland && <span className="text-xs text-red-500 font-mono flex items-center gap-1">⚠️ Extreme Ecological Smog</span>}
          </div>
        </div>

        {/* Interactive Isometric-styled Vector Landscape Representation */}
        <div id="isometric-landscape-map" className="z-20 grid grid-cols-2 md:grid-cols-5 gap-4 my-auto">
          {/* Tile 1: Energy Grid */}
          <div className="relative aspect-square rounded-2xl p-4 flex flex-col justify-between overflow-hidden border border-white/5 bg-[#1F242D]">
            <div className="absolute inset-0 opacity-10 bg-radial from-amber-500/10 to-transparent" />
            <div className="flex justify-between items-start">
              <Zap className="h-5 w-5 text-amber-400" />
              <span className="text-[9px] font-mono text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded">Sector 01</span>
            </div>
            <div className="my-2 h-16 flex items-center justify-center">
              {stats.energySupplyType.includes("Coal") && (
                <svg className="h-14 w-14 text-slate-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 0L14.828 8.12a8 8 0 10-11.314 0l3.536-3.536" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v9m-4-3h8" />
                  {/* Smoke lines */}
                  <line x1="15" y1="3" x2="16" y2="1" stroke="red" strokeWidth={2} className="animate-pulse" />
                </svg>
              )}
              {stats.energySupplyType.includes("Gas") && (
                <svg className="h-14 w-14 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              {stats.energySupplyType.includes("Solar") && (
                <svg className="h-14 w-14 text-yellow-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              )}
              {stats.energySupplyType.includes("Nuclear") && (
                <div className="relative">
                  <Sparkles className="h-12 w-12 text-cyan-400 animate-spin-slow" />
                  <div className="absolute inset-0 flex items-center justify-center bg-cyan-950/40 rounded-full h-8 w-8 m-auto">
                    <Zap className="h-4 w-4 text-cyan-300" />
                  </div>
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-[10px] font-mono text-slate-400 uppercase leading-none">Power Source</p>
              <h5 className="text-[11px] font-bold text-white mt-1 leading-tight">{stats.energySupplyType}</h5>
            </div>
          </div>

          {/* Tile 2: Transportation */}
          <div className="relative aspect-square rounded-2xl p-4 flex flex-col justify-between overflow-hidden border border-white/5 bg-[#1F242D]">
            <div className="absolute inset-0 opacity-10 bg-radial from-violet-500/10 to-transparent" />
            <div className="flex justify-between items-start">
              <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span className="text-[9px] font-mono text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded">Sector 02</span>
            </div>
            <div className="my-2 h-16 flex items-center justify-center">
              {stats.transportType.includes("Gasoline") && (
                <svg className="h-12 w-12 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  {/* Tail pipe cloud */}
                  <circle cx="10" cy="12" r="1.5" className="text-slate-500 animate-ping opacity-70" />
                </svg>
              )}
              {stats.transportType.includes("Hybrid") && (
                <svg className="h-12 w-12 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              )}
              {stats.transportType.includes("EV") && (
                <div className="flex flex-col items-center">
                   <svg className="h-12 w-12 text-emerald-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-[8px] font-mono uppercase text-emerald-300">Fast Rail</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-[10px] font-mono text-slate-400 uppercase leading-none">Mobility</p>
              <h5 className="text-[11px] font-bold text-white mt-1 leading-tight">{stats.transportType}</h5>
            </div>
          </div>

          {/* Tile 3: Industrial Sector */}
          <div className="relative aspect-square rounded-2xl p-4 flex flex-col justify-between overflow-hidden border border-white/5 bg-[#1F242D]">
            <div className="absolute inset-0 opacity-10 bg-radial from-red-500/10 to-transparent" />
            <div className="flex justify-between items-start">
              <Building2 className="h-5 w-5 text-[#94a3b8]" />
              <span className="text-[9px] font-mono text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded">Sector 03</span>
            </div>
            <div className="my-2 h-16 flex items-center justify-center">
              {stats.industryType.includes("Coal") && (
                <div className="text-center animate-pulse">
                  <Flame className="h-10 w-10 text-red-500 mx-auto" />
                  <span className="text-[9px] font-mono text-orange-400 font-bold block">Smokestacks</span>
                </div>
              )}
              {stats.industryType.includes("Standard") && (
                <svg className="h-12 w-12 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              )}
              {stats.industryType.includes("Zero-Waste") && (
                <div className="flex flex-col items-center">
                  <Sparkles className="h-10 w-10 text-emerald-400 animate-pulse" />
                  <span className="text-[8px] font-mono text-teal-300">Clean Bio-Tech</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-[10px] font-mono text-slate-400 uppercase leading-none">Industrial</p>
              <h5 className="text-[11px] font-bold text-white mt-1 leading-tight">{stats.industryType}</h5>
            </div>
          </div>

          {/* Tile 4: Forestry Reserva */}
          <div className="relative aspect-square rounded-2xl p-4 flex flex-col justify-between overflow-hidden border border-white/5 bg-[#1F242D]">
            <div className="absolute inset-0 opacity-10 bg-radial from-emerald-500/10 to-transparent" />
            <div className="flex justify-between items-start">
              <Trees className="h-5 w-5 text-emerald-400" />
              <span className="text-[9px] font-mono text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded">Sector 04</span>
            </div>
            <div className="my-2 h-16 flex items-center justify-center">
              {stats.forestryType.includes("Deforested") && (
                <div className="text-center opacity-60">
                  <svg className="h-12 w-12 text-amber-850" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span className="text-[7.5px] font-mono text-amber-700 block font-bold">Logged Area</span>
                </div>
              )}
              {stats.forestryType.includes("Urban") && (
                <svg className="h-12 w-12 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              )}
              {stats.forestryType.includes("Pristine") && (
                <div className="text-center">
                  <div className="flex justify-center -space-x-2">
                    <Trees className="h-10 w-10 text-emerald-400 animate-bounce" />
                    <Trees className="h-8 w-8 text-teal-400 translate-y-2" />
                  </div>
                  <span className="text-[8px] font-mono text-emerald-300 font-bold">Protected</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-[10px] font-mono text-slate-400 uppercase leading-none">Biodiversity</p>
              <h5 className="text-[11px] font-bold text-white mt-1 leading-tight">{stats.forestryType}</h5>
            </div>
          </div>

          {/* Tile 5: Sustainable Housing */}
          <div className="relative aspect-square rounded-2xl p-4 flex flex-col justify-between overflow-hidden border border-white/5 bg-[#1F242D]">
            <div className="absolute inset-0 opacity-10 bg-radial from-sky-500/10 to-transparent" />
            <div className="flex justify-between items-start">
              <svg className="h-5 w-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[9px] font-mono text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded">Sector 05</span>
            </div>
            <div className="my-2 h-16 flex items-center justify-center">
              {stats.housingType.includes("Leaky") && (
                <svg className="h-12 w-12 text-[#94a3b8] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              )}
              {stats.housingType.includes("Efficient") && (
                <svg className="h-12 w-12 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              )}
              {stats.housingType.includes("Net-Zero") && (
                <div className="flex flex-col items-center">
                  <svg className="h-12 w-12 text-emerald-400 rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span className="text-[8px] font-mono text-teal-300">Rooftop Solar Active</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-[10px] font-mono text-slate-400 uppercase leading-none">Housing</p>
              <h5 className="text-[11px] font-bold text-white mt-1 leading-tight">{stats.housingType}</h5>
            </div>
          </div>
        </div>

        {/* Map visual guide footer */}
        <div className="z-20 mt-4 flex justify-between items-center text-[10px] font-mono text-slate-400">
          <p>Tap Constructible Upgrades below to evolve slots.</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Green Solution
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Standard Transition
            </span>
          </div>
        </div>
      </div>

      {/* Upgrades panel: Construct and Refine */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HardHat className="h-5 w-5 text-emerald-400" />
          <h3 className="font-display text-lg font-bold">Constructible Infrastructure Solutions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upgrades
            .filter((up) => !up.purchased)
            .map((item) => {
              const canAfford = stats.credits >= item.cost;
              const isLocked = item.requiresCalculatorUnlock && !calculatorFinished;

              return (
                <div
                  key={item.id}
                  id={`upgrade-choice-${item.id}`}
                  className={`group relative overflow-hidden rounded-2xl border bg-[#12141A] p-5 transition-all flex flex-col justify-between ${
                    isLocked 
                      ? "border-white/5 opacity-65 select-none"
                      : canAfford 
                      ? "border-white/5 hover:border-emerald-500/50 hover:bg-[#1E222B] shadow-sm"
                      : "border-white/5"
                  }`}
                >
                  <div>
                    {/* Header line */}
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-mono text-slate-400 uppercase bg-slate-800/80 px-2.5 py-1 rounded-full">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1 font-mono text-xs text-teal-400 font-bold">
                        <span>{item.cost}</span>
                        <span className="text-[10px] text-slate-400">credits</span>
                      </div>
                    </div>

                    <h4 className="font-display text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Impact and construct action button */}
                  <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      <div className="flex items-center gap-1 text-emerald-400 font-bold">
                        <TrendingDown className="h-3 w-3" />
                        <span>{item.co2Effect} CO₂</span>
                      </div>
                      <div className="flex items-center gap-1 text-sky-400 font-semibold">
                        <span>+{item.healthEffect}% Health</span>
                      </div>
                    </div>

                    {isLocked ? (
                      <div className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/20 px-2.5 py-1 rounded-lg border border-amber-500/15">
                        <span>Locked via Calculator</span>
                      </div>
                    ) : (
                      <button
                        id={`construct-button-${item.id}`}
                        onClick={() => onTriggerUpgrade(item.id)}
                        disabled={!canAfford}
                        className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-semibold font-mono cursor-pointer transition-all ${
                          canAfford
                            ? "bg-emerald-500 text-slate-950 hover:brightness-110 active:scale-97 shadow-sm shadow-emerald-500/25"
                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        <Hammer className="h-3 w-3" />
                        <span>Construct</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {upgrades.filter((up) => !up.purchased).length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-8 bg-slate-900/20 border border-emerald-500/10 rounded-2xl text-center space-y-2">
              <Sparkles className="h-8 w-8 text-emerald-400 animate-pulse" />
              <h4 className="font-display font-semibold text-white">Full Net-Zero Utopia Unlocked!</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Every sector of Sustaina operates under premium deep environmental policies. You have mastered simulated carbon reduction!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

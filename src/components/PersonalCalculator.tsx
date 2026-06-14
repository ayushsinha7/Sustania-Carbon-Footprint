import React, { useState } from "react";
import { motion } from "motion/react";
import { Leaf, Award, Footprints, Train, HelpCircle, Utensils, Home, Plane, Save, Info, RefreshCw } from "lucide-react";
import { FootprintCalculation } from "../types";
import {
  computeElectricityCO2,
  computeHeatingCO2,
  computeCarCO2,
  computeFlightsCO2,
  computeDietCO2,
  computeRawTotal
} from "../utils/calculations";

interface PersonalCalculatorProps {
  onCommitCalculations: (calculatedTons: number, pledgedBonus: number) => void;
  onUnlockUpgrades: () => void;
}

export default function PersonalCalculator({ onCommitCalculations, onUnlockUpgrades }: PersonalCalculatorProps) {
  // Input questionnaire state representing real user choices
  const [inputs, setInputs] = useState<FootprintCalculation>({
    electricityUsage: 80, // USD / month
    heatingType: "electricity",
    carKilometers: 120, // km / week
    carType: "gasoline",
    flightHours: 5, // hours / year
    dietType: "balanced",
  });

  const [finished, setFinished] = useState(false);
  const [selectedPledges, setSelectedPledges] = useState<string[]>([]);
  const [pledgesSubmitted, setPledgesSubmitted] = useState(false);

  const rawTotal = computeRawTotal(inputs);

  // Pledge choices and calculations of dynamic offset bonus
  const activePledgesList = [
    {
      id: "pledge_beef",
      label: "Go Meatless on Mondays",
      desc: "Cut intensive industrial meat consumption by 15%, reducing diet methane emissions.",
      offsetBonus: 80,
    },
    {
      id: "pledge_transit",
      label: "Take Electric Transit twice a week",
      desc: "Swap car commutes for clean metro rails or electric buses. Drops road carbon by 25%.",
      offsetBonus: 100,
    },
    {
      id: "pledge_led",
      label: "Equip Smart LED Bulbs",
      desc: "Optimize utility load to lower thermal loss. Reduces electrical consumption.",
      offsetBonus: 70,
    }
  ];

  const handleTogglePledge = (pledgeId: string) => {
    if (selectedPledges.includes(pledgeId)) {
      setSelectedPledges(selectedPledges.filter((p) => p !== pledgeId));
    } else {
      setSelectedPledges([...selectedPledges, pledgeId]);
    }
  };

  const handleFinishAssessment = () => {
    setFinished(true);
    onUnlockUpgrades(); // Let App know to unlock building tiles that require calculator completed
  };

  const handleCommitPledges = () => {
    const totalEcoBonus = selectedPledges.reduce((acc, pledgeId) => {
      const p = activePledgesList.find((x) => x.id === pledgeId);
      return acc + (p?.offsetBonus || 0);
    }, 0);

    setPledgesSubmitted(true);
    // Directly commit to our state managers in App.tsx
    onCommitCalculations(rawTotal, totalEcoBonus);
  };

  return (
    <div className="bg-[#12141A] p-6 rounded-3xl border border-white/5 shadow-2xl">
      {/* Intro and interactive title */}
      <div className="flex items-center gap-3 mb-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          <Footprints className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider">Your Carbon Footprint Analysis</h2>
          <p className="text-xs text-slate-400">Evaluate your physical actions and commit to green lifestyle adjustments.</p>
        </div>
      </div>

      {!finished ? (
        <div className="space-y-6">
          {/* Slider 1: Electricity expense */}
          <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center">
              <label htmlFor="electricity-usage-input" className="text-xs uppercase tracking-widest text-slate-300 font-semibold flex items-center gap-2 cursor-pointer">
                <Home className="h-4 w-4 text-emerald-400" />
                <span>Monthly Electricity Bill</span>
              </label>
              <span className="text-xs font-mono bg-[#1A1D24] text-emerald-400 px-3 py-1 rounded-full border border-white/5 font-bold">
                ${inputs.electricityUsage} / month
              </span>
            </div>
            <input
              type="range"
              id="electricity-usage-input"
              aria-label="Monthly Electricity Bill"
              min="10"
              max="350"
              value={inputs.electricityUsage}
              onChange={(e) => setInputs({ ...inputs, electricityUsage: Number(e.target.value) })}
              className="w-full h-1.5 bg-[#1A1D24] rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-[10px] text-slate-400 leading-normal font-mono flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-emerald-400/60" /> Calculated at regional utility emission coefficients.
            </p>
          </div>

          {/* Selector 2: Thermal Fuel source */}
          <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
            <label className="text-xs uppercase tracking-widest text-slate-300 font-semibold flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-400" />
              <span>Household Heating Climate Source</span>
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { id: "naturalGas", label: "Natural Gas", desc: "Standard carbon" },
                { id: "heatingOil", label: "Heating Oil", desc: "Extremely heavy" },
                { id: "electricity", label: "Electric Grid", desc: "Moderate mix" },
                { id: "solar", label: "Solar Thermal", desc: "Highly ecological" }
              ].map((fuel) => (
                <button
                  key={fuel.id}
                  onClick={() => setInputs({ ...inputs, heatingType: fuel.id as any })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    inputs.heatingType === fuel.id
                      ? "border-emerald-500/50 bg-emerald-500/10 text-white shadow-md shadow-emerald-500/5"
                      : "border-white/5 bg-[#1A1D24] text-slate-350 hover:border-slate-700"
                  }`}
                >
                  <p className="text-xs font-semibold">{fuel.label}</p>
                  <p className="text-[9px] font-mono mt-0.5 text-slate-400 leading-none">{fuel.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Slider 3: Car Travel commute */}
          <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center">
              <label htmlFor="car-kilometers-input" className="text-xs uppercase tracking-widest text-slate-300 font-semibold flex items-center gap-2 cursor-pointer">
                <Train className="h-4 w-4 text-emerald-400" />
                <span>Car Weekly Travel Distance</span>
              </label>
              <span className="text-xs font-mono bg-[#1A1D24] text-emerald-400 px-3 py-1 rounded-full border border-white/5 font-bold">
                {inputs.carKilometers} km / week
              </span>
            </div>
            <input
              type="range"
              id="car-kilometers-input"
              aria-label="Car Weekly Travel Distance"
              min="0"
              max="500"
              value={inputs.carKilometers}
              onChange={(e) => setInputs({ ...inputs, carKilometers: Number(e.target.value) })}
              className="w-full h-1.5 bg-[#1A1D24] rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="pt-2">
              <p className="text-xs text-slate-300 font-semibold mb-1.5 font-mono">My Car Fuel Type</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  { id: "gasoline", label: "Gas / Diesel" },
                  { id: "hybrid", label: "Hybrid Hybrid" },
                  { id: "electric", label: "100% Electric" },
                  { id: "none", label: "No Car Commute" }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setInputs({ ...inputs, carType: type.id as any })}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono text-center transition-all cursor-pointer ${
                      inputs.carType === type.id
                        ? "border-emerald-555 bg-emerald-500/10 text-emerald-400"
                        : "border-white/5 bg-[#1A1D24] text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Flights and DIET grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <label htmlFor="flight-hours-input" className="text-xs uppercase tracking-widest text-slate-300 font-semibold flex items-center gap-2 cursor-pointer">
                  <Plane className="h-4 w-4 text-emerald-400" />
                  <span>Aviation Flight Hours</span>
                </label>
                <span className="text-xs font-mono bg-[#1A1D24] text-emerald-400 px-2.5 py-0.5 rounded border border-white/5 font-bold">
                  {inputs.flightHours} hrs
                </span>
              </div>
              <input
                type="range"
                id="flight-hours-input"
                aria-label="Annual Aviation Flight Hours"
                min="0"
                max="80"
                value={inputs.flightHours}
                onChange={(e) => setInputs({ ...inputs, flightHours: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#1A1D24] rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-300 font-semibold flex items-center gap-2">
                <Utensils className="h-4 w-4 text-emerald-400" />
                <span>Default Dietary Routine</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "heavyMeat", label: "Heavy Meat" },
                  { id: "balanced", label: "Balanced Food" },
                  { id: "vegetarian", label: "Vegetarian" },
                  { id: "vegan", label: "Vegan Diet" }
                ].map((diet) => (
                  <button
                    key={diet.id}
                    onClick={() => setInputs({ ...inputs, dietType: diet.id as any })}
                    className={`py-1 rounded-lg border text-xs font-mono text-center transition-all cursor-pointer ${
                      inputs.dietType === diet.id
                        ? "border-emerald-555 bg-emerald-500/10 text-emerald-450 text-emerald-400"
                        : "border-white/5 bg-[#1A1D24] text-slate-400 hover:border-slate-750"
                    }`}
                  >
                     {diet.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calculator direct footer with real-time meter display */}
          <div className="flex justify-between items-center p-4 bg-[#1A1D24] rounded-2xl border border-white/5">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase leading-none">Your Real Annual Footprint</p>
              <h4 className="text-xl font-bold font-mono text-white mt-1.5 leading-none">
                {rawTotal.toFixed(2)} <span className="text-sm font-mono text-slate-400">Tons CO₂e</span>
              </h4>
            </div>
            <button
              id="submit-calculator-assessment"
              onClick={handleFinishAssessment}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-sm shadow-emerald-500/20 active:scale-97 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>Lock Carbon Analysis</span>
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 text-center py-4"
        >
          {/* Finished view: Pledging solutions */}
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-2 animate-bounce">
            <Leaf className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-lg font-bold text-white">Assessment Successfully Generated!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Your calculated physical footprint evaluated to <strong className="text-white font-mono">{rawTotal.toFixed(1)} metric tons CO₂/yr</strong>. 
              The target is below <strong className="text-emerald-400 font-mono">2.0 tons</strong>. Take a real-scale pledge to dispatch Eco-Credits directly to your city grid.
            </p>
          </div>

          <div className="text-left space-y-3 max-w-md mx-auto">
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest pl-1">Take Real Carbon Pledges</p>
            {activePledgesList.map((p) => {
              const isSelected = selectedPledges.includes(p.id);
              return (
                <button
                  key={p.id}
                  disabled={pledgesSubmitted}
                  onClick={() => handleTogglePledge(p.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center gap-3 select-none ${
                    pledgesSubmitted ? "opacity-75" : "cursor-pointer"
                  } ${
                    isSelected
                      ? "border-emerald-550 bg-emerald-500/5 text-white"
                      : "border-white/5 bg-[#1A1D24] text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-slate-200">{p.label}</h5>
                    <p className="text-[10px] leading-tight text-slate-400">{p.desc}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-400 shrink-0">
                    +{p.offsetBonus} Credits
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center max-w-sm mx-auto pt-4">
            <button
              onClick={() => {
                setFinished(false);
                setPledgesSubmitted(false);
              }}
              className="px-4 py-2.5 rounded-xl border border-white/5 text-slate-400 text-xs hover:bg-[#1A1D24] transition-colors font-mono cursor-pointer"
            >
              Re-calculate
            </button>
            <button
              id="claim-carbon-credits"
              disabled={pledgesSubmitted || selectedPledges.length === 0}
              onClick={handleCommitPledges}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                pledgesSubmitted || selectedPledges.length === 0
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold hover:shadow-lg shadow-emerald-500/20 active:scale-97 cursor-pointer"
              }`}
            >
              {pledgesSubmitted ? "Credits Transferred" : "Commit & Earn"}
            </button>
          </div>

          {pledgesSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/10 text-emerald-400 text-[11px] font-mono max-w-md mx-auto"
            >
              🎉 Eco bonus credits dispatched. Premium advanced upgrades are now unlocked on the constructible catalog!
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

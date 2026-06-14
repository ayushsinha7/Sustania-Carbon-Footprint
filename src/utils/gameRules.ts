import { CityStats, SectorUpgrade } from "../types";

/**
 * Validates whether an upgrade can be purchased by the governor
 */
export function validatePurchase(
  stats: CityStats,
  upgrade: SectorUpgrade,
  calculatorFinished: boolean
): { allowed: boolean; reason?: string } {
  if (stats.credits < upgrade.cost) {
    return { allowed: false, reason: "Insufficient Eco-Incentive funds in city treasury." };
  }
  if (upgrade.requiresCalculatorUnlock && !calculatorFinished) {
    return { allowed: false, reason: "You must complete your Real-World Football/Carbon Footprint calculations first to unlock this advanced microgrid." };
  }
  if (upgrade.purchased) {
    return { allowed: false, reason: "Infrastructure has already been constructed and deployed." };
  }
  return { allowed: true };
}

/**
 * Applies the effects of an ecological upgrade to the current city statistics
 */
export function applyUpgrade(stats: CityStats, upgrade: SectorUpgrade): CityStats {
  const nextCO2 = Math.max(0, parseFloat((stats.co2 + upgrade.co2Effect).toFixed(2)));
  const nextHealth = Math.min(100, Math.max(0, stats.health + upgrade.healthEffect));
  const nextCredits = Math.max(0, stats.credits - upgrade.cost);

  let updatedEnergy = stats.energySupplyType;
  let updatedTransport = stats.transportType;
  let updatedIndustry = stats.industryType;
  let updatedForestry = stats.forestryType;
  let updatedHousing = stats.housingType;

  if (upgrade.category === "energy") {
    if (upgrade.id === "gaspump") updatedEnergy = "Natural Gas";
    if (upgrade.id === "windsolar") updatedEnergy = "Solar & Wind";
    if (upgrade.id.includes("fusion")) updatedEnergy = "Nuclear Fusion";
  } else if (upgrade.category === "transport") {
    if (upgrade.id === "biobuses") updatedTransport = "Hybrid Public Buses";
    if (upgrade.id === "maglevEV") updatedTransport = "100% Electric Rail & EV";
  } else if (upgrade.category === "industry") {
    if (upgrade.id === "filters") updatedIndustry = "Standard Regulatory";
    if (upgrade.id === "biotechs") updatedIndustry = "Zero-Waste Bio-tech";
  } else if (upgrade.category === "forestry") {
    if (upgrade.id === "streetgreen") updatedForestry = "Urban Greenspaces";
    if (upgrade.id === "redwoods") updatedForestry = "Pristine Protected Canopy";
  } else if (upgrade.category === "housing") {
    if (upgrade.id === "condos") updatedHousing = "Double-glazed Efficient Apartments";
    if (upgrade.id.includes("microgrid")) updatedHousing = "Active Net-Zero Microgrids";
  }

  return {
    ...stats,
    co2: nextCO2,
    health: nextHealth,
    credits: nextCredits,
    energySupplyType: updatedEnergy,
    transportType: updatedTransport,
    industryType: updatedIndustry,
    forestryType: updatedForestry,
    housingType: updatedHousing
  };
}

/**
 * Calculates current net zero progress percentage
 */
export function calculateNetZeroIndex(co2: number): number {
  if (co2 <= 0) return 100;
  const initialCO2 = 15.2;
  const rawProgress = 100 - (co2 / initialCO2) * 100;
  return Math.max(0, Math.min(100, Math.round(rawProgress)));
}

/**
 * Calculates a dynamic ecological health rating and advice message
 */
export function getEcoStatusReport(co2: number, health: number): {
  rating: string;
  grade: "A+" | "B" | "C-" | "D" | "F";
  statusColor: string;
} {
  const netZeroIdx = calculateNetZeroIndex(co2);
  const combinedScore = (netZeroIdx + health) / 2;

  if (combinedScore >= 90) {
    return {
      rating: "Ecological Paradise: Full sustainability achieved!",
      grade: "A+",
      statusColor: "text-emerald-400"
    };
  } else if (combinedScore >= 70) {
    return {
      rating: "Green Urban Zone: High air quality and stable emissions.",
      grade: "B",
      statusColor: "text-teal-400"
    };
  } else if (combinedScore >= 50) {
    return {
      rating: "Developing Sector: Traditional smog persists. More upgrades required.",
      grade: "C-",
      statusColor: "text-amber-400"
    };
  } else if (combinedScore >= 30) {
    return {
      rating: "Industrial Heavyweight: Emissions exceed capacity, respiratory strain warning.",
      grade: "D",
      statusColor: "text-orange-500"
    };
  } else {
    return {
      rating: "Environmental Collapse: Smog haze blocks sunlight. Deploy urgent scrubbers!",
      grade: "F",
      statusColor: "text-red-500"
    };
  }
}

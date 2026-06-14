import { describe, it, expect } from "vitest";
import { CityStats, SectorUpgrade } from "../types";
import {
  validatePurchase,
  applyUpgrade,
  calculateNetZeroIndex,
  getEcoStatusReport
} from "../utils/gameRules";

const mockStats: CityStats = {
  name: "Test City",
  co2: 12.0,
  health: 45,
  population: 100000,
  credits: 500,
  energyDemand: 200,
  energySupplyType: "Coal-Powered Heavy",
  transportType: "Gasoline Cars",
  industryType: "Coal-Powered Heavy",
  forestryType: "Deforested Logging",
  housingType: "Leaky Standard Suburbs"
};

const mockUpgrade: SectorUpgrade = {
  id: "gaspump",
  name: "Methane Gas Cogeneration",
  category: "energy",
  cost: 120,
  co2Effect: -2.2,
  healthEffect: 8,
  description: "Cleaner gas boilers.",
  purchased: false
};

const lockedUpgrade: SectorUpgrade = {
  id: "fusion",
  name: "Tokamak Core",
  category: "energy",
  cost: 850,
  co2Effect: -7.5,
  healthEffect: 34,
  description: "Nuclear fusion core.",
  purchased: false,
  requiresCalculatorUnlock: true
};

describe("City Map Upgrades and Game Rules Validation", () => {
  it("allows purchase if user has enough credits and is not locked", () => {
    const result = validatePurchase(mockStats, mockUpgrade, false);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("denies purchase if user has insufficient credits", () => {
    const poorStats = { ...mockStats, credits: 50 };
    const result = validatePurchase(poorStats, mockUpgrade, false);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("funds");
  });

  it("denies purchase if upgrade requires personal calculator unlock and it's not finished", () => {
    const richStats = { ...mockStats, credits: 1000 };
    const result = validatePurchase(richStats, lockedUpgrade, false);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("calculations first");
  });

  it("allows purchase if upgrade requires calculator unlock and it is finished", () => {
    const richStats = { ...mockStats, credits: 1000 };
    const result = validatePurchase(richStats, lockedUpgrade, true);
    expect(result.allowed).toBe(true);
  });

  it("denies purchase if already purchased", () => {
    const purchasedUpgrade = { ...mockUpgrade, purchased: true };
    const result = validatePurchase(mockStats, purchasedUpgrade, false);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("already");
  });
});

describe("City Stats Upgrade Application", () => {
  it("deducts credit expense from city treasury correctly", () => {
    const updated = applyUpgrade(mockStats, mockUpgrade);
    expect(updated.credits).toBe(mockStats.credits - mockUpgrade.cost);
  });

  it("reduces carbon metrics and raises eco-health values", () => {
    const updated = applyUpgrade(mockStats, mockUpgrade);
    expect(updated.co2).toBeCloseTo(9.8, 1);
    expect(updated.health).toBe(53);
  });

  it("clips CO2 stats at a floor of 0.0", () => {
    const highEffectUpgrade: SectorUpgrade = {
      id: "ultra-green",
      name: "Fictional Zero Carbon",
      category: "energy",
      cost: 50,
      co2Effect: -30.0,
      healthEffect: 10,
      description: "Cheat upgrade.",
      purchased: false
    };
    const updated = applyUpgrade(mockStats, highEffectUpgrade);
    expect(updated.co2).toBe(0);
  });

  it("clips Ecosystem Health stats at a ceiling of 100", () => {
    const superHealthyUpgrade: SectorUpgrade = {
      id: "utopia",
      name: "Utopian Trees",
      category: "forestry",
      cost: 50,
      co2Effect: -1.0,
      healthEffect: 80,
      description: "Super green.",
      purchased: false
    };
    const updated = applyUpgrade(mockStats, superHealthyUpgrade);
    expect(updated.health).toBe(100);
  });

  it("applies corresponding infrastructure category labels (Energy: Gas)", () => {
    const updated = applyUpgrade(mockStats, mockUpgrade);
    expect(updated.energySupplyType).toBe("Natural Gas");
  });

  it("applies category labels for Wind and Solar", () => {
    const windUpgrade = { ...mockUpgrade, id: "windsolar" };
    const updated = applyUpgrade(mockStats, windUpgrade);
    expect(updated.energySupplyType).toBe("Solar & Wind");
  });

  it("applies category labels for Nuclear Fusion", () => {
    const fusionUpgrade = { ...mockUpgrade, id: "fusion tokamak" };
    const updated = applyUpgrade(mockStats, fusionUpgrade);
    expect(updated.energySupplyType).toBe("Nuclear Fusion");
  });

  it("applies corresponding labels for Transport (Hybrid Buses)", () => {
    const busUpgrade: SectorUpgrade = {
      id: "biobuses",
      name: "Buses",
      category: "transport",
      cost: 10,
      co2Effect: -0.5,
      healthEffect: 2,
      description: "test",
      purchased: false
    };
    const updated = applyUpgrade(mockStats, busUpgrade);
    expect(updated.transportType).toBe("Hybrid Public Buses");
  });

  it("applies corresponding labels for Transport (EV Rail)", () => {
    const railUpgrade: SectorUpgrade = {
      id: "maglevEV",
      name: "Rail",
      category: "transport",
      cost: 10,
      co2Effect: -0.5,
      healthEffect: 2,
      description: "test",
      purchased: false
    };
    const updated = applyUpgrade(mockStats, railUpgrade);
    expect(updated.transportType).toBe("100% Electric Rail & EV");
  });

  it("applies corresponding labels for Industry (Regulatory)", () => {
    const indUpgrade: SectorUpgrade = {
      id: "filters",
      name: "Filters",
      category: "industry",
      cost: 10,
      co2Effect: -0.5,
      healthEffect: 2,
      description: "test",
      purchased: false
    };
    const updated = applyUpgrade(mockStats, indUpgrade);
    expect(updated.industryType).toBe("Standard Regulatory");
  });

  it("applies corresponding labels for Industry (Bio-tech)", () => {
    const indUpgrade: SectorUpgrade = {
      id: "biotechs",
      name: "Bio",
      category: "industry",
      cost: 10,
      co2Effect: -0.5,
      healthEffect: 2,
      description: "test",
      purchased: false
    };
    const updated = applyUpgrade(mockStats, indUpgrade);
    expect(updated.industryType).toBe("Zero-Waste Bio-tech");
  });

  it("applies corresponding labels for Forestry (Greenspaces)", () => {
    const forestUpgrade: SectorUpgrade = {
      id: "streetgreen",
      name: "Greening",
      category: "forestry",
      cost: 10,
      co2Effect: -0.5,
      healthEffect: 2,
      description: "test",
      purchased: false
    };
    const updated = applyUpgrade(mockStats, forestUpgrade);
    expect(updated.forestryType).toBe("Urban Greenspaces");
  });

  it("applies corresponding labels for Forestry (Canopy)", () => {
    const forestUpgrade: SectorUpgrade = {
      id: "redwoods",
      name: "Canopy",
      category: "forestry",
      cost: 10,
      co2Effect: -0.5,
      healthEffect: 2,
      description: "test",
      purchased: false
    };
    const updated = applyUpgrade(mockStats, forestUpgrade);
    expect(updated.forestryType).toBe("Pristine Protected Canopy");
  });

  it("applies corresponding labels for Housing (Apartments)", () => {
    const houseUpgrade: SectorUpgrade = {
      id: "condos",
      name: "Condos",
      category: "housing",
      cost: 10,
      co2Effect: -0.5,
      healthEffect: 2,
      description: "test",
      purchased: false
    };
    const updated = applyUpgrade(mockStats, houseUpgrade);
    expect(updated.housingType).toBe("Double-glazed Efficient Apartments");
  });

  it("applies corresponding labels for Housing (Net-Zero)", () => {
    const houseUpgrade: SectorUpgrade = {
      id: "activemicrogrid",
      name: "Microgrid",
      category: "housing",
      cost: 10,
      co2Effect: -0.5,
      healthEffect: 2,
      description: "test",
      purchased: false
    };
    const updated = applyUpgrade(mockStats, houseUpgrade);
    expect(updated.housingType).toBe("Active Net-Zero Microgrids");
  });
});

describe("Net-Zero Progress Percentage Calculator", () => {
  it("yields 100% when carbon outputs reaches 0", () => {
    expect(calculateNetZeroIndex(0)).toBe(100);
    expect(calculateNetZeroIndex(-1.5)).toBe(100);
  });

  it("evaluates current percentage according to benchmark baseline", () => {
    expect(calculateNetZeroIndex(15.2)).toBe(0);
    expect(calculateNetZeroIndex(7.6)).toBe(50);
    expect(calculateNetZeroIndex(3.8)).toBe(75);
  });

  it("enforces clamp limits between 0 and 100", () => {
    expect(calculateNetZeroIndex(30.0)).toBe(0);
  });
});

describe("Ecosystem Health Grading Advisory", () => {
  it("reaches Class A+ Paradise under fully optimized ecosystem ratings", () => {
    const report = getEcoStatusReport(0, 100); // 100% net zero, 100% health
    expect(report.grade).toBe("A+");
    expect(report.rating).toContain("Paradise");
    expect(report.statusColor).toBe("text-emerald-400");
  });

  it("assigns Class B Green Zone under moderate-high performance", () => {
    const report = getEcoStatusReport(4.56, 80); // ~70% Net Zero + 80% health / 2 = 75% score
    expect(report.grade).toBe("B");
    expect(report.rating).toContain("Green Urban Zone");
    expect(report.statusColor).toBe("text-teal-400");
  });

  it("assigns Class C- under modest improvements", () => {
    const report = getEcoStatusReport(9.12, 60); // 40% Net-Zero + 60% Health = 50% score
    expect(report.grade).toBe("C-");
    expect(report.rating).toContain("Developing Sector");
    expect(report.statusColor).toBe("text-amber-400");
  });

  it("assigns Class D Industrial Heavyweight when conventional pollution dominates", () => {
    const report = getEcoStatusReport(12.0, 40); // 21% Net Zero + 40% Health = 30.5% score
    expect(report.grade).toBe("D");
    expect(report.rating).toContain("Industrial Heavyweight");
    expect(report.statusColor).toBe("text-orange-500");
  });

  it("flag F levels under critical ecological stress thresholds", () => {
    const report = getEcoStatusReport(15.2, 10); // 0% Net Zero + 10% Health = 5% score
    expect(report.grade).toBe("F");
    expect(report.rating).toContain("Environmental Collapse");
    expect(report.statusColor).toBe("text-red-500");
  });
});

import { describe, it, expect } from "vitest";
import { CityStats } from "../types";

// Re-declare or import the event actions to test
const mockStats: CityStats = {
  name: "Testville",
  co2: 10.0,
  health: 50,
  population: 10000,
  credits: 500,
  energyDemand: 100,
  energySupplyType: "Coal-Powered Heavy",
  transportType: "Gasoline Cars",
  industryType: "Coal-Powered Heavy",
  forestryType: "Deforested Logging",
  housingType: "Leaky Standard Suburbs"
};

const heatwaveA = (s: CityStats) => ({
  ...s,
  co2: Math.min(20, s.co2 + 1.2),
  health: Math.max(0, s.health - 8),
  credits: s.credits + 50
});

const heatwaveB = (s: CityStats) => ({
  ...s,
  co2: Math.max(0, s.co2 - 0.8),
  health: Math.min(100, s.health + 15),
  credits: Math.max(0, s.credits - 120)
});

const frackingA = (s: CityStats) => ({
  ...s,
  co2: Math.min(20, s.co2 + 1.8),
  health: Math.max(0, s.health - 15)
});

const frackingB = (s: CityStats) => ({
  ...s,
  credits: Math.max(0, s.credits - 150),
  health: Math.min(100, s.health + 10)
});

const mangrovesA = (s: CityStats) => ({
  ...s,
  credits: s.credits + 200,
  co2: Math.min(25, s.co2 + 1.5),
  health: Math.max(0, s.health - 12)
});

const mangrovesB = (s: CityStats) => ({
  ...s,
  credits: Math.max(0, s.credits - 100),
  co2: Math.max(0, s.co2 - 1.0),
  health: Math.min(100, s.health + 18)
});

describe("Random Crisis Actions", () => {
  describe("Heatwave Event", () => {
    it("option A adds carbon, penalizes health, and increases credits", () => {
      const result = heatwaveA(mockStats);
      expect(result.co2).toBeCloseTo(11.2, 1);
      expect(result.health).toBe(42);
      expect(result.credits).toBe(550);
    });

    it("option A respects CO2 ceiling of 20", () => {
      const highCO2Stats = { ...mockStats, co2: 19.5 };
      const result = heatwaveA(highCO2Stats);
      expect(result.co2).toBe(20.0);
    });

    it("option B reduces carbon, improves health, and subtracts credits", () => {
      const result = heatwaveB(mockStats);
      expect(result.co2).toBeCloseTo(9.2, 1);
      expect(result.health).toBe(65);
      expect(result.credits).toBe(380);
    });

    it("option B respects health ceiling of 100 and credits floor of 0", () => {
      const edgeStats = { ...mockStats, health: 95, credits: 50 };
      const result = heatwaveB(edgeStats);
      expect(result.health).toBe(100);
      expect(result.credits).toBe(0);
    });
  });

  describe("Fracking Event", () => {
    it("option A bumps CO2 and hurts health", () => {
      const result = frackingA(mockStats);
      expect(result.co2).toBeCloseTo(11.8, 1);
      expect(result.health).toBe(35);
    });

    it("option B consumes credits and restores health", () => {
      const result = frackingB(mockStats);
      expect(result.credits).toBe(350);
      expect(result.health).toBe(60);
    });
  });

  describe("Mangroves Sanctuary Debate", () => {
    it("option A pays credits but hurts climate metrics", () => {
      const result = mangrovesA(mockStats);
      expect(result.credits).toBe(700);
      expect(result.co2).toBeCloseTo(11.5, 1);
      expect(result.health).toBe(38);
    });

    it("option B protects nature by spending treasury funds", () => {
      const result = mangrovesB(mockStats);
      expect(result.credits).toBe(400);
      expect(result.co2).toBeCloseTo(9.0, 1);
      expect(result.health).toBe(68);
    });
  });
});

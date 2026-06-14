import { describe, it, expect } from "vitest";
import {
  computeElectricityCO2,
  computeHeatingCO2,
  computeCarCO2,
  computeFlightsCO2,
  computeDietCO2,
  computeRawTotal
} from "../utils/calculations";
import { FootprintCalculation } from "../types";

describe("Carbon Footprint Calculations", () => {
  it("computes electricity CO2 accurately based on monthly bill", () => {
    // $80 bill / 0.16 cost per kWh = 500 kWh.
    // 500 kWh * 12 months * 0.38 kg emission factor = 2280 kg CO2.
    // 2280 kg / 1000 = 2.28 metric tons.
    const result = computeElectricityCO2(80);
    expect(result).toBeCloseTo(2.28, 4);
  });

  it("returns correct heat emissions based on custom fuel options", () => {
    expect(computeHeatingCO2("naturalGas")).toBe(1.8);
    expect(computeHeatingCO2("heatingOil")).toBe(2.6);
    expect(computeHeatingCO2("electricity")).toBe(1.1);
    expect(computeHeatingCO2("solar")).toBe(0.05);
  });

  it("evaluates mileage emissions based on gasoline vs low emission cars", () => {
    // none type should yield zero
    expect(computeCarCO2("none", 120)).toBe(0);

    // gasoline car travel: 120 km/week * 52 weeks = 6240 km.
    // 6240 km * 0.22 kg/km = 1372.8 kg.
    // 1372.8 kg / 1000 = 1.3728 metric tons.
    expect(computeCarCO2("gasoline", 120)).toBeCloseTo(1.3728, 4);

    // hybrid: 120 * 52 * 0.12 / 1000 = 0.7488 metric tons
    expect(computeCarCO2("hybrid", 120)).toBeCloseTo(0.7488, 4);

    // electric: 120 * 52 * 0.04 / 1000 = 0.2496 metric tons
    expect(computeCarCO2("electric", 120)).toBeCloseTo(0.2496, 4);
  });

  it("calculates aviation flight CO2 correctly", () => {
    // 5 flight hours * 135 kg/hour = 675 kg = 0.675 metric tons.
    expect(computeFlightsCO2(5)).toBeCloseTo(0.675, 4);
  });

  it("maps distinct nutritional diet emissions properly", () => {
    expect(computeDietCO2("heavyMeat")).toBe(2.9);
    expect(computeDietCO2("balanced")).toBe(1.9);
    expect(computeDietCO2("vegetarian")).toBe(1.3);
    expect(computeDietCO2("vegan")).toBe(0.9);
  });

  it("yields precision cumulative output across complete surveys", () => {
    const inputs: FootprintCalculation = {
      electricityUsage: 80, // 2.28 tons
      heatingType: "electricity", // 1.1 tons
      carKilometers: 120, // 1.3728 tons (gasoline)
      carType: "gasoline",
      flightHours: 5, // 0.675 tons
      dietType: "balanced", // 1.9 tons
    };

    // 2.28 + 1.1 + 1.3728 + 0.675 + 1.9 = 7.3278 tons
    expect(computeRawTotal(inputs)).toBeCloseTo(7.3278, 4);
  });
});

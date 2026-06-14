import { FootprintCalculation } from "../types";

export function computeElectricityCO2(electricityUsage: number): number {
  // ~$0.15 per kWh. ~0.380 kg of CO2 per kWh.
  const kwh = electricityUsage / 0.16;
  const kgPerYr = kwh * 12 * 0.38;
  return kgPerYr / 1000; // in metric tons
}

export function computeHeatingCO2(heatingType: FootprintCalculation["heatingType"]): number {
  switch (heatingType) {
    case "naturalGas": return 1.8;
    case "heatingOil": return 2.6;
    case "electricity": return 1.1;
    case "solar": return 0.05;
    default: return 0;
  }
}

export function computeCarCO2(carType: FootprintCalculation["carType"], carKilometers: number): number {
  if (carType === "none") return 0;
  // factor: kg of CO2 per km
  let factor = 0.22; // gasoline
  if (carType === "hybrid") factor = 0.12;
  if (carType === "electric") factor = 0.04; // grid-mix based

  const kmPerYr = carKilometers * 52;
  return (kmPerYr * factor) / 1000;
}

export function computeFlightsCO2(flightHours: number): number {
  // ~120 kg CO2 emitted per hour of aviation flight
  return (flightHours * 135) / 1000;
}

export function computeDietCO2(dietType: FootprintCalculation["dietType"]): number {
  switch (dietType) {
    case "heavyMeat": return 2.9;
    case "balanced": return 1.9;
    case "vegetarian": return 1.3;
    case "vegan": return 0.9;
    default: return 1.5;
  }
}

export function computeRawTotal(inputs: FootprintCalculation): number {
  return (
    computeElectricityCO2(inputs.electricityUsage) +
    computeHeatingCO2(inputs.heatingType) +
    computeCarCO2(inputs.carType, inputs.carKilometers) +
    computeFlightsCO2(inputs.flightHours) +
    computeDietCO2(inputs.dietType)
  );
}

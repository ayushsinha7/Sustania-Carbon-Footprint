export interface CityStats {
  name: string;
  co2: number; // Metric Tons per year per capita (Target: 0.0)
  health: number; // Eco-Health % (0 to 100)
  population: number; // Virtual citizens
  credits: number; // Simulator currency
  energyDemand: number; // in MW
  energySupplyType: 'Coal-Powered Heavy' | 'Natural Gas' | 'Solar & Wind' | 'Nuclear Fusion';
  transportType: 'Gasoline Cars' | 'Hybrid Public Buses' | '100% Electric Rail & EV';
  industryType: 'Coal-Powered Heavy' | 'Standard Regulatory' | 'Zero-Waste Bio-tech';
  forestryType: 'Deforested Logging' | 'Urban Greenspaces' | 'Pristine Protected Canopy';
  housingType: 'Leaky Standard Suburbs' | 'Double-glazed Efficient Apartments' | 'Active Net-Zero Microgrids';
}

export interface SectorUpgrade {
  id: string;
  name: string;
  category: 'energy' | 'transport' | 'industry' | 'forestry' | 'housing';
  cost: number;
  co2Effect: number; // Changes CO2 stat (negative is reduction)
  healthEffect: number; // Changes Health %
  creditsMultiplier?: number; // Generates passive credits
  description: string;
  purchased: boolean;
  requiresCalculatorUnlock?: boolean; // Must finish personal calculations to construct!
}

export interface CarbonFact {
  fact: string;
  topic: string;
  impact: string;
  source?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface FootprintCalculation {
  electricityUsage: number; // USD per month
  heatingType: 'naturalGas' | 'heatingOil' | 'electricity' | 'solar';
  carKilometers: number; // miles/km per week
  carType: 'gasoline' | 'hybrid' | 'electric' | 'none';
  flightHours: number; // per year
  dietType: 'heavyMeat' | 'balanced' | 'vegetarian' | 'vegan';
}

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini API:", error);
  }
} else {
  console.warn("GEMINI_API_KEY not found. Operating with fallback offline services.");
}

// Prefilled Carbon and Climate Facts library for robust offline mode
const FALLBACK_FACTS = [
  {
    fact: "The carbon footprint of the average person in the US is 16 tons per year, one of the highest in the world. Globally, the average is closer to 4 tons.",
    topic: "Global Stats",
    impact: "To avoid a 2°C rise in global temperatures, the average global carbon footprint per year needs to drop under 2 tons by 2050."
  },
  {
    fact: "Replacing one regular light bulb with an LED can save up to 150 pounds of carbon dioxide emissions every year.",
    topic: "Home Power",
    impact: "LEDs use about 75-80% less energy than traditional incandescent bulbs and last 25 times longer."
  },
  {
    fact: "Food accounts for nearly 10-30% of a household's carbon footprint.",
    topic: "Diet & Consumption",
    impact: "Meat-rich diets carry over double the greenhouse gas footprint of plant-focused diets due to livestock methane emissions and feed land clearing."
  },
  {
    fact: "An average passenger vehicle emits about 4.6 metric tons of CO2 per year, assuming typical mileage.",
    topic: "Transportation",
    impact: "Taking public transit, cycling, or working remotely even 1-2 times a week can cut individual transit carbon by up to 35%."
  },
  {
    fact: "If everyone in the world lived and consumed like an average European or American, we would need 3 to 4 planet Earths to sustain us.",
    topic: "Overshoot",
    impact: "Ecological debt day occurs earlier every year, meaning we consume more resources than Earth naturally replenishes."
  },
  {
    fact: "A single mature tree can absorb around 48 pounds of CO2 per year from the atmosphere, sequestering it indefinitely.",
    topic: "Nature",
    impact: "Protecting and planting forests acts as a crucial negative-emissions sink, offsetting essential emissions that we cannot fully eliminate."
  },
  {
    fact: "Internet browsing, cloud video streaming, and data centers contribute roughly 3.7% of global greenhouse emissions.",
    topic: "Digital Activity",
    impact: "This is comparable to the carbon emissions of the entire global aviation industry!"
  }
];

// Fallback Advising Rules & System Reactions
const FALLBACK_ADVISORY: Record<string, string> = {
  general: "Aim to balance economic expansion with targeted environmental spending. Prioritize phase-out of coal-fired grids, expand public transport rail, and protect forestry blocks. To unlock more credit flow, solve personal carbon footprint challenges and reduce real-world transport carbon.",
  crisis_methane: "Methane is over 25 times more potent than CO2. Deploy immediate sensors to seal the pipeline leaks, levy fine structures on fossil operators, and accelerate biogas recapture in agricultural waste sectors.",
  crisis_heatwave: "Severe urban heat island effects detected. Invest heavily in urban forestry, green roof mandates on buildings, and transition from asphalt highways to high-density cooling public parks.",
  crisis_oil_spill: "Ecosystem disaster in progress. Fast-track marine cleanup operations, enforce strict maritime chemical rules, and seize this opportunity to phase out offshore oil extraction in favor of wave power generators."
};

// API: RANDOM CARBON FACT (Uses Gemini for dynamic custom generation if key exists)
app.get("/api/facts/random", async (req, res) => {
  const useGemini = req.query.refresh === "true" && ai;

  if (useGemini && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Generate one fascinating, eye-opening carbon footprint or climate awareness fact. Return the response strictly as a JSON object with three properties: 'fact' (the core fact with numbers), 'topic' (a 1-3 word topic name), and 'impact' (the actionable ecological lesson or context of this fact).",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fact: { type: Type.STRING },
              topic: { type: Type.STRING },
              impact: { type: Type.STRING }
            },
            required: ["fact", "topic", "impact"]
          }
        }
      });

      if (response.text) {
        const generatedFact = JSON.parse(response.text.trim());
        return res.json({ source: "Gemini", ...generatedFact });
      }
    } catch (e) {
      console.error("Gemini fact generation failed, using local vault:", e);
    }
  }

  // Fallback to static selection
  const randomFact = FALLBACK_FACTS[Math.floor(Math.random() * FALLBACK_FACTS.length)];
  res.json({ source: "Local Vault", ...randomFact });
});

// API: ADVISOR CONSULTANT (Calls Gemini for interactive, realistic city game suggestions)
app.post("/api/advisor/consult", async (req, res) => {
  const { cityStats, message } = req.body;

  if (!cityStats) {
    return res.status(400).json({ error: "Missing city stats context." });
  }

  const { name, co2, health, population, credits } = cityStats;

  if (ai) {
    try {
      const prompt = `You are the Chief Eco-Advisor for "${name}", a virtual simulation city in an educational game raising awareness of Carbon Footprints (CO2).
Current Dashboard Metrics of ${name}:
- Population: ${population.toLocaleString()} citizens
- Carbon Footprint per capita: ${co2.toFixed(1)} tons CO2/year (Target: Net Zero)
- Ecological Health: ${health}% (Higher means healthier biodiversity and clean air)
- City Treasury: ${credits} Credits available

Actor/Governer query / event context:
"${message}"

Provide a tactical ecological advisor report. Write like a highly professional, encouraging sustainability specialist. Keep it concise, engaging, and broken down with simple visual bullet list items. Limit to max 140 words. Tell them the exact real-world lesson related to this scenario.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });

      if (response.text) {
        return res.json({ response: response.text });
      }
    } catch (e) {
      console.error("Gemini Advisor strategy API error:", e);
    }
  }

  // Fallback strategies for smooth offline play
  let reply = FALLBACK_ADVISORY.general;
  const lowercaseMsg = (message || "").toLowerCase();
  
  if (lowercaseMsg.includes("methane") || lowercaseMsg.includes("leak")) {
    reply = FALLBACK_ADVISORY.crisis_methane;
  } else if (lowercaseMsg.includes("heatwave") || lowercaseMsg.includes("hot") || lowercaseMsg.includes("temp")) {
    reply = FALLBACK_ADVISORY.crisis_heatwave;
  } else if (lowercaseMsg.includes("oil") || lowercaseMsg.includes("spill")) {
    reply = FALLBACK_ADVISORY.crisis_oil_spill;
  }

  res.json({
    response: `🤖 [Eco-Offline AI Guide] ${reply}\n\n*Configure your GEMINI_API_KEY in the Secrets panel to activate full dynamic brainstorming!*`
  });
});

// API: EDUCATIONAL CO2 QUIZ (Dynamic CO2 Quiz generated by Gemini or served offline)
app.get("/api/quiz", async (req, res) => {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Generate a quick 3-question Carbon Footprint & climate awareness multiple choice quiz. Return exactly 3 questions. Each item should have 'id' (number), 'question' (string), 'options' (array of 4 strings), 'correctIndex' (number from 0 to 3), and 'explanation' (string clarifying why the answer is correct).",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["id", "question", "options", "correctIndex", "explanation"]
            }
          }
        }
      });

      if (response.text) {
        return res.json(JSON.parse(response.text.trim()));
      }
    } catch (err) {
      console.error("Failed to generate dynamic quiz via Gemini, serving premium pre-baked quiz:", err);
    }
  }

  // High-quality static educational quiz fallback
  res.json([
    {
      id: 1,
      question: "Which of these food categories has the highest greenhouse gas emissions per kilogram of food produced globally?",
      options: ["Poultry (Chicken)", "Wheat & Rice", "Beef (Cattle farming)", "Tofu & Soy products"],
      correctIndex: 2,
      explanation: "Beef produces a massive carbon footprint (around 60kg equivalent and methane per kg) due to cattle's natural digestive methane release, extensive pasture land needs, and feed production."
    },
    {
      id: 2,
      question: "What is global warming potential (GWP) of Methane (CH4) compared to Carbon Dioxide (CO2) over a 20-year timescale?",
      options: ["Methane has about half the warning effect of CO2", "Methane is roughly equal to CO2", "Methane is over 80 times more potent than CO2", "Methane is exactly 10 times more potent"],
      correctIndex: 2,
      explanation: "While CO2 persists much longer, methane is an incredibly potent short-lived greenhouse gas, intercepting over 80 times more heat than CO2 over a 20-year span."
    },
    {
      id: 3,
      question: "Which transport type carries the lowest carbon footprint per passenger-kilometer?",
      options: ["Electric SUV", "High-speed electric train", "Short-haul commercial flight", "Single-passenger gasoline hatchback"],
      correctIndex: 1,
      explanation: "High-speed electric trains operate at massive carrying capacity powered by grid electricity, emitting roughly 6-10g of CO2 per passenger km, compared to over 240g for airplanes."
    }
  ]);
});

// Setup Vite Dev Server / Static Ingress routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware registered.");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Vite static production handlers registered.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Eco-Engine Server] Running on http://localhost:${PORT}`);
  });
}

startServer();

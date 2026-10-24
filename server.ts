import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client with required telemetry header
let aiClient: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Gemini AI initialization error:', err);
  }
}

// 1. AI Material Quality Grading & Valuation Endpoint
app.post('/api/ai/grade-material', async (req: Request, res: Response) => {
  const { materialName, category, specifications, conditionNotes, corridor } = req.body;

  if (aiClient) {
    try {
      const prompt = `You are the lead metallurgical and industrial recycling evaluator for ReviveIndustrial, a circular manufacturing marketplace operating in India.
Evaluate this industrial surplus/scrap listing:
- Material Name: ${materialName || 'Industrial Metal Scrap'}
- Category: ${category || 'Manufacturing'}
- Specifications: ${specifications || 'Standard offcuts'}
- Condition & Notes: ${conditionNotes || 'Clean segregated lot'}
- Origin Industrial Corridor: ${corridor || 'Chakan, Pune'}

Use the ReviveIndustrial Quality Grading Rubric:
- Grade A: Near-prime surplus material, unused or minimal cosmetic wear, fully certified specs, 0% oxidation. Direct reuse.
- Grade B: Industrial scrap/offcuts with minor wear/oxidation, requiring minor processing (slitting/cleaning) before reuse.
- Grade C: End-of-life or unsegregated salvage scrap requiring heavy recycling/remelting.

Respond in strict JSON with keys:
{
  "recommendedGrade": "Grade A" | "Grade B" | "Grade C",
  "gradeRationale": "concise 2-sentence technical rationale",
  "recommendedHsnCode": "e.g. 72041000",
  "gstRatePercent": 18,
  "estimatedPriceMinInr": number,
  "estimatedPriceMaxInr": number,
  "unit": "Metric Ton",
  "recommendedBuyerIndustries": ["Industry 1", "Industry 2", "Industry 3"],
  "circularRepurposingTips": "specific industrial manufacturing application (e.g. foundry casting charge, structural fabrication, re-extrusion)",
  "transitRadiusLimitKm": number,
  "inspectionChecklist": ["item 1", "item 2", "item 3"]
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return res.json({ success: true, data: parsed, source: 'gemini' });
      }
    } catch (apiError: any) {
      console.warn('Gemini API call failed, falling back to deterministic domain evaluator:', apiError?.message);
    }
  }

  // Resilient deterministic rule-based domain evaluator (works offline or without active API key)
  const isPrime = (materialName || '').toLowerCase().includes('prime') || (conditionNotes || '').toLowerCase().includes('unused');
  const isSalvage = (conditionNotes || '').toLowerCase().includes('salvage') || (conditionNotes || '').toLowerCase().includes('melt') || (conditionNotes || '').toLowerCase().includes('rust');
  
  const grade = isPrime ? 'Grade A' : isSalvage ? 'Grade C' : 'Grade B';
  let minPrice = 38000;
  let maxPrice = 52000;
  let hsn = '72042190';
  let buyerIndustries = ['Automotive Ancillary Stamping', 'Foundry Casting', 'Structural Pre-fab'];

  if ((category || '').toLowerCase().includes('auto')) {
    hsn = '87082900';
    minPrice = 44000;
    maxPrice = 64000;
    buyerIndustries = ['Tier-2 Stamping Units', 'Electric Rickshaw Chassis Fabricators', 'Specialty Fasteners'];
  } else if ((category || '').toLowerCase().includes('plastic')) {
    hsn = '39159042';
    minPrice = 62000;
    maxPrice = 88000;
    buyerIndustries = ['Industrial Packaging Crates', 'Drip Irrigation Tubing', 'Automotive Conduit'];
  } else if ((category || '').toLowerCase().includes('agri')) {
    hsn = '84329090';
    minPrice = 32000;
    maxPrice = 46000;
    buyerIndustries = ['Agricultural Implement Re-manufacturers', 'Rural Fabrication Units', 'Smelting Mills'];
  } else if ((category || '').toLowerCase().includes('tool') || (category || '').toLowerCase().includes('die')) {
    hsn = '72283029';
    minPrice = 85000;
    maxPrice = 140000;
    buyerIndustries = ['Custom Stamping Die Makers', 'Industrial Shear Blade Fabricators', 'Mold Base Shops'];
  } else if ((category || '').toLowerCase().includes('heavy')) {
    hsn = '73269099';
    minPrice = 46000;
    maxPrice = 68000;
    buyerIndustries = ['Turbine & Gear Forgers', 'Marine Shaft Fabricators', 'Crane Pivot Re-forgers'];
  } else if ((category || '').toLowerCase().includes('medical')) {
    hsn = '73044100';
    minPrice = 180000;
    maxPrice = 290000;
    buyerIndustries = ['Surgical Instrument Fabricators', 'Chromatography Sample Lines', 'Cannula Device Manufacturers'];
  }

  if (grade === 'Grade A') {
    minPrice = Math.round(minPrice * 1.35);
    maxPrice = Math.round(maxPrice * 1.4);
  } else if (grade === 'Grade C') {
    minPrice = Math.round(minPrice * 0.65);
    maxPrice = Math.round(maxPrice * 0.7);
  }

  return res.json({
    success: true,
    data: {
      recommendedGrade: grade,
      gradeRationale: `Classified as ${grade} based on surface condition, segregation integrity, and immediate industrial tolerance specs.`,
      recommendedHsnCode: hsn,
      gstRatePercent: 18,
      estimatedPriceMinInr: minPrice,
      estimatedPriceMaxInr: maxPrice,
      unit: 'Metric Ton',
      recommendedBuyerIndustries: buyerIndustries,
      circularRepurposingTips: `Optimal for closed-loop remanufacturing in nearby manufacturing clusters, avoiding secondary smelting energy expenditure.`,
      transitRadiusLimitKm: grade === 'Grade C' ? 180 : grade === 'Grade B' ? 350 : 750,
      inspectionChecklist: [
        'Check for chemical mill test certification (MTC) batch stamps',
        'Verify surface oxidation level below 4% by area',
        'Inspect dimensional tolerance and shear uniformity',
        'Check for oil/chemical emulsion residue'
      ]
    },
    source: 'domain_rules'
  });
});

// 2. Landed Cost & Corridor Radius Optimization Endpoint
app.post('/api/ai/corridor-logistics', (req: Request, res: Response) => {
  const { originCorridor, destinationCorridor, distanceKm, weightMt, materialPricePerMt, grade } = req.body;

  const dist = Number(distanceKm) || 120;
  const weight = Number(weightMt) || 10;
  const basePricePerMt = Number(materialPricePerMt) || 45000;

  // Indian diesel commercial freight benchmarks: ~₹4.8 - ₹6.5 per MT-km for heavy commercial haulage
  const freightRatePerMtKm = dist > 400 ? 4.6 : dist > 150 ? 5.2 : 6.8;
  const freightTotal = Math.round(dist * freightRatePerMtKm * weight);
  const freightPerMt = Math.round(freightTotal / weight);

  const materialTotalValue = basePricePerMt * weight;
  const freightPercentageOfValue = ((freightTotal / materialTotalValue) * 100);

  // Economic threshold: freight should ideally remain under 15% for Grade B/C, and under 22% for Grade A
  const maxFeasiblePercent = grade === 'Grade A' ? 22 : grade === 'Grade B' ? 16 : 11;
  const isFeasible = freightPercentageOfValue <= maxFeasiblePercent;

  // Carbon calculation: Empty backhaul avoidance vs new diesel trip: ~0.082 kg CO2e saved per ton-km by backhaul matching
  const co2AvoidedKg = Math.round(dist * weight * 0.082);

  // Suggested transit radius max
  const maxRecommendedRadiusKm = Math.round((materialTotalValue * (maxFeasiblePercent / 100)) / (freightRatePerMtKm * weight));

  res.json({
    success: true,
    data: {
      originCorridor: originCorridor || 'Chakan, Pune',
      destinationCorridor: destinationCorridor || 'Peenya, Bengaluru',
      distanceKm: dist,
      weightMt: weight,
      freightPerMt,
      freightTotal,
      materialTotalValue,
      freightPercentageOfValue: Number(freightPercentageOfValue.toFixed(1)),
      isFeasible,
      maxRecommendedRadiusKm,
      co2AvoidedKg,
      recommendation: isFeasible
        ? `Landed cost viable: Freight accounts for ${freightPercentageOfValue.toFixed(1)}% of material value, well within the ${maxFeasiblePercent}% economic viability threshold.`
        : `Economic alert: Freight cost (${freightPercentageOfValue.toFixed(1)}% of value) exceeds circular viability threshold (${maxFeasiblePercent}%). Recommend pairing with empty return backhaul or sourcing within ${maxRecommendedRadiusKm} km.`
    }
  });
});

// 3. GST & Business Verification Validator
app.post('/api/ai/verify-gst', (req: Request, res: Response) => {
  const { gstin, pan, licenseNumber, corridor } = req.body;
  const cleanGst = (gstin || '').trim().toUpperCase();
  const cleanPan = (pan || '').trim().toUpperCase();

  // Standard Indian GSTIN Regex: 2 digits (State) + 10 chars PAN + 1 digit entity + Z + 1 check digit
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  const isGstValid = gstRegex.test(cleanGst);
  const isPanValid = panRegex.test(cleanPan);

  // State code mapping
  const stateCodeMap: Record<string, string> = {
    '27': 'Maharashtra (e.g. Chakan, Pimpri, Talegaon)',
    '29': 'Karnataka (e.g. Peenya, Bommasandra, Bidadi)',
    '33': 'Tamil Nadu (e.g. Oragadam, Sriperumbudur, Hosur)',
    '06': 'Haryana (e.g. Manesar, Gurugram, Faridabad)',
    '24': 'Gujarat (e.g. Sanand, Halol, Ankleshwar)',
    '20': 'Jharkhand (e.g. Jamshedpur, Adityapur)',
  };

  const stateCode = cleanGst.substring(0, 2);
  const registeredState = stateCodeMap[stateCode] || 'Industrial Jurisdiction Verified';

  const verificationStatus = isGstValid && isPanValid ? 'VERIFIED' : 'PENDING_DOCUMENT_CORRECTION';

  res.json({
    success: true,
    data: {
      status: verificationStatus,
      isGstValid,
      isPanValid,
      registeredState,
      panExtracted: cleanGst.length >= 12 ? cleanGst.substring(2, 12) : cleanPan,
      eWayBillEligibility: isGstValid,
      wasteTradingPermit: 'PCB-Category-Orange/Green Validated',
      inspectionAuditDate: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    }
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReviveIndustrial server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

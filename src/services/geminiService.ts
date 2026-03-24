import { GoogleGenAI, Type } from "@google/genai";

export interface FashionQuery {
  categorie: string;
  query: string;
  budget_max: number;
}

export interface GeminiResponse {
  styleResume: string;
  queries: FashionQuery[];
}

const MOCK_RESPONSE: GeminiResponse = {
  styleResume: "Un look casual chic, parfait pour le bureau et les sorties, avec des tons neutres et minimalistes.",
  queries: [
    { categorie: "Haut", query: "chemise blanche femme casual chic", budget_max: 50 },
    { categorie: "Bas", query: "pantalon tailleur beige femme", budget_max: 60 },
    { categorie: "Chaussures", query: "mocassins cuir noir femme", budget_max: 90 }
  ]
};

export async function generateFashionQueries(styleDescription: string): Promise<GeminiResponse> {
  const isDemoMode = process.env.DEMO_MODE && process.env.DEMO_MODE !== "false" && process.env.DEMO_MODE !== "0";
  if (isDemoMode) {
    console.log("DEMO MODE: Returning mock Gemini response");
    return new Promise(resolve => setTimeout(() => resolve(MOCK_RESPONSE), 1500));
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Aucune clé API Gemini n'a été trouvée. Normalement, AI Studio en fournit une automatiquement. Si le problème persiste, essayez de rafraîchir la page.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a fashion assistant. Given a clothing style description, generate optimized Google Shopping search queries.
Reply ONLY with valid JSON, no markdown, no explanation.
Format:
{
  "styleResume": "one sentence style summary",
  "queries": [
    { "categorie": "Haut", "query": "...", "budget_max": 50 },
    { "categorie": "Bas", "query": "...", "budget_max": 60 },
    { "categorie": "Chaussures", "query": "...", "budget_max": 90 }
  ]
}
Queries must be short, effective, in French, optimized for Google Shopping.

User style description: ${styleDescription}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            styleResume: { type: Type.STRING },
            queries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  categorie: { type: Type.STRING },
                  query: { type: Type.STRING },
                  budget_max: { type: Type.NUMBER }
                },
                required: ["categorie", "query", "budget_max"]
              }
            }
          },
          required: ["styleResume", "queries"]
        }
      }
    });

    let text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    // Remove markdown code blocks if present
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();

    return JSON.parse(text) as GeminiResponse;
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    
    // Check for invalid API key error
    const errorMessage = error.message || String(error);
    if (errorMessage.includes("API key not valid") || errorMessage.includes("API_KEY_INVALID")) {
      throw new Error("Clé API Gemini invalide. Veuillez vérifier votre clé dans le panneau Secrets (Settings > Secrets).");
    }
    
    throw new Error(`Failed to analyze style: ${errorMessage}`);
  }
}

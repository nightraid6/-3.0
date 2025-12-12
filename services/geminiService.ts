import { GoogleGenAI } from "@google/genai";
import { GEMINI_SYSTEM_INSTRUCTION } from "../constants";

const apiKey = process.env.API_KEY || '';
// Note: In a real production app, handle missing key gracefully. 
// For this demo, we assume the environment is set up correctly as per instructions.

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateHolidayFortune = async (): Promise<string> => {
  if (!ai) return "The stars are silent today.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Generate a luxury holiday fortune.',
      config: {
        systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
        maxOutputTokens: 60,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Golden light whispers secrets of the coming year.";
  }
};

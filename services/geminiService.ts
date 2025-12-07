import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const GeminiService = {
  /**
   * Breaks down a complex task into 3-5 smaller actionable subtasks.
   */
  breakDownTask: async (taskText: string): Promise<string[]> => {
    if (!ai) return [];

    try {
      const model = 'gemini-2.5-flash';
      const prompt = `Break down the following task into 3 to 5 smaller, actionable subtasks. Return ONLY the subtasks as a JSON array of strings. Task: "${taskText}"`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const text = response.text;
      if (!text) return [];
      
      return JSON.parse(text);

    } catch (error) {
      console.error("Gemini breakdown error:", error);
      return [];
    }
  }
};
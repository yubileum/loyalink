import { GoogleGenAI } from "@google/genai";
import { User } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getRewardInsight = async (user: User): Promise<string> => {
  const ai = createClient();
  if (!ai) return "AI services are currently unavailable. Please check your API key.";

  try {
    const prompt = `
      You are a friendly, enthusiastic loyalty program assistant for a coffee shop called "Coffee & Co".
      
      Current User Status:
      - Name: ${user.name}
      - Stamps: ${user.stamps} / ${user.maxStamps}
      
      Rewards Structure:
      - 5 Stamps: Free Large Cookie
      - 10 Stamps: Free Specialty Latte
      
      Task:
      Write a short, 1-2 sentence encouraging message for the user. 
      If they are close to a reward, hype it up! 
      If they just started, welcome them.
      Do not use markdown. Keep it plain text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Keep collecting stamps for great rewards!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "We couldn't reach our AI assistant, but you're doing great!";
  }
};

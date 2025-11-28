import { GoogleGenAI } from "@google/genai";

// Ideally this comes from process.env.API_KEY, but for safety in this demo context we handle missing keys gracefully.
const API_KEY = process.env.API_KEY || '';

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateEmailDraft = async (recipientName: string, context: string): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API Key is missing.");
    return "API Key missing. Please configure your environment to use AI features.";
  }

  try {
    const prompt = `Write a professional, concise email to ${recipientName}. 
    Context of the deal/situation: ${context}.
    Keep it under 150 words. Sign off as 'The Team'.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Could not generate draft.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating draft. Please try again later.";
  }
};

export const analyzeDealProbability = async (dealTitle: string, stage: string, value: number): Promise<string> => {
  if (!ai) return "AI Insights unavailable (No API Key).";

  try {
    const prompt = `Analyze the following sales deal:
    Title: ${dealTitle}
    Stage: ${stage}
    Value: $${value}
    
    Provide a 1-sentence strategic advice on how to close this deal based on standard B2B sales practices.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No insights available.";
  } catch (error) {
    console.error(error);
    return "Could not analyze deal.";
  }
};
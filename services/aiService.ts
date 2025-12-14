
import { GoogleGenAI } from "@google/genai";
import { AppConfig } from '../types';

declare global {
  interface Window {
    puter?: any;
  }
}

// Ideally this comes from process.env.API_KEY
const SYSTEM_GEMINI_API_KEY = process.env.API_KEY || '';

const getConfig = (): AppConfig | null => {
  const saved = localStorage.getItem('opencrm_config');
  return saved ? JSON.parse(saved) : null;
};

export const signInToPuter = async (): Promise<any> => {
    if (!window.puter) {
        alert("Puter.js SDK not loaded. Check your internet connection.");
        return null;
    }
    try {
        const user = await window.puter.auth.signIn();
        return user;
    } catch (error) {
        console.error("Puter Sign In Error:", error);
        throw error;
    }
};

export const getPuterUser = async (): Promise<any> => {
    if (!window.puter) return null;
    try {
        return await window.puter.auth.getUser();
    } catch (e) {
        return null;
    }
};

export const chatWithAI = async (message: string, context: string = ''): Promise<string> => {
  const config = getConfig();
  const provider = config?.aiProvider || 'gemini';

  const systemPrompt = context 
    ? `Context: ${context}\n\nUser Query: ${message}`
    : message;

  if (provider === 'puter') {
     if (!window.puter) return "Puter.js SDK not loaded.";
     try {
        const response = await window.puter.ai.chat(systemPrompt);
        return response?.message?.content || response?.toString() || "No response.";
     } catch (e) {
        console.error(e);
        return "Error connecting to Puter AI.";
     }
  } else {
      const apiKey = config?.geminiApiKey || SYSTEM_GEMINI_API_KEY;
      if (!apiKey) return "Gemini API Key missing. Please check Settings.";
      
      const ai = new GoogleGenAI({ apiKey: apiKey });
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: systemPrompt,
        });
        return response.text || "No response.";
      } catch (error) {
        console.error(error);
        return "Error connecting to Gemini.";
      }
  }
};

export const generateEmailDraft = async (recipientName: string, context: string): Promise<string> => {
  const config = getConfig();
  const provider = config?.aiProvider || 'gemini';

  const prompt = `Write a professional, concise email to ${recipientName}. 
    Context of the deal/situation: ${context}.
    Keep it under 150 words. Sign off as 'The Team'.`;

  if (provider === 'puter') {
     if (!window.puter) return "Puter.js SDK not loaded. Please refresh the page.";
     try {
        const response = await window.puter.ai.chat(prompt);
        return response?.message?.content || response?.toString() || "No response from Puter AI.";
     } catch (e) {
        console.error("Puter AI Error:", e);
        return "Error: Please sign in to Puter in Settings > AI & Intelligence to use this feature.";
     }
  } else {
     const apiKey = config?.geminiApiKey || SYSTEM_GEMINI_API_KEY;
     if (!apiKey) return "Gemini API Key missing. Please configure it in Settings > AI.";
     
     const ai = new GoogleGenAI({ apiKey: apiKey });
     try {
       const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: prompt,
       });
       return response.text || "Could not generate draft.";
     } catch (error) {
       console.error("Gemini API Error:", error);
       return "Error generating draft with Gemini. Check your API Key.";
     }
  }
};

export const analyzeDealProbability = async (dealTitle: string, stage: string, value: number): Promise<string> => {
  const config = getConfig();
  const provider = config?.aiProvider || 'gemini';

  const prompt = `Analyze the following sales deal:
    Title: ${dealTitle}
    Stage: ${stage}
    Value: $${value}
    
    Provide a 1-sentence strategic advice on how to close this deal based on standard B2B sales practices.`;

  if (provider === 'puter') {
      if (!window.puter) return "Puter.js SDK not loaded.";
      try {
         const response = await window.puter.ai.chat(prompt);
         return response?.message?.content || response?.toString() || "No insights available.";
      } catch (e) {
         console.error(e);
         return "Error: Sign in to Puter in Settings to use AI.";
      }
  } else {
      const apiKey = config?.geminiApiKey || SYSTEM_GEMINI_API_KEY;
      if (!apiKey) return "Gemini API Key missing.";
      
      const ai = new GoogleGenAI({ apiKey: apiKey });
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview', // Use Pro for complex reasoning
          contents: prompt,
        });
        return response.text || "No insights available.";
      } catch (error) {
        console.error(error);
        return "Could not analyze deal. Check API Key.";
      }
  }
};

export const generateProjectRisks = async (name: string, description: string): Promise<string> => {
  const config = getConfig();
  const provider = config?.aiProvider || 'gemini';
  const prompt = `Analyze this project and identify 3 potential key risks and suggest 1-sentence mitigations for each. Format as a clean markdown list.
  Project Name: ${name}
  Description: ${description}`;

  if (provider === 'puter') {
      if (!window.puter) return "Puter.js SDK not loaded.";
      try {
         const response = await window.puter.ai.chat(prompt);
         return response?.message?.content || response?.toString() || "No risks identified.";
      } catch (e) {
         return "Error connecting to AI.";
      }
  } else {
      const apiKey = config?.geminiApiKey || SYSTEM_GEMINI_API_KEY;
      if (!apiKey) return "Gemini API Key missing.";
      const ai = new GoogleGenAI({ apiKey: apiKey });
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview', // Use Pro for analysis
          contents: prompt,
        });
        return response.text || "No risks identified.";
      } catch (error) {
        return "Could not generate risks.";
      }
  }
};

export const generateContactIcebreaker = async (name: string, title: string, company: string): Promise<string> => {
  const config = getConfig();
  const provider = config?.aiProvider || 'gemini';
  const prompt = `Write a short, professional 1-sentence icebreaker to start a conversation with ${name}, who is a ${title} at ${company}. Focus on their role or industry.`;

  if (provider === 'puter') {
      if (!window.puter) return "Puter.js SDK not loaded.";
      try {
         const response = await window.puter.ai.chat(prompt);
         return response?.message?.content || response?.toString() || "Hi there!";
      } catch (e) {
         return "Error connecting to AI.";
      }
  } else {
      const apiKey = config?.geminiApiKey || SYSTEM_GEMINI_API_KEY;
      if (!apiKey) return "Gemini API Key missing.";
      const ai = new GoogleGenAI({ apiKey: apiKey });
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash', // Flash is fast enough
          contents: prompt,
        });
        return response.text || "Hi there!";
      } catch (error) {
        return "Could not generate icebreaker.";
      }
  }
};

export const summarizeDocument = async (title: string, contentSnippet: string): Promise<string> => {
  const config = getConfig();
  const provider = config?.aiProvider || 'gemini';
  const prompt = `Summarize the following document content in 3 concise sentences.
  Document Title: ${title}
  Content: "${contentSnippet}"`;

  if (provider === 'puter') {
      if (!window.puter) return "Puter.js SDK not loaded.";
      try {
         const response = await window.puter.ai.chat(prompt);
         return response?.message?.content || response?.toString() || "No summary available.";
      } catch (e) {
         return "Error connecting to AI.";
      }
  } else {
      const apiKey = config?.geminiApiKey || SYSTEM_GEMINI_API_KEY;
      if (!apiKey) return "Gemini API Key missing.";
      const ai = new GoogleGenAI({ apiKey: apiKey });
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview', // Use Pro for summarization
          contents: prompt,
        });
        return response.text || "No summary available.";
      } catch (error) {
        return "Could not generate summary.";
      }
  }
};

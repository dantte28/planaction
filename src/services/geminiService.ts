import { GoogleGenAI } from "@google/genai";
import { Job, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const analyzeJobMatch = async (job: Job, profile: UserProfile) => {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze the match between this job and candidate profile.
    Job: ${JSON.stringify(job)}
    Profile: ${JSON.stringify(profile)}
    
    Return JSON: { "score": number, "missingSkills": string[], "suggestions": string }
  `;
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  
  return JSON.parse(response.text || "{}");
};

export const generateMessage = async (type: 'outreach' | 'followup', job: Job) => {
  const model = "gemini-3-flash-preview";
  const prompt = `Generate a professional ${type} message for a job at ${job.empresa} for the position ${job.vaga}. Language: Portuguese.`;
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });
  
  return response.text;
};

export const getInsights = async (applications: number, interviews: number) => {
  const model = "gemini-3-flash-preview";
  const prompt = `Analyze these job search stats: ${applications} applications, ${interviews} interviews. Provide 3 strategic insights.`;
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });
  
  return response.text;
};

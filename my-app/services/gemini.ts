import { GoogleGenerativeAI } from "@google/generative-ai";
import Constants from "expo-constants";

const apiKey = Constants.expoConfig?.extra?.geminiApiKey as string | undefined;

const client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = client?.getGenerativeModel({ model: "gemini-2.0-flash" }) ?? null;

export async function summarizePlace(
  title: string,
  rawExtract: string
): Promise<string> {
  if (!model) return rawExtract;
  try {
    const prompt = `You are a knowledgeable campus tour guide. Summarize this Wikipedia article about "${title}" in 2-3 concise, friendly sentences for someone standing near it:\n\n${rawExtract}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return rawExtract;
  }
}

export async function askAboutPlace(
  title: string,
  rawExtract: string,
  question: string
): Promise<string> {
  if (!model) return "Sorry, I couldn't find an answer.";
  try {
    const prompt = `Based on this info about "${title}":\n${rawExtract}\n\nAnswer this question concisely: ${question}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return "Sorry, I couldn't find an answer.";
  }
}

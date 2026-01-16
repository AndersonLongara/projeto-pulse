/**
 * OpenRouter Provider Configuration
 *
 * Configures the AI SDK to use OpenRouter with Gemini model.
 * Uses createOpenAI with custom baseURL for OpenRouter compatibility.
 *
 * @see https://openrouter.ai/docs
 */

import { createOpenAI } from "@ai-sdk/openai";

// ===========================================
// OPENROUTER CONFIGURATION
// ===========================================

/**
 * OpenRouter provider using AI SDK's OpenAI adapter
 * OpenRouter is API-compatible with OpenAI format
 */
export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "Pulse IA - HR Assistant",
  },
});

// ===========================================
// MODEL DEFINITIONS
// ===========================================

/**
 * Primary model: Gemini 2.0 Flash Lite (Free tier)
 * Fast, efficient, great for conversational AI
 */
export const PULSE_AI_MODEL = "google/gemini-2.0-flash-lite-preview-02-05:free";

/**
 * Fallback model if primary is unavailable
 */
export const PULSE_AI_MODEL_FALLBACK = "google/gemini-2.0-flash-001";

// ===========================================
// MODEL PARAMETERS
// ===========================================

export const MODEL_CONFIG = {
  /** Temperature: 0.7 for creative but consistent responses */
  temperature: 0.7,
  
  /** Max tokens: Enough for detailed responses with tables */
  maxTokens: 1024,
  
  /** Top-P: Nucleus sampling for natural variety */
  topP: 0.9,
  
  /** Frequency penalty: Reduce repetition */
  frequencyPenalty: 0.3,
};

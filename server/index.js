const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");
const path = require("path");
const fs = require("fs");

app.use(cors());
app.use(express.json());

require("dotenv").config({ path: require("find-config")(".env") });

const PORT = process.env.PORT || 3000;
const AI_GATEWAY_KEY = process.env.OPENAI_API_KEY; // e.g. https://ai-gateway.zende.sk
const AI_GATEWAY_URL = process.env.OPENAI_GATEWAY_URL;

// Load intent definitions
const intentsPath = path.join(process.cwd(), "intents.json");
const intentsList = JSON.parse(fs.readFileSync(intentsPath, "utf-8"));

/**
 * 🧠 Helper to send prompt to Zendesk AI Gateway
 */
async function getIntentsFromAI(transcript) {
  if (!AI_GATEWAY_URL || !AI_GATEWAY_KEY) {
    console.error("Missing AI Gateway configuration");
    throw new Error("AI Gateway not configured");
  }

  const systemPrompt = `
You are a multilingual Zendesk AI assistant.
You understand multiple languages and map user commands to valid intents.

Available intents:
${Object.entries(intentsList)
  .map(([key, desc]) => `- ${key}: ${desc}`)
  .join("\n")}

Rules:
- Always respond in JSON.
- You may detect multiple intents in one transcript.
- For each intent, include intent name, par
- If language is not English, detect and translate it internally before reasoning.
- Output format:
{
  "language": "<detected_language_code>",
  "intents": [
    { "intent": string, "params": object, "confidence": number, "explanation": string }
  ]
}

Example:
User: "Apply Add Subject macro and then save the ticket."
→
{
  "language": "en",
  "intents": [
    {
      "intent": "ApplyMacro",
      "params": { "macro_name": "Add Subject" },
      "confidence": 0.95,
      "explanation": "User requested to apply macro Add Subject."
    },
    {
      "intent": "SaveTicket",
      "params": {},
      "confidence": 0.97,
      "explanation": "User requested to save the ticket."
    }
  ]
}
`;

  try {
    console.log(
      `Making request to AI Gateway: ${AI_GATEWAY_URL}/v1/chat/completions`,
    );

    const response = await axios.post(
      `${AI_GATEWAY_URL}/v1/chat/completions`,
      {
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: transcript },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_GATEWAY_KEY}`,
        },
      },
    );
    try {
      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (err) {
      console.error("Failed to parse AI response", err);
      return { language: "unknown", intents: [] };
    }
  } catch (error) {
    console.error("AI Gateway request failed:", {
      url: `${AI_GATEWAY_URL}/v1/chat/completions`,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
}

/**
 * 🎯 API Endpoint: /process-transcript
 * Input: { transcript: string }
 * Output: { language: string, intents: [...], reply: string }
 */
app.post("/process-transcript", async (req, res) => {
  const { transcript } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: "Transcript missing" });
  }

  try {
    const aiResult = await getIntentsFromAI(transcript);

    // Generate a human-readable reply based on the detected intents
    let reply = "";
    if (aiResult.intents && aiResult.intents.length > 0) {
      const intentNames = aiResult.intents
        .map((intent) => intent.intent)
        .join(", ");
      reply = `I detected the following intents: ${intentNames}. `;

      // Add explanations for high-confidence intents
      const highConfidenceIntents = aiResult.intents.filter(
        (intent) => intent.confidence > 0.8,
      );
      if (highConfidenceIntents.length > 0) {
        reply += highConfidenceIntents
          .map((intent) => intent.explanation)
          .join(" ");
      }
    } else {
      reply =
        "I'm sorry, I couldn't understand your request. Could you please rephrase it?";
    }

    res.json({ ...aiResult, reply });
  } catch (error) {
    console.error("Error fetching AI response:", error.message);

    // Provide different responses based on error type
    let reply = "";
    if (error.message.includes("AI Gateway not configured")) {
      reply =
        "The AI service is not properly configured. Please check your environment variables.";
    } else if (error.response?.status === 404) {
      reply =
        "The AI service endpoint was not found. Please check your AI Gateway URL configuration.";
    } else if (
      error.response?.status === 401 ||
      error.response?.status === 403
    ) {
      reply =
        "Authentication failed with the AI service. Please check your API key.";
    } else {
      reply = "I'm experiencing technical difficulties. Please try again.";
    }

    res.status(500).json({
      error: "AI processing failed",
      reply,
      language: "en",
      intents: [],
    });
  }
});

//voice to voice agent
app.get("/api/v1/session", async (req, res) => {
  try {
    const response = await fetch(
      "https://ai-gateway.zende.sk/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2025-06-03",
        }),
      },
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in /session:", error);
    res.status(500).json({ error: error });
  }
});

//text to speech
app.post("/api/v1/tts", async (req, res) => {
  try {
    const { input, voice, model } = req.body;

    if (!input) {
      return res.status(400);
    }
    const response = await fetch(
      "https://ai-gateway.zende.sk/v1/audio/speech",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          voice,
          input,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(500).json({ error: error.error.message });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (error) {
    console.error("Error in /session:", error);
    res.status(500).json({ error: error });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

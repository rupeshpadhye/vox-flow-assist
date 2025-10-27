const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

require("dotenv").config({ path: require("find-config")(".env") });

const PORT = process.env.PORT || 3000;

//voice to voice agent
app.get("/api/v1/session", async (req, res) => {
  try {
    const response = await fetch(`${OPENAI_GATEWAY_URL}/v1/realtime/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2025-06-03",
      }),
    });
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
    const response = await fetch(`${OPENAI_GATEWAY_URL}/v1/audio/speech`, {
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
    });

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

const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

require('dotenv').config({ path: require('find-config')('.env') })

const PORT = process.env.PORT || 3000;
const username = `${process.env.EMAIL}/token`;
const apiToken = process.env.API_TOKEN;
const subdomain = process.env.SUB_DOMAIN;

const ZENDESK_API_URL = `https://${subdomain}.zendesk.com/api/v2`;


const config = {
  method: 'GET',
  headers: {
      'Content-Type': 'application/json',
  },
  auth: {
      username: username,
      password: apiToken,
  },
};



app.get("/api/v1/tickets", (req, res) => {

  const size = req.query.size || 25;
  const {nextCursor , prevCursor } = req.query;
  const cursorAfterParam = nextCursor &&  nextCursor !== 'null' ? `&page[after]=${nextCursor}` : '';
  const prevCursorParam = prevCursor && prevCursor !== 'null' ? `&page[before]=${prevCursor}` : '';


  try {
    axios({
      ...config,
      url: `${ZENDESK_API_URL}/tickets.json?page[size]=${size}${cursorAfterParam}${prevCursorParam}`,
    }).then((response) => {
      res.json(response.data);
    });
  } catch (err) {
    //console.log(err);
  }
});

app.get("/api/v1/tickets/:id", (req, res) => {
  try {
    axios({
      ...config,
      url: `${ZENDESK_API_URL}/tickets/${req.params.id}?include=comment_count,users,last_audits`,
    }).then((response) => {
      res.json(response.data);
    });
  } catch (err) {
    console.error(error);
  }
});


app.put("/api/v1/tickets/:id", (req, res) => {
  const ticketId = req.params.id;
  const data = req.body;
  try {
    axios({
      ...config,
      method: "PUT",
      url: `${ZENDESK_API_URL}/tickets/${ticketId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    }).then((response) => {
      res.json(response.data);
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: `Failed to fetch data for ticket id - ${ticketId}` });
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
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in /session:", error);
    res
      .status(500)
      .json({ error: error });
  }
});


//text to speech
app.post("/api/v1/tts", async (req, res) => {
  try {
    const {input, voice, model} = req.body;

    if(!input) {
      return res.status(400);
    }
    const response = await fetch("https://ai-gateway.zende.sk/v1/audio/speech", {
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
    res
      .status(500)
      .json({ error: error });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

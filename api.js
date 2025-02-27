const express = require("express");
const session = require("express-session");
const axios = require("axios");
const cheerio = require("cheerio");
const validUrl = require("valid-url");
require("dotenv").config();

const { callAIModel } = require("./ai");
const { scrapeTable } = require("./scraper");

const app = express();
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Validate input
const validateInput = (url, prompt) => {
  if (!validUrl.isUri(url)) return "Invalid URL";
  if (typeof prompt !== "string" || prompt.trim() === "") return "Invalid prompt";

  // Check for harmful script in the prompt
  const harmfulPatterns = [/script/i, /<\s*script/i, /<\/\s*script/i];
  for (const pattern of harmfulPatterns) {
    if (pattern.test(prompt)) return "Prompt contains harmful script";
  }

  return null;
};

// Chat API
app.post("/chat", async (req, res) => {
  const { url, prompt } = req.body;
  const validationError = validateInput(url, prompt);
  if (validationError) return res.status(400).json({ error: validationError });

  if (!req.session.history) req.session.history = [];

  const scrapedData = await scrapeTable(url);
  // const aiResponse = await callAIModel(`URL: ${url} HTML: ${JSON.stringify(scrapedData)}\nUser Prompt: ${prompt}`);
  const aiResponse = await callAIModel(`
    You are a web scraper. Your task is to return scraping result based on the user prompt on the given URL and its HTML content.
    You expected to return a JSON in the following format:
    {
      "text": "....", // reply text from the AI
      "results": [...], // scraping results (in array of object),
    }

    Now, here is the URL, HTML content, and user prompt:
    URL: ${url}\n HTML: ${scrapedData.fullHtml}\n User Prompt: ${prompt}
    `);

  req.session.history.push({ url, prompt, response: aiResponse });
  res.json({ response: aiResponse, history: req.session.history });
  // res.json({ response: scrapedData, history: req.session.history });
});

app.listen(3000, () => console.log("Server running on port 3000"));

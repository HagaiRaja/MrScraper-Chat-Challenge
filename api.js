const express = require("express");
const session = require("express-session");
const axios = require("axios");
const cheerio = require("cheerio");
const validUrl = require("valid-url");
require("dotenv").config();

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

// Web Scraping Function (Example with Cheerio)
const scrapeWebsite = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    let breeders = [];
    $(".breeder-info").each((i, el) => {
      breeders.push({
        name: $(el).find(".name").text().trim(),
        phone: $(el).find(".phone").text().trim(),
        location: $(el).find(".location").text().trim(),
      });
    });
    return breeders.length > 0 ? breeders : { fullHtml: data };
  } catch (error) {
    return { error: "Failed to scrape the website" };
  }
};

// AI Model Call
const callAIModel = async (prompt) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.OPENROUTER_MODEL_ID,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    return { error: "AI model request failed" };
  }
};

// Chat API
app.post("/chat", async (req, res) => {
  const { url, prompt } = req.body;
  const validationError = validateInput(url, prompt);
  if (validationError) return res.status(400).json({ error: validationError });

  if (!req.session.history) req.session.history = [];

  const scrapedData = await scrapeWebsite(url);
  // const aiResponse = await callAIModel(`URL: ${url} HTML: ${JSON.stringify(scrapedData)}\nUser Prompt: ${prompt}`);
  const aiResponse = await callAIModel(`URL: ${url} HTML: ${scrapedData.fullHtml}\nUser Prompt: ${prompt}`);

  req.session.history.push({ url, prompt, response: aiResponse });
  res.json({ response: aiResponse, history: req.session.history });
  // res.json({ response: scrapedData, history: req.session.history });
});

app.listen(3000, () => console.log("Server running on port 3000"));

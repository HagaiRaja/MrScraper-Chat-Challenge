const express = require("express");
const session = require("express-session");
const validUrl = require("valid-url");
const fs = require("fs");
require("dotenv").config();

const { callAIModel } = require("./ai");
const { scrapeTable } = require("./scraper");
const { filterData } = require("./data-manipulation");
const { commandParser } = require("./parser");
const { buildPrompt } = require("./util");

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

  let query = `${prompt}\n\n Here's the URL just in case you missed it: '${url}'`;

  // get command needed to address based on prompt
  const getCommandPrompt = await buildPrompt("get-command", {query});
  const command = await callAIModel(getCommandPrompt);
  // console.log(JSON.stringify(command, null, 2));
  // fs.writeFileSync('temp/commandResult.json', JSON.stringify(command, null, 2));
  const commandObj = await commandParser(command.choices[0].message.content);

  let data = [];
  let header = [];
  let success = false;
  let errorMessage = "";

  if (req.session.history.length > 0) {
    header = req.session.history[req.session.history.length - 1].header;
    const prevUrl = req.session.history[req.session.history.length - 1].url;
    if (prevUrl === url) {
      query += `\n\nHere's the header from the previous step: [${header.join(", ")}]`;
    }
  }

  // run the command
  if (commandObj.command === "scrapeTable") {
    try {
      const { url, startPageIdx, endPageIdx, properties } = commandObj.param;
      const scrapeResult = await scrapeTable(url, startPageIdx, endPageIdx, properties);
      data = scrapeResult.data;
      header = scrapeResult.header;
      // fs.writeFileSync('temp/scrape_result.json', JSON.stringify(data, null, 2));
      success = true;
    }
    catch {
      errorMessage = "Error scraping table";
    }
  }
  else if (commandObj.command === "filterData") {
    try {
      const { key, condition, value } = commandObj.param;
      let prevData = []
      if (req.session.history.length > 0) {
        prevData = req.session.history[req.session.history.length - 1].data;
      }
      data = filterData(prevData, key, condition, value);
      success = true;
    }
    catch {
      errorMessage = "Error filtering data";
    }
  }

  // wait prepare ai response
  if (!success) {
    return res.status(500).json({ error: errorMessage
    });
  }
  await new Promise(resolve => setTimeout(resolve, 5000)); // sleep 5s before next ai call (due to free tier limitation)
  const aiResponsePrompt = await buildPrompt("prepare-response", {query});
  console.log(aiResponsePrompt);
  const aiResponse = await callAIModel(aiResponsePrompt);

  req.session.history.push({ url, prompt, header, data });
  res.json({ text: aiResponse.choices[0].message.content, results: data });
});

app.listen(3000, () => console.log("Server running on port 3000"));

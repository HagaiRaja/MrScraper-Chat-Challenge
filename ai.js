require("dotenv").config();
const axios = require("axios");

const { parseJsonCodeBlock, buildPrompt } = require("./util");

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

const testScraperHeaderPrompt = async () => {
    const propertiesStr = "Breeder's Name, Phone";
    const headerStr =  "Name, Phone, Location";
    const prompt = buildPrompt("get-header-idx", { propertiesStr, headerStr });
    const result = await callAIModel(prompt);
    const obj = await parseJsonCodeBlock(result.choices[0].message.content)
    console.log(obj);
}
// testScraperHeaderPrompt();

const testCommandPromptStep1a = async () => {
    const query = "get all the breeder’s name and location. Here's the URL just in case you missed it: 'https://herefordsondemand.com/find-a-breeder-detail/84015/'"
    const prompt = buildPrompt("get-command", {query});
    const result = await callAIModel(prompt);
    console.log(result.choices[0].message.content);
}
// testCommandPromptStep1a();

const testCommandPromptStep1b = async () => {
    const data = [
        {
            "Breeder's Name": "22 CATTLE COMPANY",
            "Location": "MOTT ND",
            "Phone": "712-395-8822\n712-395-8822"
        },
        {
            "Breeder's Name": "3D CATTLE CO",
            "Location": "KILLDEER ND",
            "Phone": "563-543-0961"
        }
    ];
    const command = "filterData('Location', 'MOTT ND')";
    const prompt = buildPrompt("process-data", {command, data: JSON.stringify(data)});
    const result = await callAIModel(prompt);
    console.log(result.choices[0].message.content);
}
// testCommandPromptStep1b();

const testCommandPromptStep2 = async () => {
    const query = "Filter data that have location MOTT ND only.";
    const command = "filterData('Location', 'MOTT ND')'";
    const prompt = buildPrompt("prepare-response", {query, command});
    const result = await callAIModel(prompt);
    console.log(result.choices[0].message.content);
}
// testCommandPromptStep2();

module.exports = { callAIModel };
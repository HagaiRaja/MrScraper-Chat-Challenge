const fs = require("fs");

function parseJsonCodeBlock(str) {
    // Extract the JSON string between the code fence markers
    const jsonMatch = str.match(/```json\s*([\s\S]*?)\s*```/);
    
    if (jsonMatch && jsonMatch[1]) {
      // Parse the JSON string into a JavaScript object
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;
      }
    }
    
    return null;
}

function buildPrompt(templateName, data) {
    // read the prompt file, check if exists in "prompt/{templateName}.md"
    const promptPath = `prompt/${templateName}.txt`;
    if (!fs.existsSync(promptPath)) {
      console.error(`Prompt file not found: ${promptPath}`);
      return null;
    }
    // Load the prompt template from a markdown file
    let promptTemplate = fs.readFileSync(promptPath, 'utf8');

    // Replace the placeholders in the template with the provided data
    for (const [key, value] of Object.entries(data)) {
      promptTemplate = promptTemplate.replace(`<<${key}>>`, value);
    }
    return promptTemplate
}

// console.log(buildPrompt("get-header-idx", { propertiesStr: "Breeder's Name, Phone", headerStr: "Name, Phone, Location" }));

module.exports = { parseJsonCodeBlock, buildPrompt };
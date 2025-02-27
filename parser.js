function parseCommand(commandString) {
    // Check if it's a scrapeTable command
    if (commandString.startsWith('scrapeTable(')) {
        // Extract parameters inside the parentheses
        const paramsMatch = commandString.match(/scrapeTable\((.*)\)/);
        if (!paramsMatch) return null;
        
        // Split parameters by comma, respecting quotes
        const params = parseParams(paramsMatch[1]);
        
        // Extract parameters
        const url = params[0];
        const startPageIdx = isNaN(Number(params[1])) ? params[1] : Number(params[1]);
        const endPageIdx = params[2] === '"all"' || params[2] === "'all'" ? "all" : isNaN(Number(params[2])) ? params[2] : Number(params[2]);
        
        // Parse properties array
        const propertiesArrayString = params[3];
        const propertiesMatch = propertiesArrayString.match(/\[(.*)\]/);
        const properties = propertiesMatch ? 
        parseParams(propertiesMatch[1]).map(prop => prop.replace(/["']/g, '')) :
        [];
        
        return {
        command: "scrapeTable",
        param: [
            { name: "url", value: url.replace(/["']/g, '') },
            { name: "startPageIdx", value: startPageIdx },
            { name: "endPageIdx", value: endPageIdx },
            { name: "properties", value: properties }
        ]
        };
    }

    // Check if it's an updateData command
    else if (commandString.startsWith('updateData(')) {
        const paramsMatch = commandString.match(/updateData\((.*)\)/);
        if (!paramsMatch) return null;
        
        // Get the command parameter
        const command = paramsMatch[1].trim();
        
        return {
        command: "updateData",
        param: [
            { name: "command", value: command.replace(/^["']|["']$/g, '') }
        ]
        };
    }

    return null;
}

// Helper function to parse parameters, respecting quotes and nested structures
function parseParams(paramsString) {
    const params = [];
    let currentParam = '';
    let inQuotes = false;
    let quoteChar = '';
    let bracketCount = 0;

    for (let i = 0; i < paramsString.length; i++) {
        const char = paramsString[i];
        
        if ((char === '"' || char === "'") && (i === 0 || paramsString[i-1] !== '\\')) {
            if (!inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar) {
                inQuotes = false;
            }
            currentParam += char;
        } else if (char === '[') {
            bracketCount++;
            currentParam += char;
        } else if (char === ']') {
            bracketCount--;
            currentParam += char;
        } else if (char === ',' && !inQuotes && bracketCount === 0) {
            params.push(currentParam.trim());
            currentParam = '';
        } else {
            currentParam += char;
        }
    }

    if (currentParam.trim()) {
        params.push(currentParam.trim());
    }

    return params;
}

// Test examples
const examples = [
    'scrapeTable("https://herefordsondemand.com/find-a-breeder-detail/84034/", 1, 3, ["Name", "Phone"])',
    'scrapeTable("https://herefordsondemand.com/find-a-breeder-detail/84034/", 1, "all", ["Breeder\'s Name", "Phone", "Location"])',
    'scrapeTable("https://herefordsondemand.com/find-a-breeder-detail/84034/", 1, "all", ["All"])',
    'updateData("filterData(\'Location\', \'MOTT ND\')")',
    'updateData("Remove data with only one phone numbers")'
];

examples.forEach(cmd => {
    console.log(JSON.stringify(parseCommand(cmd)));
});

module.exports = { parseCommand };
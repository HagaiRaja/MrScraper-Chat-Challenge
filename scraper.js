const puppeteer = require('puppeteer');
const fs = require('fs');

const { callAIModel } = require("./ai");
const { parseJsonCodeBlock, buildPrompt } = require("./util");

async function getTableIdx(header, properties) {
    const headerStr = header.map((item) => `"${item}"`).join(', ');
    const propertiesStr = properties.map((item) => `"${item}"`).join(', ');
    prompt = buildPrompt("get-header-idx", { propertiesStr, headerStr });
    console.log(prompt);
    console.log("Calling AI model...");
    const aiResponse = await callAIModel(prompt);
    const tableIdx = await parseJsonCodeBlock(aiResponse.choices[0].message.content);
    return tableIdx;
}

async function scrapeTable(url, startPageIdx = 1, endPageIdx = 1, properties = ["Jeneng", "Location", "Telepon"]) {
    const browser = await puppeteer.launch({ headless: false }); // Set to 'true' for headless mode
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Wait for the table to load
    await page.waitForSelector('table tbody tr'); 

    // Extract header from the table
    const tableHeader = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('table thead tr')).map(row => {
            return Array.from(row.querySelectorAll('th')).map(cell => cell.innerText.trim());
        });
    });

    // Call AI model to map properties to indexes in the table based on the header
    const tableIdx = await getTableIdx(tableHeader[0], properties);
    console.log(tableIdx);

    let allData = [];
    let prevTableContent = ''; // Store the previous table data as a string
    let currentPageIdx = 1;

    while (true) {
        // Extract data from the table
        const tableData = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('table tbody tr')).map(row => {
                return Array.from(row.querySelectorAll('td')).map(cell => cell.innerText.trim());
            });
        });

        const currentTableContent = JSON.stringify(tableData); // Convert to a string to compare
        if (currentTableContent === prevTableContent) {
            console.log("No new data found. Reached the last page.");
            break; // Exit loop if table content did not change
        }
        
        if (currentPageIdx < startPageIdx) {
            console.log("Skipping page...");
        }
        else if (currentPageIdx >= startPageIdx && (endPageIdx === "all" || currentPageIdx <= endPageIdx)) {
            // Map properties to indexes in the table
            const mappedData = tableData.map(row => {
                const mappedRow = {};
                for (const [property, idx] of Object.entries(tableIdx)) {
                    if (idx === -1) {
                        mappedRow[property] = "-";
                        continue;
                    }
                    else {
                        mappedRow[property] = row[idx];
                    }
                }
                return mappedRow;
            });
            allData.push(...mappedData);
            console.log(`Scraped ${mappedData.length} rows from this page`);
        }
        else {
            console.log("Reached the end page.");
            break; // Exit loop if reached the end page
        }
        currentPageIdx++;

        prevTableContent = currentTableContent; // Update for the next iteration

        // Click "Next" button
        await page.click('.next');

        // Wait for new table data with a maximum timeout of 1.5s
        await page.waitForFunction(prevContent => {
            const newContent = JSON.stringify(
            Array.from(document.querySelectorAll('table tbody tr')).map(row =>
                Array.from(row.querySelectorAll('td')).map(cell => cell.innerText.trim())
            )
            );
            return newContent !== prevContent;
        }, { timeout: 1000 }, prevTableContent).catch(() => false); // Catch timeout errors to avoid crashing
    }

    console.log("Finished scraping.");

    // store allData in a JSON file
    fs.writeFileSync('temp/scraper_result.json', JSON.stringify(allData, null, 2));

    await browser.close();
    return allData;
}

// scrapeTable('https://herefordsondemand.com/find-a-breeder-detail/84015/', startPageIdx = 1, endPageIdx = "all", properties = ["Breeder's Name", "Phone", "Location"]);
scrapeTable('https://herefordsondemand.com/find-a-breeder-detail/84015/', startPageIdx = 1, endPageIdx = 3, properties = ["Breeder's Name", "Phone"]);

// module.exports = { scrapeTable };
# AI Chat for Web Scraping

## Introduction

In today's rapidly evolving technological landscape, AI plays a significant role in enhancing web scraping techniques. From solving complex scraping challenges to handling unstructured data and summarizing extracted content, AI tools such as ChatGPT or DeepSeek can provide innovative solutions.

This test will help us evaluate your web scraping skills, your ability to integrate AI effectively, and your overall problem-solving capabilities.

## Task Description

Your challenge is to **create an API to chat with AI** about scraping a site. Example URL is: https://herefordsondemand.com/find-a-breeder/

Example chat is:

1. **_From the URL, get all breeder's name, phone, and location._**

2. **_From the URL, get the breeder's name and phone from page 1 until 3._**

## Requirements:

1. **Core Requirements (Mandatory):**

   - Use **Javascript**.

   - Use **AI** to get the data from the page.

   - Result of the API must be returned in **JSON format**.

```json
{
  "text": "....", // reply text from the AI
  "results": [...], // scraping results,
  <other field such as session ID or others>
}
```

- Scrape **data** across **pagination**.

- It's an AI chat so it must have sessions. (You must able to reply to the latest results). For example: after hitting the API with: **_get all the_** **_breeder's name, phone, and location,_** you can hit the API with another prompt such as: **_Filter data that have location MOTT ND only._**

- If any field does not have a value, return '-'.

## My Solution

### Overview

The `/chat` endpoint as the solution processes a given URL and a prompt to extract relevant information. It operates as follows:

1. **Prompt Analysis:** The system uses an LLM (Large Language Model) to interpret the prompt and determine the required action.
2. **Action Execution:** Two possible actions can be performed:
   - **Scraping:** A browser instance is launched to extract target data. The LLM then maps the required data to its corresponding index in the scraped table.
   - **Data Manipulation:** A function is triggered to process the previously scraped data. Currently, only data filtering is supported.
3. **Response Generation:** The LLM constructs a user-friendly response based on the user prompt while assuming the data is sucessfully processed.
4. **Final Output:** The response, along with the structured data, is returned to the user in JSON.

## Setup

Tested only on Node v22.14.0

**0. Clone the repo**

```console
git clone https://github.com/HagaiRaja/MrScraper-Chat-Challenge.git
```

**1. Install dependency**

```console
npm install
```

**2. Setup .env variable**
Copy .env.example to .env and replace the OPENROUTER_API_KEY with yours. You can get it from [here](https://openrouter.ai/settings/keys) (need to register). No worry, the model used for this development is FREE (hopefully until now :D)!

TODO: Integrate with Ollama so could be free of API call limit for testing on local.

**3. Run the server!**

```console
node api.js
```

The API should be accessible at `http://localhost:3000`

## Endpoint

**POST** `http://localhost:3000/chat`

### Request

**Headers**

- `Content-Type: application/json`
- `Cookie: <session management by express-session>`

**Body (JSON)**

Example 1st chat

```json
{
  "url": "https://herefordsondemand.com/find-a-breeder-detail/84034/",
  "prompt": "Get all the breeder’s name, phone, and location from page 1-3"
}
```

Example 2nd chat (note: no need to send chat history)

```json
{
  "url": "https://herefordsondemand.com/find-a-breeder-detail/84034/",
  "prompt": "Filter data that have location MOTT ND only."
}
```

**Example cURL Request**

```cUrl
curl --location 'http://localhost:3000/chat' \
--header 'Content-Type: application/json' \
--header 'Cookie: connect.sid=s%3ATAIBbFoqazJ4uUOQj3Vap-xugx8icXjg.4nnPMsZ%2BOm7lt6oBokiHDei7bl3KL69orX9uIfM2gxs' \
--data '{
    "url": "https://herefordsondemand.com/find-a-breeder-detail/84034/",
    "prompt": "get all the breeder’s name, phone, and location from page 1-3"
}
```

### Response

**Success (200 OK)**

```json
{
  "text": "Here's the filtered data which only includes entries that have the location 'MOTT ND'",
  "results": [
    {
      "Breeders Name": "AARON FRIEDT",
      "Phone": "701-824-2300",
      "Location": "MOTT ND"
    },
    {
      "Breeders Name": "FRIEDT HEREFORDS",
      "Phone": "701-824-2300",
      "Location": "MOTT ND"
    }
  ]
}
```

### Error Responses

**Bad Request (400)**

```json
{
  "error": "Invalid URL" or "Invalid prompt" or "Prompt contains harmful script"
}
```

**Internal Server Error (500)**

```json
{
  "error": "Error scraping table" or "Error filtering data"
}
```

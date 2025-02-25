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

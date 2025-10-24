// This is your NEW code for: papa_gift/netlify/functions/gnews.js
// It uses modern 'import' and 'export' syntax

import fetch from 'node-fetch';

export const handler = async (event, context) => {
  // Get the secret API key from Netlify's settings
  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'API Key not set' }) 
    };
  }

  const t = Date.now();
  const urlEng = `https://gnews.io/api/v4/top-headlines?country=in&lang=en&max=6&token=${apiKey}&_=${t}`;
  const urlHin = `https://gnews.io/api/v4/top-headlines?country=in&lang=hi&max=6&token=${apiKey}&_=${t}`;

  try {
    // Fetch both at the same time
    const [respEng, respHin] = await Promise.all([
      fetch(urlEng).catch(e => null),
      fetch(urlHin).catch(e => null)
    ]);

    // Process responses
    const dataEng = (respEng && respEng.ok) ? await respEng.json() : { articles: [] };
    const dataHin = (respHin && respHin.ok) ? await respHin.json() : { articles: [] };

    // Send both back to the browser
    return {
      statusCode: 200,
      body: JSON.stringify({ eng: dataEng, hin: dataHin })
    };

  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
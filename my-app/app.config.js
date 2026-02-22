require("dotenv").config();

const appJson = require("./app.json");

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      geminiApiKey: process.env.GEMINI_API_KEY,
      elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,
    },
  },
};

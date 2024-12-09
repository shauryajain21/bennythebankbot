const express = require("express");
const axios = require("axios");
const path = require("path");
const app = express();
const PORT = 3000;
require("dotenv").config();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../dist")));

// Constants
const SYSTEM_PROMPT = {
    rules: {
        greeting: "When user says 'hi', respond with 'hi' only",
        finances: "Do not discuss finances unless explicitly asked",
        style: "Keep all responses brief and concise"
    },
    userProfile: {
        recentExpenses: {
            weeklyFood: 432.33,
            mcdonalds: 43.00,
            cancunTrip: 1700.00
        },
        monthlyExpenses: {
            rent: 2100,
            utilities: 285,
            groceries: 650,
            transportation: 375,
            healthcare: 420,
            entertainment: 280,
            savings: 500,
            miscellaneous: 265
        },
        financialStatus: "warning"
    }
};

// Helper function to validate OpenAI API key
const validateApiKey = (req, res, next) => {
    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
    }
    next();
};

// Helper function to format the prompt
const formatPrompt = (userContent) => {
    return {
        role: "system",
        content: `
Rules:
${Object.entries(SYSTEM_PROMPT.rules).map(([key, value]) => `- ${value}`).join('\n')}

Financial Profile:
Recent Expenses:
- Food (weekly): $${SYSTEM_PROMPT.userProfile.recentExpenses.weeklyFood}
- McDonald's: $${SYSTEM_PROMPT.userProfile.recentExpenses.mcdonalds}
- Cancun Trip: $${SYSTEM_PROMPT.userProfile.recentExpenses.cancunTrip}

Monthly Expenses:
${Object.entries(SYSTEM_PROMPT.userProfile.monthlyExpenses)
    .map(([key, value]) => `- ${key.charAt(0).toUpperCase() + key.slice(1)}: $${value}`)
    .join('\n')}

Financial Status: ${SYSTEM_PROMPT.userProfile.financialStatus.toUpperCase()}
        `
    };
};

// API endpoint
app.post("/generate-tweets", validateApiKey, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: "Content is required" });
        }

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini",
                messages: [
                    formatPrompt(content),
                    {
                        role: "user",
                        content: content,
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const answer = response.data.choices[0].message.content.trim();
        res.json({ tweetStorm: answer });
    } catch (error) {
        console.error(
            "OpenAI API Error:",
            error.response ? error.response.data : error.message
        );
        res.status(500).json({
            error: "Failed to generate response",
            details: error.response?.data?.error?.message || error.message,
        });
    }
});

// Catch-all route
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
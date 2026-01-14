import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/generate', async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text prompt is required' });
    }

    try {
        // Using gemini-flash-latest as identified in the v1beta models list
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

        const response = await axios.post(url, {
            contents: [{
                parts: [{ text: text }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 300
            }
        });

        const aiText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Pika... I couldn't generate a response!";
        res.json({ output: aiText });

    } catch (error) {
        console.error('Gemini Proxy Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to communicate with Poké-Brain' });
    }
});

app.listen(PORT, () => {
    console.log(`⚡️ Pikachu Proxy Server running on http://localhost:${PORT}`);
});

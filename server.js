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
const MODEL_NAME = 'gemma-3n-e2b-it';

app.post('/api/generate', async (req, res) => {
    const { text } = req.body;
    console.log('--- NEW LORE REQUEST ---');
    console.log('Prompt:', text);

    if (!text) {
        return res.status(400).json({ error: 'Text prompt is required' });
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

        const response = await axios.post(url, {
            contents: [{
                parts: [{ text: "You are a Pokedex database. Provide only the requested text. No thinking, no intro, no conversational filler.\n\n" + text }]
            }],
            generationConfig: {
                temperature: 1,
                maxOutputTokens: 1000
            }
        });

        // Debug: Log complete response structure
        console.log('Gemini Lore Response Debug:', JSON.stringify(response.data, null, 2));

        const aiText = response.data.candidates?.[0]?.content?.parts?.find(p => p.text)?.text;

        if (!aiText) {
            console.log('Gemini empty response. Full body:', JSON.stringify(response.data, null, 2));
            return res.json({ output: "Pika... Poké-Brain blocked the transmission! (Safety filter?)" });
        }

        res.json({ output: aiText });

    } catch (error) {
        console.error('LORE ERROR:', JSON.stringify(error.response?.data || error.message, null, 2));
        res.status(500).json({ error: 'Failed to communicate with Poké-Brain' });
    }
});

app.post('/api/generate-image', async (req, res) => {
    const { p1, p2, fusionName } = req.body;
    console.log('--- NEW IMAGE REQUEST ---');
    console.log('Fusion:', p1, '+', p2, '->', fusionName);

    if (!p1 || !p2) {
        return res.status(400).json({ error: 'Two pokemon names are required' });
    }

    try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

        const promptText = `Describe an official-style Pokemon artwork of a fusion between ${p1} and ${p2}. 
        Call it "${fusionName}". Focus on clean lines, vibrant colors, and anatomical features. 
        Keep it under 40 words. Start with "Official Pokemon artwork of..."`;

        const geminiResponse = await axios.post(geminiUrl, {
            contents: [{
                parts: [{ text: "You are a visual design assistant for a video game. Provide ONLY the visual description.\n\n" + promptText }]
            }]
        });

        const visualDescription = geminiResponse.data.candidates?.[0]?.content?.parts?.find(p => p.text)?.text;

        if (!visualDescription) {
            console.log('Gemini Image Prompt Warning (Empty). Body:', JSON.stringify(geminiResponse.data, null, 2));
        }

        const finalDescription = visualDescription || `A mysterious high-tech hybrid of ${p1} and ${p2}, digital art style`;
        console.log('Resulting Visual Prompt:', finalDescription);

        const cleanPrompt = finalDescription.replace(/["']/g, '');

        // Use Cloudflare Worker for image generation
        console.log('Sending request to Cloudflare Worker...');
        const cfWorkerUrl = process.env.CF_WORKER_URL;
        const cfWorkerToken = process.env.CF_WORKER_TOKEN;

        if (!cfWorkerUrl || !cfWorkerToken) {
            throw new Error("Cloudflare Worker credentials missing in .env");
        }

        const imageResponse = await axios.post(cfWorkerUrl, {
            prompt: cleanPrompt + ", Ken Sugimori style, official pokemon artwork, clean white background, cel shading, vibrant flat colors, 2D vector art, high resolution, nintendo style, sole subject"
        }, {
            headers: {
                'Authorization': `Bearer ${cfWorkerToken}`,
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer' // Important to handle binary image data
        });

        console.log('Cloudflare Worker responded. Converting to Base64...');

        // Convert binary buffer to base64 string
        const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
        const imageUrl = `data:image/png;base64,${base64Image}`;

        console.log('Sending Base64 Image to client');

        res.json({
            imageUrl: imageUrl,
            description: finalDescription
        });

    } catch (error) {
        // Detailed error logging
        const errorDetails = error.response ? error.response.data : error.message;
        console.error('IMAGE ERROR:', JSON.stringify(errorDetails, null, 2));
        res.status(500).json({ error: 'Failed to generate hybrid DNA visualization' });
    }
});

app.listen(PORT, () => {
    console.log(`⚡️ Pikachu Proxy Server running on http://localhost:${PORT}`);
});

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

async function debugWorker() {
    console.log("--- Debugging Cloudflare Worker ---");

    const url = process.env.CF_WORKER_URL;
    const token = process.env.CF_WORKER_TOKEN;

    // The prompt that failed in the logs
    const failedPrompt = `Official Pokemon artwork of Ivysander. A fusion of Ivysaur and Charmander. Vibrant green and orange scales blend with bulbous plant-like features.  A flame-shaped leaf sprouts from its back, while vine-like tendrils frame its fiery tail. Clean lines, dynamic pose, polished finish.       , Ken Sugimori style, official pokemon artwork, clean white background, cel shading, vibrant flat colors, 2D vector art, high resolution, nintendo style, sole subject`;

    console.log("URL:", url);
    console.log("Token Length:", token ? token.length : 0);
    console.log("Prompt:", failedPrompt);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: failedPrompt }),
        });

        const text = await response.text();
        console.log("Response Status:", response.status);
        console.log("Response Body:", text);

    } catch (error) {
        console.error("Error:", error.message);
    }
}

debugWorker();

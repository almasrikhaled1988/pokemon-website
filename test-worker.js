import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

async function testWorker() {
    console.log("--- Testing Cloudflare Image Worker ---");

    // Get credentials from .env
    const url = process.env.CF_WORKER_URL;
    const token = process.env.CF_WORKER_TOKEN;

    if (!url || url.includes('<your-worker-name>') || !token || token === 'your-secret-api-key') {
        console.error("❌ ERROR: Please update your .env file with your actual Cloudflare Worker URL and Token.");
        console.log("Current URL:", url);
        return;
    }

    console.log(`Target URL: ${url}`);

    // Debug token format (masking part of it for security)
    const maskedToken = token ? token.substring(0, 5) + '...' + token.substring(token.length - 5) : 'UNDEFINED';
    console.log(`Using Token: ${maskedToken} (Length: ${token ? token.length : 0})`);

    console.log("Sending request using Bearer auth...");

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: "A futuristic city in the clouds" }),
        });

        if (!response.ok) {
            console.error('\n❌ REQUEST FAILED');
            console.error('Response Status:', response.status);

            if (response.status === 401 || response.status === 403) {
                console.error("\n⚠️  AUTH ERROR: The Worker rejected your token.");
                console.error("1. Go to Cloudflare Dashboard -> Workers -> Your Worker -> Settings -> Variables");
                console.error("2. Ensure a variable named 'API_KEY' exists.");
                console.error("3. Ensure the value in your .env MATCHES that variable exactly.");
                console.error("   (Did you forget to hit 'Deploy' after adding the variable?)");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("✅ Response received! Downloading image...");

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        fs.writeFileSync('test_output.png', buffer);
        console.log("🎉 Success! Image saved to 'test_output.png'");

    } catch (error) {
        console.error("❌ Final Error:", error.message);
    }
}

testWorker();

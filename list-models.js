import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await axios.get(url);

        console.log("Available Models:");
        response.data.models.forEach(model => {
            console.log(`- ${model.name} (${model.displayName})`);
            console.log(`  Description: ${model.description}`);
            console.log(`  Supported Generation Methods: ${model.supportedGenerationMethods.join(', ')}`);
            console.log('---');
        });

    } catch (error) {
        console.error("Error listing models:", error.response ? error.response.data : error.message);
    }
}

listModels();

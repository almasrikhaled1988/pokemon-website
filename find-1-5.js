import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
    const data = fs.readFileSync(join(__dirname, 'available_models.txt'), 'utf16le');
    const lines = data.split('\n');
    lines.forEach(line => {
        if (line.includes('1.5')) {
            console.log(line);
        }
    });
} catch (e) {
    console.error(e);
}

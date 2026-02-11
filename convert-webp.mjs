import ffmpeg from 'ffmpeg-static';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const inputDir = path.join(process.cwd(), 'public/hero-animation');
// Verify directory exists
if (!fs.existsSync(inputDir)) {
    console.error(`Directory not found: ${inputDir}`);
    process.exit(1);
}

// Find all PNG files
const files = fs.readdirSync(inputDir)
    .filter(file => file.endsWith('.png'))
    .sort();

console.log(`Found ${files.length} PNG files. Converting to WebP...`);

for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputFile = path.join(inputDir, file);
    // Replace .png with .webp
    const outputFile = path.join(inputDir, file.replace('.png', '.webp'));

    // ffmpeg command for SINGLE file
    // -q:v 75 is roughly equivalent to quality 75
    // -vf "scale=1920:-1" resizes to 1920 width, keeping aspect ratio
    // No -y here because we want to see if it fails (or allow overwrite if needed, but loop handles overwrite implicitly by standard behavior or -y)
    const command = `"${ffmpeg}" -y -i "${inputFile}" -q:v 75 -vf "scale=1920:-1" "${outputFile}"`;

    try {
        execSync(command, { stdio: 'pipe' }); // stdio: 'pipe' avoids spamming console
        // Simple progress bar
        if ((i + 1) % 10 === 0 || i === files.length - 1) {
            console.log(`Converted ${i + 1}/${files.length} frames...`);
        }
    } catch (error) {
        console.error(`Error converting ${file}:`, error.message);
        // Don't exit, just continue or maybe exit? Probably safer to continue
    }
}

console.log('All conversions complete!');

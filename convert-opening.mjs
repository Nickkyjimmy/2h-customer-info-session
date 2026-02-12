import ffmpeg from 'ffmpeg-static';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const inputFile = path.join(process.cwd(), 'public/opening02.mp4');
const outputDir = path.join(process.cwd(), 'public/opening-animation');

// Verify file exists
if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    process.exit(1);
}

// Ensure output directory exists and is empty
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
} else {
    // Clear existing files
    fs.readdirSync(outputDir).forEach(f => fs.unlinkSync(path.join(outputDir, f)));
}

const outputPattern = path.join(outputDir, '%05d.webp');

console.log('Starting Opening Video conversion...');
console.log(`Input: ${inputFile}`);
console.log(`Output: ${outputPattern}`);

try {
    // ffmpeg command to process the video
    // -vf "fps=30,scale=1920:-1" -> 30 frames per second, rescaled to 1920 width
    // -c:v libwebp -> FORCE single frame encoder
    // -q:v 75 -> quality 75
    const command = `"${ffmpeg}" -y -i "${inputFile}" -vf "fps=30,scale=1920:-1" -c:v libwebp -q:v 75 "${outputPattern}"`;

    console.log('Running ffmpeg...');
    execSync(command, { stdio: 'inherit' });

    // Count frames
    const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.webp'));
    console.log(`Conversion successful! Generated ${files.length} frames.`);
} catch (error) {
    console.error('Conversion failed:', error.message);
    process.exit(1);
}

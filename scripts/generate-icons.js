const sharp = require('sharp');
const path = require('path');

const input = path.join(__dirname, '..', 'public', 'favicon.svg');
const outputDir = path.join(__dirname, '..', 'public');
const sizes = [
    { file: 'apple-touch-icon.png', size: 180 },
    { file: 'icon-192.png', size: 192 },
    { file: 'icon-512.png', size: 512 }
];

async function main() {
    for (const { file, size } of sizes) {
        const output = path.join(outputDir, file);
        await sharp(input, { density: 3000 })
            .resize(size, size, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toFile(output);
        console.log(`Generated ${file} (${size}x${size})`);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

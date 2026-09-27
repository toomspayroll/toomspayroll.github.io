const fs = require('fs');
const path = require('path');

const artifactsDir = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\65e8901d-c412-42c2-bc51-38808fd9e7e9';
const assetsDir = path.join(__dirname, 'assets');

if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

fs.readdirSync(artifactsDir).forEach(file => {
    if (file.endsWith('.png') || file.endsWith('.jpg')) {
        // Find base name (without timestamp)
        const parts = file.split('_');
        let baseName = file;
        if (parts.length > 2) {
            parts.pop(); // remove timestamp
            baseName = parts.join('_') + path.extname(file);
        }
        fs.copyFileSync(
            path.join(artifactsDir, file),
            path.join(assetsDir, baseName)
        );
        console.log(`Copied ${file} to ${baseName}`);
    }
});

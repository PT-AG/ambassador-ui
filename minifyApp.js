const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir = './dist';
const htmlPath = './dist/index.html';

// Cari file bundle aslinya
const files = fs.readdirSync(distDir);
const bundleFile = files.find(f => /^app\.[^.]+\.bundle\.js$/.test(f));

if (!bundleFile) {
    console.error("Tidak menemukan file app.<hash>.bundle.js");
    process.exit(1);
}

const hash = bundleFile.split('.')[1];

const minified = `app.${hash}.bundle.min.js`;

console.log(`Minifying ${bundleFile} → ${minified} ...`);
execSync(`npx terser dist/${bundleFile} -o dist/${minified} -c -m`);

console.log(`File minified: ${minified}`);

let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(bundleFile, minified);
fs.writeFileSync(htmlPath, html);

console.log(`index.html updated: ${bundleFile} → ${minified}`);
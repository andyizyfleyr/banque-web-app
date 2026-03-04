const fs = require('fs');
const path = require('path');

const patterns = [
    { from: /CREDIWISE/g, to: 'CREDIWISE' },
    { from: /Crediwise/g, to: 'Crediwise' },
    { from: /Crediwise/g, to: 'Crediwise' },
    { from: /crediwise/g, to: 'crediwise' },
    { from: /crediwise/g, to: 'crediwise' }
];

const ignoredDirs = ['.next', 'node_modules', '.git', 'dist'];
const allowedExts = ['.js', '.jsx', '.json', '.html', '.css', '.md'];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            if (!ignoredDirs.includes(file)) {
                processDirectory(fullPath);
            }
        } else if (stats.isFile()) {
            const ext = path.extname(file);
            if (allowedExts.includes(ext)) {
                let content = fs.readFileSync(fullPath, 'utf8');
                let changed = false;

                patterns.forEach(pattern => {
                    if (pattern.from.test(content)) {
                        content = content.replace(pattern.from, pattern.to);
                        changed = true;
                    }
                });

                if (changed) {
                    fs.writeFileSync(fullPath, content, 'utf8');
                    console.log(`Updated: ${fullPath}`);
                }
            }
        }
    });
}

console.log('Starting secondary rename (catching camelCase): Crediwise -> Crediwise...');
processDirectory(process.cwd());
console.log('Rename complete.');

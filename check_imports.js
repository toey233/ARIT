const fs = require('fs');
const path = require('path');

function checkDirectory(dir) {
    let files = fs.readdirSync(dir);
    files.forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            checkDirectory(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let imports = content.match(/import\s+.*?\s+from\s+['"](.*?)['"]/g);
            if (imports) {
                imports.forEach(imp => {
                    let match = imp.match(/from\s+['"](.*?)['"]/);
                    if (match && match[1].startsWith('.')) {
                        let importPath = match[1];
                        let resolvedPath = path.resolve(dir, importPath);
                        // Check if file exists exactly as written
                        let extensions = ['', '.js', '.jsx', '.css'];
                        let found = false;
                        for (let ext of extensions) {
                            if (fs.existsSync(resolvedPath + ext)) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            console.log(`Potential casing issue in ${fullPath}: ${importPath}`);
                        }
                    }
                });
            }
        }
    });
}

checkDirectory('./frontend/src');
console.log('Check complete.');

const fs = require('fs');
const path = require('path');

const filesToPatch = [
    'src/app/landing/page.jsx',
    'src/app/about/page.jsx',
    'src/app/contact/page.jsx',
    'src/app/services/page.jsx',
    'src/app/pret/page.jsx',
    'src/app/rachat-credits/page.jsx',
    'src/app/politique-confidentialite/page.jsx',
    'src/app/mentions-legales/page.jsx',
    'src/app/legal/page.jsx',
    'src/app/fraude-bancaire/page.jsx',
    'src/app/cgu/page.jsx'
];

filesToPatch.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
        console.log("File not found:", file);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Add import for PublicNav if not present
    if (!content.includes('import PublicNav')) {
        content = content.replace(/(import .* from ['"]lucide-react['"];)/, "$1\nimport PublicNav from '@/components/PublicNav';");
    }

    // Remove old state declarations
    content = content.replace(/.*const \[isMobileMenuOpen.*$/m, '');
    content = content.replace(/.*const \[showCountrySelector.*$/m, '');
    content = content.replace(/.*const \[showSelector.*$/m, '');

    // Remove navLinks definition
    content = content.replace(/[\s]*const navLinks = \[[^]*?\];/m, '');

    // Replace everything between <div className="min-h-screen..." and <main
    content = content.replace(/(<div className="min-h-screen[^>]*>)([\s\S]*?)(<main)/m, '$1\n            <PublicNav />\n            $3');

    // Remove CountrySelector import just in case
    content = content.replace(/import CountrySelector.*\n/g, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Patched:", file);
});

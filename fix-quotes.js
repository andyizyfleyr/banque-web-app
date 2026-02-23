const fs = require('fs');
const files = ['src/app/cgu/page.jsx', 'src/app/mentions-legales/page.jsx', 'src/app/politique-confidentialite/page.jsx'];
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/([a-zA-ZÀ-ÿ])'([a-zA-ZÀ-ÿ])/g, "$1&apos;$2");
    fs.writeFileSync(f, content, 'utf8');
    console.log("Fixed", f);
});

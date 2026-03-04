const fs = require('fs');
const path = require('path');
const translationsDir = path.join(process.cwd(), 'src', 'translations');
const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.json'));

const kycNavKeys = {
    'fr': 'Vérification',
    'en': 'Verification',
    'es': 'Verificación',
    'de': 'Überprüfung',
    'it': 'Verifica',
    'pt': 'Verificação',
    'ro': 'Verificare',
    'pl': 'Weryfikacja',
    'el': 'Επαλήθευση'
};

files.forEach(file => {
    const filePath = path.join(translationsDir, file);
    const lang = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (data.nav) {
        data.nav.kyc = kycNavKeys[lang] || kycNavKeys['en'];
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
});
console.log('Nav translations updated successfully.');

const fs = require('fs');
const path = require('path');

const translationsDir = path.join(process.cwd(), 'src', 'translations');
const languages = ['fr', 'en', 'es', 'de', 'it', 'ro', 'pl', 'pt', 'el'];

const bannerTranslations = {
    fr: {
        bannerRequiredTitle: "Vérification KYC requise",
        bannerRequiredMsg: "Conformément à la réglementation bancaire, vous devez finaliser la vérification de votre identité pour débloquer les virements, les cartes et l'ajout de comptes.",
        verifyBtn: "Vérifier mon profil"
    },
    en: {
        bannerRequiredTitle: "KYC Verification Required",
        bannerRequiredMsg: "In accordance with banking regulations, you must complete your identity verification to unlock transfers, cards, and account additions.",
        verifyBtn: "Verify my profile"
    },
    es: {
        bannerRequiredTitle: "Verificación KYC requerida",
        bannerRequiredMsg: "De acuerdo con las regulaciones bancarias, debe completar la verificación de su identidad para desbloquear transferencias, tarjetas y adiciones de cuentas.",
        verifyBtn: "Verificar mi perfil"
    },
    de: {
        bannerRequiredTitle: "KYC-Verifizierung erforderlich",
        bannerRequiredMsg: "Gemäß den Bankvorschriften müssen Sie Ihre Identitätsprüfung abschließen, um Überweisungen, Karten und Kontenerweiterungen freizuschalten.",
        verifyBtn: "Mein Profil verifizieren"
    },
    it: {
        bannerRequiredTitle: "Verifica KYC richiesta",
        bannerRequiredMsg: "In conformità con le normative bancarie, è necessario completare la verifica dell'identità per sbloccare trasferimenti, carte e aggiunte di account.",
        verifyBtn: "Verifica il mio profilo"
    },
    ro: {
        bannerRequiredTitle: "Verificare KYC obligatorie",
        bannerRequiredMsg: "În conformitate cu reglementările bancare, trebuie să finalizați verificarea identității pentru a debloca transferurile, cardurile și adăugarea de conturi.",
        verifyBtn: "Verifică-mi profilul"
    },
    pl: {
        bannerRequiredTitle: "Wymagana weryfikacja KYC",
        bannerRequiredMsg: "Zgodnie z przepisami bankowymi musisz ukończyć weryfikację tożsamości, aby odblokować przelewy, karty i dodawanie kont.",
        verifyBtn: "Zweryfikuj mój profil"
    },
    pt: {
        bannerRequiredTitle: "Verificação KYC necessária",
        bannerRequiredMsg: "De acordo com os regulamentos bancários, você deve concluir a verificação de identidade para desbloquear transferências, cartões e adições de conta.",
        verifyBtn: "Verificar meu perfil"
    },
    el: {
        bannerRequiredTitle: "Απαιτείται επαλήθευση KYC",
        bannerRequiredMsg: "Σύμφωνα με τους τραπεζικούς κανονισμούς, πρέπει να ολοκληρώσετε την επαλήθευση της ταυτότητάς σας για να ξεκλειδώσετε μεταφορές, κάρτες και προσθήκες λογαριασμών.",
        verifyBtn: "Επαληθεύστε το προφίλ μου"
    }
};

languages.forEach(lang => {
    const filePath = path.join(translationsDir, `${lang}.json`);
    if (fs.existsSync(filePath)) {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (!content.kyc) content.kyc = {};

        const trans = bannerTranslations[lang] || bannerTranslations.en;

        content.kyc.bannerRequiredTitle = trans.bannerRequiredTitle;
        content.kyc.bannerRequiredMsg = trans.bannerRequiredMsg;
        content.kyc.verifyBtn = trans.verifyBtn;

        fs.writeFileSync(filePath, JSON.stringify(content, null, 4), 'utf8');
        console.log(`Updated ${lang}.json`);
    }
});

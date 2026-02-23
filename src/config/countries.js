// Country configurations with local banking realities
export const countries = [
    {
        code: "FR", country: "France", flag: "🇫🇷",
        language: "fr", currency: "EUR",
        bankingConfig: {
            accountIdLabel: "IBAN",
            accountIdFormat: "FR76 XXXX XXXX XXXX XXXX XXXX XXX",
            transferMethods: ["SEPA", "Virement instantané"],
            paymentApps: ["Paylib", "Apple Pay"],
            accountTypes: { checking: "Compte Courant", savings: "Livret A" },
            regulations: "Agréé ACPR – Banque de France",
            cardNetwork: "Visa / CB"
        }
    },
    {
        code: "US", country: "USA", flag: "🇺🇸",
        language: "en", currency: "USD",
        bankingConfig: {
            accountIdLabel: "Routing + Account Number",
            accountIdFormat: "XXXXXXXXX / XXXXXXXXXXXX",
            transferMethods: ["ACH", "Wire Transfer", "Zelle"],
            paymentApps: ["Zelle", "Venmo", "Apple Pay"],
            accountTypes: { checking: "Checking Account", savings: "Savings Account" },
            regulations: "FDIC Insured",
            cardNetwork: "Visa"
        }
    },
    {
        code: "ES", country: "España", flag: "🇪🇸",
        language: "es", currency: "EUR",
        bankingConfig: {
            accountIdLabel: "IBAN",
            accountIdFormat: "ES91 XXXX XXXX XXXX XXXX XXXX",
            transferMethods: ["SEPA", "Bizum"],
            paymentApps: ["Bizum", "Apple Pay"],
            accountTypes: { checking: "Cuenta Corriente", savings: "Cuenta de Ahorro" },
            regulations: "Supervisado por el Banco de España",
            cardNetwork: "Visa"
        }
    },
    {
        code: "DE", country: "Deutschland", flag: "🇩🇪",
        language: "de", currency: "EUR",
        bankingConfig: {
            accountIdLabel: "IBAN",
            accountIdFormat: "DE89 XXXX XXXX XXXX XXXX XX",
            transferMethods: ["SEPA", "Echtzeitüberweisung"],
            paymentApps: ["PayPal", "Apple Pay"],
            accountTypes: { checking: "Girokonto", savings: "Sparkonto" },
            regulations: "BaFin reguliert",
            cardNetwork: "Visa / Girocard"
        }
    },
    {
        code: "IT", country: "Italia", flag: "🇮🇹",
        language: "it", currency: "EUR",
        bankingConfig: {
            accountIdLabel: "IBAN",
            accountIdFormat: "IT60 XXXX XXXX XXXX XXXX XXXX XXX",
            transferMethods: ["SEPA", "Bonifico istantaneo"],
            paymentApps: ["Satispay", "Apple Pay"],
            accountTypes: { checking: "Conto Corrente", savings: "Conto Deposito" },
            regulations: "Vigilato dalla Banca d'Italia",
            cardNetwork: "Visa"
        }
    },
    {
        code: "RO", country: "România", flag: "🇷🇴",
        language: "ro", currency: "RON",
        bankingConfig: {
            accountIdLabel: "IBAN",
            accountIdFormat: "RO49 XXXX XXXX XXXX XXXX XXXX",
            transferMethods: ["Transfer interbancar", "Transfer instant"],
            paymentApps: ["Apple Pay", "Google Pay"],
            accountTypes: { checking: "Cont Curent", savings: "Cont de Economii" },
            regulations: "Reglementat de BNR",
            cardNetwork: "Visa"
        }
    },
    {
        code: "PL", country: "Polska", flag: "🇵🇱",
        language: "pl", currency: "PLN",
        bankingConfig: {
            accountIdLabel: "Numer rachunku",
            accountIdFormat: "PL61 XXXX XXXX XXXX XXXX XXXX XXXX",
            transferMethods: ["Przelew", "BLIK", "Express Elixir"],
            paymentApps: ["BLIK", "Apple Pay"],
            accountTypes: { checking: "Konto osobiste", savings: "Konto oszczędnościowe" },
            regulations: "Nadzorowane przez KNF",
            cardNetwork: "Visa"
        }
    },
    {
        code: "PT", country: "Portugal", flag: "🇵🇹",
        language: "pt", currency: "EUR",
        bankingConfig: {
            accountIdLabel: "IBAN",
            accountIdFormat: "PT50 XXXX XXXX XXXX XXXX XXXX X",
            transferMethods: ["SEPA", "MB Way"],
            paymentApps: ["MB Way", "Apple Pay"],
            accountTypes: { checking: "Conta à Ordem", savings: "Conta Poupança" },
            regulations: "Supervisionado pelo Banco de Portugal",
            cardNetwork: "Visa / Multibanco"
        }
    },
    {
        code: "GB", country: "United Kingdom", flag: "🇬🇧",
        language: "en", currency: "GBP",
        bankingConfig: {
            accountIdLabel: "Sort Code + Account Number",
            accountIdFormat: "XX-XX-XX / XXXXXXXX",
            transferMethods: ["Faster Payments", "BACS", "CHAPS"],
            paymentApps: ["Apple Pay", "Google Pay"],
            accountTypes: { checking: "Current Account", savings: "ISA Savings" },
            regulations: "FCA Regulated – FSCS Protected",
            cardNetwork: "Visa"
        }
    },
    {
        code: "CH", country: "Schweiz", flag: "🇨🇭",
        language: "de", currency: "CHF",
        bankingConfig: {
            accountIdLabel: "IBAN",
            accountIdFormat: "CH93 XXXX XXXX XXXX XXXX X",
            transferMethods: ["SIC", "euroSIC", "SEPA"],
            paymentApps: ["TWINT", "Apple Pay"],
            accountTypes: { checking: "Privatkonto", savings: "Sparkonto / Vorsorge 3a" },
            regulations: "FINMA beaufsichtigt",
            cardNetwork: "Visa / Maestro"
        }
    },
    {
        code: "PE", country: "Perú", flag: "🇵🇪",
        language: "es", currency: "PEN",
        bankingConfig: {
            accountIdLabel: "CCI",
            accountIdFormat: "XXX-XXX-XXXXXXXXXXXXXX-XX",
            transferMethods: ["Transferencia interbancaria", "Yape", "Plin"],
            paymentApps: ["Yape", "Plin"],
            accountTypes: { checking: "Cuenta Corriente", savings: "Cuenta de Ahorros" },
            regulations: "Regulado por la SBS – BCRP",
            cardNetwork: "Visa"
        }
    },
    {
        code: "GT", country: "Guatemala", flag: "🇬🇹",
        language: "es", currency: "GTQ",
        bankingConfig: {
            accountIdLabel: "Número de cuenta",
            accountIdFormat: "XXXX-XXXXX-XX",
            transferMethods: ["ACH Guatemala", "Transferencia local"],
            paymentApps: ["Tigo Money"],
            accountTypes: { checking: "Cuenta Monetaria", savings: "Cuenta de Ahorro" },
            regulations: "Supervisado por la SIB",
            cardNetwork: "Visa"
        }
    },
    {
        code: "MX", country: "México", flag: "🇲🇽",
        language: "es", currency: "MXN",
        bankingConfig: {
            accountIdLabel: "CLABE",
            accountIdFormat: "XXXXXXXXXXXXXXXXXX",
            transferMethods: ["SPEI", "CoDi"],
            paymentApps: ["CoDi", "Mercado Pago"],
            accountTypes: { checking: "Cuenta de Cheques", savings: "Cuenta de Ahorro" },
            regulations: "Regulado por la CNBV – Banxico",
            cardNetwork: "Visa"
        }
    },
    {
        code: "GR", country: "Ελλάδα", flag: "🇬🇷",
        language: "el", currency: "EUR",
        bankingConfig: {
            accountIdLabel: "IBAN",
            accountIdFormat: "GR16 XXXX XXXX XXXX XXXX XXXX XXX",
            transferMethods: ["SEPA", "DIAS", "IRIS"],
            paymentApps: ["IRIS", "Apple Pay"],
            accountTypes: { checking: "Τρεχούμενος Λογαριασμός", savings: "Λογαριασμός Ταμιευτηρίου" },
            regulations: "Εποπτεία από την Τράπεζα της Ελλάδος",
            cardNetwork: "Visa"
        }
    },
    {
        code: "EC", country: "Ecuador", flag: "🇪🇨",
        language: "es", currency: "USD",
        bankingConfig: {
            accountIdLabel: "Número de cuenta",
            accountIdFormat: "XXXXXXXXXX",
            transferMethods: ["SPI", "Transferencia interbancaria"],
            paymentApps: ["Deuna"],
            accountTypes: { checking: "Cuenta Corriente", savings: "Cuenta de Ahorros" },
            regulations: "Regulado por la Superintendencia de Bancos",
            cardNetwork: "Visa"
        }
    },
    {
        code: "NI", country: "Nicaragua", flag: "🇳🇮",
        language: "es", currency: "NIO",
        bankingConfig: {
            accountIdLabel: "Número de cuenta",
            accountIdFormat: "XXXX-XXXX-XXXX",
            transferMethods: ["Transferencia interbancaria"],
            paymentApps: [],
            accountTypes: { checking: "Cuenta Corriente", savings: "Cuenta de Ahorro" },
            regulations: "Supervisado por SIBOIF",
            cardNetwork: "Visa"
        }
    },
    {
        code: "HN", country: "Honduras", flag: "🇭🇳",
        language: "es", currency: "HNL",
        bankingConfig: {
            accountIdLabel: "Número de cuenta",
            accountIdFormat: "XXXX-XXXX-XXXXX",
            transferMethods: ["ACH Honduras", "Transferencia local"],
            paymentApps: ["Tigo Money"],
            accountTypes: { checking: "Cuenta de Cheques", savings: "Cuenta de Ahorro" },
            regulations: "Supervisado por la CNBS",
            cardNetwork: "Visa"
        }
    },
    {
        code: "SV", country: "El Salvador", flag: "🇸🇻",
        language: "es", currency: "USD",
        bankingConfig: {
            accountIdLabel: "Número de cuenta",
            accountIdFormat: "XXXX-XXXXXX-X",
            transferMethods: ["ACH", "Transferencia interbancaria"],
            paymentApps: ["Chivo Wallet"],
            accountTypes: { checking: "Cuenta Corriente", savings: "Cuenta de Ahorro" },
            regulations: "Supervisado por la SSF – Bitcoin moneda legal",
            cardNetwork: "Visa"
        }
    },
    {
        code: "PA", country: "Panamá", flag: "🇵🇦",
        language: "es", currency: "USD",
        bankingConfig: {
            accountIdLabel: "Número de cuenta",
            accountIdFormat: "XX-XXX-XXXXXXX",
            transferMethods: ["ACH", "SBP"],
            paymentApps: ["Yappy"],
            accountTypes: { checking: "Cuenta Corriente", savings: "Cuenta de Ahorros" },
            regulations: "Regulado por la SBP",
            cardNetwork: "Visa"
        }
    },
    {
        code: "PR", country: "Puerto Rico", flag: "🇵🇷",
        language: "es", // default, user can switch to "en"
        altLanguage: "en",
        bankingConfig: {
            accountIdLabel: "Routing + Account Number",
            accountIdFormat: "XXXXXXXXX / XXXXXXXXXXXX",
            transferMethods: ["ACH", "ATH Móvil"],
            paymentApps: ["ATH Móvil", "Zelle"],
            accountTypes: { checking: "Cuenta Corriente", savings: "Cuenta de Ahorros" },
            regulations: "FDIC Insured",
            cardNetwork: "Visa"
        }
    }
];

// Get country by code
export const getCountry = (code) => countries.find(c => c.code === code);

// Get all countries grouped by region
export const getCountriesByRegion = () => ({
    europe: countries.filter(c => ["FR", "ES", "DE", "IT", "RO", "PL", "PT", "GB", "CH", "GR"].includes(c.code)),
    americas: countries.filter(c => ["US", "PE", "GT", "MX", "EC", "NI", "HN", "SV", "PA", "PR"].includes(c.code))
});

// Get unique languages
export const getAvailableLanguages = () => [
    { code: "fr", name: "Français" },
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "de", name: "Deutsch" },
    { code: "it", name: "Italiano" },
    { code: "ro", name: "Română" },
    { code: "pl", name: "Polski" },
    { code: "pt", name: "Português" },
    { code: "el", name: "Ελληνικά" }
];

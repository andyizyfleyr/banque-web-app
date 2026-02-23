// Currency configurations with native formatting and static exchange rates (base EUR)
export const currencies = {
    EUR: { code: "EUR", symbol: "€", name: "Euro", locale: "fr-FR", rate: 1.0 },
    USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", rate: 1.08 },
    GBP: { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB", rate: 0.85 },
    CHF: { code: "CHF", symbol: "CHF", name: "Swiss Franc", locale: "de-CH", rate: 0.95 },
    RON: { code: "RON", symbol: "lei", name: "Romanian Leu", locale: "ro-RO", rate: 4.97 },
    PLN: { code: "PLN", symbol: "zł", name: "Polish Zloty", locale: "pl-PL", rate: 4.31 },
    MXN: { code: "MXN", symbol: "$", name: "Mexican Peso", locale: "es-MX", rate: 18.23 },
    PEN: { code: "PEN", symbol: "S/", name: "Peruvian Sol", locale: "es-PE", rate: 3.75 },
    GTQ: { code: "GTQ", symbol: "Q", name: "Guatemalan Quetzal", locale: "es-GT", rate: 7.82 },
    NIO: { code: "NIO", symbol: "C$", name: "Nicaraguan Córdoba", locale: "es-NI", rate: 36.62 },
    HNL: { code: "HNL", symbol: "L", name: "Honduran Lempira", locale: "es-HN", rate: 24.67 },
};

/**
 * Convert an amount from one currency to another
 * @param {number} amount
 * @param {string} fromCurrency
 * @param {string} toCurrency
 * @returns {number} Converted amount
 */
export const convertCurrency = (amount, fromCurrency = "EUR", toCurrency = "EUR") => {
    if (fromCurrency === toCurrency) return amount;
    const fromRate = currencies[fromCurrency]?.rate || 1.0;
    const toRate = currencies[toCurrency]?.rate || 1.0;

    // First convert to EUR (base), then to target currency
    const amountInEur = amount / fromRate;
    return amountInEur * toRate;
};

/**
 * Format a number as a currency string using Intl.NumberFormat
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - ISO 4217 currency code (EUR, USD, etc.)
 * @param {object} options - Override options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = "EUR", options = {}) => {
    const config = currencies[currencyCode] || currencies.EUR;

    try {
        return new Intl.NumberFormat(config.locale, {
            style: "currency",
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            ...options
        }).format(amount);
    } catch {
        // Fallback
        return `${amount.toFixed(2)} ${config.symbol}`;
    }
};

/**
 * Format amount with sign (for transactions)
 * @param {number} amount 
 * @param {string} currencyCode 
 * @returns {string}
 */
export const formatSignedCurrency = (amount, currencyCode = "EUR") => {
    const formatted = formatCurrency(Math.abs(amount), currencyCode);
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
};

/**
 * Get currency symbol only
 * @param {string} currencyCode 
 * @returns {string}
 */
export const getCurrencySymbol = (currencyCode = "EUR") => {
    return currencies[currencyCode]?.symbol || currencyCode;
};

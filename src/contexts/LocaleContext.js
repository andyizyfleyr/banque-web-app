"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { countries, getCountry } from '@/config/countries';
import { formatCurrency as formatCurrencyUtil, formatSignedCurrency, getCurrencySymbol, convertCurrency } from '@/config/currencies';

// Import all translation files
import fr from '@/translations/fr.json';
import en from '@/translations/en.json';
import es from '@/translations/es.json';
import de from '@/translations/de.json';
import it from '@/translations/it.json';
import ro from '@/translations/ro.json';
import pl from '@/translations/pl.json';
import pt from '@/translations/pt.json';
import el from '@/translations/el.json';

const translations = { fr, en, es, de, it, ro, pl, pt, el };

const LocaleContext = createContext(null);

const STORAGE_KEY = 'redbank_locale';

export const LocaleProvider = ({ children }) => {
    const [countryCode, setCountryCode] = useState(null);
    const [language, setLanguage] = useState('fr');
    const [globalCurrency, setGlobalCurrency] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Load saved locale from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setCountryCode(parsed.countryCode || 'FR');
                setLanguage(parsed.language || 'fr');
                setGlobalCurrency(parsed.globalCurrency || null);
                setIsReady(true);
            } else {
                // First visit: detect browser language
                const browserLang = typeof navigator !== 'undefined'
                    ? navigator.language.split('-')[0].toLowerCase()
                    : 'fr';

                // Check if the detected language is supported
                const supportedLangs = Object.keys(translations);
                const initialLang = supportedLangs.includes(browserLang) ? browserLang : 'fr';

                setShowOnboarding(true);
                setCountryCode('FR'); // Default country, can be refined based on lang later
                setLanguage(initialLang);
                setGlobalCurrency(null);
                setIsReady(true);
            }
        } catch {
            setCountryCode('FR');
            setLanguage('fr');
            setGlobalCurrency(null);
            setIsReady(true);
        }
    }, []);

    // Get current country object
    const country = getCountry(countryCode || 'FR') || countries[0];

    // Save to localStorage whenever locale changes
    useEffect(() => {
        if (countryCode && isReady) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                countryCode,
                language,
                globalCurrency
            }));
        }
    }, [countryCode, language, globalCurrency, isReady]);

    // Translation function with dot notation support
    const t = useCallback((key, replacements = {}) => {
        const keys = key.split('.');
        let value = translations[language] || translations.fr;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Fallback to French
                let fallback = translations.fr;
                for (const fk of keys) {
                    if (fallback && typeof fallback === 'object' && fk in fallback) {
                        fallback = fallback[fk];
                    } else {
                        return key; // Key not found anywhere
                    }
                }
                value = fallback;
                break;
            }
        }

        if (typeof value !== 'string') return key;

        // Replace {placeholders}
        let result = value;
        Object.entries(replacements).forEach(([rKey, rValue]) => {
            result = result.replace(`{${rKey}}`, rValue);
        });

        return result;
    }, [language]);

    // Currency formatting using the country's currency
    const fc = useCallback((amount, currencyOverride) => {
        const fromCurr = currencyOverride || country.currency;
        const targetCurr = globalCurrency || fromCurr;
        const convertedAmount = convertCurrency(amount, fromCurr, targetCurr);
        return formatCurrencyUtil(convertedAmount, targetCurr);
    }, [country, globalCurrency]);

    // Signed currency (for transactions: +120€ / -45€)
    const fcs = useCallback((amount, currencyOverride) => {
        const fromCurr = currencyOverride || country.currency;
        const targetCurr = globalCurrency || fromCurr;
        const convertedAmount = convertCurrency(amount, fromCurr, targetCurr);
        return formatSignedCurrency(convertedAmount, targetCurr);
    }, [country, globalCurrency]);

    // Get currency symbol
    const cs = useCallback((currencyOverride) => {
        return getCurrencySymbol(globalCurrency || currencyOverride || country.currency);
    }, [country, globalCurrency]);

    // Convert raw value
    const cv = useCallback((amount, currencyOverride) => {
        const fromCurr = currencyOverride || country.currency;
        const targetCurr = globalCurrency || fromCurr;
        return convertCurrency(amount, fromCurr, targetCurr);
    }, [country, globalCurrency]);

    // Change global currency
    const changeCurrency = useCallback((code) => {
        setGlobalCurrency(code);
    }, []);

    // Change country (also changes language and global currency to country's defaults)
    const changeCountry = useCallback((code, langOverride) => {
        const newCountry = getCountry(code);
        if (newCountry) {
            setCountryCode(code);
            setLanguage(langOverride || newCountry.language);
            setGlobalCurrency(newCountry.currency);
            setShowOnboarding(false);
        }
    }, []);

    // Change language only (for countries with multiple languages like Puerto Rico)
    const changeLanguage = useCallback((lang) => {
        if (translations[lang]) {
            setLanguage(lang);
        }
    }, []);

    // Complete onboarding
    const completeOnboarding = useCallback((code, lang, currency) => {
        changeCountry(code, lang);
        if (currency) setGlobalCurrency(currency);
        setShowOnboarding(false);
    }, [changeCountry]);

    const value = {
        // State
        countryCode,
        country,
        language,
        globalCurrency,
        isReady,
        showOnboarding,
        // Translation
        t,
        // Currency formatting
        fc,       // formatCurrency(amount, currencyOverride?)
        fcs,      // formatSignedCurrency(amount, currencyOverride?)
        cs,       // getCurrencySymbol(currencyOverride?)
        cv,       // convert raw value
        // Actions
        changeCountry,
        changeLanguage,
        changeCurrency,
        completeOnboarding,
        setShowOnboarding
    };

    return (
        <LocaleContext.Provider value={value}>
            {children}
        </LocaleContext.Provider>
    );
};

export const useLocale = () => {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
};

export default LocaleContext;

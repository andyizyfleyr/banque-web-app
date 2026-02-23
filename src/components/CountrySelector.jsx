"use client";
import React, { useState, useMemo } from 'react';
import { X, Check, ChevronDown, Globe, Languages, Coins } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { countries, getCountriesByRegion } from '@/config/countries';
import { currencies } from '@/config/currencies';

const CountrySelector = ({ onClose, isOnboarding = false }) => {
    const { t, countryCode, language, globalCurrency, changeCountry, changeLanguage, changeCurrency, country } = useLocale();
    const [selectedCountry, setSelectedCountry] = useState(countryCode);
    const [selectedLang, setSelectedLang] = useState(language);
    const [selectedCurrency, setSelectedCurrency] = useState(globalCurrency || country?.currency || 'EUR');
    const [activeTab, setActiveTab] = useState('country');

    const regions = useMemo(() => getCountriesByRegion(), []);

    const currentSelectedCountry = useMemo(() => {
        const c = countries.find(c => c.code === selectedCountry);
        return c ? { ...c, name: c.country, defaultLanguage: c.language } : null;
    }, [selectedCountry]);

    const availableLanguages = useMemo(() => {
        const langMap = {
            'fr': { code: 'fr', name: 'Français', flag: '🇫🇷' },
            'en': { code: 'en', name: 'English', flag: '🇬🇧' },
            'es': { code: 'es', name: 'Español', flag: '🇪🇸' },
            'de': { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
            'it': { code: 'it', name: 'Italiano', flag: '🇮🇹' },
            'ro': { code: 'ro', name: 'Română', flag: '🇷🇴' },
            'pl': { code: 'pl', name: 'Polski', flag: '🇵🇱' },
            'pt': { code: 'pt', name: 'Português', flag: '🇵🇹' },
            'el': { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
        };
        // Show default language for selected country first, then all others
        const defaultLang = currentSelectedCountry?.defaultLanguage || 'fr';
        const sorted = Object.values(langMap).sort((a, b) => {
            if (a.code === defaultLang) return -1;
            if (b.code === defaultLang) return 1;
            return a.name.localeCompare(b.name);
        });
        return sorted;
    }, [currentSelectedCountry]);

    const handleConfirm = () => {
        if (selectedCountry !== countryCode) {
            changeCountry(selectedCountry, selectedLang);
        } else if (selectedLang !== language) {
            changeLanguage(selectedLang);
        }

        if (selectedCurrency !== (globalCurrency || currentSelectedCountry?.currency)) {
            changeCurrency(selectedCurrency);
        }

        onClose();
    };

    const regionLabels = {
        'europe': t('countrySelector.europe'),
        'americas': t('countrySelector.americas'),
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-[#1D3557]">
                            {isOnboarding ? t('onboarding.welcome') : t('countrySelector.title')}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {isOnboarding ? t('onboarding.selectCountry') : t('countrySelector.subtitle')}
                        </p>
                    </div>
                    {!isOnboarding && (
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={20} className="text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6 flex-shrink-0">
                    <button
                        onClick={() => setActiveTab('country')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'country' ? 'border-[#e63746] text-[#e63746]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Globe size={16} />
                        {t('common.country')}
                    </button>
                    <button
                        onClick={() => setActiveTab('language')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'language' ? 'border-[#e63746] text-[#e63746]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Languages size={16} />
                        {t('common.language')}
                    </button>
                    <button
                        onClick={() => setActiveTab('currency')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'currency' ? 'border-[#e63746] text-[#e63746]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Coins size={16} />
                        {t('common.currency')}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {activeTab === 'country' ? (
                        <div className="space-y-6">
                            {Object.entries(regions).map(([region, regionCountries]) => (
                                <div key={region}>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                        {regionLabels[region] || region}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {regionCountries.map((c) => (
                                            <button
                                                key={c.code}
                                                onClick={() => {
                                                    setSelectedCountry(c.code);
                                                    setSelectedLang(c.defaultLanguage);
                                                    setSelectedCurrency(c.currency);
                                                }}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${selectedCountry === c.code
                                                    ? 'bg-[#e63746]/10 ring-2 ring-[#e63746] text-[#1D3557]'
                                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                <span className="text-xl leading-none">{c.flag}</span>
                                                <span className="text-sm font-medium truncate">{c.country}</span>
                                                {selectedCountry === c.code && (
                                                    <Check size={16} className="text-[#e63746] ml-auto flex-shrink-0" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activeTab === 'language' ? (
                        <div className="space-y-2">
                            {availableLanguages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => setSelectedLang(lang.code)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 ${selectedLang === lang.code
                                        ? 'bg-[#e63746]/10 ring-2 ring-[#e63746] text-[#1D3557]'
                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    <span className="text-xl">{lang.flag}</span>
                                    <span className="text-sm font-medium">{lang.name}</span>
                                    {lang.code === currentSelectedCountry?.defaultLanguage && (
                                        <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full uppercase">default</span>
                                    )}
                                    {selectedLang === lang.code && (
                                        <Check size={16} className="text-[#e63746] ml-auto" />
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {Object.values(currencies).map((curr) => (
                                <button
                                    key={curr.code}
                                    onClick={() => setSelectedCurrency(curr.code)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 ${selectedCurrency === curr.code
                                        ? 'bg-[#e63746]/10 ring-2 ring-[#e63746] text-[#1D3557]'
                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-sm font-bold text-[#1D3557]">
                                        {curr.symbol}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">{curr.code}</span>
                                        <span className="text-xs text-gray-500">{curr.name}</span>
                                    </div>
                                    {curr.code === currentSelectedCountry?.currency && (
                                        <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full uppercase ml-2">default</span>
                                    )}
                                    {selectedCurrency === curr.code && (
                                        <Check size={16} className="text-[#e63746] ml-auto" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/50">
                    <p className="text-xs text-gray-400">{t('countrySelector.changeAnytime')}</p>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2.5 bg-[#e63746] text-white font-bold text-sm rounded-xl hover:bg-[#c5303d] transition-colors shadow-lg shadow-red-200 active:scale-95"
                    >
                        {isOnboarding ? t('onboarding.letsGo') : t('countrySelector.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CountrySelector;

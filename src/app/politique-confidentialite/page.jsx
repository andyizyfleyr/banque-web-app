"use client";
import React, { useState } from 'react';
import { useLocale } from "@/contexts/LocaleContext";
import Image from "next/image";
import Link from "next/link";
import { Database, Target, Clock, Shield, Globe, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import CountrySelector from '@/components/CountrySelector';
import PublicFooter from '@/components/PublicFooter';

const PolitiqueConfidentialite = () => {
    const { t, country, language } = useLocale();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSelector, setShowSelector] = useState(false);

    const navLinks = [
        { name: t('public_nav.home'), active: false, path: "/" },
        { name: t('public_nav.about'), active: false, path: "/about" },
        { name: t('public_nav.services'), active: false, path: "/services" },
        { name: t('public_nav.contact'), active: false, path: "/contact" }
    ];

    return (
        <div className="min-h-screen bg-gray-50 selection:bg-[#E63746]/10 selection:text-[#E63746] font-sans overflow-x-hidden">
            {showSelector && <CountrySelector onClose={() => setShowSelector(false)} />}

            {/* Header / Nav */}
            <nav className="fixed w-full z-[100] transition-all duration-500 py-0 md:py-8">
                <div className="max-w-[1400px] mx-auto px-0 md:px-6 lg:px-16">
                    <div className="bg-white/80 backdrop-blur-2xl rounded-none md:rounded-[2.5rem] border-b md:border border-white/50 shadow-[0_15px_40px_rgba(0,0,0,0.04)] px-6 md:px-10 py-4 flex items-center justify-between transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
                        <Link href="/" className="flex items-center gap-3 group shrink-0">
                            <Image src="/landing-page-assert/logo.png" alt="Financer" width={140} height={40} className="object-contain" priority />
                        </Link>
                        <div className="hidden xl:flex items-center space-x-12">
                            {navLinks.map((link, i) => (
                                <Link key={i} href={link.path}
                                    className={`text-[15px] font-bold transition-all relative group ${link.active ? 'text-[#E63746]' : 'text-[#1D3557] hover:text-[#E63746]'}`}>
                                    {link.name}
                                    <span className={`absolute -bottom-1.5 left-0 w-full h-0.5 bg-[#E63746] rounded-full transition-transform origin-left ${link.active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                                </Link>
                            ))}
                        </div>
                        <div className="flex items-center space-x-4 md:space-x-10">
                            <div className="hidden lg:flex items-center gap-3 pr-8 border-r border-gray-100">
                                <button onClick={() => setShowSelector(true)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-[#1D3557] hover:bg-[#E63746]/5 hover:text-[#E63746] transition-colors"><Globe size={18} /></button>
                                <button onClick={() => setShowSelector(true)} className="text-sm font-bold text-[#1D3557] hover:text-[#E63746] transition-colors uppercase">
                                    {language === 'en' ? 'English' : language === 'fr' ? 'Français' : language.toUpperCase()}
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="hidden sm:block text-[#1D3557] font-bold text-[15px] hover:text-[#E63746] transition-colors">{t('public_nav.login')}</Link>
                                <button onClick={() => setShowSelector(true)} className="lg:hidden w-11 h-11 flex items-center justify-center text-[#1D3557] hover:bg-gray-100 rounded-full transition-colors"><Globe size={22} /></button>
                                <button className="xl:hidden w-11 h-11 flex items-center justify-center text-[#1D3557] hover:bg-gray-100 rounded-full transition-colors" onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#1D3557]/60 backdrop-blur-md z-[200] xl:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 w-full max-w-sm h-full bg-white shadow-2xl p-10 flex flex-col" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-16">
                                <Image src="/landing-page-assert/logo.png" alt="Financer" width={120} height={35} />
                                <button className="w-11 h-11 flex items-center justify-center text-[#1D3557] hover:bg-gray-100 rounded-full" onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
                            </div>
                            <div className="space-y-8 mb-auto">
                                {navLinks.map((link, i) => (
                                    <Link key={i} href={link.path} className={`block text-2xl font-black ${link.active ? 'text-[#E63746]' : 'text-[#1D3557]'}`} onClick={() => setIsMobileMenuOpen(false)}>{link.name}</Link>
                                ))}
                            </div>
                            <div className="pt-10 border-t border-gray-100 space-y-6">
                                <button onClick={() => setShowSelector(true)} className="flex items-center gap-3 w-full p-4 rounded-2xl bg-gray-50 text-[#1D3557] font-black"><Globe size={20} /><span>{language === 'en' ? 'English' : language === 'fr' ? 'Français' : language.toUpperCase()}</span></button>
                                <Link href="/login" className="block w-full text-center py-4 rounded-2xl bg-[#1D3557] text-white font-black shadow-lg" onClick={() => setIsMobileMenuOpen(false)}>{t('public_nav.login')}</Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content */}
            <main className="pt-32 lg:pt-44 pb-20">
                <div className="max-w-4xl mx-auto px-6 lg:px-16">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-black text-[#1D3557] mb-4">{t('privacyPage.title')}</h1>
                        <p className="text-gray-400 text-sm">{t('privacyPage.updatedDate')}</p>
                        <div className="w-24 h-1.5 bg-gradient-to-r from-[#1D3557] to-[#E63746] mx-auto rounded-full mt-6"></div>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12 space-y-12 text-gray-600 leading-relaxed">
                        <p className="text-lg">{t('privacyPage.intro')}</p>

                        {/* Collecte */}
                        <div>
                            <h3 className="text-xl font-bold text-[#1D3557] mb-4 flex items-center gap-2"><Database className="text-[#E63746]" size={22} /> {t('privacyPage.dataCollectionTitle')}</h3>
                            <p>{t('privacyPage.dataCollectionIntro')}</p>
                            <ul className="mt-3 space-y-2 pl-6 list-disc marker:text-[#E63746]">
                                <li><strong className="text-[#1D3557]">{t('privacyPage.identityData')}</strong> {t('privacyPage.identityDataDesc')}</li>
                                <li><strong className="text-[#1D3557]">{t('privacyPage.contactData')}</strong> {t('privacyPage.contactDataDesc')}</li>
                                <li><strong className="text-[#1D3557]">{t('privacyPage.financialData')}</strong> {t('privacyPage.financialDataDesc')}</li>
                                <li><strong className="text-[#1D3557]">{t('privacyPage.connectionData')}</strong> {t('privacyPage.connectionDataDesc')}</li>
                            </ul>
                        </div>

                        {/* Finalités */}
                        <div>
                            <h3 className="text-xl font-bold text-[#1D3557] mb-4 flex items-center gap-2"><Target className="text-[#E63746]" size={22} /> {t('privacyPage.purposeTitle')}</h3>
                            <p>{t('privacyPage.purposeIntro')}</p>
                            <ul className="mt-3 space-y-2 pl-6 list-disc marker:text-[#E63746]">
                                <li>{t('privacyPage.purpose1')}</li>
                                <li>{t('privacyPage.purpose2')}</li>
                                <li>{t('privacyPage.purpose3')}</li>
                                <li>{t('privacyPage.purpose4')}</li>
                            </ul>
                        </div>

                        {/* Conservation */}
                        <div>
                            <h3 className="text-xl font-bold text-[#1D3557] mb-4 flex items-center gap-2"><Clock className="text-[#E63746]" size={22} /> {t('privacyPage.retentionTitle')}</h3>
                            <p>{t('privacyPage.retentionDesc')}</p>
                        </div>

                        {/* Droits */}
                        <div>
                            <h3 className="text-xl font-bold text-[#1D3557] mb-4 flex items-center gap-2"><Shield className="text-[#E63746]" size={22} /> {t('privacyPage.rightsTitle')}</h3>
                            <p>{t('privacyPage.rightsIntro')}</p>
                            <ul className="mt-3 space-y-2 pl-6 list-disc marker:text-[#E63746]">
                                <li>{t('privacyPage.right1')}</li>
                                <li>{t('privacyPage.right2')}</li>
                                <li>{t('privacyPage.right3')}</li>
                                <li>{t('privacyPage.right4')}</li>
                            </ul>
                            <p className="mt-4">{t('privacyPage.rightsContact')} <strong className="text-[#1D3557]">dpo@financer-group.com</strong></p>
                        </div>
                    </div>
                </div>

                <div className="mt-16">
                    <PublicFooter />
                </div>
            </main>
        </div>
    );
};

export default PolitiqueConfidentialite;

"use client";

import React, { useState } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CountrySelector from '@/components/CountrySelector';

const PublicNav = () => {
    const { t, language } = useLocale();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showCountrySelector, setShowCountrySelector] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { name: t('public_nav.home'), active: pathname === '/', path: "/" },
        { name: t('public_nav.about'), active: pathname === '/about', path: "/about" },
        { name: t('public_nav.services'), active: pathname === '/services', path: "/services" },
        { name: t('publicFooter.personalLoan'), active: pathname === '/pret', path: "/pret" },
        { name: t('publicFooter.creditBuyback'), active: pathname === '/rachat-credits', path: "/rachat-credits" },
        { name: t('public_nav.contact'), active: pathname === '/contact', path: "/contact" }
    ];

    return (
        <>
            {/* Header / Nav */}
            <nav className="fixed top-0 left-0 w-full z-[100] transition-all duration-500 py-0 md:py-8">
                <div className="max-w-[1400px] mx-auto px-0 md:px-6 lg:px-16">
                    <div className="bg-white/80 backdrop-blur-2xl rounded-none md:rounded-[2.5rem] border-b md:border border-white/50 shadow-[0_15px_40px_rgba(0,0,0,0.04)] px-6 md:px-10 py-4 flex flex-row items-center justify-between transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
                        <Link href="/" className="flex items-center gap-3 group shrink-0 self-start">
                            <Image
                                src="/landing-page-assert/logo.svg"
                                alt="Crediwize"
                                width={160}
                                height={45}
                                className="object-contain pr-2"
                                priority
                            />
                        </Link>

                        <div className="hidden xl:flex items-center space-x-12">
                            {navLinks.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.path}
                                    className={`text-[15px] font-bold transition-all relative group ${link.active ? 'text-[#e63746]' : 'text-[#1D3557] hover:text-[#e63746]'}`}
                                >
                                    {link.name}
                                    <span className={`absolute -bottom-1.5 left-0 w-full h-0.5 bg-[#e63746] rounded-full transition-transform origin-left ${link.active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center space-x-4 md:space-x-10">
                            <div className="hidden lg:flex items-center gap-3 pr-8 border-r border-gray-100">
                                <button
                                    onClick={() => setShowCountrySelector(true)}
                                    className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-[#1D3557] hover:bg-[#e63746]/5 hover:text-[#e63746] transition-colors"
                                >
                                    <Globe size={18} />
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="hidden sm:block text-[#1D3557] font-bold text-[15px] hover:text-[#e63746] transition-colors"
                                >
                                    {t('public_nav.login')}
                                </Link>
                                <button
                                    onClick={() => setShowCountrySelector(true)}
                                    className="lg:hidden w-11 h-11 flex items-center justify-center text-[#1D3557] hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <Globe size={22} />
                                </button>
                                <button
                                    className="xl:hidden w-11 h-11 flex items-center justify-center text-[#1D3557] hover:bg-gray-100 rounded-full transition-colors"
                                    onClick={() => setIsMobileMenuOpen(true)}
                                >
                                    <Menu size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#1D3557]/60 backdrop-blur-md z-[200] xl:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 w-full max-w-sm h-full bg-white shadow-2xl p-10 flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-row justify-between items-center mb-16">
                                <Image src="/landing-page-assert/logo.svg" alt="Crediwize" width={140} height={40} className="self-start object-contain pr-2" />
                                <button
                                    className="w-11 h-11 flex items-center justify-center text-[#1D3557] hover:bg-gray-100 rounded-full"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-8 mb-auto">
                                {navLinks.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.path}
                                        className={`block text-2xl font-black ${link.active ? 'text-[#e63746]' : 'text-[#1D3557]'}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>

                            <div className="pt-10 border-t border-gray-100 space-y-6">
                                <button
                                    onClick={() => setShowCountrySelector(true)}
                                    className="flex items-center gap-3 w-full p-4 rounded-2xl bg-gray-50 text-[#1D3557] font-black"
                                >
                                    <Globe size={20} />
                                    <span>{language === 'en' ? 'English' : language === 'fr' ? 'Français' : language === 'sv' ? 'Svenska' : language === 'ky' ? 'Кыргызча' : language.toUpperCase()}</span>
                                </button>
                                <Link
                                    href="/login"
                                    className="block w-full text-center py-4 rounded-2xl bg-[#1D3557] text-white font-black shadow-lg"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {t('public_nav.login')}
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Country Selector Modal */}
            {showCountrySelector && (
                <CountrySelector onClose={() => setShowCountrySelector(false)} />
            )}
        </>
    );
};

export default PublicNav;

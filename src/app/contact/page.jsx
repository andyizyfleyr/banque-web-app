"use client";
import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import Image from "next/image";
import Link from "next/link";
import {
    Search, User, ChevronDown, Phone, Mail, MapPin, Smartphone,
    Send, Clock, Menu, X, Headset, Globe
} from "lucide-react";
import { motion } from "framer-motion";
import CountrySelector from "@/components/CountrySelector";
import PublicFooter from "@/components/PublicFooter";

const ContactPage = () => {
    const { t, country } = useLocale();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSelector, setShowSelector] = useState(false);
    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const navLinks = [
        { name: t('public_nav.home'), active: false, path: "/" },
        { name: t('public_nav.about'), active: false, path: "/about" },
        { name: t('public_nav.services'), active: false, path: "/services" },
        { name: t('public_nav.contact'), active: true, path: "/contact" }
    ];

    return (
        <div className="min-h-screen bg-[#ffffff] text-[#666270] font-sans overflow-hidden selection:bg-[#e63746] selection:text-white flex flex-col">
            {showSelector && (
                <CountrySelector onClose={() => setShowSelector(false)} />
            )}
            {/* Navbar */}
            <nav className="fixed w-full top-0 bg-white/90 backdrop-blur-md z-50 py-5 px-6 lg:px-16 border-b border-gray-100 transition-all">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <Link href="/">
                        <Image src="/landing-page-assert/logo.png" alt="Financer" width={140} height={40} className="object-contain" priority />
                    </Link>

                    <div className="flex items-center space-x-4 md:space-x-10">
                        <div className="hidden xl:flex items-center space-x-10 text-[15px] font-semibold text-[#1D3557]">
                            {navLinks.map((link, idx) => (
                                <Link key={idx} href={link.path || "#"} className={`transition-colors hover:text-[#e63746] flex items-center gap-1 ${link.active ? 'text-[#e63746]' : ''}`}>
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                            {/* Country/Language Selector Button */}
                            <button
                                onClick={() => setShowSelector(true)}
                                className="p-2 sm:p-2.5 rounded-full bg-gray-50/50 hover:bg-gray-100 text-[#1D3557] transition-colors flex items-center gap-1.5 border border-gray-100"
                                title={t('countrySelector.title')}
                            >
                                <span className="text-[16px] leading-none">{country?.flag || '🌍'}</span>
                                <Globe size={16} className="text-[#1D3557]" />
                            </button>

                            <Link href="/login" className="bg-[#e63746] hover:bg-[#C1121F] text-white px-5 md:px-7 py-2.5 md:py-3 rounded-full font-bold text-[14px] md:text-[15px] transition shadow-[0_8px_20px_rgba(230,55,70,0.3)]">
                                {t('public_nav.getStarted')}
                            </Link>

                            <button className="xl:hidden flex items-center justify-center p-2 rounded-full hover:bg-gray-100 text-[#1D3557] transition-colors" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
                                <Menu size={28} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Backdrop */}
            <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 xl:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMobileMenuOpen(false)}></div>

            {/* Mobile Menu Drawer */}
            <div className={`fixed top-0 right-0 h-full w-[80%] max-w-[320px] bg-white z-[110] shadow-[0_0_40px_rgba(0,0,0,0.2)] transform transition-transform duration-300 ease-[0.16,1,0.3,1] xl:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 flex justify-between items-center bg-white border-b border-gray-50">
                    <Image src="/landing-page-assert/logo.png" alt="Financer" width={110} height={30} className="object-contain" />
                    <button className="text-[#1D3557] hover:bg-[#FDECEC] hover:text-[#e63746] transition-all p-2.5 bg-gray-50 rounded-full" onClick={() => setIsMobileMenuOpen(false)}>
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-8 px-6 flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2 mb-2">{t('public_nav.navigation')}</span>
                    {navLinks.map((link, idx) => (
                        <Link key={idx} href={link.path || "#"} onClick={() => setIsMobileMenuOpen(false)} className={`text-lg font-bold transition-all px-4 py-3.5 rounded-2xl flex items-center justify-between group ${link.active ? 'bg-[#FDECEC] text-[#e63746]' : 'text-[#1D3557] hover:bg-gray-50 hover:text-[#e63746]'}`}>
                            {link.name}
                            <ChevronDown className="w-5 h-5 text-gray-300 -rotate-90 group-hover:text-[#e63746] transition-colors" />
                        </Link>
                    ))}

                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2 mb-4 block">{t('public_nav.yourAccount')}</span>
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center bg-[#1D3557] hover:bg-[#2A4b7C] text-white py-4 rounded-full font-bold text-[15px] mb-3 transition-colors shadow-lg">
                            {t('public_nav.login')}
                        </Link>
                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center bg-white border-2 border-[#1D3557] text-[#1D3557] hover:bg-gray-50 py-4 rounded-full font-bold text-[15px] transition-colors">
                            {t('public_nav.register')}
                        </Link>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 mt-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#e63746]/10 rounded-full flex items-center justify-center text-[#e63746]">
                            <Headset size={20} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{t('public_nav.needHelp')}</p>
                            <p className="font-black text-[#1D3557]">+33 1 23 45 67 89</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 pb-10 pt-28">
                {/* Header Section */}
                <section className="relative py-20 lg:py-32 bg-[#F8F9FA] overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#e63746] rounded-full blur-[120px] -z-10 opacity-10"></div>
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16 text-center space-y-8 relative z-10">
                        <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-[#e63746] font-bold text-[13px] tracking-[0.15em] bg-[#FDECEC] px-5 py-2 rounded-full inline-block shadow-sm">
                            {t('contactPage.tag')}
                        </motion.span>
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-[40px] md:text-5xl lg:text-[76px] font-black text-[#1D3557] leading-[1.05] tracking-tight max-w-4xl mx-auto">
                            {t('contactPage.title')}
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-gray-500 text-lg md:text-xl lg:text-2xl leading-relaxed font-medium max-w-2xl mx-auto">
                            {t('contactPage.desc')}
                        </motion.p>
                    </div>
                </section>

                {/* Contact Cards */}
                <section className="py-20 lg:py-24 relative z-20 -mt-10 lg:-mt-20">
                    <div className="max-w-[1200px] mx-auto px-6 lg:px-16">
                        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8 md:gap-10">

                            {/* Numéro de téléphone */}
                            <motion.a href="tel:+33180000000" variants={fadeInUp} className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(230,55,70,0.15)] transition-all duration-300">
                                <div className="w-20 h-20 bg-[#FDECEC] text-[#e63746] rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[#e63746] group-hover:text-white transition-all shadow-inner">
                                    <Phone size={36} />
                                </div>
                                <h3 className="text-2xl font-bold text-[#1D3557] mb-3 group-hover:text-[#e63746] transition-colors">{t('contactPage.callUs')}</h3>
                                <p className="text-gray-500 text-[15px] leading-relaxed font-medium mb-6">{t('contactPage.callDesc')}</p>
                                <span className="text-xl font-black text-[#1D3557] mt-auto border-b-2 border-transparent group-hover:border-[#e63746] transition-colors pb-1">+33 1 80 00 00 00</span>
                            </motion.a>

                            {/* WhatsApp */}
                            <motion.a href="https://wa.me/33600000000" target="_blank" rel="noopener noreferrer" variants={fadeInUp} className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(37,211,102,0.2)] transition-all duration-300">
                                <div className="w-20 h-20 bg-[#E8F8EE] text-[#00D084] rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[#00D084] group-hover:text-white transition-all shadow-inner">
                                    <Smartphone size={36} />
                                </div>
                                <h3 className="text-2xl font-bold text-[#1D3557] mb-3 group-hover:text-[#00D084] transition-colors">{t('contactPage.whatsapp')}</h3>
                                <p className="text-gray-500 text-[15px] leading-relaxed font-medium mb-6">{t('contactPage.whatsappDesc')}</p>
                                <span className="text-xl font-black text-[#1D3557] mt-auto border-b-2 border-transparent group-hover:border-[#00D084] transition-colors pb-1">+33 6 00 00 00 00</span>
                            </motion.a>

                            {/* Email */}
                            <motion.a href="mailto:contact@financer.fr" variants={fadeInUp} className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(0,163,255,0.15)] transition-all duration-300">
                                <div className="w-20 h-20 bg-[#E6F8FE] text-[#00A3FF] rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[#00A3FF] group-hover:text-white transition-all shadow-inner">
                                    <Mail size={36} />
                                </div>
                                <h3 className="text-2xl font-bold text-[#1D3557] mb-3 group-hover:text-[#00A3FF] transition-colors">{t('contactPage.emailUs')}</h3>
                                <p className="text-gray-500 text-[15px] leading-relaxed font-medium mb-6">{t('contactPage.emailDesc')}</p>
                                <span className="text-xl font-black text-[#1D3557] mt-auto border-b-2 border-transparent group-hover:border-[#00A3FF] transition-colors pb-1">contact@financer.fr</span>
                            </motion.a>

                        </motion.div>
                    </div>
                </section>

                {/* Opening Hours Info */}
                <section className="py-10 pb-24">
                    <div className="max-w-[800px] mx-auto px-6 text-center">
                        <div className="bg-[#F8F9FA] rounded-full px-8 py-5 inline-flex items-center gap-4 border border-gray-100 shadow-sm">
                            <Clock className="text-[#e63746]" size={24} />
                            <p className="text-gray-600 font-bold text-[15px]">{t('contactPage.hours')}</p>
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
};

export default ContactPage;

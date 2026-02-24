"use client";
import React, { useState } from 'react';
import { useLocale } from "@/contexts/LocaleContext";
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowRight,
    Globe,
    Menu,
    X,
    ShieldAlert,
    Wifi,
    CreditCard,
    Copy,
    Key,
    Smartphone,
    Lock,
    UserCheck,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CountrySelector from '@/components/CountrySelector';
import PublicFooter from '@/components/PublicFooter';

const FraudeBancaire = () => {
    const { t, country, language } = useLocale();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSelector, setShowSelector] = useState(false);

    const navLinks = [
        { name: t('public_nav.home'), active: false, path: "/" },
        { name: t('public_nav.about'), active: false, path: "/about" },
        { name: t('public_nav.services'), active: false, path: "/services" },
        { name: t('public_nav.contact'), active: false, path: "/contact" }
    ];

    const fraudTypes = [
        {
            title: t('fraudPage.fraud1Title'),
            subtitle: t('fraudPage.fraud1Subtitle'),
            desc: t('fraudPage.fraud1Desc'),
            icon: ShieldAlert,
            color: "text-red-500",
            bg: "bg-red-50",
            image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80"
        },
        {
            title: t('fraudPage.fraud2Title'),
            subtitle: t('fraudPage.fraud2Subtitle'),
            desc: t('fraudPage.fraud2Desc'),
            icon: Wifi,
            color: "text-orange-500",
            bg: "bg-orange-50",
            image: "https://images.unsplash.com/photo-1521931961826-fe48677230a5?auto=format&fit=crop&w=1200&q=80"
        },
        {
            title: t('fraudPage.fraud3Title'),
            subtitle: t('fraudPage.fraud3Subtitle'),
            desc: t('fraudPage.fraud3Desc'),
            icon: Copy,
            color: "text-blue-500",
            bg: "bg-blue-50",
            image: "https://images.unsplash.com/photo-1614064641938-3bbee5294247?auto=format&fit=crop&w=1200&q=80"
        },
        {
            title: t('fraudPage.fraud4Title'),
            subtitle: t('fraudPage.fraud4Subtitle'),
            desc: t('fraudPage.fraud4Desc'),
            icon: CreditCard,
            color: "text-purple-500",
            bg: "bg-purple-50",
            image: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=1200&q=80"
        }
    ];

    const reflexes = [
        { title: t('fraudPage.reflex1Title'), desc: t('fraudPage.reflex1Desc'), icon: Key },
        { title: t('fraudPage.reflex2Title'), desc: t('fraudPage.reflex2Desc'), icon: Smartphone },
        { title: t('fraudPage.reflex3Title'), desc: t('fraudPage.reflex3Desc'), icon: Lock },
        { title: t('fraudPage.reflex4Title'), desc: t('fraudPage.reflex4Desc'), icon: UserCheck },
        { title: t('fraudPage.reflex5Title'), desc: t('fraudPage.reflex5Desc'), icon: Clock }
    ];

    return (
        <div className="min-h-screen bg-white selection:bg-[#E63746]/10 selection:text-[#E63746] font-sans overflow-x-hidden">
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
                                <button onClick={() => setShowSelector(true)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-[#1D3557] hover:bg-[#E63746]/5 hover:text-[#E63746] transition-colors">
                                    <Globe size={18} />
                                </button>
                                <button onClick={() => setShowSelector(true)} className="text-sm font-bold text-[#1D3557] hover:text-[#E63746] transition-colors uppercase">
                                    {language === 'en' ? 'English' : language === 'fr' ? 'Français' : language.toUpperCase()}
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="hidden sm:block text-[#1D3557] font-bold text-[15px] hover:text-[#E63746] transition-colors">
                                    {t('public_nav.login')}
                                </Link>
                                <button onClick={() => setShowSelector(true)} className="lg:hidden w-11 h-11 flex items-center justify-center text-[#1D3557] hover:bg-gray-100 rounded-full transition-colors">
                                    <Globe size={22} />
                                </button>
                                <button className="xl:hidden w-11 h-11 flex items-center justify-center text-[#1D3557] hover:bg-gray-100 rounded-full transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#1D3557]/60 backdrop-blur-md z-[200] xl:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}>
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 w-full max-w-sm h-full bg-white shadow-2xl p-10 flex flex-col"
                            onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-16">
                                <Image src="/landing-page-assert/logo.png" alt="Financer" width={120} height={35} />
                                <button className="w-11 h-11 flex items-center justify-center text-[#1D3557] hover:bg-gray-100 rounded-full" onClick={() => setIsMobileMenuOpen(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="space-y-8 mb-auto">
                                {navLinks.map((link, i) => (
                                    <Link key={i} href={link.path}
                                        className={`block text-2xl font-black ${link.active ? 'text-[#E63746]' : 'text-[#1D3557]'}`}
                                        onClick={() => setIsMobileMenuOpen(false)}>
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                            <div className="pt-10 border-t border-gray-100 space-y-6">
                                <button onClick={() => setShowSelector(true)} className="flex items-center gap-3 w-full p-4 rounded-2xl bg-gray-50 text-[#1D3557] font-black">
                                    <Globe size={20} />
                                    <span>{language === 'en' ? 'English' : language === 'fr' ? 'Français' : language.toUpperCase()}</span>
                                </button>
                                <Link href="/login" className="block w-full text-center py-4 rounded-2xl bg-[#1D3557] text-white font-black shadow-lg" onClick={() => setIsMobileMenuOpen(false)}>
                                    {t('public_nav.login')}
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="pt-24 lg:pt-36">
                {/* Hero Section */}
                <section className="relative w-full min-h-[70vh] flex items-center py-20 overflow-hidden bg-gradient-to-br from-[#1D3557] to-[#14243A]">
                    <div className="absolute inset-0 z-0">
                        <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=80"
                            alt="Fraud prevention" className="w-full h-full object-cover opacity-20 mix-blend-overlay" />
                    </div>
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 text-white">
                            <span className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest bg-[#E63746] text-white uppercase inline-block shadow-lg shadow-red-500/30">
                                {t('fraudPage.badge')}
                            </span>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1]">
                                {t('fraudPage.heroTitle1')} <br className="hidden md:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#E63746]">{t('fraudPage.heroTitle2')}</span>
                            </h1>
                            <p className="text-lg md:text-xl text-blue-100/90 max-w-xl leading-relaxed font-light">
                                {t('fraudPage.heroDesc')}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Fraud Types Section */}
                <section className="py-24 bg-white">
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                            <h2 className="text-3xl md:text-5xl font-black text-[#1D3557] leading-tight">{t('fraudPage.fraudTypesTitle1')} <span className="text-[#E63746]">{t('fraudPage.fraudTypesTitle2')}</span></h2>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-[#1D3557] to-[#E63746] mx-auto rounded-full"></div>
                        </div>

                        <div className="space-y-16">
                            {fraudTypes.map((fraud, idx) => (
                                <div key={idx} className={`grid lg:grid-cols-2 gap-12 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                                    <div className={`${idx % 2 === 1 ? 'lg:order-2' : 'lg:order-1'} rounded-[2rem] overflow-hidden shadow-xl`}>
                                        <img src={fraud.image} alt={fraud.title} className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700" />
                                    </div>
                                    <div className={`${idx % 2 === 1 ? 'lg:order-1' : 'lg:order-2'} space-y-6`}>
                                        <div className={`w-16 h-16 ${fraud.bg} rounded-2xl flex items-center justify-center ${fraud.color} shadow-sm`}>
                                            <fraud.icon size={28} strokeWidth={2} />
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold text-[#E63746] tracking-widest uppercase">{fraud.subtitle}</span>
                                            <h3 className="text-3xl font-black text-[#1D3557] mt-1">{fraud.title}</h3>
                                        </div>
                                        <p className="text-gray-500 text-lg leading-relaxed font-light">{fraud.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Reflexes Section */}
                <section className="py-24 bg-gray-50/50">
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                            <span className="text-[#E63746] font-bold tracking-widest uppercase text-sm">{t('fraudPage.bestPracticesLabel')}</span>
                            <h2 className="text-3xl md:text-5xl font-black text-[#1D3557] leading-tight">{t('fraudPage.reflexesTitle1')}<br /><span className="text-[#E63746]">{t('fraudPage.reflexesTitle2')}</span></h2>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-[#1D3557] to-[#E63746] mx-auto rounded-full"></div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {reflexes.map((reflex, idx) => (
                                <div key={idx} className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden">
                                    <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-[#E63746]/5 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                                    <div className="w-16 h-16 bg-[#1D3557]/5 rounded-2xl flex items-center justify-center text-[#1D3557] mb-8 relative z-10 shadow-sm group-hover:bg-[#E63746] group-hover:text-white transition-all duration-300">
                                        <reflex.icon size={28} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-xl font-black text-[#1D3557] mb-3 relative z-10">{reflex.title}</h3>
                                    <p className="text-gray-500 leading-relaxed font-medium relative z-10">{reflex.desc}</p>
                                </div>
                            ))}

                            {/* Security Shield Card */}
                            <div className="bg-gradient-to-br from-[#1D3557] to-[#2A4b7C] p-10 rounded-[2rem] shadow-xl text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                                <Lock size={48} className="mb-6 text-white/80 relative z-10" />
                                <h3 className="text-2xl font-black mb-2 relative z-10">{t('fraudPage.secureApp')}</h3>
                                <p className="text-blue-100 relative z-10 font-light">{t('fraudPage.encryptedData')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-gradient-to-br from-[#E63746] to-red-700 text-white">
                    <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
                        <h2 className="text-4xl md:text-6xl font-black leading-tight">{t('fraudPage.ctaTitle1')}<br />{t('fraudPage.ctaTitle2')}</h2>
                        <p className="text-xl text-red-100 font-light max-w-2xl mx-auto">{t('fraudPage.ctaDesc')}</p>
                        <Link href="/contact" className="inline-flex items-center gap-3 bg-white text-[#E63746] px-10 py-5 rounded-2xl font-black text-lg shadow-2xl hover:bg-gray-50 transition-colors group">
                            {t('fraudPage.contactUsNow')}
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </section>

                <PublicFooter />
            </main>
        </div>
    );
};

export default FraudeBancaire;

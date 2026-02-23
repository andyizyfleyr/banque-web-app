"use client";

import React, { useState } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import Image from 'next/image';
import Link from 'next/link';
import {
    ChevronDown,
    CheckCircle,
    Apple,
    Send,
    Zap,
    ShieldCheck,
    Headset,
    Globe,
    Menu,
    X,
    TrendingUp,
    Shield,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CountrySelector from '@/components/CountrySelector';
import PublicFooter from '@/components/PublicFooter';

const LandingPage = () => {
    const { t, fc, language } = useLocale();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showCountrySelector, setShowCountrySelector] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    const navLinks = [
        { name: t('public_nav.home'), active: true, path: "/" },
        { name: t('public_nav.about'), active: false, path: "/about" },
        { name: t('public_nav.services'), active: false, path: "/services" },
        { name: t('public_nav.contact'), active: false, path: "/contact" }
    ];

    const faqs = [
        { question: t('landing.faq1_q'), answer: t('landing.faq1_a') },
        { question: t('landing.faq2_q'), answer: t('landing.faq2_a') },
        { question: t('landing.faq3_q'), answer: t('landing.faq3_a') },
        { question: t('landing.faq4_q'), answer: t('landing.faq4_a') },
        { question: t('landing.faq5_q'), answer: t('landing.faq5_a') }
    ];

    const reviews = [
        { text: t('landing.rev1_text'), author: "Sarah Jenkins", role: t('landing.rev1_role'), rating: 5 },
        { text: t('landing.rev2_text'), author: "Michael Chen", role: t('landing.rev2_role'), rating: 5 },
        { text: t('landing.rev3_text'), author: "Elena Rodriguez", role: t('landing.rev3_role'), rating: 5 },
        { text: t('landing.rev4_text'), author: "David Schmidt", role: t('landing.rev4_role'), rating: 5 },
        { text: t('landing.rev5_text'), author: "Aisha Mohammed", role: t('landing.rev5_role'), rating: 5 },
        { text: t('landing.rev6_text'), author: "James Wilson", role: t('landing.rev6_role'), rating: 5 }
    ];

    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    return (
        <div className="min-h-screen bg-white selection:bg-[#e63746]/10 selection:text-[#e63746]">
            {/* Header / Nav */}
            <nav className="fixed w-full z-[100] transition-all duration-500 py-0 md:py-8">
                <div className="max-w-[1400px] mx-auto px-0 md:px-6 lg:px-16">
                    <div className="bg-white/80 backdrop-blur-2xl rounded-none md:rounded-[2.5rem] border-b md:border border-white/50 shadow-[0_15px_40px_rgba(0,0,0,0.04)] px-6 md:px-10 py-4 flex items-center justify-between transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
                        <Link href="/" className="flex items-center gap-3 group shrink-0">
                            <Image
                                src="/landing-page-assert/logo.png"
                                alt="Financer"
                                width={140}
                                height={40}
                                className="object-contain"
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
                                <button
                                    onClick={() => setShowCountrySelector(true)}
                                    className="text-sm font-bold text-[#1D3557] hover:text-[#e63746] transition-colors uppercase"
                                >
                                    {language === 'en' ? 'English' : language === 'fr' ? 'Français' : language.toUpperCase()}
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
                            <div className="flex justify-between items-center mb-16">
                                <Image src="/landing-page-assert/logo.png" alt="Financer" width={120} height={35} />
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
                                    <span>{language === 'en' ? 'English' : language === 'fr' ? 'Français' : language.toUpperCase()}</span>
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

            <main>
                {/* Hero Section */}
                <section className="relative w-full overflow-hidden flex flex-col items-center justify-center pt-24 lg:pt-32 pb-40 min-h-screen z-0">
                    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover -z-20 hidden md:block">
                        <source src="/video-assets/Hero_Edit__1728x1117_Desktop.mp4" type="video/mp4" />
                    </video>
                    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover -z-20 block md:hidden">
                        <source src="/video-assets/Hero_Edit__834x1194_Mobile.mp4" type="video/mp4" />
                    </video>

                    <div className="absolute inset-0 bg-gradient-to-b from-[#e63746]/40 via-[#e63746]/30 to-[#e63746]/70 -z-10 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-[#e63746]/20 -z-10" />

                    <div className="max-w-[1400px] w-full mx-auto px-6 lg:px-16 flex flex-col items-center justify-center relative z-10 pt-10">
                        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-6 flex flex-col items-center text-center max-w-4xl">


                            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 text-[56px] lg:text-[72px] font-bold leading-[1.1] mb-6 tracking-tight drop-shadow-lg">
                                {t('landing.heroTitleLine1')} <br className="hidden md:block" /> {t('landing.heroTitleLine2')}
                            </h1>

                            <p className="text-xl text-gray-300 max-w-xl font-medium leading-[1.6] mb-10 drop-shadow-md mx-auto">
                                {t('landing.heroDesc')}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5">
                                <Link href="/register" className="bg-[#e63746] hover:bg-[#C1121F] text-white px-10 py-5 rounded-full font-bold text-lg shadow-[0_15px_30px_rgba(230,55,70,0.4)] transition-all hover:-translate-y-1 active:scale-95">
                                    {t('landing.createAccountLink')}
                                </Link>
                            </div>

                            <div className="flex items-center gap-4 mt-8">
                                <div className="flex -space-x-3">
                                    {['Ellipse-8.png', 'Ellipse-6.png', 'author_2.png'].map((img, i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1D3557] relative overflow-hidden bg-gray-700 shadow-lg">
                                            <Image src={`/landing-page-assert/${img}`} alt={`User ${i + 1}`} fill className="object-cover" />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-[#1D3557] bg-[#1D3557] flex items-center justify-center text-white text-xs font-bold z-10 shadow-lg">
                                        5K+
                                    </div>
                                </div>
                                <span className="text-sm text-gray-300 font-semibold">{t('landing.usersWorldwide')}</span>
                            </div>
                        </motion.div>

                        {/* Floating Cards */}
                        <motion.div
                            initial={{ opacity: 0, x: -100, rotate: -15 }}
                            animate={{ opacity: 1, x: 0, rotate: -15 }}
                            transition={{ duration: 1.2, delay: 0.2 }}
                            className="absolute -bottom-16 -left-12 lg:-left-20 hidden xl:block z-0 pointer-events-none origin-bottom-left"
                        >
                            <div className="w-[320px] h-[200px] bg-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-white/20 p-8 flex flex-col justify-between overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4E1]/30 to-[#FFDAB9]/30" />
                                <div className="relative z-10 flex justify-between items-start">
                                    <TrendingUp className="text-white/80" size={28} />
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 bg-[#FF3333] rounded-full opacity-80 mix-blend-multiply" />
                                        <div className="w-6 h-6 bg-[#FFB800] rounded-full opacity-80 mix-blend-multiply" />
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-white/80 text-[10px] tracking-[0.2em] font-bold mb-1 uppercase">{t('landing.balance')}</p>
                                    <p className="text-white text-4xl font-black tracking-tight">{fc(62358.77)}</p>
                                </div>
                                <div className="relative z-10 flex justify-between w-full text-white/50 text-[10px] font-mono mt-4 italic tracking-widest">
                                    <span>●●●● 1112</span>
                                    <span>01/25</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 100, rotate: 15 }}
                            animate={{ opacity: 1, x: 0, rotate: 15 }}
                            transition={{ duration: 1.2, delay: 0.4 }}
                            className="absolute -bottom-16 -right-12 lg:-right-20 hidden xl:block z-0 pointer-events-none origin-bottom-right"
                        >
                            <div className="w-[320px] h-[200px] bg-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-white/20 p-8 flex flex-col justify-end overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#E6E6FA]/30 to-[#DDA0DD]/30" />
                                <div className="relative z-10 w-full text-white">
                                    <div className="w-12 h-8 rounded bg-white/30 mb-8 backdrop-blur-md border border-white/40 overflow-hidden">
                                        <div className="w-full h-full bg-[#FFD700]/40" />
                                    </div>
                                    <p className="text-xl tracking-[0.2em] font-mono mb-2">1234 5678 9000 0000</p>
                                    <div className="flex justify-between items-center text-white/70 text-[11px] font-bold uppercase tracking-wider">
                                        <span>Jay Leroy</span>
                                        <span>12/24</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-white py-24 lg:py-32 relative overflow-hidden">
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16 grid lg:grid-cols-2 gap-20 items-center">
                        <div className="relative max-w-[550px] mx-auto lg:mx-0 w-full">
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="relative rounded-[3rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.1)] z-10 border-[8px] border-white aspect-[4/5]">
                                <Image src="/landing-page-assert/Image-1.png" fill className="object-cover" alt="Banking App" />
                            </motion.div>

                            <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-1/4 -left-12 bg-white pl-4 pr-8 py-4 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center gap-4 z-20 border border-white hidden md:flex">
                                <div className="w-14 h-14 bg-[#E6F8FE] rounded-full border-2 border-[#1D3557] relative overflow-hidden">
                                    <Image src="/landing-page-assert/author_2.png" fill className="object-cover" alt="Consultant" />
                                </div>
                                <div>
                                    <span className="block text-[11px] font-bold text-gray-400 tracking-wider mb-0.5 uppercase">{t('landing.admin')}</span>
                                    <span className="block text-lg font-black text-[#1D3557]">Alex Suan</span>
                                </div>
                            </motion.div>

                            <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4.5, repeat: Infinity }} className="absolute -bottom-8 -right-8 bg-white px-8 py-6 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex items-center gap-5 z-20 border border-white border-b-8 border-b-[#00D084] hidden md:flex">
                                <div className="w-14 h-14 bg-[#00D084]/10 rounded-full flex items-center justify-center">
                                    <ShieldCheck className="text-[#00D084]" size={28} />
                                </div>
                                <p className="text-lg font-black text-[#1D3557] leading-tight">
                                    {t('landing.securePayments')} <br />
                                    <span className="text-gray-400 font-bold text-sm">{t('landing.lastActivity')}</span>
                                </p>
                            </motion.div>

                            <Image src="/landing-page-assert/mouse-pointer.png" width={100} height={100} className="absolute bottom-1/4 -left-16 z-30 drop-shadow-2xl hidden md:block" alt="pointer" />
                        </div>

                        <motion.div initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }} className="space-y-8 pl-0 lg:pl-10">
                            <span className="text-[#e63746] font-bold text-[13px] tracking-[0.15em] bg-[#FDECEC] px-5 py-2 rounded-full inline-block shadow-sm uppercase">{t('landing.featuresTitle')}</span>
                            <h2 className="text-[40px] md:text-5xl lg:text-7xl font-black text-[#1D3557] leading-[1.1] tracking-tight">
                                {t('landing.featuresHeading')}
                            </h2>
                            <p className="text-gray-500 leading-relaxed text-lg font-medium max-w-xl">
                                {t('landing.featuresDesc')}
                            </p>

                            <div className="space-y-10 pt-8">
                                <div className="flex gap-6 group">
                                    <div className="w-20 h-20 bg-white shadow-[0_15px_30px_rgba(0,0,0,0.04)] rounded-3xl flex items-center justify-center text-[#e63746] group-hover:bg-[#e63746] group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-2 border border-gray-50">
                                        <Shield size={32} />
                                    </div>
                                    <div className="pt-2 flex-1">
                                        <h4 className="text-2xl font-bold text-[#1D3557] mb-3">{t('landing.feat1Title')}</h4>
                                        <p className="text-gray-500 text-[15px] leading-relaxed font-medium">{t('landing.feat1Desc')}</p>
                                    </div>
                                </div>

                                <div className="flex gap-6 group">
                                    <div className="w-20 h-20 bg-white shadow-[0_15px_30px_rgba(0,0,0,0.04)] rounded-3xl flex items-center justify-center text-[#e63746] group-hover:bg-[#e63746] group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-2 border border-gray-50">
                                        <Headset size={32} />
                                    </div>
                                    <div className="pt-2 flex-1">
                                        <h4 className="text-2xl font-bold text-[#1D3557] mb-3">{t('landing.feat2Title')}</h4>
                                        <p className="text-gray-500 text-[15px] leading-relaxed font-medium">{t('landing.feat2Desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Loans Section */}
                <section className="bg-gray-50 py-24 lg:py-32 relative overflow-hidden">
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16 grid lg:grid-cols-2 gap-20 items-center">
                        <motion.div initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }} className="space-y-8 pr-0 lg:pr-10">
                            <span className="text-[#e63746] font-bold text-[13px] tracking-[0.15em] bg-[#FDECEC] px-5 py-2 rounded-full inline-block shadow-sm uppercase">{t('landing.loansTitle')}</span>
                            <h2 className="text-[40px] md:text-5xl lg:text-7xl font-black text-[#1D3557] leading-[1.1] tracking-tight">
                                {t('landing.loansHeading')}
                            </h2>
                            <p className="text-gray-500 leading-relaxed text-lg font-medium">
                                {t('landing.loansDesc')}
                            </p>

                            <ul className="space-y-5 pt-4">
                                {[t('landing.loanFeature1'), t('landing.loanFeature2'), t('landing.loanFeature3')].map((feat, i) => (
                                    <li key={i} className="flex items-center gap-4 text-[#1D3557] font-bold text-lg">
                                        <div className="w-8 h-8 rounded-full bg-[#00D084]/10 flex items-center justify-center text-[#00D084] shrink-0 shadow-inner">
                                            <CheckCircle size={18} />
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <button className="bg-[#e63746] hover:bg-[#C1121F] text-white px-12 py-5 rounded-full font-bold text-[15px] transition shadow-[0_8px_20px_rgba(230,55,70,0.3)] mt-8 hover:-translate-y-1 active:scale-95 uppercase tracking-widest">
                                {t('landing.loanSimulate')}
                            </button>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative h-full min-h-[450px] w-full flex items-center justify-center">
                            <div className="absolute inset-0 bg-[radial-gradient(circle,#fdf5f6,transparent)] rounded-full blur-[100px] -z-10 opacity-70" />
                            <div className="relative w-full aspect-[4/3] rounded-[3rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.15)] border-[10px] border-white z-10 mx-auto max-w-lg group">
                                <Image src="/landing-page-assert/loan.jpeg" fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt="Rapid Loan" />
                            </div>

                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -bottom-8 lg:bottom-10 -left-6 lg:-left-12 bg-white px-8 py-6 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center gap-6 z-20 border border-gray-100 uppercase">
                                <div className="w-16 h-16 bg-[#FFB800]/10 rounded-2xl flex items-center justify-center shadow-inner">
                                    <Zap className="text-[#FFB800] fill-[#FFB800]" size={32} />
                                </div>
                                <div>
                                    <h4 className="font-black text-[#1D3557] text-3xl mb-1">{t('landing.fromRate')}</h4>
                                    <p className="text-gray-400 font-bold text-[13px] tracking-[0.1em]">{t('landing.fixedApr')}</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Download App Section */}
                <section className="bg-white py-24 lg:py-32">
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
                        <div className="bg-[#1D3557] rounded-[4rem] p-12 md:p-24 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center gap-16">
                            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#e63746]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                            <div className="relative z-10 lg:w-3/5 space-y-10 text-center lg:text-left flex flex-col items-center lg:items-start">
                                <h2 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight">
                                    {t('landing.downloadAppTitle')}
                                </h2>
                                <p className="text-white/60 text-xl font-light max-w-xl">
                                    {t('landing.downloadAppDesc')}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <button className="transition-all hover:opacity-80 active:scale-95">
                                        <Image
                                            src="/landing-page-assert/apple_store.svg"
                                            width={200}
                                            height={60}
                                            alt="Download on the App Store"
                                            className="h-[60px] w-auto"
                                        />
                                    </button>
                                    <button className="transition-all hover:opacity-80 active:scale-95">
                                        <Image
                                            src="/landing-page-assert/google_play.svg"
                                            width={220}
                                            height={60}
                                            alt="Get it on Google Play"
                                            className="h-[60px] w-auto"
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className="lg:w-2/5 relative">
                                <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="relative z-10 w-full max-w-[320px] mx-auto filter drop-shadow-[0_45px_45px_rgba(0,0,0,0.5)]">
                                    <Image src="/landing-page-assert/Rectangle-8732.jpg" width={300} height={600} className="rounded-[3rem] border-8 border-white/10" alt="App" />
                                </motion.div>
                                <Image src="/landing-page-assert/Ellipse-60.png" width={800} height={800} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl scale-150 pointer-events-none" alt="glow" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Marquee Testimonials */}
                <section className="bg-gray-50 py-24 lg:py-32 overflow-hidden border-y border-gray-100">
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16 text-center mb-20 space-y-6">
                        <span className="text-[#e63746] font-bold text-[13px] tracking-[0.15em] bg-[#FDECEC] px-5 py-2 rounded-full inline-block shadow-sm uppercase">{t('landing.testimonialsTag')}</span>
                        <h2 className="text-4xl md:text-6xl font-black text-[#1D3557] tracking-tight">{t('landing.testimonialsHeading')}</h2>
                    </div>

                    <div className="flex flex-col gap-10">
                        {/* Row 1 */}
                        <div className="flex gap-10 whitespace-nowrap animate-marquee">
                            {[...reviews, ...reviews].map((rev, i) => (
                                <div key={i} className="inline-block w-[400px] bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 flex flex-col justify-between whitespace-normal group hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(rev.rating)].map((_, j) => <span key={j} className="text-[#FFB800] text-xl">★</span>)}
                                    </div>
                                    <p className="text-[#1D3557] text-lg font-bold italic mb-8 leading-relaxed">"{rev.text}"</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#1D3557] text-white rounded-full flex items-center justify-center font-black text-xl">{rev.author.charAt(0)}</div>
                                        <div>
                                            <h5 className="font-black text-[#1D3557]">{rev.author}</h5>
                                            <p className="text-xs text-[#e63746] font-bold uppercase tracking-widest">{rev.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Row 2 Reverse */}
                        <div className="flex gap-10 whitespace-nowrap animate-marquee-reverse">
                            {[...reviews, ...reviews].reverse().map((rev, i) => (
                                <div key={i} className="inline-block w-[400px] bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 flex flex-col justify-between whitespace-normal group hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(rev.rating)].map((_, j) => <span key={j} className="text-[#FFB800] text-xl">★</span>)}
                                    </div>
                                    <p className="text-[#1D3557] text-lg font-bold italic mb-8 leading-relaxed">"{rev.text}"</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#e63746] text-white rounded-full flex items-center justify-center font-black text-xl">{rev.author.charAt(0)}</div>
                                        <div>
                                            <h5 className="font-black text-[#1D3557]">{rev.author}</h5>
                                            <p className="text-xs text-[#e63746] font-bold uppercase tracking-widest">{rev.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="bg-white py-24 lg:py-40">
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16 flex flex-col items-center">
                        <span className="text-[#e63746] font-bold text-[13px] tracking-[0.15em] bg-[#FDECEC] px-5 py-2 rounded-full inline-block shadow-sm uppercase mb-6">{t('landing.faqTag')}</span>
                        <h2 className="text-[40px] md:text-5xl lg:text-7xl font-black text-[#1D3557] leading-[1.1] mb-20 text-center tracking-tight">{t('landing.faqHeading')}</h2>

                        <div className="w-full max-w-4xl space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-100/50 transition-all hover:shadow-md">
                                    <button className="w-full px-10 py-10 flex items-center justify-between text-left group" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                                        <span className={`font-bold text-xl pr-8 transition-colors ${openFaq === index ? 'text-[#e63746]' : 'text-[#1D3557]'}`}>{faq.question}</span>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${openFaq === index ? 'bg-[#e63746] text-white rotate-180' : 'bg-white text-gray-400 shadow-sm'}`}>
                                            <ChevronDown size={24} />
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === index && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-gray-100">
                                                <div className="px-10 pb-10 pt-5 text-gray-500 font-medium text-lg leading-relaxed">{faq.answer}</div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <PublicFooter />

            {/* Custom Animations Styles */}
            <style jsx global>{`
                 @keyframes marquee {
                      0% { transform: translateX(0); }
                      100% { transform: translateX(-50%); }
                 }
                 @keyframes marquee-reverse {
                      0% { transform: translateX(-50%); }
                      100% { transform: translateX(0); }
                 }
                 .animate-marquee {
                      animation: marquee 60s linear infinite;
                 }
                 .animate-marquee-reverse {
                      animation: marquee-reverse 60s linear infinite;
                 }
            `}</style>
        </div>
    );
};

export default LandingPage;

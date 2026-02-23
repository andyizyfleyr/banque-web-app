"use client";
import React from "react";
import { useLocale } from "@/contexts/LocaleContext";
import Image from "next/image";
import Link from "next/link";
import {
    Search, User, ChevronDown, CheckCircle, Apple,
    Send, Smartphone, ArrowRightLeft, Shield, BarChart, CreditCard, Headset, Menu, X, Globe
} from "lucide-react";
import { motion } from "framer-motion";
import CountrySelector from "@/components/CountrySelector";
import PublicFooter from "@/components/PublicFooter";

const ServicesPage = () => {
    const { t, country } = useLocale();
    const [showSelector, setShowSelector] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
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
        { name: t('public_nav.services'), active: true, path: "/services" },
        { name: t('public_nav.contact'), active: false, path: "/contact" }
    ];

    const services = [
        {
            icon: <ArrowRightLeft size={32} />,
            title: t('servicesPage.srv1Title'),
            description: t('servicesPage.srv1Desc'),
            color: "bg-[#FDECEC] text-[#e63746]"
        },
        {
            icon: <CreditCard size={32} />,
            title: t('servicesPage.srv2Title'),
            description: t('servicesPage.srv2Desc'),
            color: "bg-[#E6F8FE] text-[#00A3FF]"
        },
        {
            icon: <BarChart size={32} />,
            title: t('servicesPage.srv3Title'),
            description: t('servicesPage.srv3Desc'),
            color: "bg-[#E8F8EE] text-[#00D084]"
        },
        {
            icon: <Shield size={32} />,
            title: t('servicesPage.srv4Title'),
            description: t('servicesPage.srv4Desc'),
            color: "bg-purple-50 text-purple-600"
        },
        {
            icon: <Smartphone size={32} />,
            title: t('servicesPage.srv5Title'),
            description: t('servicesPage.srv5Desc'),
            color: "bg-yellow-50 text-yellow-600"
        },
        {
            icon: <Headset size={32} />,
            title: t('servicesPage.srv6Title'),
            description: t('servicesPage.srv6Desc'),
            color: "bg-gray-100 text-[#1D3557]"
        }
    ];

    return (
        <div className="min-h-screen bg-[#ffffff] text-[#666270] font-sans overflow-hidden selection:bg-[#e63746] selection:text-white">
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

            <main className="pb-10 pt-28">
                {/* Header Section */}
                <section className="relative py-20 lg:py-32 bg-[#F8F9FA] overflow-hidden">
                    <div className="absolute top-1/2 right-0 w-[50%] h-[100%] bg-gradient-to-l from-[#e63746]/5 to-transparent blur-3xl -z-10"></div>
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16 text-center space-y-8 relative z-10">
                        <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-[#e63746] font-bold text-[13px] tracking-[0.15em] bg-[#FDECEC] px-5 py-2 rounded-full inline-block shadow-sm">
                            {t('servicesPage.tag')}
                        </motion.span>
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-[40px] md:text-5xl lg:text-[76px] font-black text-[#1D3557] leading-[1.05] tracking-tight max-w-4xl mx-auto">
                            {t('servicesPage.title')}
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-gray-500 text-lg md:text-xl lg:text-2xl leading-relaxed font-medium max-w-3xl mx-auto">
                            {t('servicesPage.desc')}
                        </motion.p>
                    </div>
                </section>

                {/* Services Grid Section */}
                <section className="py-20 lg:py-32">
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
                        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                            {services.map((service, index) => (
                                <motion.div key={index} variants={fadeInUp} className="bg-white p-10 rounded-[2.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col group hover:-translate-y-2 transition-transform duration-300">
                                    <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                        {service.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#1D3557] mb-4 group-hover:text-[#e63746] transition-colors">{service.title}</h3>
                                    <p className="text-gray-500 text-[15px] leading-relaxed font-medium flex-1">
                                        {service.description}
                                    </p>
                                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-2 group-hover:gap-4 transition-all">
                                        <a href="#" className="text-[14px] font-bold text-[#1D3557]">{t('servicesPage.learnMoreArrow')}</a>
                                        <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#e63746] group-hover:text-white transition-colors">
                                            <span className="text-lg leading-none transform translate-y-[-1px]">→</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Call to action */}
                <section className="bg-[#1D3557] text-white py-20 lg:py-24 my-10 rounded-[3rem] mx-4 lg:mx-8 xl:mx-auto max-w-[1400px] overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#e63746] rounded-full blur-[100px] opacity-30 pointer-events-none"></div>
                    <div className="max-w-[800px] mx-auto px-6 text-center space-y-8 relative z-10">
                        <h2 className="text-[36px] md:text-5xl font-black leading-[1.1] text-white tracking-tight">{t('servicesPage.callToActionTitle')}</h2>
                        <p className="text-gray-300 text-lg md:text-xl font-light max-w-2xl mx-auto">
                            {t('servicesPage.callToActionDesc')}
                        </p>
                        <div className="pt-4">
                            <Link href="/login" className="inline-block bg-[#e63746] hover:bg-[#C1121F] hover:scale-105 text-white px-10 py-4 rounded-full font-bold text-[16px] transition-all shadow-[0_15px_30px_rgba(230,55,70,0.4)]">
                                {t('servicesPage.openFreeAccount')}
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
};

export default ServicesPage;

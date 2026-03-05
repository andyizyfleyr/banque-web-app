"use client";
import React, { useState } from 'react';
import { useLocale } from "@/contexts/LocaleContext";
import Image from 'next/image';
import Link from 'next/link';
import {
    Clock,
    PiggyBank,
    UserCircle,
    ArrowRight,
    Globe,
    Menu,
    X,
    ChevronDown,
    Headset
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const RachatCredits = () => {
    const { t, country, language } = useLocale();

    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    return (
        <div className="min-h-screen bg-white selection:bg-[#E63746]/10 selection:text-[#E63746] font-sans overflow-x-hidden">
            <PublicNav />

            {/* Main Content */}
            <main className="pt-24 lg:pt-36">

                {/* Hero Section */}
                <section className="relative w-full min-h-[70vh] flex items-center py-20 overflow-hidden bg-gradient-to-br from-[#1D3557] to-[#14243A]">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.prismic.io/bforbank/9ff348ec-6f7a-4fc4-ac5a-019763de496c_rachat+de+credit+banque+bforbank.webp?auto=compress%2Cformat&rect=0%2C146%2C1347%2C606&width=2048"
                            alt={t('loans.creditBuyback')}
                            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
                        />
                    </div>

                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 text-white">
                            <span className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest bg-[#E63746] text-white uppercase inline-block shadow-lg shadow-red-500/30">
                                {t('buybackPage.badge')}
                            </span>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1]">
                                {t('buybackPage.heroTitle1')} <br className="hidden md:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#E63746]">{t('buybackPage.heroTitle2')}</span>
                            </h1>
                            <p className="text-lg md:text-xl text-blue-100/90 max-w-xl leading-relaxed font-light">
                                {t('buybackPage.heroDesc')}
                            </p>

                            <div className="pt-4 flex flex-wrap gap-4">
                                <Link href="/login" className="bg-[#E63746] hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-red-500/20 flex items-center gap-3 group text-lg">
                                    {t('buybackPage.applyNow')}
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Avantages Section */}
                <section className="py-24 bg-gray-50/50">
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                            <h2 className="text-3xl md:text-5xl font-black text-[#1D3557] leading-tight">{t('buybackPage.advantagesTitle1')}<br /><span className="text-[#E63746]">{t('buybackPage.advantagesTitle2')}</span></h2>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-[#1D3557] to-[#E63746] mx-auto rounded-full"></div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Raison 1 */}
                            <div className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-2xl border border-gray-100 hover:border-blue-100 transition-all duration-300 group hover:-translate-y-2">
                                <div className="w-20 h-20 bg-blue-50/50 rounded-3xl flex items-center justify-center text-[#1D3557] mb-8 group-hover:scale-110 group-hover:bg-[#1D3557] group-hover:text-white transition-all duration-300 shadow-sm">
                                    <PiggyBank size={36} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-black text-[#1D3557] mb-4">{t('buybackPage.adv1Title')}</h3>
                                <p className="text-gray-500 leading-relaxed text-lg">
                                    {t('buybackPage.adv1Desc')}
                                </p>
                            </div>

                            {/* Raison 2 */}
                            <div className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-2xl border border-gray-100 hover:border-emerald-100 transition-all duration-300 group hover:-translate-y-2">
                                <div className="w-20 h-20 bg-emerald-50/50 rounded-3xl flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
                                    <Clock size={36} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-black text-[#1D3557] mb-4">{t('buybackPage.adv2Title')}</h3>
                                <p className="text-gray-500 leading-relaxed text-lg">
                                    {t('buybackPage.adv2Desc')}
                                </p>
                            </div>

                            {/* Raison 3 */}
                            <div className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-2xl border border-gray-100 hover:border-red-100 transition-all duration-300 group hover:-translate-y-2">
                                <div className="w-20 h-20 bg-red-50/50 rounded-3xl flex items-center justify-center text-[#E63746] mb-8 group-hover:scale-110 group-hover:bg-[#E63746] group-hover:text-white transition-all duration-300 shadow-sm">
                                    <UserCircle size={36} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-black text-[#1D3557] mb-4">{t('buybackPage.adv3Title')}</h3>
                                <p className="text-gray-500 leading-relaxed text-lg">
                                    {t('buybackPage.adv3Desc')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Etapes Image Grid Section */}
                <section className="py-24 bg-white overflow-hidden">
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div className="order-2 lg:order-1 grid grid-cols-2 gap-6 relative">
                                {/* Decorative element */}
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 z-0"></div>

                                <div className="space-y-6 pt-16 relative z-10">
                                    <div className="rounded-[2rem] overflow-hidden shadow-2xl hover:scale-[1.03] transition-transform duration-500">
                                        <img src="https://images.prismic.io/bforbank/ZvwaHrVsGrYSwPY2_multiple_image_square_debt_consolidation_1_1x.webp?auto=format%2Ccompress&width=2048" alt="Step 1" className="w-full aspect-[4/5] object-cover" />
                                    </div>
                                </div>
                                <div className="space-y-6 relative z-10">
                                    <div className="rounded-[2rem] overflow-hidden shadow-2xl hover:scale-[1.03] transition-transform duration-500">
                                        <img src="https://images.prismic.io/bforbank/ZvwaPLVsGrYSwPZQ_multiple_image_square_debt_consolidation_2_3x.webp?auto=format%2Ccompress&width=2048" alt="Step 2" className="w-full aspect-square object-cover" />
                                    </div>
                                    <div className="rounded-[2rem] overflow-hidden shadow-2xl hover:scale-[1.03] transition-transform duration-500">
                                        <img src="https://images.prismic.io/bforbank/ZvwaU7VsGrYSwPZl_multiple_image_square_debt_consolidation_3_1x.webp?auto=format%2Ccompress&width=2048" alt="Step 3" className="w-full aspect-square object-cover" />
                                    </div>
                                </div>
                            </div>

                            <div className="order-1 lg:order-2 space-y-12">
                                <div className="space-y-4">
                                    <span className="text-[#E63746] font-bold tracking-widest uppercase text-sm">{t('buybackPage.howToLabel')}</span>
                                    <h2 className="text-4xl md:text-5xl font-black text-[#1D3557] leading-tight">{t('buybackPage.howToTitle1')}<br />{t('buybackPage.howToTitle2')}</h2>
                                    <p className="text-gray-500 text-xl font-light">{t('buybackPage.howToDesc')}</p>
                                </div>

                                <div className="space-y-8">
                                    {[
                                        { title: t('buybackPage.step1Title'), desc: t('buybackPage.step1Desc') },
                                        { title: t('buybackPage.step2Title'), desc: t('buybackPage.step2Desc') },
                                        { title: t('buybackPage.step3Title'), desc: t('buybackPage.step3Desc') },
                                        { title: t('buybackPage.step4Title'), desc: t('buybackPage.step4Desc') }
                                    ].map((step, idx) => (
                                        <div key={idx} className="flex gap-6 group">
                                            <div className="w-14 h-14 bg-white border border-gray-200 text-[#1D3557] rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-gray-100 group-hover:bg-[#E63746] group-hover:border-[#E63746] group-hover:text-white transition-all duration-300">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-bold text-[#1D3557] mb-2">{step.title}</h4>
                                                <p className="text-gray-500 text-lg">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Bas */}
                <section className="py-24 bg-gradient-to-tr from-[#1D3557] via-[#1A2E4C] to-[#E63746] text-center px-6 relative overflow-hidden">
                    <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://images.prismic.io/bforbank/9ff348ec-6f7a-4fc4-ac5a-019763de496c_rachat+de+credit+banque+bforbank.webp')] bg-cover bg-center mix-blend-overlay"></div>

                    <div className="max-w-4xl mx-auto space-y-10 relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">{t('buybackPage.ctaTitle1')}<br />{t('buybackPage.ctaTitle2')}</h2>
                        <p className="text-blue-100 text-xl md:text-2xl font-light max-w-2xl mx-auto">
                            {t('buybackPage.ctaDesc')}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
                            <Link href="/login" className="bg-white text-[#1D3557] hover:bg-gray-50 px-10 py-5 rounded-2xl font-black transition-all shadow-2xl flex items-center justify-center gap-3 text-lg group">
                                {t('buybackPage.viewOffers')}
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>

                <PublicFooter />
            </main>
        </div>
    );
};

export default RachatCredits;

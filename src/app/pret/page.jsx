"use client";
import React, { useState } from 'react';
import { useLocale } from "@/contexts/LocaleContext";
import Image from 'next/image';
import Link from 'next/link';
import {
    Clock,
    Settings,
    Smartphone,
    ArrowRight,
    Globe,
    Menu,
    X,
    ChevronDown,
    Headset,
    Car,
    Home,
    GraduationCap,
    Wallet,
    Plane
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const PretPersonnel = () => {
    const { t, country, language } = useLocale();



    const loanTypes = [
        { title: t('loanPage.personalLoan'), desc: t('loanPage.personalLoanDesc'), icon: Plane, color: "text-blue-500", bg: "bg-blue-50" },
        { title: t('loanPage.autoLoan'), desc: t('loanPage.autoLoanDesc'), icon: Car, color: "text-emerald-500", bg: "bg-emerald-50" },
        { title: t('loanPage.renovationLoan'), desc: t('loanPage.renovationLoanDesc'), icon: Home, color: "text-orange-500", bg: "bg-orange-50" },
        { title: t('loanPage.studentLoan'), desc: t('loanPage.studentLoanDesc'), icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-50" },
        { title: t('loanPage.revolvingCredit'), desc: t('loanPage.revolvingCreditDesc'), icon: Wallet, color: "text-[#E63746]", bg: "bg-red-50" }
    ];

    return (
        <div className="min-h-screen bg-white selection:bg-[#E63746]/10 selection:text-[#E63746] font-sans overflow-x-hidden">
            <PublicNav />

            {/* Main Content */}
            <main className="pt-24 lg:pt-36">

                {/* Hero Section */}
                <section className="relative w-full min-h-[70vh] flex items-center py-20 overflow-hidden bg-gradient-to-br from-[#1D3557] to-[#14243A]">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.prismic.io/bforbank/ZvwZQLVsGrYSwPXf_multiple_image_square_personal_loan_1_1x.webp?auto=format%2Ccompress&width=2048"
                            alt={t('loanPage.personalLoan')}
                            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
                        />
                    </div>

                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 text-white">
                            <span className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest bg-[#E63746] text-white uppercase inline-block shadow-lg shadow-red-500/30">
                                {t('loanPage.badge')}
                            </span>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1]">
                                {t('loanPage.heroTitle1')} <br className="hidden md:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#E63746]">{t('loanPage.heroTitle2')}</span>
                            </h1>
                            <p className="text-lg md:text-xl text-blue-100/90 max-w-xl leading-relaxed font-light">
                                {t('loanPage.heroDesc')}
                            </p>

                            <div className="pt-4 flex flex-wrap gap-4">
                                <Link href="/login" className="bg-[#E63746] hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-red-500/20 flex items-center gap-3 group text-lg">
                                    {t('loanPage.simulateLoan')}
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Types de prêts Section */}
                <section className="py-24 bg-white">
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                            <h2 className="text-3xl md:text-5xl font-black text-[#1D3557] leading-tight">{t('loanPage.loanTypesTitle1')} <span className="text-[#E63746]">{t('loanPage.loanTypesTitle2')}</span></h2>
                            <p className="text-gray-500 text-lg">{t('loanPage.loanTypesDesc')}</p>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-[#1D3557] to-[#E63746] mx-auto rounded-full"></div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {loanTypes.map((loan, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden">
                                    {/* Decoration */}
                                    <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${loan.bg} opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>

                                    <div className={`w-16 h-16 ${loan.bg} rounded-2xl flex items-center justify-center ${loan.color} mb-8 relative z-10 shadow-sm`}>
                                        <loan.icon size={28} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-2xl font-black text-[#1D3557] mb-3 relative z-10">{loan.title}</h3>
                                    <p className="text-gray-500 leading-relaxed font-medium relative z-10">
                                        {loan.desc}
                                    </p>
                                </div>
                            ))}

                            {/* Card Promo / Call to action */}
                            <div className="bg-gradient-to-br from-[#1D3557] to-[#2A4b7C] p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-center items-start group relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://images.prismic.io/bforbank/ZvwZYrVsGrYSwPXo_multiple_image_square_personal_loan_3_1x.webp')] bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity duration-500 mix-blend-overlay"></div>
                                <h3 className="text-3xl font-black mb-4 relative z-10">{t('loanPage.needHelp')}</h3>
                                <p className="text-blue-100 mb-8 relative z-10 font-light">
                                    {t('loanPage.needHelpDesc')}
                                </p>
                                <Link href="/contact" className="bg-white text-[#1D3557] px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-colors relative z-10">
                                    {t('loanPage.contactUs')} <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Avantages Section */}
                <section className="py-24 bg-gray-50/50">
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                            <h2 className="text-3xl md:text-5xl font-black text-[#1D3557] leading-tight">{t('loanPage.advantagesTitle1')}<br />{t('loanPage.advantagesTitle2')}</h2>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-[#1D3557] to-[#E63746] mx-auto rounded-full"></div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-2xl border border-gray-100 hover:border-emerald-100 transition-all duration-300 group hover:-translate-y-2">
                                <div className="w-20 h-20 bg-emerald-50/50 rounded-3xl flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
                                    <Clock size={36} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-black text-[#1D3557] mb-4">{t('loanPage.adv1Title')}</h3>
                                <p className="text-gray-500 leading-relaxed text-lg">
                                    {t('loanPage.adv1Desc')}
                                </p>
                            </div>

                            <div className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-2xl border border-gray-100 hover:border-orange-100 transition-all duration-300 group hover:-translate-y-2">
                                <div className="w-20 h-20 bg-orange-50/50 rounded-3xl flex items-center justify-center text-orange-600 mb-8 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-sm">
                                    <Settings size={36} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-black text-[#1D3557] mb-4">{t('loanPage.adv2Title')}</h3>
                                <p className="text-gray-500 leading-relaxed text-lg">
                                    {t('loanPage.adv2Desc')}
                                </p>
                            </div>

                            <div className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-2xl border border-gray-100 hover:border-blue-100 transition-all duration-300 group hover:-translate-y-2">
                                <div className="w-20 h-20 bg-blue-50/50 rounded-3xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                    <Smartphone size={36} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-black text-[#1D3557] mb-4">{t('loanPage.adv3Title')}</h3>
                                <p className="text-gray-500 leading-relaxed text-lg">
                                    {t('loanPage.adv3Desc')}
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
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#E63746] rounded-full blur-3xl opacity-10 z-0"></div>

                                <div className="space-y-6 pt-16 relative z-10">
                                    <div className="rounded-[2rem] overflow-hidden shadow-2xl hover:scale-[1.03] transition-transform duration-500">
                                        <img src="https://images.prismic.io/bforbank/ZvwZQLVsGrYSwPXf_multiple_image_square_personal_loan_1_1x.webp?auto=format%2Ccompress&width=2048" alt="Step 1" className="w-full aspect-[4/5] object-cover" />
                                    </div>
                                </div>
                                <div className="space-y-6 relative z-10">
                                    <div className="rounded-[2rem] overflow-hidden shadow-2xl hover:scale-[1.03] transition-transform duration-500">
                                        <img src="https://images.prismic.io/bforbank/ZvwZU7VsGrYSwPXm_multiple_image_square_personal_loan_2_3x.webp?auto=format%2Ccompress&width=2048" alt="Step 2" className="w-full aspect-square object-cover" />
                                    </div>
                                    <div className="rounded-[2rem] overflow-hidden shadow-2xl hover:scale-[1.03] transition-transform duration-500">
                                        <img src="https://images.prismic.io/bforbank/ZvwZYrVsGrYSwPXo_multiple_image_square_personal_loan_3_1x.webp?auto=format%2Ccompress&width=2048" alt="Step 3" className="w-full aspect-[4/5] object-cover" />
                                    </div>
                                </div>
                            </div>

                            <div className="order-1 lg:order-2 space-y-12">
                                <div className="space-y-4">
                                    <span className="text-[#E63746] font-bold tracking-widest uppercase text-sm">{t('loanPage.howToLabel')}</span>
                                    <h2 className="text-4xl md:text-5xl font-black text-[#1D3557] leading-tight">{t('loanPage.howToTitle1')}<br />{t('loanPage.howToTitle2')}</h2>
                                    <p className="text-gray-500 text-xl font-light">{t('loanPage.howToDesc')}</p>
                                </div>

                                <div className="space-y-8">
                                    {[
                                        { title: t('loanPage.step1Title'), desc: t('loanPage.step1Desc') },
                                        { title: t('loanPage.step2Title'), desc: t('loanPage.step2Desc') },
                                        { title: t('loanPage.step3Title'), desc: t('loanPage.step3Desc') },
                                        { title: t('loanPage.step4Title'), desc: t('loanPage.step4Desc') }
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

                <PublicFooter />
            </main>
        </div>
    );
};

export default PretPersonnel;

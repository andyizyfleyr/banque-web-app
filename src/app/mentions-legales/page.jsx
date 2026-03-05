"use client";
import React, { useState } from 'react';
import { useLocale } from "@/contexts/LocaleContext";
import Image from "next/image";
import Link from "next/link";
import { Building2, User, Server, ShieldCheck, Globe, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const MentionsLegales = () => {
    const { t, country, language } = useLocale();



    return (
        <div className="min-h-screen bg-gray-50 selection:bg-[#E63746]/10 selection:text-[#E63746] font-sans overflow-x-hidden">
            <PublicNav />

            {/* Main content */}
            <main className="pt-32 lg:pt-44 pb-20">
                <div className="max-w-4xl mx-auto px-6 lg:px-16">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-black text-[#1D3557] mb-4">{t('legalPage.title')}</h1>
                        <p className="text-gray-400 text-sm">{t('legalPage.effectiveDate')}</p>
                        <div className="w-24 h-1.5 bg-gradient-to-r from-[#1D3557] to-[#E63746] mx-auto rounded-full mt-6"></div>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12 space-y-12 text-gray-600 leading-relaxed">
                        {/* Éditeur */}
                        <div>
                            <h3 className="text-xl font-bold text-[#1D3557] mb-4 flex items-center gap-2"><Building2 className="text-[#E63746]" size={22} /> {t('legalPage.editorTitle')}</h3>
                            <p dangerouslySetInnerHTML={{ __html: t('legalPage.editorIntro') }}></p>
                            <ul className="mt-2 space-y-1 pl-6 list-disc marker:text-[#E63746]">
                                <li>{t('legalPage.companyName')}</li>
                                <li>{t('legalPage.headquarters')}</li>
                                <li>{t('legalPage.capital')}</li>
                                <li>{t('legalPage.rcs')}</li>
                                <li>{t('legalPage.vat')}</li>
                                <li>{t('legalPage.orias')}</li>
                            </ul>
                        </div>

                        {/* Directeur */}
                        <div>
                            <h3 className="text-xl font-bold text-[#1D3557] mb-4 flex items-center gap-2"><User className="text-[#E63746]" size={22} /> {t('legalPage.directorTitle')}</h3>
                            <p>{t('legalPage.directorDesc')}</p>
                            <p className="mt-2">{t('legalPage.directorContact')} <strong className="text-[#1D3557]">contact@crediwise-group.com</strong></p>
                        </div>

                        {/* Hébergement */}
                        <div>
                            <h3 className="text-xl font-bold text-[#1D3557] mb-4 flex items-center gap-2"><Server className="text-[#E63746]" size={22} /> {t('legalPage.hostingTitle')}</h3>
                            <p>{t('legalPage.hostingIntro')}</p>
                            <ul className="mt-2 space-y-1 pl-6 list-disc marker:text-[#E63746]">
                                <li>{t('legalPage.hostingCompany')}</li>
                                <li>{t('legalPage.hostingAddress')}</li>
                                <li>{t('legalPage.hostingPhone')}</li>
                            </ul>
                        </div>

                        {/* Autorité */}
                        <div>
                            <h3 className="text-xl font-bold text-[#1D3557] mb-4 flex items-center gap-2"><ShieldCheck className="text-[#E63746]" size={22} /> {t('legalPage.authorityTitle')}</h3>
                            <p>{t('legalPage.authorityDesc')}</p>
                            <p className="mt-2">{t('legalPage.authorityAddress')}</p>
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

export default MentionsLegales;

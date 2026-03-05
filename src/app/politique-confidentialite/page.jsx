"use client";
import React, { useState } from 'react';
import { useLocale } from "@/contexts/LocaleContext";
import Image from "next/image";
import Link from "next/link";
import { Database, Target, Clock, Shield, Globe, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const PolitiqueConfidentialite = () => {
    const { t, country, language } = useLocale();



    return (
        <div className="min-h-screen bg-gray-50 selection:bg-[#E63746]/10 selection:text-[#E63746] font-sans overflow-x-hidden">
            <PublicNav />

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
                            <p className="mt-4">{t('privacyPage.rightsContact')} <strong className="text-[#1D3557]">dpo@crediwise-group.com</strong></p>
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

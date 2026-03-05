"use client";
import React, { useState } from 'react';
import { useLocale } from "@/contexts/LocaleContext";
import Image from "next/image";
import Link from "next/link";
import { Globe, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const CGU = () => {
    const { t, country, language } = useLocale();



    return (
        <div className="min-h-screen bg-gray-50 selection:bg-[#E63746]/10 selection:text-[#E63746] font-sans overflow-x-hidden">
            <PublicNav />

            {/* Main content */}
            <main className="pt-32 lg:pt-44 pb-20">
                <div className="max-w-4xl mx-auto px-6 lg:px-16">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-black text-[#1D3557] mb-4">{t('termsPage.title')}</h1>
                        <p className="text-gray-400 text-sm">{t('termsPage.effectiveDate')}</p>
                        <div className="w-24 h-1.5 bg-gradient-to-r from-[#1D3557] to-[#E63746] mx-auto rounded-full mt-6"></div>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12 space-y-10 text-gray-600 leading-relaxed">
                        <p className="text-lg">{t('termsPage.intro')}</p>

                        <div>
                            <h3 className="text-xl font-bold text-[#1D3557] mb-4">{t('termsPage.article1Title')}</h3>
                            <p>{t('termsPage.article1Desc')}</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-[#1D3557] mb-4">{t('termsPage.article2Title')}</h3>
                            <p>{t('termsPage.article2Desc')}</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-[#1D3557] mb-4">{t('termsPage.article3Title')}</h3>
                            <p>{t('termsPage.article3Desc')}</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-[#1D3557] mb-4">{t('termsPage.article4Title')}</h3>
                            <p>{t('termsPage.article4Desc')}</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-[#1D3557] mb-4">{t('termsPage.article5Title')}</h3>
                            <p>{t('termsPage.article5Desc')}</p>
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

export default CGU;

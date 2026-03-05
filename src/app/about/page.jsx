"use client";
import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import Image from "next/image";
import Link from "next/link";
import {
    Search, User, ChevronDown, CheckCircle, Apple,
    Send, ShieldCheck, Target, Globe, Users, Award, Menu, X, Headset
} from "lucide-react";
import { motion } from "framer-motion";
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const AboutPage = () => {
    const { t, country } = useLocale();

    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };



    return (
        <div className="min-h-screen bg-[#ffffff] text-[#666270] font-sans overflow-hidden selection:bg-[#e63746] selection:text-white">
            <PublicNav />

            <main className="pb-10 pt-28">
                {/* Header Section */}
                <section className="relative py-20 lg:py-32 bg-[#F8F9FA] overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#fdf5f6] rounded-full blur-3xl -z-10 opacity-70"></div>
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16 text-center space-y-8 relative z-10">
                        <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-[#e63746] font-bold text-[13px] tracking-[0.15em] bg-[#FDECEC] px-5 py-2 rounded-full inline-block shadow-sm">
                            {t('about.story')}
                        </motion.span>
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-[40px] md:text-5xl lg:text-[76px] font-black text-[#1D3557] leading-[1.05] tracking-tight max-w-4xl mx-auto">
                            {t('about.title')}
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-gray-500 text-lg md:text-xl lg:text-2xl leading-relaxed font-medium max-w-3xl mx-auto">
                            {t('about.desc')}
                        </motion.p>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-20 lg:py-32">
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
                        <div className="text-center mb-16 md:mb-24">
                            <h2 className="text-3xl md:text-5xl font-black text-[#1D3557] tracking-tight">{t('about.valuesTitle')}</h2>
                        </div>

                        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                            {/* Valeur 1 */}
                            <motion.div variants={fadeInUp} className="bg-white p-10 rounded-[2.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.04)] border border-gray-50 hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-16 h-16 bg-[#FDECEC] text-[#e63746] rounded-2xl flex items-center justify-center mb-8">
                                    <Target size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-[#1D3557] mb-4">{t('about.val1')}</h3>
                                <p className="text-gray-500 text-[15px] leading-relaxed font-medium">{t('about.val1Desc')}</p>
                            </motion.div>

                            {/* Valeur 2 */}
                            <motion.div variants={fadeInUp} className="bg-white p-10 rounded-[2.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.04)] border border-gray-50 hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-16 h-16 bg-[#E6F8FE] text-[#00A3FF] rounded-2xl flex items-center justify-center mb-8">
                                    <ShieldCheck size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-[#1D3557] mb-4">{t('about.val2')}</h3>
                                <p className="text-gray-500 text-[15px] leading-relaxed font-medium">{t('about.val2Desc')}</p>
                            </motion.div>

                            {/* Valeur 3 */}
                            <motion.div variants={fadeInUp} className="bg-white p-10 rounded-[2.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.04)] border border-gray-50 hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-16 h-16 bg-[#E8F8EE] text-[#00D084] rounded-2xl flex items-center justify-center mb-8">
                                    <Globe size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-[#1D3557] mb-4">{t('about.val3')}</h3>
                                <p className="text-gray-500 text-[15px] leading-relaxed font-medium">{t('about.val3Desc')}</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="bg-[#1D3557] text-white py-20 lg:py-24 my-10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#e63746]/20 to-transparent opacity-50"></div>
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16 grid grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
                        <div className="text-center space-y-2">
                            <h4 className="text-4xl md:text-5xl lg:text-6xl font-black text-white">2M+</h4>
                            <p className="text-gray-300 font-bold tracking-widest uppercase text-sm">{t('about.activeClients')}</p>
                        </div>
                        <div className="text-center space-y-2">
                            <h4 className="text-4xl md:text-5xl lg:text-6xl font-black text-white">50+</h4>
                            <p className="text-gray-300 font-bold tracking-widest uppercase text-sm">{t('about.supportedCountries')}</p>
                        </div>
                        <div className="text-center space-y-2">
                            <h4 className="text-4xl md:text-5xl lg:text-6xl font-black text-white">€10B</h4>
                            <p className="text-gray-300 font-bold tracking-widest uppercase text-sm">{t('about.transactionsInfo')}</p>
                        </div>
                        <div className="text-center space-y-2">
                            <h4 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#e63746]">24/7</h4>
                            <p className="text-gray-300 font-bold tracking-widest uppercase text-sm">{t('about.supportOption')}</p>
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
};

export default AboutPage;

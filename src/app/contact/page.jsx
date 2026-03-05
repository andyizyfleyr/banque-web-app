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
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const ContactPage = () => {
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
                staggerChildren: 0.1
            }
        }
    };



    return (
        <div className="min-h-screen bg-[#ffffff] text-[#666270] font-sans overflow-hidden selection:bg-[#e63746] selection:text-white flex flex-col">
            <PublicNav />

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
                            <motion.a href="mailto:contact@crediwise.fr" variants={fadeInUp} className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(0,163,255,0.15)] transition-all duration-300">
                                <div className="w-20 h-20 bg-[#E6F8FE] text-[#00A3FF] rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[#00A3FF] group-hover:text-white transition-all shadow-inner">
                                    <Mail size={36} />
                                </div>
                                <h3 className="text-2xl font-bold text-[#1D3557] mb-3 group-hover:text-[#00A3FF] transition-colors">{t('contactPage.emailUs')}</h3>
                                <p className="text-gray-500 text-[15px] leading-relaxed font-medium mb-6">{t('contactPage.emailDesc')}</p>
                                <span className="text-xl font-black text-[#1D3557] mt-auto border-b-2 border-transparent group-hover:border-[#00A3FF] transition-colors pb-1">contact@crediwise.fr</span>
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

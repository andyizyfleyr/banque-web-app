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
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const ServicesPage = () => {
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
            <PublicNav />

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

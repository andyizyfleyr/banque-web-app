"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Home,
    Car,
    Briefcase,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Zap,
    ArrowRight
} from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

import { useRouter } from 'next/navigation';

const LoanStepForm = () => {
    const { t, fc } = useLocale();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState('personal');
    const [amount, setAmount] = useState(25000);
    const [months, setMonths] = useState(24);

    const loanTypes = [
        { id: 'personal', label: t('loans.personalLoan'), icon: Users, rate: 0.02, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'mortgage', label: t('loans.mortgageLoan'), icon: Home, rate: 0.02, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'auto', label: t('loans.autoLoan'), icon: Car, rate: 0.02, color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'business', label: t('loans.businessLoan'), icon: Briefcase, rate: 0.02, color: 'text-indigo-600', bg: 'bg-indigo-50' }
    ];

    const currentType = loanTypes.find(t => t.id === selectedType) || loanTypes[0];
    const monthlyRate = currentType.rate / 12;
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1));

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <div className="w-full h-full bg-white rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col overflow-hidden relative group">
            {/* Header / Progress bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-50 flex">
                <div
                    className="h-full bg-[#E63746] transition-all duration-500 ease-out"
                    style={{ width: `${(step / 2) * 100}%` }}
                />
            </div>

            <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-[#1D3557]">{t('loans.stepCategory')}</h3>
                                <p className="text-gray-400 text-sm font-medium">Choisissez le type de projet qui vous tient à cœur.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {loanTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            setSelectedType(type.id);
                                            nextStep();
                                        }}
                                        className={`p-6 rounded-3xl border-2 text-left transition-all ${selectedType === type.id
                                            ? 'border-[#E63746] bg-red-50/20'
                                            : 'border-gray-50 hober:border-gray-200 hover:bg-gray-50/50'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl ${type.bg} ${type.color} flex items-center justify-center mb-3`}>
                                            <type.icon size={24} />
                                        </div>
                                        <span className="font-bold text-[#1D3557] text-sm block leading-tight">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between">
                                <button onClick={prevStep} className="flex items-center gap-2 text-gray-400 hover:text-[#1D3557] font-bold text-xs transition-colors group">
                                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                    RETOUR
                                </button>
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#E63746] text-white">
                                    {currentType.label}
                                </span>
                            </div>

                            <div className="space-y-10">
                                {/* Amount Slider */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('loans.loanAmount')}</label>
                                        <div className="text-2xl font-black text-[#1D3557]">{fc(amount)}</div>
                                    </div>
                                    <input
                                        type="range"
                                        min="1000"
                                        max="100000"
                                        step="1000"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#E63746]"
                                    />
                                </div>

                                {/* Duration Slider */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('loans.durationMonths')}</label>
                                        <div className="text-2xl font-black text-[#1D3557]">{months} <span className="text-gray-400 text-sm font-bold">{t('loans.monthsUnit')}</span></div>
                                    </div>
                                    <input
                                        type="range"
                                        min="6"
                                        max="84"
                                        step="6"
                                        value={months}
                                        onChange={(e) => setMonths(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#E63746]"
                                    />
                                </div>

                                {/* Calculation Results */}
                                <div className="bg-[#1D3557] p-8 rounded-3xl relative overflow-hidden shadow-xl shadow-blue-900/20">
                                    <div className="absolute top-0 right-0 p-6 opacity-10">
                                        <Zap size={60} className="text-white fill-white" />
                                    </div>
                                    <div className="relative z-10 space-y-1">
                                        <span className="text-blue-300 text-[10px] font-black uppercase tracking-[0.2em]">{t('loans.monthlyPayment')}</span>
                                        <div className="text-4xl font-black text-white flex items-baseline gap-2">
                                            {fc(monthlyPayment)}
                                            <span className="text-blue-300 text-sm font-bold capitalize">/ {t('loans.monthsUnit')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-[#E63746] hover:bg-[#C1121F] text-white py-5 rounded-2xl font-black text-sm transition-all shadow-lg shadow-red-200 uppercase tracking-widest flex items-center justify-center gap-3"
                                onClick={() => router.push('/loans')}
                            >
                                DEMANDER CE PRÊT
                                <ArrowRight size={18} />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Tag */}
            {step === 1 && (
                <div className="px-8 pb-8 pt-0 flex items-center gap-2 text-green-500">
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">Réponse de principe immédiate</span>
                </div>
            )}
        </div>
    );
};

export default LoanStepForm;

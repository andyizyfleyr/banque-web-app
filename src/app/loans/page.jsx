"use client";
import React, { useState, useEffect } from 'react';
import {
    Check,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    Save,
    Building2,
    Calendar,
    Home,
    Car,
    Briefcase,
    GraduationCap,
    TrendingUp,
    Info,
    Wallet,
    Users,
    Landmark,
    Upload,
    FileText,
    Shield,
    MessageSquare,
    X,
    CheckCircle
} from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import {
    AreaChart,
    Area,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { currencies } from '@/config/currencies';
import { useLocale } from '@/contexts/LocaleContext';

const Loans = () => {
    const { user } = useAuth();
    const { t, fc } = useLocale();
    const [amount, setAmount] = useState(25000);
    const [months, setMonths] = useState(24);
    const [isLoading, setIsLoading] = useState(false); // For save button
    const [loading, setLoading] = useState(true); // For page content
    const [isMounted, setIsMounted] = useState(false);
    const [myLoans, setMyLoans] = useState([]);
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState(null);
    const [financialInfo, setFinancialInfo] = useState({
        monthlyIncome: '3500',
        employmentStatus: 'permanent',
        housingStatus: 'owner',
        existingLoans: '0'
    });
    const [loanCurrency, setLoanCurrency] = useState('EUR');

    // Document & Justification State
    const [loanPurpose, setLoanPurpose] = useState('');
    const [loanPurposeDetail, setLoanPurposeDetail] = useState('');
    const [identityDoc, setIdentityDoc] = useState(null);
    const [addressProof, setAddressProof] = useState(null);

    const hasSubmittedBefore = myLoans.length > 0;

    const loanTypes = [
        { id: 'personal', label: t('loans.personalLoan'), icon: Users, rate: 0.02, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'mortgage', label: t('loans.mortgageLoan'), icon: Home, rate: 0.02, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'auto', label: t('loans.autoLoan'), icon: Car, rate: 0.02, color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'business', label: t('loans.businessLoan'), icon: Briefcase, rate: 0.02, color: 'text-indigo-600', bg: 'bg-indigo-50' }
    ];

    useEffect(() => {
        setIsMounted(true);
        if (user) fetchLoans();
    }, [user]);

    const fetchLoans = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('loans')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setMyLoans(data);
        } catch (error) {
            console.error('Error fetching loans:', error);
            toast.error(t('loans.loadError'));
        } finally {
            setLoading(false);
        }
    };

    // Loan Calculation (Amortization Formula)
    const currentRate = selectedType ? loanTypes.find(t => t.id === selectedType).rate : 0.045;
    const monthlyRate = currentRate / 12;
    // Formula: M = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1));
    const totalRepayment = (monthlyPayment * months);
    const totalCost = totalRepayment - amount;

    const handleSaveLoan = async () => {
        if (!user) return;
        setIsLoading(true);

        const newLoan = {
            user_id: user.id,
            amount: amount,
            remaining_balance: amount,
            interest_rate: currentRate * 100, // Store as percentage
            duration_months: months,
            monthly_payment: monthlyPayment,
            start_date: new Date().toISOString(),
            status: 'pending_approval',
            created_at: new Date().toISOString(),
            type: selectedType,
            currency: loanCurrency,
            monthly_income: Number(financialInfo.monthlyIncome),
            professional_situation: financialInfo.employmentStatus,
            housing_status: financialInfo.housingStatus
        };

        const { error } = await supabase.from('loans').insert([newLoan]);

        if (error) {
            toast.error(t('loans.submitError'));
            console.error(error);
        } else {
            setStep(6); // Success step
            fetchLoans();
        }
        setIsLoading(false);
    };

    // Generate Chart Data
    const generateChartData = () => {
        const data = [];
        const currentMonthlyPayment = monthlyPayment;
        let remainingBalance = amount;
        let totalInterestPaid = 0;

        for (let i = 1; i <= months; i++) {
            const interestPaid = remainingBalance * monthlyRate;
            const principalPaid = currentMonthlyPayment - interestPaid;
            remainingBalance -= principalPaid;
            totalInterestPaid += interestPaid;

            if (i % 12 === 0 || i === months) {
                const year = Math.ceil(i / 12);
                data.push({
                    year: `${t('loans.year')} ${year}`,
                    Capital: Math.max(0, amount - remainingBalance),
                    [t('loans.interest')]: totalInterestPaid
                });
            }
        }
        return data;
    };

    const chartData = generateChartData();

    if (!isMounted) return null;

    return (
        <PageWrapper className="pb-24 space-y-8">
            {loading ? (
                <div className="space-y-8">
                    {/* Header Skeleton */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-64" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-12 w-40 rounded-xl" />
                    </div>

                    {/* Summary Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 space-y-3">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-32" />
                            </div>
                        ))}
                    </div>

                    {/* Loans List Skeleton */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <div className="p-6 space-y-6">
                            {[1, 2].map((i) => (
                                <div key={i} className="p-6 border rounded-2xl space-y-4">
                                    <div className="flex justify-between">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="w-10 h-10 rounded-full" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-6 w-24 rounded-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-3 w-16" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                        <Skeleton className="h-2 w-full rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between max-w-4xl mx-auto relative hidden sm:flex">
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full overflow-hidden">
                                <div className="bg-[#E63746] h-full transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }}></div>
                            </div>
                            {[{ n: 1, label: t('loans.stepCategory') }, { n: 2, label: t('loans.stepSimulation') }, { n: 3, label: t('loans.stepSituation') }, { n: 4, label: t('loans.stepDocuments') }, { n: 5, label: t('loans.stepValidation') }].map((s) => (
                                <div key={s.n} className="flex flex-col items-center gap-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${step > s.n ? 'bg-green-500 text-white' : step === s.n ? 'bg-[#E63746] text-white ring-4 ring-red-100' : 'bg-gray-200 text-gray-600'}`}>
                                        {step > s.n ? <Check size={20} /> : <span className="font-bold">{s.n}</span>}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= s.n ? 'text-[#1D3557]' : 'text-gray-400'}`}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="max-w-5xl mx-auto space-y-6">

                        {step === 1 && (
                            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 overflow-x-auto md:overflow-visible gap-6 pb-4 pt-2 md:pb-0 md:pt-0 snap-x hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0 animate-fade-in">
                                {loanTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            setSelectedType(type.id);
                                            setStep(2);
                                        }}
                                        className={`min-w-[70vw] md:min-w-0 snap-center p-8 bg-white rounded-3xl border transition-all hover:shadow-xl group relative flex flex-col items-center text-center gap-4 ${selectedType === type.id ? 'border-[#E63746] ring-2 ring-red-100' : 'border-gray-100 hover:border-red-100'}`}
                                    >
                                        <div className={`w-16 h-16 rounded-2xl ${type.bg} ${type.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <type.icon size={32} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#1D3557] mb-1">{type.label}</h3>
                                            <p className="text-xs text-gray-500">{t('loans.startingFrom')} {(type.rate * 100).toFixed(2)}%</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Simulator */}
                                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-end items-center mb-8">
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#E63746] text-white">
                                                {loanTypes.find(t => t.id === selectedType)?.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Sliders */}
                                    <div className="space-y-12 mb-12">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <label className="text-xs font-bold text-gray-500 uppercase">{t('loans.loanAmount')}</label>
                                                <div className="text-2xl font-black text-[#1D3557]">{fc(amount)}</div>
                                            </div>
                                            <input
                                                type="range"
                                                min="1000"
                                                max="100000"
                                                step="1000"
                                                value={amount}
                                                onChange={(e) => setAmount(Number(e.target.value))}
                                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#E63746]"
                                            />
                                            <div className="flex justify-between text-[10px] font-medium text-gray-400">
                                                <span>{fc(1000, loanCurrency)}</span>
                                                <span>{fc(100000, loanCurrency)}</span>
                                            </div>
                                        </div>


                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <label className="text-sm font-bold text-gray-600 uppercase">{t('loans.durationMonths')}</label>
                                                <div className="text-3xl font-black text-[#1D3557]">{months} <span className="text-lg text-gray-600 font-medium">{t('loans.monthsUnit')}</span></div>
                                            </div>
                                            <input
                                                type="range"
                                                min="6"
                                                max="84"
                                                step="6"
                                                value={months}
                                                onChange={(e) => setMonths(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#E63746]"
                                            />
                                            <div className="flex justify-between text-xs font-medium text-gray-600">
                                                <span>6 {t('loans.monthsUnit')}</span>
                                                <span>84 {t('loans.monthsUnit')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Instant Calculation Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-100">
                                        <div className="p-4 bg-[#E63746]/5 rounded-2xl border border-[#E63746]/10 text-center md:text-left">
                                            <p className="text-[10px] font-black text-[#E63746] uppercase tracking-widest mb-1">{t('loans.monthlyPayment')}</p>
                                            <p className="text-xl font-black text-[#E63746]">{fc(monthlyPayment, loanCurrency)} / {t('loans.monthsUnit')}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl bg-gray-50 flex flex-col justify-center">
                                                <p className="text-[10px] font-bold text-gray-600 uppercase">{t('loans.interestRate')}</p>
                                                <p className="text-lg font-bold text-[#1D3557]">{(currentRate * 100).toFixed(2)}%</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-gray-50 flex flex-col justify-center">
                                                <p className="text-[10px] font-bold text-gray-600 uppercase">{t('loans.apr') || 'TAEG'}</p>
                                                <p className="text-lg font-bold text-green-700">{(currentRate * 1.1 * 100).toFixed(2)}%</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t('loans.desiredAmount')}</p>
                                                <span className="text-xl font-black text-[#E63746]">{fc(amount, loanCurrency)}</span>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t('loans.totalAmount')}</p>
                                                <span className="text-xl font-black text-[#1D3557]">{fc(totalRepayment, loanCurrency)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}

                        {step === 3 && (
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-fade-in space-y-8">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-[#1D3557]">{t('loans.financialInfo')}</h2>
                                    <p className="text-gray-500 text-sm">{t('loans.financialInfoDesc')}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase">{t('loans.netMonthlyIncome')}</label>
                                        <div className="relative">
                                            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="number"
                                                value={financialInfo.monthlyIncome}
                                                onChange={(e) => setFinancialInfo({ ...financialInfo, monthlyIncome: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#E63746]/20 transition-all outline-none font-bold text-[#1D3557]"
                                                placeholder={t('loans.exIncome') || "ex: 2500"}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase">{t('loans.employmentStatus')}</label>
                                        <select
                                            value={financialInfo.employmentStatus}
                                            onChange={(e) => setFinancialInfo({ ...financialInfo, employmentStatus: e.target.value })}
                                            className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#E63746]/20 transition-all outline-none font-bold text-[#1D3557]"
                                        >
                                            <option value="permanent">{t('loans.permanent')}</option>
                                            <option value="fixedTerm">{t('loans.fixedTerm')}</option>
                                            <option value="selfEmployed">{t('loans.selfEmployed')}</option>
                                            <option value="civilServant">{t('loans.civilServant')}</option>
                                            <option value="student">{t('loans.student')}</option>
                                            <option value="other">{t('loans.other')}</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase">{t('loans.housing')}</label>
                                        <select
                                            value={financialInfo.housingStatus}
                                            onChange={(e) => setFinancialInfo({ ...financialInfo, housingStatus: e.target.value })}
                                            className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#E63746]/20 transition-all outline-none font-bold text-[#1D3557]"
                                        >
                                            <option value="owner">{t('loans.owner')}</option>
                                            <option value="tenant">{t('loans.tenant')}</option>
                                            <option value="hostedFree">{t('loans.hostedFree')}</option>
                                            <option value="companyHousing">{t('loans.companyHousing')}</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase">{t('loans.existingLoans')}</label>
                                        <input
                                            type="number"
                                            value={financialInfo.existingLoans}
                                            onChange={(e) => setFinancialInfo({ ...financialInfo, existingLoans: e.target.value })}
                                            className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#E63746]/20 transition-all outline-none font-bold text-[#1D3557]"
                                            placeholder={t('loans.exLoans') || "ex: 350"}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Documents & Justification */}
                        {step === 4 && (
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-fade-in space-y-8">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-[#1D3557] flex items-center gap-3">
                                        <Shield className="text-[#E63746]" size={28} />
                                        {t('loans.documentsMotivation')}
                                    </h2>
                                    <p className="text-gray-500 text-sm">{t('loans.documentsDesc')}</p>
                                </div>

                                {/* Loan Purpose */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-[#1D3557] uppercase tracking-wider flex items-center gap-2">
                                        <MessageSquare size={16} className="text-[#E63746]" />
                                        {t('loans.whyLoan')}
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {[
                                            { id: 'achat_immobilier', label: t('loans.purposeRealEstate'), icon: '🏠' },
                                            { id: 'achat_vehicule', label: t('loans.purposeVehicle'), icon: '🚗' },
                                            { id: 'travaux', label: t('loans.purposeRenovation'), icon: '🔨' },
                                            { id: 'etudes', label: t('loans.purposeEducation'), icon: '🎓' },
                                            { id: 'tresorerie', label: t('loans.purposeCashflow'), icon: '💰' },
                                            { id: 'autre', label: t('loans.purposeOther'), icon: '📋' }
                                        ].map((purpose) => (
                                            <button
                                                key={purpose.id}
                                                onClick={() => setLoanPurpose(purpose.id)}
                                                className={`p-4 rounded-xl border-2 transition-all text-left ${loanPurpose === purpose.id ? 'border-[#E63746] bg-red-50/30 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
                                            >
                                                <span className="text-xl mb-2 block">{purpose.icon}</span>
                                                <span className="text-sm font-bold text-[#1D3557]">{purpose.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={loanPurposeDetail}
                                        onChange={(e) => setLoanPurposeDetail(e.target.value)}
                                        placeholder={t('loans.describeProject')}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#E63746]/20 transition-all outline-none text-sm text-[#1D3557] resize-none"
                                    />
                                </div>

                                {/* Document Uploads */}
                                {!hasSubmittedBefore && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-[#1D3557] uppercase tracking-wider flex items-center gap-2">
                                            <FileText size={16} className="text-[#E63746]" />
                                            {t('loans.supportingDocs')}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Identity Document */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">{t('loans.identityDoc')}</label>
                                                <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${identityDoc ? 'border-green-300 bg-green-50/50' : 'border-gray-200 bg-gray-50/50 hover:border-[#E63746]/30 hover:bg-red-50/20'}`}>
                                                    {identityDoc ? (
                                                        <div className="flex items-center gap-3 justify-center">
                                                            <CheckCircle className="text-green-500" size={22} />
                                                            <div className="text-left">
                                                                <p className="text-sm font-bold text-[#1D3557] truncate max-w-[180px]">{identityDoc.name}</p>
                                                                <p className="text-[10px] text-gray-400">{(identityDoc.size / 1024).toFixed(0)} {t('common.kb') || 'Ko'}</p>
                                                            </div>
                                                            <button onClick={() => setIdentityDoc(null)} className="ml-2 w-7 h-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors">
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="cursor-pointer space-y-2 block">
                                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                                                <Upload size={20} className="text-gray-400" />
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-500">{t('loans.clickToUpload')}</p>
                                                            <p className="text-[10px] text-gray-400">{t('loans.fileFormats')}</p>
                                                            <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => e.target.files[0] && setIdentityDoc(e.target.files[0])} />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Proof of Address */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">{t('loans.addressProof')}</label>
                                                <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${addressProof ? 'border-green-300 bg-green-50/50' : 'border-gray-200 bg-gray-50/50 hover:border-[#E63746]/30 hover:bg-red-50/20'}`}>
                                                    {addressProof ? (
                                                        <div className="flex items-center gap-3 justify-center">
                                                            <CheckCircle className="text-green-500" size={22} />
                                                            <div className="text-left">
                                                                <p className="text-sm font-bold text-[#1D3557] truncate max-w-[180px]">{addressProof.name}</p>
                                                                <p className="text-[10px] text-gray-400">{(addressProof.size / 1024).toFixed(0)} {t('common.kb') || 'Ko'}</p>
                                                            </div>
                                                            <button onClick={() => setAddressProof(null)} className="ml-2 w-7 h-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors">
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="cursor-pointer space-y-2 block">
                                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                                                <Upload size={20} className="text-gray-400" />
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-500">{t('loans.clickToUpload')}</p>
                                                            <p className="text-[10px] text-gray-400">{t('loans.addressProofFormats')}</p>
                                                            <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => e.target.files[0] && setAddressProof(e.target.files[0])} />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Security Note */}
                                <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-700">
                                    <Shield className="flex-shrink-0" size={18} />
                                    <p className="text-xs font-medium">{t('loans.securityNote')}</p>
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Landmark size={120} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#1D3557] mb-8">{t('loans.applicationSummary')}</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('loans.loanDetails')}</h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                    <span className="text-gray-500 font-medium">{t('loans.type')}</span>
                                                    <span className="font-bold text-[#1D3557]">{loanTypes.find(t => t.id === selectedType)?.label}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                    <span className="text-gray-500 font-medium">{t('loans.amount')}</span>
                                                    <span className="text-xl font-black text-[#E63746]">{fc(amount, loanCurrency)}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                    <span className="text-gray-500 font-medium">{t('loans.duration')}</span>
                                                    <span className="font-bold text-[#1D3557]">{months} {t('loans.monthsUnit')}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                    <span className="text-gray-500 font-medium">{t('loans.monthlyPayment')}</span>
                                                    <span className="font-bold text-[#1D3557]">{fc(monthlyPayment, loanCurrency)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('loans.financialDetails')}</h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                    <span className="text-gray-500 font-medium">{t('loans.monthlyIncome')}</span>
                                                    <span className="font-bold text-[#1D3557]">{fc(Number(financialInfo.monthlyIncome), loanCurrency)}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                    <span className="text-gray-500 font-medium">{t('loans.situation')}</span>
                                                    <span className="font-bold text-[#1D3557]">{t(`loans.${financialInfo.employmentStatus}`)}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                    <span className="text-gray-500 font-medium">{t('loans.housing')}</span>
                                                    <span className="font-bold text-[#1D3557]">{t(`loans.${financialInfo.housingStatus}`)}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                    <span className="text-gray-500 font-medium">{t('loans.debtCapacity')}</span>
                                                    <span className={`font-bold ${Number(monthlyPayment) < (Number(financialInfo.monthlyIncome) * 0.35) ? 'text-green-600' : 'text-orange-600'}`}>
                                                        {Number(monthlyPayment) < (Number(financialInfo.monthlyIncome) * 0.35) ? t('loans.optimal') : t('loans.underReview')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Justificatifs Summary */}
                                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Shield size={14} />
                                        {t('loans.documentsMotivation')}
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                            <span className="text-gray-500 font-medium">{t('loans.loanPurpose')}</span>
                                            <span className="font-bold text-[#1D3557]">
                                                {loanPurpose === 'achat_immobilier' ? `🏠 ${t('loans.purposeRealEstate')}` :
                                                    loanPurpose === 'achat_vehicule' ? `🚗 ${t('loans.purposeVehicle')}` :
                                                        loanPurpose === 'travaux' ? `🔨 ${t('loans.purposeRenovation')}` :
                                                            loanPurpose === 'etudes' ? `🎓 ${t('loans.purposeEducation')}` :
                                                                loanPurpose === 'tresorerie' ? `💰 ${t('loans.purposeCashflow')}` : `📋 ${t('loans.purposeOther')}`}
                                            </span>
                                        </div>
                                        {loanPurposeDetail && (
                                            <div className="py-3 border-b border-gray-50">
                                                <span className="text-gray-500 font-medium text-sm block mb-1">{t('loans.projectDetail')}</span>
                                                <p className="text-sm text-[#1D3557] italic">&quot;{loanPurposeDetail}&quot;</p>
                                            </div>
                                        )}
                                        {!hasSubmittedBefore ? (
                                            <>
                                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                    <span className="text-gray-500 font-medium">{t('loans.identityDoc')}</span>
                                                    <span className="flex items-center gap-2 font-bold text-green-600">
                                                        <CheckCircle size={16} />
                                                        {identityDoc?.name}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                    <span className="text-gray-500 font-medium">{t('loans.addressProof')}</span>
                                                    <span className="flex items-center gap-2 font-bold text-green-600">
                                                        <CheckCircle size={16} />
                                                        {addressProof?.name}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                <span className="text-gray-500 font-medium">{t('loans.supportingDocs')}</span>
                                                <span className="flex items-center gap-2 font-bold text-green-600">
                                                    <CheckCircle size={16} />
                                                    {t('loans.docsAlreadySubmitted') || 'Déjà fournis'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-700">
                                    <Info className="flex-shrink-0" />
                                    <p className="text-xs font-medium leading-relaxed">
                                        {t('loans.submitDisclaimer')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="max-w-2xl mx-auto py-12 text-center space-y-8 animate-fade-in">
                                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100 animate-bounce">
                                    <Check size={48} strokeWidth={3} />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black text-[#1D3557]">{t('loans.applicationSent')}</h2>
                                    <p className="text-gray-500 text-lg">{t('loans.applicationPending')} #{Math.floor(Math.random() * 900000 + 100000)}</p>
                                </div>
                                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                                    <div className="flex items-center justify-between text-left p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                <Calendar className="text-blue-600" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-[#1D3557]">{t('loans.estimatedDelay')}</p>
                                                <p className="text-sm text-gray-500">{t('loans.lessThan24h')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-full">{t('loans.pending')}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setStep(1);
                                            setSelectedType(null);
                                        }}
                                        className="w-full py-4 bg-[#1D3557] text-white rounded-2xl font-bold shadow-xl shadow-blue-900/10 hover:bg-[#1D3557]/90 transition-all flex items-center justify-center gap-2"
                                    >
                                        {t('loans.backToLoans')}
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <>
                                {/* User's Active Loans */}
                                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="text-xl font-bold text-[#1D3557] mb-6">{t('loans.currentApplications')}</h3>
                                    {myLoans && myLoans.length === 0 ? (
                                        <div className="text-center text-gray-500 py-8">{t('loans.noLoans')}</div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {myLoans?.map((loan) => (
                                                <div key={loan.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow relative overflow-hidden">
                                                    <div className={`absolute top-0 right-0 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase ${loan.status === 'active' ? 'bg-green-500' : loan.status === 'pending_approval' ? 'bg-orange-500' : 'bg-gray-500'}`}>
                                                        {loan.status === 'pending_approval' ? t('loans.underStudy') : (loan.status === 'active' ? t('loans.active') || 'Actif' : loan.status)}
                                                    </div>
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1D3557]">
                                                            {loan.type === 'auto' ? <Car size={20} /> : loan.type === 'mortgage' ? <Home size={20} /> : <Building2 size={20} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-[#1D3557]">{fc(Number(loan.amount), loan.currency)}</p>
                                                            <p className="text-xs text-gray-500">{loan.duration_months} {t('loans.monthsUnit')} {t('loans.at')} {loan.interest_rate}%</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs">
                                                        <span className="flex items-center gap-1 text-gray-500">
                                                            <Calendar size={12} /> {loan.start_date ? new Date(loan.start_date).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                        <span className="font-bold text-[#1D3557]">{t('loans.fileNo')}{loan.id.slice(0, 8)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Navigation Footer Bar */}
                    {step < 6 && (
                        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 py-4 md:py-6 z-40 transition-all">
                            <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center gap-2">
                                <div className="p-3 md:p-4 bg-gray-50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4 flex-1 md:flex-none">
                                    <span className="text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-widest">{t('loans.monthlyPayment')}</span>
                                    <p className="text-sm md:text-xl font-black text-[#1D3557]">{fc(monthlyPayment, loanCurrency)}</p>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3">
                                    {step > 1 && (
                                        <button
                                            onClick={() => setStep(step - 1)}
                                            className="flex items-center justify-center w-12 h-12 md:w-auto md:px-6 md:py-4 rounded-xl font-bold bg-[#1D3557] text-white hover:bg-[#1D3557]/80 shadow-md transition-all"
                                        >
                                            <ArrowLeft size={20} />
                                            <span className="hidden md:inline ml-2">{t('common.back')}</span>
                                        </button>
                                    )}
                                    <button
                                        disabled={(step === 1 && !selectedType) || (step === 4 && (!loanPurpose || (!hasSubmittedBefore && (!identityDoc || !addressProof)))) || isLoading}
                                        onClick={() => step < 5 ? setStep(step + 1) : handleSaveLoan()}
                                        className="bg-[#E63746] text-white px-4 py-3 md:px-10 md:py-4 rounded-xl font-bold text-sm md:text-base shadow-lg shadow-red-200 hover:bg-[#E63746]/90 transition-all transform active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                {step === 5 ? t('loans.submitApplication') : t('loans.nextStep')}
                                                <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </PageWrapper>
    );
};

export default Loans;


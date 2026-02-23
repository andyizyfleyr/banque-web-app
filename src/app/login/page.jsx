"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Landmark,
    Mail,
    Lock,
    User,
    ArrowRight,
    Loader2,
    AlertCircle,
    Fingerprint,
    ShieldCheck,
    Globe,
    ChevronDown
} from 'lucide-react';
import { countries } from '@/config/countries';
import toast from 'react-hot-toast';
import { useLocale } from '@/contexts/LocaleContext';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const { t, countryCode: currentCountryCode, changeCountry } = useLocale();
    const [countryCode, setCountryCode] = useState(currentCountryCode || 'FR');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const { signIn, signUp } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn({ email, password });
                if (error) throw error;
                router.push('/dashboard');
            } else {
                const { data, error } = await signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            country: countryCode
                        },
                    },
                });

                if (error) throw error;

                if (data?.session) {
                    toast.success(t('login.accountCreatedSuccess'));
                    router.push('/dashboard');
                } else {
                    toast.success(t('login.accountCreatedConfirm'));
                    setIsLogin(true);
                }
            }
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-[#F1F5F9] flex relative overflow-hidden font-sans">
            {/* Background Texture/Gradient */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-[50vh] bg-[#e63746] rounded-b-[3rem] lg:rounded-b-[5rem] shadow-2xl"></div>
                {/* Decorative circles */}
                <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-black/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-6xl mx-auto flex items-start justify-center p-4 lg:p-8 min-h-screen lg:items-center">
                <div className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row lg:min-h-[600px] border border-white/20 mt-16 md:mt-24 lg:mt-0">

                    {/* Left Side: Brand & Visuals */}
                    <div className="hidden lg:flex lg:w-[45%] bg-[#e63746] p-12 text-white flex-col justify-between relative overflow-hidden">
                        {/* Abstract shapes */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1D3557]/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-12">
                                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                                    <Landmark className="text-white" size={28} />
                                </div>
                                <span className="text-2xl font-black tracking-tighter">REDBANK <span className="text-[#1D3557]">ELITE.</span></span>
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                                {t('login.heroTitle1')} <br />
                                <span className="text-[#1D3557]">{t('login.heroTitle2')}</span>
                            </h1>
                            <p className="text-white/80 text-lg leading-relaxed max-w-sm">
                                {t('login.heroSubtitle')}
                            </p>
                        </div>

                        <div className="relative z-10 mt-12 space-y-4">
                            <div className="flex items-center gap-4 text-sm font-medium text-white/90">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                                    <ShieldCheck size={16} />
                                </div>
                                {t('login.securityAES')}
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium text-white/90">
                                <div className="w-8 h-8 rounded-full bg-[#1D3557]/20 flex items-center justify-center text-[#1D3557]">
                                    <Globe size={16} />
                                </div>
                                {t('login.intlAccess')}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="w-full lg:w-[55%] p-6 md:p-12 lg:p-16 flex flex-col justify-start lg:justify-center bg-white relative pt-10 lg:pt-16">
                        <div className="max-w-md mx-auto w-full">
                            {/* Mobile Logo */}
                            <div className="flex lg:hidden items-center justify-center gap-2 mb-8 mt-2">
                                <div className="p-2 bg-[#1D3557] rounded-xl shadow-md">
                                    <Landmark className="text-[#e63746]" size={20} />
                                </div>
                                <span className="text-xl font-black tracking-tighter text-[#1D3557]">REDBANK <span className="text-[#e63746]">ELITE.</span></span>
                            </div>

                            <div className="mb-10">
                                <h2 className="text-3xl font-black text-[#1D3557] tracking-tight mb-2">
                                    {isLogin ? t('login.login') : t('login.createAccount')}
                                </h2>
                                <p className="text-gray-400 font-medium text-sm">
                                    {isLogin
                                        ? t('login.loginDesc')
                                        : t('login.registerDesc')}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <AnimatePresence mode='wait'>
                                    {!isLogin && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <User size={18} className="text-gray-400 group-focus-within:text-[#e63746] transition-colors" />
                                                </div>
                                                <input
                                                    type="text"
                                                    required={!isLogin}
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-semibold text-[#1D3557] focus:bg-white focus:border-[#e63746] focus:ring-0 transition-all outline-none placeholder:text-gray-300"
                                                    placeholder={t('login.fullName')}
                                                />
                                            </div>

                                            <div className="relative group mt-5">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Globe size={18} className="text-gray-400 group-focus-within:text-[#e63746] transition-colors" />
                                                </div>
                                                <select
                                                    value={countryCode}
                                                    onChange={(e) => {
                                                        const code = e.target.value;
                                                        setCountryCode(code);
                                                        changeCountry(code);
                                                    }}
                                                    className="block w-full pl-12 pr-10 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-semibold text-[#1D3557] focus:bg-white focus:border-[#e63746] focus:ring-0 transition-all outline-none appearance-none cursor-pointer"
                                                >
                                                    {countries.map(c => (
                                                        <option key={c.code} value={c.code}>{c.flag} {c.country}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                    <ChevronDown size={18} className="text-gray-400" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail size={18} className="text-gray-400 group-focus-within:text-[#e63746] transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-semibold text-[#1D3557] focus:bg-white focus:border-[#e63746] focus:ring-0 transition-all outline-none placeholder:text-gray-300"
                                        placeholder={t('login.emailPlaceholder')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={18} className="text-gray-400 group-focus-within:text-[#e63746] transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-semibold text-[#1D3557] focus:bg-white focus:border-[#e63746] focus:ring-0 transition-all outline-none placeholder:text-gray-300"
                                            placeholder={t('login.password')}
                                        />
                                    </div>
                                    {isLogin && (
                                        <div className="flex justify-end">
                                            <button type="button" className="text-xs font-bold text-[#e63746] hover:text-[#C1121F] transition-colors">
                                                {t('login.forgotPassword')}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium"
                                    >
                                        <AlertCircle size={18} />
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#1D3557] text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-[#152744] active:scale-[0.98] transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 group"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            {isLogin ? t('login.signIn') : t('login.signUp')}
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="mt-8 text-center text-sm font-medium text-gray-500">
                                {isLogin ? t('login.noAccount') : t('login.alreadyMember')}
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError(null);
                                    }}
                                    className="ml-2 text-[#e63746] font-bold hover:underline focus:outline-none"
                                >
                                    {isLogin ? t('login.createAccount') : t('login.signIn')}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Copyright */}
                <div className="absolute bottom-6 left-0 right-0 text-center text-[#1D3557]/40 text-[10px] font-bold uppercase tracking-widest">
                    &copy; 2026 RedBank Private Core. All rights reserved.
                </div>
            </div>
        </div >
    );
};

export default LoginPage;

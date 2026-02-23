"use client";
import React, { useState, useEffect, useRef } from 'react';
import { countries } from '@/config/countries';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowRightLeft,
    ArrowDownLeft,
    Plus,
    PiggyBank,
    TrendingUp,
    MoreHorizontal,
    ShoppingCart,
    DollarSign,
    Zap,
    Utensils,
    Car,
    ShieldCheck,
    Activity,
    CreditCard,
    Wallet,
    Loader2,
    ArrowRight,
    X,
    Trash2,
    Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/contexts/ConfirmContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    AreaChart,
    Area,
    PieChart,
    Pie,
} from 'recharts';
import { motion } from 'framer-motion';
import { PageWrapper } from '@/components/PageWrapper';
import { CountUp } from '@/components/CountUp';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Skeleton } from '@/components/ui/Skeleton';
import { currencies } from '@/config/currencies';

const Dashboard = () => {
    const { user } = useAuth();
    const confirm = useConfirm();
    const router = useRouter();
    const { t, fc, fcs, cs, cv, language, country } = useLocale();
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savingsRate: 0
    });
    const [totalSavings, setTotalSavings] = useState(0);
    const [allTransactions, setAllTransactions] = useState([]);
    const [isMounted, setIsMounted] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [tempAccountName, setTempAccountName] = useState('');
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountType, setNewAccountType] = useState('checking');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profile, setProfile] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState('EUR');
    const isCreatingAccount = useRef(false);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setProfile(profileData);
            if (profileData?.preferred_currency) {
                setSelectedCurrency(profileData.preferred_currency);
            }

            // Fetch Accounts
            const { data: accountsData, error: accountsError } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', user.id);

            if (accountsError) throw accountsError;
            setAccounts(accountsData || []);
            let currentAccounts = accountsData || [];

            // AUTO-CREATE ACCOUNT IF MISSING (Self-healing for new signups)
            if (currentAccounts.length === 0 && !isCreatingAccount.current) {
                isCreatingAccount.current = true;

                // Double check to prevent race conditions during concurrent loads
                const { count } = await supabase
                    .from('accounts')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                if (count > 0) {
                    isCreatingAccount.current = false;
                    return;
                }

                const userCountry = user.user_metadata?.country || 'FR';
                const fullName = user.user_metadata?.full_name || 'Utilisateur';

                // Determine IBAN/Account prefix based on country
                let finalIban = 'FR76 3000 6000 0102 1234 5678 901'; // Default Fallback
                const c = countries.find(x => x.code === userCountry);
                if (c && c.bankingConfig && c.bankingConfig.accountIdFormat) {
                    finalIban = c.bankingConfig.accountIdFormat.replace(/X/g, () => Math.floor(Math.random() * 10));
                }

                const { data: newAcc, error: createErr } = await supabase.from('accounts').insert([{
                    user_id: user.id,
                    name: (c && c.bankingConfig && c.bankingConfig.accountTypes) ? c.bankingConfig.accountTypes.checking : 'Compte Courant',
                    type: 'checking',
                    balance: 0,
                    currency: c?.currency || 'EUR',
                    iban: finalIban
                }]).select().single();

                if (!createErr && newAcc) {
                    currentAccounts = [newAcc];
                    setAccounts(currentAccounts);

                    // Create profile if missing
                    await supabase.from('profiles').upsert([{
                        id: user.id,
                        full_name: fullName,
                        country: userCountry,
                        preferred_currency: c?.currency || 'EUR'
                    }]);
                }
            }

            // Fetch Savings Goals for Total Savings
            const { data: goalsData, error: goalsError } = await supabase
                .from('goals')
                .select('current_amount')
                .eq('user_id', user.id);

            if (!goalsError && goalsData) {
                const total = goalsData.reduce((sum, g) => sum + (g.current_amount || 0), 0);
                setTotalSavings(total);
            }

            const userAccountIds = (accountsData || []).map(a => a.id);

            // Fetch Recent Transactions (last 5 for activity list)
            let transactionsData = [];
            if (userAccountIds.length > 0) {
                const { data, error: transactionsError } = await supabase
                    .from('transactions')
                    .select(`
                        *,
                        account:accounts(name)
                    `)
                    .in('account_id', userAccountIds)
                    .order('date', { ascending: false })
                    .limit(5);

                if (transactionsError) throw transactionsError;
                transactionsData = data || [];
            }
            setTransactions(transactionsData);

            // Fetch all transactions for charts (last 6 months)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            if (userAccountIds.length > 0) {
                const { data: allTxData } = await supabase
                    .from('transactions')
                    .select('amount, date, category, description')
                    .in('account_id', userAccountIds)
                    .gte('date', sixMonthsAgo.toISOString().split('T')[0])
                    .order('date', { ascending: true });
                setAllTransactions(allTxData || []);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        if (user) {
            fetchDashboardData();
        }
    }, [user]); // Re-run if user changes

    // Guard against rendering client-side specific components or data before mounting
    if (!isMounted) return null;

    const handleAddAccount = async (e) => {
        e.preventDefault();
        if (accounts.length >= 3) return;
        if (!newAccountName.trim()) return;

        try {
            setIsSubmitting(true);

            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

            if (authError || !authUser) {
                throw new Error(t('common.error'));
            }

            // Determine IBAN/Account prefix based on country
            let finalIban = 'FR76 3000 6000 0102 1234 5678 901'; // Default Fallback
            const userCountry = profile?.country || authUser.user_metadata?.country || 'FR';
            const c = countries.find(x => x.code === userCountry);
            if (c && c.bankingConfig && c.bankingConfig.accountIdFormat) {
                finalIban = c.bankingConfig.accountIdFormat.replace(/X/g, () => Math.floor(Math.random() * 10));
            }

            const newAccountData = {
                user_id: authUser.id,
                name: newAccountName,
                type: newAccountType,
                balance: 0,
                iban: finalIban,
                currency: c?.currency || selectedCurrency
            };

            const { error: insertError } = await supabase
                .from('accounts')
                .insert([newAccountData]);

            if (insertError) throw insertError;

            await fetchDashboardData();
            setIsAddModalOpen(false);
            setNewAccountName('');
            toast.success(t('common.success'));
        } catch (error) {
            console.error('Account Creation Error:', error);
            toast.error(`${t('common.error')}: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        console.log('DEBUG: handleUpdateAccount called');
        if (!tempAccountName.trim() || !editingAccount) {
            console.log('DEBUG: Update aborted - missing name or account');
            return;
        }

        try {
            setIsSubmitting(true);
            console.log('DEBUG: Attempting to update account', editingAccount.id, 'to', tempAccountName);
            const { data, error } = await supabase
                .from('accounts')
                .update({ name: tempAccountName })
                .eq('id', editingAccount.id)
                .select();

            if (error) {
                console.error('DEBUG: Supabase Update Error:', error);
                throw error;
            }

            console.log('DEBUG: Update successful, data:', data);
            await fetchDashboardData();
            setIsEditModalOpen(false);
            setEditingAccount(null);
            toast.success(t('common.success'));
        } catch (error) {
            console.error('Detailed Update Error:', error);
            toast.error(`${t('common.error')}: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAccount = async (accountId) => {
        const isConfirmed = await confirm({
            title: t('dashboard.deleteAccount'),
            message: t('dashboard.deleteAccount'),
            confirmText: t('common.delete'),
            cancelText: t('common.cancel'),
            variant: 'danger'
        });

        if (!isConfirmed) return;

        try {
            setIsSubmitting(true);
            const { error } = await supabase
                .from('accounts')
                .delete()
                .eq('id', accountId);

            if (error) throw error;

            await fetchDashboardData();
            toast.success(t('common.success'));
        } catch (error) {
            console.error('Delete Error:', error);
            toast.error(`${t('common.error')}: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isMounted) return null;

    const checkingAccount = accounts.find(acc => acc.type === 'checking') || accounts[0];
    const savingsAccount = accounts.find(acc => acc.type === 'savings');

    // FIX: Multi-currency balance calculation
    // Calculate Total Checking Balance (sum of all checking accounts converted to display currency)
    const totalCheckingBalance = accounts
        .filter(acc => acc.type === 'checking')
        .reduce((sum, acc) => sum + cv(parseFloat(acc.balance), acc.currency), 0);

    // Calculate Total Savings (sum of all savings accounts + goals, all converted)
    const totalSavingsBalance = accounts
        .filter(acc => acc.type === 'savings')
        .reduce((sum, acc) => sum + cv(parseFloat(acc.balance), acc.currency), 0)
        + cv(totalSavings, profile?.preferred_currency);

    // Icon mapping for transactions
    const getTransactionIcon = (category) => {
        switch (category?.toLowerCase()) {
            case 'shopping': return ShoppingCart;
            case 'salary': return DollarSign;
            case 'bills': return Zap;
            case 'food': return Utensils;
            case 'transport': return Car;
            default: return Activity;
        }
    };

    const getTransactionColor = (category, amount) => {
        if (amount > 0) return 'bg-green-100 text-green-600';
        switch (category?.toLowerCase()) {
            case 'shopping': return 'bg-orange-100 text-orange-600';
            case 'bills': return 'bg-blue-100 text-blue-600';
            case 'food': return 'bg-purple-100 text-purple-600';
            case 'transport': return 'bg-yellow-100 text-yellow-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (loading) {
        return (
            <PageWrapper className="pb-12 space-y-10">
                {/* Portfolio Overview Skeletons */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 lg:col-start-3 h-[200px] md:h-[300px] rounded-3xl bg-gray-100 animate-pulse"></div>
                </div>

                {/* Accounts Grid Skeletons */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <div className="w-48 h-8 bg-gray-100 rounded-lg animate-pulse"></div>
                        <div className="w-32 h-6 bg-gray-100 rounded-md animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-6 rounded-3xl border-2 border-gray-100 bg-white h-[180px] animate-pulse"></div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions Skeletons */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <div className="w-60 h-8 bg-gray-100 rounded-lg animate-pulse"></div>
                        <div className="w-24 h-6 bg-gray-100 rounded-md animate-pulse"></div>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-100 animate-pulse">
                                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="pb-12 space-y-10">
            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-8 lg:col-start-3 bg-gradient-to-br from-[#E63946] to-[#F77F00] rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[200px] md:min-h-[300px] border border-white/10"
                >
                    {/* Abstract decoration */}
                    <div className="absolute bottom-0 right-0 w-1/2 opacity-30 pointer-events-none">
                        <svg className="w-full" fill="none" viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 120C50 110 80 140 120 100C160 60 200 110 250 80C300 50 350 70 400 20" stroke="white" strokeLinecap="round" strokeWidth="4"></path>
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <p className="text-white/80 font-black uppercase tracking-[0.2em] text-[10px] mb-1">{t('dashboard.totalBalance')}</p>
                        <h1 className="text-5xl lg:text-7xl font-extrabold mb-3 tracking-tighter text-white">
                            <CountUp value={totalCheckingBalance} suffix={` ${cs()}`} decimals={2} />
                        </h1>
                        <p className="text-[10px] font-mono tracking-[0.3em] text-white/60">
                            {country?.bankingConfig?.accountIdLabel || 'IBAN'}: {checkingAccount?.iban ? `XXXX ${checkingAccount.iban.slice(-4)}` : 'XXXX 0000'}
                        </p>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-2 w-full sm:w-auto relative z-10">
                        <button
                            onClick={() => router.push('/transfers')}
                            className="bg-white px-4 py-3.5 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-md active:scale-95 border border-transparent sm:px-6"
                        >
                            <ArrowRightLeft size={16} color="#e63746" />
                            <span style={{ color: '#e63746' }}>{t('nav.transfers')}</span>
                        </button>
                        <button
                            onClick={() => router.push('/cards')}
                            className="bg-red-900/40 backdrop-blur-md text-white border border-white/20 px-4 py-3.5 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-900/60 transition-all active:scale-95 sm:px-6 text-center"
                        >
                            <CreditCard size={16} /> {t('nav.cards')}
                        </button>
                    </div>
                </motion.div>
            </div>


            {/* Accounts Grid */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-[#e63746] rounded-full"></div>
                        <h2 className="text-2xl font-black text-[#1D3557] tracking-tight">{t('dashboard.myAccounts')}</h2>
                    </div>
                    <button className="text-xs font-black text-[#e63746] uppercase tracking-widest hover:opacity-70">{t('common.settings')}</button>
                </div>

                <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4 snap-x hide-scrollbar">
                    {accounts.map((acc, idx) => (
                        <motion.div
                            key={acc.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => router.push('/transactions')}
                            className={`min-w-[85vw] md:min-w-0 snap-center p-6 rounded-3xl border-2 transition-all cursor-pointer h-full relative overflow-hidden group hover:-translate-y-2 ${acc.type === 'checking' ? 'border-gray-100 bg-white shadow-2xl shadow-red-200/50' : 'border-gray-100 bg-white hover:border-gray-200 shadow-xl shadow-gray-200/30'}`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-sm ${acc.type === 'checking' ? 'bg-[#e63746] text-white' : 'bg-[#1D3557]/10 text-[#1D3557]'}`}>
                                    {acc.type === 'checking' ? t('dashboard.checking') : t('dashboard.savingsType')}
                                </span>
                                <div className="flex gap-2 relative z-[30]">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setActiveMenu(activeMenu === acc.id ? null : acc.id);
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-[--color-navy] bg-white shadow-sm active:scale-95"
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {activeMenu === acc.id && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[40] overflow-hidden"
                                        >
                                            <button
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    const { error } = await supabase.rpc('deposit_demo', {
                                                        input_account_id: acc.id,
                                                        input_amount: 100000
                                                    });

                                                    if (error) {
                                                        console.error(error);
                                                        toast.error(t('common.error'));
                                                    } else {
                                                        toast.success(`+${fc(100000, acc.currency)} ✓`);
                                                        fetchDashboardData();
                                                    }
                                                    setActiveMenu(null);
                                                }}
                                                className="w-full px-4 py-3 text-left text-xs font-black text-emerald-600 hover:bg-emerald-50 flex items-center gap-3 transition-colors border-b border-gray-50"
                                            >
                                                <Plus size={16} />
                                                +100K (Test)
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setEditingAccount(acc);
                                                    setTempAccountName(acc.name);
                                                    setIsEditModalOpen(true);
                                                    setActiveMenu(null);
                                                }}
                                                className="w-full px-4 py-3 text-left text-xs font-black text-[--color-navy] hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                            >
                                                <Activity size={16} className="text-blue-500" />
                                                {t('dashboard.editAccount')}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDeleteAccount(acc.id);
                                                    setActiveMenu(null);
                                                }}
                                                className="w-full px-4 py-3 text-left text-xs font-black text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-gray-50"
                                            >
                                                <Trash2 size={16} />
                                                {t('dashboard.deleteAccount')}
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-400 font-bold text-[9px] uppercase tracking-widest mb-1">{country?.bankingConfig?.accountIdLabel || t('dashboard.accountNumber')}</p>
                            <p className="font-mono text-xs mb-6 text-[#1D3557]/60">
                                {acc.iban || 'FR76 XXXX XXXX XXXX'}
                            </p>
                            <div className="flex flex-col">
                                <h4 className="text-[#1D3557] font-black text-4xl tracking-tighter mb-1">
                                    <CountUp value={cv(parseFloat(acc.balance), acc.currency)} suffix={` ${cs(acc.currency)}`} decimals={2} />
                                </h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{acc.name}</p>
                            </div>
                            {/* Background Icon Decoration */}
                            <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 transition-all duration-500 ${acc.type === 'checking' ? 'text-[#e63746]' : 'text-[#1D3557]'}`}>
                                {acc.type === 'checking' && <Wallet size={100} strokeWidth={2.5} />}
                                {acc.type === 'savings' && <PiggyBank size={100} strokeWidth={2.5} />}
                            </div>
                        </motion.div>
                    ))}

                    {/* Add Account Placeholder */}
                    {accounts.length < 3 ? (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="min-w-[85vw] md:min-w-0 snap-center p-6 rounded-3xl border-2 border-[#e63746] bg-[#e63746] text-white hover:bg-[#1D3557] hover:border-[#1D3557] transition-all flex flex-col items-center justify-center gap-4 group min-h-[220px] shadow-xl shadow-red-200/50 active:scale-95"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white group-hover:bg-white/10 transition-all flex items-center justify-center">
                                <Plus size={24} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-white">{t('dashboard.openAccount')}</span>
                        </button>
                    ) : (
                        <div className="min-w-[85vw] md:min-w-0 snap-center p-6 rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center gap-4 min-h-[220px] opacity-60">
                            <ShieldCheck size={32} className="text-gray-400" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center px-4">{t('dashboard.accountLimitReached')}</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Charts Section */}
            {allTransactions.length > 0 && (() => {
                // Compute daily data for the last 30 days (Shopify style)
                const now = new Date();
                const dailyMap = {};
                const last30Days = [];

                for (let i = 29; i >= 0; i--) {
                    const d = new Date(now);
                    d.setDate(d.getDate() - i);
                    const key = d.toISOString().split('T')[0];
                    const localeCode = language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : language === 'de' ? 'de-DE' : language === 'it' ? 'it-IT' : language === 'pt' ? 'pt-PT' : language === 'ro' ? 'ro-RO' : language === 'pl' ? 'pl-PL' : language === 'el' ? 'el-GR' : 'en-US';
                    const label = d.toLocaleDateString(localeCode, { day: '2-digit', month: 'short' });
                    dailyMap[key] = { name: label, fullDate: key, income: 0, expenses: 0, balance: 0 };
                    last30Days.push(key);
                }

                const categoryMap = {};
                allTransactions.forEach(tx => {
                    const d = new Date(tx.date).toISOString().split('T')[0];
                    const amt = parseFloat(tx.amount);

                    if (dailyMap[d]) {
                        if (amt > 0) dailyMap[d].income += amt;
                        else dailyMap[d].expenses += Math.abs(amt);
                    }

                    // Category breakdown (all time or filtered)
                    if (amt < 0) {
                        const cat = tx.category || 'other';
                        categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(amt);
                    }
                });

                // Compute cumulative balance trend
                let runningBalance = totalBalance;
                // Move backwards to find starting balance 30 days ago
                const sortedTxs = [...allTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
                sortedTxs.forEach(tx => {
                    if (new Date(tx.date) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)) {
                        // This transaction is within the last 30 days, so it contributed to the current totalBalance
                        // To find the balance BEFORE this, we subtract it
                    }
                });

                // Simpler approach: build a relative trend line from 0
                const dailyData = last30Days.map(key => dailyMap[key]);

                const catColors = {
                    shopping: '#E63746', food: '#F77F00', transport: '#1D3557',
                    entertainment: '#8B5CF6', utilities: '#06B6D4', health: '#10B981',
                    education: '#EC4899', subscription: '#F59E0B', other: '#6B7280',
                    salary: '#22C55E', transfer: '#3B82F6'
                };
                const catLabels = {
                    shopping: t('categories.shopping'), food: t('categories.food'), transport: t('categories.transport'),
                    entertainment: t('categories.entertainment'), utilities: t('categories.utilities'), health: t('categories.health'),
                    education: t('categories.education'), subscription: t('categories.subscription'), other: t('categories.other'),
                    salary: t('categories.salary'), transfer: t('categories.transfer')
                };

                const categoryData = Object.entries(categoryMap)
                    .map(([key, value]) => ({
                        name: catLabels[key] || key,
                        value: Math.round(value),
                        fill: catColors[key] || '#6B7280'
                    }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5);

                const CustomTooltip = ({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                        return (
                            <div className="bg-white/95 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-2xl border border-gray-100/50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50 pb-1">{label}</p>
                                {payload.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between gap-8 mb-1 last:mb-0">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }}></div>
                                            <span className="text-xs font-bold text-gray-500">{p.name}</span>
                                        </div>
                                        <span className="text-xs font-black text-[#1D3557]">
                                            {fc(Number(p.value), profile?.preferred_currency)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        );
                    }
                    return null;
                };

                return (
                    <section className="mt-12 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-gradient-to-b from-[#E63746] to-[#F77F00] rounded-full"></div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-[#1D3557] tracking-tight">
                                        <span className="hidden md:inline">{t('dashboard.financialAnalysis')}</span>
                                        <span className="md:hidden">Performance</span>
                                    </h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('dashboard.last30Days')}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-3 py-1.5 bg-green-50 rounded-lg flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-[10px] font-black text-green-700 uppercase">{t('dashboard.income')}</span>
                                </div>
                                <div className="px-3 py-1.5 bg-red-50 rounded-lg flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#E63746]"></div>
                                    <span className="text-[10px] font-black text-[#E63746] uppercase">{t('dashboard.expenses')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* main Chart - Smooth Curves */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="lg:col-span-12 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 p-8"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                                    <div>
                                        <h3 className="text-lg font-black text-[#1D3557]">{t('dashboard.dailyCashFlow')}</h3>
                                        <p className="text-xs text-gray-400 font-medium">{t('dashboard.cashFlowSubtitle')}</p>
                                    </div>
                                    <div className="flex items-baseline gap-6 border-l border-gray-100 pl-6">
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t('dashboard.totalIncome')}</p>
                                            <p className="text-xl font-black text-green-600">+{fc(dailyData.reduce((s, d) => s + d.income, 0), profile?.preferred_currency)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t('dashboard.totalExpenses')}</p>
                                            <p className="text-xl font-black text-[#E63746]">-{fc(dailyData.reduce((s, d) => s + d.expenses, 0), profile?.preferred_currency)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#E63746" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#E63746" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                                                interval={4}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                                                tickFormatter={(value) => fc(value, profile?.preferred_currency)}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }} />
                                            <Area
                                                type="monotone"
                                                dataKey="income"
                                                name={t('dashboard.income')}
                                                stroke="#10B981"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorRevenus)"
                                                animationDuration={2000}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="expenses"
                                                name={t('dashboard.expenses')}
                                                stroke="#E63746"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorDepenses)"
                                                animationDuration={2000}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>


                        </div>
                    </section>
                );
            })()}

            {/* Recent Activity List */}
            <div className="mt-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-black rounded-full"></div>
                        <h2 className="text-2xl font-black text-[--color-navy] tracking-tight">
                            <span className="hidden md:inline">{t('dashboard.recentActivity')}</span>
                            <span className="md:hidden">Transactions</span>
                        </h2>
                    </div>
                    <Link href="/transactions" className="text-xs font-black text-[--color-primary-red] uppercase tracking-widest hover:opacity-70 flex items-center gap-2">
                        <span className="hidden md:inline">{t('dashboard.viewAll')}</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden divide-y divide-gray-50">
                    {transactions.length > 0 ? (
                        transactions.map((item, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={item.id}
                                className="p-5 hover:bg-gray-50/80 transition-all flex items-center justify-between group cursor-pointer"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl ${getTransactionColor(item.category, item.amount)} flex items-center justify-center group-hover:scale-110 shadow-sm transition-all`}>
                                        {React.createElement(getTransactionIcon(item.category), { size: 20 })}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-[--color-navy] mb-0.5">{item.description}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                            {new Date(item.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })} • {item.account?.name || t('dashboard.checking')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-black tracking-tight ${parseFloat(item.amount) > 0 ? 'text-green-600' : 'text-[--color-primary-red]'}`}>
                                        <CountUp value={parseFloat(item.amount)} suffix={` ${cs(item.currency || item.account?.currency || profile?.preferred_currency)}`} decimals={2} prefix={parseFloat(item.amount) > 0 ? '+' : ''} />
                                    </p>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">{item.status === 'completed' ? t('common.completed') : t('common.pending')}</span>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="p-12 text-center">
                            <Activity className="mx-auto text-gray-200 mb-4" size={48} />
                            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">{t('dashboard.noTransactions')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Ajout de Compte */}
            {
                isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute inset-0 bg-[#1D3557]/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] p-8 shadow-2xl relative z-10 w-full max-w-md border border-gray-100"
                        >
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-1.5 h-8 bg-[--color-primary-red] rounded-full"></div>
                                <h2 className="text-2xl font-black text-[--color-navy] tracking-tight">{t('dashboard.addAccount')}</h2>
                            </div>

                            <form onSubmit={handleAddAccount} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">{t('dashboard.accountName')}</label>
                                    <input
                                        type="text"
                                        value={newAccountName}
                                        onChange={(e) => setNewAccountName(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-[--color-navy] focus:outline-none focus:ring-2 focus:ring-[--color-primary-red]/20 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">{t('dashboard.accountType')}</label>
                                    <select
                                        value={newAccountType}
                                        onChange={(e) => setNewAccountType(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-[--color-navy] focus:outline-none focus:ring-2 focus:ring-[--color-primary-red]/20 transition-all appearance-none"
                                    >
                                        <option value="checking">{t('dashboard.checking')}</option>
                                        <option value="savings">{t('dashboard.savingsType')}</option>
                                    </select>
                                </div>


                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#e63746] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#C1121F] transition-all shadow-xl shadow-red-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin text-white" size={18} /> : null}
                                    <span className="text-white">
                                        {isSubmitting ? t('dashboard.creating') : t('dashboard.create')}
                                    </span>
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )
            }

            {/* Modal Modification de Compte */}
            {
                isEditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-[#1D3557]/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] p-8 shadow-2xl relative z-10 w-full max-w-md border border-gray-100"
                        >
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-1.5 h-8 bg-[--color-primary-red] rounded-full"></div>
                                <h2 className="text-2xl font-black text-[--color-navy] tracking-tight">{t('dashboard.editAccount')}</h2>
                            </div>

                            <form onSubmit={handleUpdateAccount} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">{t('dashboard.accountName')}</label>
                                    <input
                                        type="text"
                                        value={tempAccountName}
                                        onChange={(e) => setTempAccountName(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-[--color-navy] focus:outline-none focus:ring-2 focus:ring-[--color-primary-red]/20 transition-all"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#e63746] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#C1121F] transition-all shadow-xl shadow-red-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            {t('common.loading')}
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck size={18} />
                                            {t('common.save')}
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )
            }
        </PageWrapper >
    );
};

export default Dashboard;

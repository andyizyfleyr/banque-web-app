"use client";
import React, { useState, useEffect } from 'react';

import {
    Wallet,
    PiggyBank,
    ArrowRight,
    Plus,
    Coins,
    CalendarClock,
    Trophy,
    TrendingUp,
    Rocket,
    ShieldCheck,
    Wand2,
    PlusCircle,
    Plane,
    Home,
    Car,
    Gift,
    Smartphone
} from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { currencies } from '@/config/currencies';

const Savings = () => {
    const { user } = useAuth();
    const { t, fc, cs } = useLocale();
    const [extraMonthly, setExtraMonthly] = useState(150);
    const [isMounted, setIsMounted] = useState(false);
    const [goals, setGoals] = useState([]);
    const [totalSaved, setTotalSaved] = useState(0);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false); // For creation button

    // Create Goal State
    const [isCreating, setIsCreating] = useState(false);
    const [newGoal, setNewGoal] = useState({
        name: '',
        target_amount: '',
        target_date: '',
        category: 'other',
        currency: 'EUR'
    });

    // Deposit Feature State
    const [accounts, setAccounts] = useState([]);
    const [auditGoal, setAuditGoal] = useState(null); // The goal being funded
    const [depositAmount, setDepositAmount] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('');
    const [isDepositing, setIsDepositing] = useState(false);

    // Selection & Deletion State
    const [selectedGoalIds, setSelectedGoalIds] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (user) {
            fetchGoals();
            fetchAccounts();
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('preferred_currency')
            .eq('id', user.id)
            .single();
        if (!error && data) setProfile(data);
    };

    const fetchAccounts = async () => {
        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .order('name');
            if (data) setAccounts(data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    };

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id)
                .order('target_date', { ascending: true });

            if (error) throw error;

            if (data) {
                setGoals(data);
                const total = data.reduce((acc, goal) => acc + (goal.current_amount || 0), 0);
                setTotalSaved(total);
            }
        } catch (error) {
            console.error('Error fetching goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGoal = async () => {
        if (!user || !newGoal.name || !newGoal.target_amount) return;
        setIsLoading(true);

        const goalData = {
            user_id: user.id,
            name: newGoal.name,
            target_amount: parseFloat(newGoal.target_amount),
            current_amount: 0,
            target_date: newGoal.target_date || null,
            category: newGoal.category,
            currency: newGoal.currency
        };

        const { error } = await supabase.from('goals').insert([goalData]);

        if (error) {
            toast.error(t('savings.createError'));
            console.error(error);
        } else {
            toast.success(t('savings.createSuccess'));
            setNewGoal({ name: '', target_amount: '', target_date: '', category: 'other', currency: 'EUR' });
            setIsCreating(false);
            fetchGoals();
        }
        setIsLoading(false);
    };

    const handleDeposit = async () => {
        if (!auditGoal || !selectedAccount || !depositAmount) return;
        setIsDepositing(true);

        try {
            const { error } = await supabase.rpc('deposit_to_goal', {
                user_goal_id: auditGoal.id,
                source_account_id: selectedAccount,
                deposit_amount: parseFloat(depositAmount)
            });

            if (error) throw error;

            toast.success(t('savings.depositSuccess'));
            setAuditGoal(null);
            setDepositAmount('');
            fetchGoals(); // Refresh goals
            fetchAccounts(); // Refresh account balance
        } catch (error) {
            console.error(error);
            toast.error(error.message || t('savings.depositError'));
        } finally {
            setIsDepositing(false);
        }
    };

    // Selection Handlers
    const toggleSelectGoal = (id) => {
        if (selectedGoalIds.includes(id)) {
            setSelectedGoalIds(selectedGoalIds.filter(goalId => goalId !== id));
        } else {
            setSelectedGoalIds([...selectedGoalIds, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedGoalIds.length === goals.length) {
            setSelectedGoalIds([]);
        } else {
            setSelectedGoalIds(goals.map(g => g.id));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedGoalIds.length === 0) return;

        const isConfirmed = window.confirm(`${t('savings.confirmDelete')} ${selectedGoalIds.length} ${t('savings.goalsCount')} ?`);
        if (!isConfirmed) return;

        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from('goals')
                .delete()
                .in('id', selectedGoalIds);

            if (error) throw error;

            toast.success(t('savings.deleteSuccess'));
            setSelectedGoalIds([]);
            fetchGoals();
        } catch (error) {
            console.error('Error deleting goals:', error);
            toast.error(t('savings.deleteError'));
        } finally {
            setIsDeleting(false);
        }
    };


    if (!isMounted) return null;

    if (loading) {
        return (
            <PageWrapper>
                <div className="space-y-12">
                    {/* Header Skeleton */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-64" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-20 w-48 rounded-xl" />
                    </div>

                    {/* Goals Grid Skeleton */}
                    <div className="space-y-6">
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 space-y-4">
                                    <Skeleton className="h-32 w-full" />
                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                            <Skeleton className="h-12 w-12 rounded-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <Skeleton className="h-3 w-12" />
                                                <Skeleton className="h-3 w-12" />
                                            </div>
                                            <Skeleton className="h-2 w-full rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Projection Skeleton */}
                    <div className="space-y-6">
                        <Skeleton className="h-6 w-48" />
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 h-80 space-y-6">
                            <div className="flex justify-between">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-12 w-48 rounded-xl" />
                            </div>
                            <Skeleton className="h-full w-full rounded-lg" />
                        </div>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    // Mock Data for Projection (Visual only, baseline depends on totalSaved)
    const generateProjectionData = (extra) => {
        const data = [];
        let balance = totalSaved || 5000;
        let baseline = totalSaved || 5000;
        for (let i = 0; i <= 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + i);
            const label = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

            // Baseline growth
            baseline += 200 + (baseline * 0.0035);

            // Impact growth
            balance += (200 + extra) + (balance * 0.0035);

            data.push({
                name: label,
                Base: Math.round(baseline),
                Projeté: Math.round(balance)
            });
        }
        return data;
    };

    const projectionData = generateProjectionData(extraMonthly);

    return (
        <PageWrapper className="pb-12 space-y-12">
            {/* Header Section & Summary */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1D3557]">{t('savings.pageTitle')}</h1>
                    <p className="text-gray-600 mt-1">{t('savings.pageSubtitle')}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all border-l-4 border-l-[#E63746]">
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t('savings.totalBalance')}</p>
                        <p className="text-2xl font-black text-[#1D3557]">{fc(totalSaved, profile?.preferred_currency)}</p>
                    </div>
                    <div className="w-10 h-10 bg-[#E63746]/10 rounded-xl flex items-center justify-center text-[#E63746]">
                        <PiggyBank size={20} />
                    </div>
                </div>
            </div>

            {/* Savings Goals Grid */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-[#1D3557]">{t('savings.activeGoals')}</h2>
                        {goals.length > 0 && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedGoalIds.length === goals.length && goals.length > 0}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 rounded border-gray-300 text-[#E63746] focus:ring-[#E63746]"
                                />
                                <span className="text-xs font-medium text-gray-500">{t('savings.selectAll')}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {selectedGoalIds.length > 0 && (
                            <button
                                onClick={handleDeleteSelected}
                                disabled={isDeleting}
                                className="text-red-600 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                            >
                                {isDeleting ? t('savings.deleting') : `${t('savings.deleteSelected')} (${selectedGoalIds.length})`}
                            </button>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {goals.map((goal) => {
                        const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                        const progressLength = progress / 100;
                        const isSelected = selectedGoalIds.includes(goal.id);
                        const circumference = 100; // Simplified for svg strokeDasharray if needed, but here using pathLength

                        const isCompleted = progress >= 100;
                        const statusColor = isCompleted ? "text-green-500" : "text-[#E63746]";
                        const strokeColor = isCompleted ? "#22c55e" : "#E63746"; // green-500 vs brand red

                        return (
                            <div
                                key={goal.id}
                                className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-shadow relative group ${isSelected ? 'border-[#E63746] ring-1 ring-[#E63746]' : 'border-gray-100'}`}
                            >
                                {/* Selection Checkbox */}
                                <div className="absolute top-3 left-3 z-20">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleSelectGoal(goal.id)}
                                        className="w-5 h-5 rounded border-white/50 bg-black/20 text-[#E63746] focus:ring-[#E63746] cursor-pointer"
                                    />
                                </div>
                                <div className={`h-32 flex items-center justify-center ${goal.category === 'travel' ? 'bg-blue-50' : goal.category === 'home' ? 'bg-purple-50' : goal.category === 'car' ? 'bg-orange-50' : goal.category === 'safety' ? 'bg-green-50' : 'bg-gray-50'}`}>
                                    {(() => {
                                        const iconProps = { size: 48, className: "opacity-80" };
                                        switch (goal.category) {
                                            case 'travel': return <Plane {...iconProps} className="text-blue-500" />;
                                            case 'home': return <Home {...iconProps} className="text-purple-500" />;
                                            case 'car': return <Car {...iconProps} className="text-orange-500" />;
                                            case 'safety': return <ShieldCheck {...iconProps} className="text-green-500" />;
                                            default: return <PiggyBank {...iconProps} className="text-gray-400" />;
                                        }
                                    })()}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-[10px] font-bold text-[#1D3557] uppercase shadow-sm">
                                        {goal.category === 'travel' ? t('savings.catTravel') :
                                            goal.category === 'home' ? t('savings.catHome') :
                                                goal.category === 'car' ? t('savings.catCar') :
                                                    goal.category === 'safety' ? t('savings.catSafety') : t('savings.catOther')}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-[#1D3557] line-clamp-1" title={goal.name}>{goal.name}</h3>
                                            <p className="text-xs text-gray-600">{t('savings.target')} : {new Date(goal.target_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</p>
                                        </div>
                                        <div className="relative w-12 h-12 flex items-center justify-center">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                                <motion.path
                                                    className={statusColor}
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeWidth="3"
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: progressLength }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                />
                                            </svg>
                                            <span className={`absolute text-[10px] font-bold ${isCompleted ? 'text-green-600' : 'text-[#1D3557]'}`}>{Math.round(progress)}%</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-left">
                                            <p className="text-lg font-black text-[#1D3557]">{fc(goal.current_amount, goal.currency)}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('savings.savedOn')} {fc(goal.target_amount, goal.currency)}</p>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <motion.div
                                                className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-[#E63746]'}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                            ></motion.div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
                                        <button
                                            onClick={() => !isCompleted && setAuditGoal(goal)}
                                            disabled={isCompleted}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${isCompleted
                                                ? 'bg-green-100 text-green-700 cursor-default'
                                                : 'bg-[#1D3557] text-white hover:bg-[#1D3557]/90'
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <>
                                                    <ShieldCheck size={16} />
                                                    {t('savings.completed')}
                                                </>
                                            ) : (
                                                <>
                                                    <PlusCircle size={16} />
                                                    {t('savings.deposit')}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add New Goal Button */}
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-transparent border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-[#E63746] hover:bg-red-50 transition-all group cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-[#E63746] transition-colors">
                            <Plus className="text-[#E63746] group-hover:text-white" size={24} />
                        </div>
                        <span className="font-bold text-[#1D3557]">{t('savings.addGoal')}</span>
                        <span className="text-xs text-gray-600 mt-1">{t('savings.newProject')}</span>
                    </button>
                </div>
            </section>







            {/* Create Goal Modal */}
            {
                isCreating && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                        >
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-[#1D3557] mb-2">{t('savings.newGoalTitle')}</h3>
                                <p className="text-sm text-gray-500 mb-6">{t('savings.newGoalDesc')}</p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">{t('savings.projectName')}</label>
                                        <input
                                            type="text"
                                            value={newGoal.name}
                                            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                                            placeholder={t('savings.projectPlaceholder')}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63746]/20 font-medium"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">{t('savings.goalAmount')}</label>
                                            <input
                                                type="number"
                                                value={newGoal.target_amount}
                                                onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                                                placeholder="0.00"
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63746]/20 font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 px-1">{t('savings.targetDate')}</label>
                                            <input
                                                type="date"
                                                value={newGoal.target_date}
                                                onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1D3557] focus:outline-none focus:ring-2 focus:ring-[#E63746]/10 transition-all"
                                                required
                                            />
                                        </div>

                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-3">{t('savings.category')}</label>
                                        <div className="flex md:grid md:grid-cols-5 overflow-x-auto md:overflow-visible gap-2 pb-3 pt-1 md:pb-0 md:pt-0 snap-x hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                                            {[
                                                { id: 'travel', icon: Plane, label: t('savings.catTravel') },
                                                { id: 'home', icon: Home, label: t('savings.catHome') },
                                                { id: 'car', icon: Car, label: t('savings.catCar') },
                                                { id: 'safety', icon: ShieldCheck, label: t('savings.catSafety') },
                                                { id: 'other', icon: PiggyBank, label: t('savings.catOther') }
                                            ].map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setNewGoal({ ...newGoal, category: cat.id })}
                                                    className={`min-w-[80px] md:min-w-0 snap-center p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${newGoal.category === cat.id ? 'border-[#E63746] bg-red-50 text-[#E63746]' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}
                                                >
                                                    <cat.icon size={20} />
                                                    <span className="text-[10px] font-bold">{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="flex-1 px-4 py-3 font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                                    >
                                        {t('savings.cancel')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreateGoal}
                                        disabled={!newGoal.name || !newGoal.target_amount || isLoading}
                                        className="flex-1 px-4 py-3 bg-[#E63746] text-white font-bold rounded-xl hover:bg-[#E63746]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            t('savings.create')
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )
            }

            {/* Deposit Modal */}
            {
                auditGoal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                        >
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-[#1D3557] mb-2">{t('savings.saveFor')} {auditGoal.name}</h3>
                                <p className="text-sm text-gray-500 mb-6">{t('savings.depositDesc')}</p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">{t('savings.sourceAccount')}</label>
                                        <select
                                            value={selectedAccount}
                                            onChange={(e) => setSelectedAccount(e.target.value)}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63746]/20 font-medium"
                                        >
                                            <option value="">{t('savings.selectAccount')}</option>
                                            {accounts.map(acc => (
                                                <option key={acc.id} value={acc.id} disabled={acc.balance < (depositAmount || 0)}>
                                                    {acc.name} ({fc(acc.balance, acc.currency)})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">{t('savings.depositAmount')}</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={depositAmount}
                                                onChange={(e) => setDepositAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#E63746] focus:bg-white transition-all text-lg font-bold text-[#1D3557] outline-none"
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{cs(auditGoal?.currency || profile?.preferred_currency)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        onClick={() => setAuditGoal(null)}
                                        className="flex-1 px-4 py-3 font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                                    >
                                        {t('savings.cancel')}
                                    </button>
                                    <button
                                        onClick={handleDeposit}
                                        disabled={!selectedAccount || !depositAmount || isDepositing}
                                        className="flex-1 px-4 py-3 bg-[#E63746] text-white font-bold rounded-xl hover:bg-[#E63746]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isDepositing ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            t('savings.confirm')
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )
            }
        </PageWrapper >
    );
};

export default Savings;

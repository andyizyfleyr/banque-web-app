"use client";
import React, { useState, useEffect } from 'react';
import {
    Search,
    Calendar,
    ChevronDown,
    SlidersHorizontal,
    Download,
    ShoppingBag,
    Utensils,
    Briefcase,
    Fuel,
    Film,
    ShoppingCart,
    Lightbulb,
    MapPin,
    ArrowRight,
    Star,
    Coffee,
    Home,
    Zap,
    Smartphone,
    Gamepad2,
    Music,
    Tv,
    Dumbbell,
    Stethoscope,
    GraduationCap,
    Car,
    Plane,
    Hammer,
    Scissors,
    Gift,
    CreditCard,
    Banknote,
    Landmark,
    Repeat,
    ArrowRightLeft,
    AlertCircle,
    Laptop,
    Book,
    Palmtree,
    Ticket,
    Receipt,
    Shield,
    HeartPulse
} from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Skeleton } from '@/components/ui/Skeleton';

const Transactions = () => {
    const { user } = useAuth();
    const { t, fc } = useLocale();
    const [filter, setFilter] = useState('Tout');
    const [searchTerm, setSearchTerm] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [stats, setStats] = useState({ expenses: [], trend: [] });

    // Pagination State
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        setIsMounted(true);
        if (user) {
            // Debounce Search & Filter Change
            const timer = setTimeout(() => {
                setPage(0);
                fetchTransactions(0, true);
            }, 300);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, filter, searchTerm]);

    const fetchTransactions = async (pageNumber = 0, reset = false) => {
        try {
            setLoading(true);
            const from = pageNumber * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            let query = supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false })
                .range(from, to);

            // Apply Server-Side Filters
            if (filter === 'Débit') query = query.lt('amount', 0);
            if (filter === 'Crédit') query = query.gt('amount', 0);

            if (searchTerm) {
                // Search in description or category (case-insensitive)
                query = query.or(`description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                let newTransactions;
                if (reset || pageNumber === 0) {
                    newTransactions = data;
                } else {
                    newTransactions = [...transactions, ...data];
                }

                setTransactions(newTransactions);

                // Update pagination status
                setHasMore(data.length === ITEMS_PER_PAGE);

                // Recalculate stats based on loaded data
                calculateStats(newTransactions);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            if (reset) setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchTransactions(nextPage, false);
    };

    const calculateStats = (data) => {
        // Top Expenses
        const expensesMap = data.reduce((acc, curr) => {
            if (curr.amount < 0) {
                const cat = curr.category || 'Autres';
                acc[cat] = (acc[cat] || 0) + Math.abs(curr.amount);
            }
            return acc;
        }, {});

        const totalExpenses = Object.values(expensesMap).reduce((a, b) => a + b, 0);
        const topExpenses = Object.entries(expensesMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, amount], index) => ({
                name,
                amount: fc(amount, 'EUR'),
                percent: totalExpenses ? `${Math.round((amount / totalExpenses) * 100)}%` : '0%',
                color: ['bg-[#E63746]', 'bg-[#1D3557]', 'bg-slate-500', 'bg-slate-300', 'bg-gray-200'][index % 5]
            }));

        // Spending Trend (Last 4 months) - Simplified for demo
        const trendData = [
            { name: 'Juil', value: 2400 },
            { name: 'Août', value: 3800 },
            { name: 'Sep', value: 3200 },
            { name: 'Oct', value: 4500 }
        ];

        setStats({ expenses: topExpenses, trend: trendData });
    };

    const getIcon = (category) => {
        const cat = category?.toLowerCase() || '';

        // Income / Salary
        if (cat.includes('salaire') || cat.includes('revenu') || cat.includes('virement reçu')) return Briefcase;
        if (cat.includes('remboursement') || cat.includes('dépôt')) return Banknote;

        // Housing & Utilities
        if (cat.includes('loyer') || cat.includes('logement') || cat.includes('immobilier')) return Home;
        if (cat.includes('facture') || cat.includes('électricité') || cat.includes('eau') || cat.includes('gaz')) return Zap;
        if (cat.includes('internet') || cat.includes('téléphone') || cat.includes('mobile')) return Smartphone;

        // Shopping & Groceries
        if (cat.includes('courses') || cat.includes('supermarché') || cat.includes('alimentation')) return ShoppingCart;
        if (cat.includes('shopping') || cat.includes('vêtement') || cat.includes('mode') || cat.includes('cadeau')) return ShoppingBag;
        if (cat.includes('électronique') || cat.includes('tech') || cat.includes('multimédia')) return Laptop;

        // Food & Dining
        if (cat.includes('restaurant') || cat.includes('bar') || cat.includes('café') || cat.includes('resto') || cat.includes('food')) return Utensils;

        // Transport & Travel
        if (cat.includes('transport') || cat.includes('essence') || cat.includes('parking') || cat.includes('péage') || cat.includes('taxi') || cat.includes('uber')) return Car;
        if (cat.includes('voyage') || cat.includes('avion') || cat.includes('train') || cat.includes('hôtel') || cat.includes('vacances')) return Plane;

        // Entertainment
        if (cat.includes('divertissement') || cat.includes('cinéma') || cat.includes('film') || cat.includes('netflix') || cat.includes('spectacle')) return Film;
        if (cat.includes('musique') || cat.includes('spotify') || cat.includes('concert')) return Music;
        if (cat.includes('jeux') || cat.includes('game') || cat.includes('steam')) return Gamepad2;

        // Health
        if (cat.includes('santé') || cat.includes('médecin') || cat.includes('pharmacie') || cat.includes('hôpital') || cat.includes('soin')) return Stethoscope;
        if (cat.includes('sport') || cat.includes('fitness') || cat.includes('gym')) return Dumbbell;

        // Services
        if (cat.includes('éducation') || cat.includes('formation') || cat.includes('école') || cat.includes('livre')) return GraduationCap;
        if (cat.includes('beauté') || cat.includes('coiffeur')) return Scissors;
        if (cat.includes('service') || cat.includes('abonnement')) return Repeat;

        // Finance
        if (cat.includes('banque') || cat.includes('frais') || cat.includes('agios') || cat.includes('cotisation')) return Landmark;
        if (cat.includes('retrait') || cat.includes('dab')) return Banknote;
        if (cat.includes('virement') || cat.includes('transfert')) return ArrowRightLeft;

        // Others
        if (cat.includes('assurances') || cat.includes('sécurité')) return Shield;
        if (cat.includes('impôt') || cat.includes('taxe')) return Receipt;

        return Coffee;
    };

    const getColor = (category, amount) => {
        if (amount > 0) return 'bg-emerald-100 text-emerald-700'; // Income always Green

        const cat = category?.toLowerCase() || '';

        // Housing: Purple
        if (cat.includes('loyer') || cat.includes('logement') || cat.includes('immobilier') || cat.includes('facture')) return 'bg-purple-100 text-purple-700';

        // Transport: Blue
        if (cat.includes('transport') || cat.includes('essence') || cat.includes('voyage') || cat.includes('avion') || cat.includes('train')) return 'bg-blue-100 text-blue-700';

        // Food: Orange
        if (cat.includes('restaurant') || cat.includes('bar') || cat.includes('café') || cat.includes('alimentation') || cat.includes('courses')) return 'bg-orange-100 text-orange-700';

        // Health: Rose
        if (cat.includes('santé') || cat.includes('sport') || cat.includes('fitness') || cat.includes('médecin')) return 'bg-rose-100 text-rose-700';

        // Tech & Entertainment: Indigo
        if (cat.includes('tech') || cat.includes('électronique') || cat.includes('internet') || cat.includes('netflix') || cat.includes('jeux')) return 'bg-indigo-100 text-indigo-700';

        // Shopping: Pink
        if (cat.includes('shopping') || cat.includes('vêtement') || cat.includes('mode') || cat.includes('cadeau')) return 'bg-pink-100 text-pink-700';

        // Education/Services: Yellow/Amber
        if (cat.includes('éducation') || cat.includes('service') || cat.includes('coiffeur')) return 'bg-amber-100 text-amber-700';

        // Financial: Gray/Slate
        if (cat.includes('banque') || cat.includes('retrait') || cat.includes('virement') || cat.includes('transfert')) return 'bg-slate-100 text-slate-700';

        // Default: Gray
        return 'bg-gray-100 text-gray-600';
    };

    const groupTransactions = (data) => {
        const groups = {};
        data.forEach(tx => {
            const date = new Date(tx.date);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let key = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            if (date.toDateString() === today.toDateString()) key = t('transactions.today');
            else if (date.toDateString() === yesterday.toDateString()) key = t('transactions.yesterday');

            if (!groups[key]) groups[key] = [];
            groups[key].push(tx);
        });
        return Object.entries(groups).map(([date, items]) => ({ date, items }));
    };

    // Filter Logic


    const groupedTransactions = groupTransactions(transactions);

    if (!isMounted) return null;

    return (
        <PageWrapper className="pb-12 space-y-8">
            {/* Filters & Actions Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#E63746]/20 text-sm"
                            placeholder={t('transactions.searchPlaceholder')}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-transparent">
                            {[{ key: 'Tout', label: t('transactions.all') }, { key: 'Débit', label: t('transactions.debit') }, { key: 'Crédit', label: t('transactions.credit') }].map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${filter === f.key ? 'bg-white shadow-sm text-[#E63746]' : 'text-gray-500 hover:text-[#E63746]'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl text-sm font-medium text-gray-700">
                            <span>{t('transactions.amount')}</span>
                            <SlidersHorizontal size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content: Transaction List */}
                <div className="lg:w-2/3 space-y-3">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-[#1D3557]">{t('transactions.history')}</h2>
                        {transactions.length} {t('transactions.transactionsLabel')}
                    </div>

                    {loading && transactions.length === 0 ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100">
                                    <Skeleton className="w-12 h-12 rounded-full" />
                                    <div className="flex-grow space-y-2">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-3 w-1/4" />
                                    </div>
                                    <div className="text-right space-y-2">
                                        <Skeleton className="h-5 w-20 ml-auto" />
                                        <Skeleton className="h-3 w-12 ml-auto" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : groupedTransactions.length > 0 ? (
                        <>
                            {groupedTransactions.map((group, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="sticky top-20 bg-[--color-background-light] py-2 z-10">
                                        <span className="text-xs font-bold text-gray-600 uppercase">{group.date}</span>
                                    </div>
                                    {group.items.map((item) => {
                                        const Icon = getIcon(item.category);
                                        return (
                                            <div key={item.id} className="group flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 hover:border-[#E63746]/30 hover:shadow-md transition-all cursor-pointer">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#E63746]/10 transition-colors ${getColor(item.category, item.amount)}`}>
                                                    <Icon size={20} />
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="font-bold text-[#1D3557]">{item.description}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-600 rounded uppercase">{item.category}</span>
                                                        <span className="text-xs text-gray-500">{new Date(item.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold text-lg ${item.amount > 0 ? 'text-emerald-600' : 'text-[#E63746]'}`}>
                                                        {item.amount > 0 ? '+' : ''}{fc(Math.abs(item.amount), item.currency)}
                                                    </p>
                                                    <p className={`text-[10px] font-bold text-gray-400`}>{item.status || t('transactions.completed')}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}

                            {hasMore && (
                                <div className="pt-4 flex justify-center">
                                    <button
                                        onClick={loadMore}
                                        disabled={loading}
                                        className="px-6 py-2 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:text-[#E63746] transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : t('transactions.loadMore')}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                            {t('transactions.noTransactions')}
                        </div>
                    )}
                </div>

                {/* Sidebar: Analytics */}
                <div className="lg:w-1/3 space-y-6">
                    <div className="sticky top-24 space-y-6">
                        {/* Top 5 Expenses */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-[#1D3557]">{t('transactions.topExpenses')}</h3>
                            </div>
                            <div className="space-y-5">
                                {stats.expenses.map((exp, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-gray-600 font-medium">{exp.name}</span>
                                            <span className="font-bold text-[#1D3557]">{exp.amount}</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${exp.color}`} style={{ width: exp.percent }}></div>
                                        </div>
                                    </div>
                                ))}
                                {stats.expenses.length === 0 && <p className="text-xs text-gray-400">{t('transactions.notEnoughData')}</p>}
                            </div>
                        </section>

                        {/* Month-over-Month Comparison */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-[#1D3557] mb-6">{t('transactions.spendingTrends')}</h3>
                            <div className="h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.trend}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {stats.trend.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 3 ? '#1D3557' : '#f1f5f9'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default Transactions;

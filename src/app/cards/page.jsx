"use client";
import React, { useState, useEffect } from 'react';
import {
    PlusCircle,
    Nfc,
    Ban,
    LockOpen,
    RefreshCw,
    Shield,
    BarChart2,
    CreditCard,
    Lock,
    ArrowLeft,
    Trash2,
    Cloud,
    Eye,
    EyeOff,
    Link2,
    Wallet
} from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { toast } from 'react-hot-toast';

const Cards = () => {
    const { user } = useAuth();
    const { t, fc } = useLocale();
    const [cards, setCards] = useState([]);
    const [activeCard, setActiveCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    // Flip State
    const [flippedCardId, setFlippedCardId] = useState(null);

    // New Card Ordering State
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderStep, setOrderStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [orderData, setOrderData] = useState({
        type: 'visa_virtual',
        is_physical: false,
        address: { street: '', city: '', zip: '', country: 'France' }
    });

    // Card catalog
    const CARD_CATALOG = {
        visa_virtual: {
            name: t('cards.virtualCard'),
            monthlyPrice: 10,
            isPhy: false,
            color: 'from-[#E63746] to-rose-700',
            icon: '💳',
            features: [t('cards.featureOnline'), t('cards.featureSubscriptions'), t('cards.featureApplePay')],
            plans: [
                { id: 'monthly', label: t('cards.planMonthly'), months: 1, discount: 0 },
                { id: 'quarterly', label: t('cards.planQuarterly'), months: 3, discount: 10 },
                { id: 'annual', label: t('cards.planAnnual'), months: 12, discount: 20 }
            ]
        },
        visa_gold: {
            name: t('cards.goldCard'),
            monthlyPrice: 35,
            isPhy: true,
            color: 'from-yellow-400 via-yellow-200 to-yellow-600',
            icon: '⭐',
            features: [t('cards.featureUnlimited'), t('cards.featureTravelInsurance'), t('cards.featureFreeWithdrawals'), t('cards.featureConcierge')],
            plans: [
                { id: 'quarterly', label: t('cards.planQuarterly'), months: 3, discount: 10 },
                { id: 'annual', label: t('cards.planAnnual'), months: 12, discount: 20 }
            ]
        },
        mastercard_black: {
            name: t('cards.diamondCard'),
            monthlyPrice: 50,
            isPhy: true,
            color: 'from-gray-800 via-gray-900 to-black',
            icon: '💎',
            features: [t('cards.featurePremiumLimits'), t('cards.featureConcierge247'), t('cards.featureLounge'), t('cards.featureAllRiskInsurance'), t('cards.featureCashback')],
            plans: [
                { id: 'annual', label: t('cards.planAnnual'), months: 12, discount: 20 }
            ]
        }
    };

    const getSelectedCardInfo = () => CARD_CATALOG[orderData.type];
    const getPlanPrice = (cardType, plan) => {
        const card = CARD_CATALOG[cardType];
        if (!plan || !card) return 0;
        const total = card.monthlyPrice * plan.months;
        return Math.round(total * (1 - plan.discount / 100));
    };
    const [isOrderingProcess, setIsOrderingProcess] = useState(false);

    // Deletion State
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeletingProcess, setIsDeletingProcess] = useState(false);

    // Account Linking State
    const [accounts, setAccounts] = useState([]);
    const [isLinkingAccount, setIsLinkingAccount] = useState(false);

    // Per-card-type spending limit caps
    const getMaxLimits = (cardType) => {
        switch (cardType) {
            case 'visa_virtual':
                return { daily: 200, weekly: 500, monthly: 1000 };
            case 'visa_gold':
                return { daily: 5000, weekly: 15000, monthly: 30000 };
            case 'mastercard_black':
                return { daily: 10000, weekly: 30000, monthly: 60000 };
            default:
                return { daily: 2000, weekly: 5000, monthly: 10000 };
        }
    };

    // Fetch Accounts
    const fetchAccounts = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', user.id);
        if (data) setAccounts(data);
    };

    // Fetch Cards (with linked account data)
    const fetchCards = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('cards')
                .select('*, linked_account:accounts!linked_account_id(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (error) {
                // Fallback if linked_account join fails (column not yet added)
                const { data: fallback } = await supabase
                    .from('cards')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true });
                if (fallback && fallback.length > 0) {
                    setCards(fallback);
                    if (!activeCard || !fallback.find(c => c.id === activeCard.id)) setActiveCard(fallback[0]);
                }
                return;
            }

            if (data && data.length > 0) {
                setCards(data);
                // Always sync activeCard with fresh data
                const currentId = activeCard?.id;
                const freshActive = currentId ? data.find(c => c.id === currentId) : null;
                setActiveCard(freshActive || data[0]);
            } else {
                setCards([]);
                setActiveCard(null);
            }
        } finally {
            setLoading(false);
        }
    };

    // Initial Load
    useEffect(() => {
        setIsMounted(true);
        if (user) {
            fetchCards();
            fetchAccounts();
        }
    }, [user]);

    // Link / Unlink Account
    const handleLinkAccount = async (accountId) => {
        if (!activeCard) return;
        const { error } = await supabase
            .from('cards')
            .update({ linked_account_id: accountId || null })
            .eq('id', activeCard.id);

        if (error) {
            toast.error(t('cards.linkError'));
        } else {
            toast.success(accountId ? t('cards.linkSuccess') : t('cards.unlinkSuccess'));
            fetchCards();
        }
        setIsLinkingAccount(false);
    };

    // Card Actions
    const handleToggle = async (key) => {
        if (!activeCard) return;

        const newControls = { ...activeCard.controls, [key]: !activeCard.controls[key] };
        const updatedCard = { ...activeCard, controls: newControls };
        setActiveCard(updatedCard);
        setCards(cards.map(c => c.id === activeCard.id ? updatedCard : c));

        const { error } = await supabase
            .from('cards')
            .update({ controls: newControls })
            .eq('id', activeCard.id);

        if (error) {
            toast.error(t('cards.updateError'));
            fetchCards();
        } else {
            toast.success(newControls[key] ? 'Option activée avec succès' : 'Option désactivée');
        }
    };

    const handleLimitChange = (key, value) => {
        if (!activeCard) return;
        const limits = getMaxLimits(activeCard.type);
        const val = Math.min(parseInt(value), limits[key]);
        const newLimits = { ...activeCard.limits, [key]: val };
        const updatedCard = { ...activeCard, limits: newLimits };
        setActiveCard(updatedCard);
        setCards(cards.map(c => c.id === activeCard.id ? updatedCard : c));
    };

    const handleLimitCommit = async (key, value) => {
        if (!activeCard) return;
        const val = parseInt(value);
        const { error } = await supabase
            .from('cards')
            .update({ limits: { ...activeCard.limits, [key]: val } })
            .eq('id', activeCard.id);

        if (error) toast.error(t('cards.limitUpdateError'));
    };

    const toggleBlockCard = async () => {
        if (!activeCard) return;

        const newStatus = activeCard.status === 'blocked' ? 'active' : 'blocked';
        const updatedCard = { ...activeCard, status: newStatus };
        setActiveCard(updatedCard);
        setCards(cards.map(c => c.id === activeCard.id ? updatedCard : c));

        const { error } = await supabase
            .from('cards')
            .update({ status: newStatus })
            .eq('id', activeCard.id);

        if (error) {
            toast.error(t('cards.statusError'));
            fetchCards();
        } else {
            toast.success(newStatus === 'blocked' ? t('cards.cardBlocked') : t('cards.cardUnblocked'));
        }
    };

    const getCardPrice = () => {
        if (!selectedPlan) return 0;
        return getPlanPrice(orderData.type, selectedPlan);
    };

    const handleOrderCard = async () => {
        if (!user) return;
        setIsOrderingProcess(true);

        try {
            const price = getCardPrice();

            // Check if any account has sufficient balance
            const accountWithBalance = accounts.find(acc => acc.balance >= price);

            if (!accountWithBalance) {
                toast.error(t('cards.insufficientFunds') || 'Solde insuffisant dans vos comptes.');
                setIsOrderingProcess(false);
                return;
            }

            const last4 = Math.floor(1000 + Math.random() * 9000).toString();
            const expiry = '12/29';

            const { error } = await supabase.rpc('order_new_card', {
                p_user_id: user.id,
                p_card_type: orderData.type,
                p_last_4: last4,
                p_expiry: expiry,
                p_holder_name: user.user_metadata?.full_name || 'Client Bank',
                p_is_physical: orderData.is_physical,
                p_delivery_address: orderData.is_physical ? orderData.address : null,
                p_price: price,
                p_currency: 'EUR' // Added currency parameter
            });

            if (error) throw error;

            toast.success(t('cards.orderSuccess'));
            setIsOrdering(false);
            setOrderStep(1);
            setSelectedPlan(null);
            fetchCards();
        } catch (error) {
            console.error(error);
            toast.error(error.message || t('cards.orderError'));
        } finally {
            setIsOrderingProcess(false);
        }
    };

    const handleDeleteCard = async () => {
        if (!activeCard) return;
        setIsDeletingProcess(true);

        try {
            const { error } = await supabase
                .from('cards')
                .delete()
                .eq('id', activeCard.id);

            if (error) throw error;

            toast.success(t('cards.deleteSuccess'));
            setIsDeleting(false);
            fetchCards();
        } catch (error) {
            console.error(error);
            toast.error(t('cards.deleteError'));
        } finally {
            setIsDeletingProcess(false);
        }
    };

    const handleCardClick = (card) => {
        if (activeCard?.id === card.id) {
            setFlippedCardId(flippedCardId === card.id ? null : card.id);
        } else {
            setActiveCard(card);
            setFlippedCardId(null);
        }
    };

    if (!isMounted) return null;

    const maxLimits = {
        daily: 5000,
        weekly: 20000,
        monthly: 50000
    };

    return (
        <PageWrapper className="pb-12 space-y-8">
            {/* Header */}
            <section>
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1D3557]">
                            <span className="hidden md:inline">{t('cards.title')}</span>
                            <span className="md:hidden">Mes cartes</span>
                        </h1>
                        <p className="text-gray-600 mt-1">{t('cards.subtitle')}</p>
                    </div>
                    <button
                        onClick={() => setIsOrdering(true)}
                        className="bg-[#E63746] text-white px-4 md:px-6 py-2 md:py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-red-200"
                    >
                        <PlusCircle size={18} />
                        <span className="hidden md:inline">{t('cards.orderCard')}</span>
                        <span className="md:hidden">Ajouter</span>
                    </button>
                </div>

                {loading ? (
                    <div className="h-60 flex items-center justify-center bg-gray-50 rounded-2xl animate-pulse">
                        <p className="text-gray-400">{t('cards.loadingCards')}</p>
                    </div>
                ) : cards.length === 0 ? (
                    <div className="h-60 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <CreditCard size={48} className="text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">{t('cards.noCards')}</p>
                        <button
                            onClick={() => setIsOrdering(true)}
                            className="mt-4 px-6 py-2 bg-[#1D3557] text-white rounded-xl font-bold hover:bg-[#1D3557]/90 transition-colors"
                        >
                            {t('cards.createFirstCard')}
                        </button>
                    </div>
                ) : (
                    <div className="flex overflow-x-auto gap-8 pt-8 pb-10 snap-x snap-mandatory px-4 -mx-4 no-scrollbar">
                        {cards.map((card) => (
                            <motion.div
                                key={card.id}
                                onClick={() => handleCardClick(card)}
                                style={{ perspective: 1000 }}
                                className={`flex-shrink-0 w-[85vw] sm:w-[400px] snap-center relative cursor-pointer`}
                            >
                                <motion.div
                                    animate={{ rotateY: flippedCardId === card.id ? 180 : 0 }}
                                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                                    style={{ transformStyle: 'preserve-3d' }}
                                    className={`relative h-60 w-full transition-all duration-300 rounded-2xl ${activeCard?.id === card.id ? 'ring-[3px] ring-[#E63746] ring-offset-4 ring-offset-gray-50 scale-[1.02] shadow-2xl shadow-[#E63746]/15' : 'opacity-75 hover:opacity-95 hover:scale-[1.01]'}`}
                                >
                                    {/* FRONT */}
                                    <div className={`absolute inset-0 backface-hidden rounded-2xl p-8 flex flex-col justify-between shadow-xl border border-white/20 overflow-hidden ${card.type === 'visa_gold' ? 'bg-gradient-to-br from-yellow-400 via-yellow-200 to-yellow-600' :
                                        card.type === 'mastercard_black' ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white' :
                                            'bg-gradient-to-br from-[#E63746] to-rose-700 text-white'
                                        }`}
                                        style={{ backfaceVisibility: 'hidden' }}
                                    >
                                        <div className="flex justify-between items-start z-10">
                                            {card.type === 'visa_virtual' ? <Cloud size={32} className="opacity-80" /> : <img src="/chip.png" alt="Chip" className="h-10 w-auto drop-shadow-sm" />}
                                            <div className="flex flex-col items-end gap-1">
                                                {card.linked_account ? (
                                                    <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/20 text-right">
                                                        <p className="text-[8px] uppercase opacity-60 font-bold leading-none mb-0.5">{card.linked_account.name || t('cards.account')}</p>
                                                        <p className="text-base font-black leading-none">
                                                            {fc(Number(card.linked_account.balance), card.linked_account.currency)}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${card.status === 'blocked' ? 'bg-red-500 text-white' : 'bg-white/20 backdrop-blur-md border border-white/30'}`}>
                                                        {card.status === 'blocked' ? t('cards.statusBlocked') : t('cards.statusActive')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4 z-10">
                                            <div className="text-2xl font-mono tracking-widest drop-shadow-sm">
                                                **** **** **** {card.last_4}
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] uppercase opacity-60 font-bold">{t('cards.holder')}</p>
                                                    <p className="text-sm font-bold uppercase tracking-wider">{card.holder_name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] uppercase opacity-60 font-bold">{t('cards.expires')}</p>
                                                    <p className="text-sm font-bold">{card.expiry}</p>
                                                </div>
                                                <div className="flex items-center justify-end">
                                                    <img src="/visa-logo.png" alt="Visa" className="h-10 w-auto drop-shadow-md" />
                                                </div>
                                            </div>
                                        </div>

                                        {
                                            card.status === 'blocked' && (
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                                                    <Lock className="text-white w-12 h-12" />
                                                </div>
                                            )
                                        }
                                    </div>

                                    {/* BACK */}
                                    <div className={`absolute inset-0 backface-hidden rounded-2xl flex flex-col shadow-2xl border border-white/20 overflow-hidden ${card.type === 'visa_gold' ? 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-800' :
                                        card.type === 'mastercard_black' ? 'bg-gradient-to-br from-gray-900 via-black to-slate-900 text-white' :
                                            'bg-gradient-to-br from-rose-700 via-rose-800 to-rose-950 text-white'
                                        }`}
                                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                    >
                                        {/* Magnetic Stripe */}
                                        <div className="w-full h-12 bg-gradient-to-b from-gray-900 to-black mt-8 shadow-inner opacity-90" />

                                        <div className="px-6 py-4 flex-1 flex flex-col justify-between">
                                            {/* Signature & CVV Strip */}
                                            <div className="mt-2 text-left">
                                                <p className="text-[7px] uppercase opacity-50 font-bold mb-1 ml-2 tracking-tighter">Authorized Signature — Not Valid Unless Signed</p>
                                                <div className="flex items-center">
                                                    <div className="h-10 grow bg-gradient-to-r from-gray-100 via-white to-gray-100 rounded-l-sm flex items-center px-4 overflow-hidden relative">
                                                        {/* Subtle signature pattern lines */}
                                                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '7px 7px' }} />
                                                        <span className="text-gray-400 font-serif italic text-sm opacity-60 z-10 select-none">Bank Signature</span>
                                                    </div>
                                                    <div className="h-10 w-16 bg-white border-l-2 border-gray-200 rounded-r-sm flex items-center justify-center shadow-inner">
                                                        <span className="text-gray-900 font-mono font-black italic text-lg tracking-tighter">
                                                            {card.cvv || '***'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Info & Branding */}
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end border-t border-white/10 pt-4">
                                                    <div className="max-w-[180px]">
                                                        <p className="text-[6px] leading-[1.4] opacity-40 uppercase font-medium">
                                                            This card is issued by Banka pursuant to a license. The use of this card is subject to the terms and conditions.
                                                            Found? please return to the nearest branch or call +33 1 23 45 67 89.
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end">
                                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                                                            <div className="w-4 h-4 rounded-full border border-white/20 animate-pulse" />
                                                        </div>
                                                        <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Banka Premium</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Subtle texture overlay */}
                                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                                    </div>
                                </motion.div>
                                <p className="text-center mt-4 font-bold text-[#1D3557]">
                                    {card.type === 'visa_gold' ? 'Visa Gold' : card.type === 'mastercard_black' ? 'Mastercard Black' : 'Virtual Card'}
                                    {activeCard?.id === card.id && <span className="ml-2 text-[#E63746] text-xs">({t('cards.selected')})</span>}
                                </p>
                            </motion.div>
                        ))
                        }
                    </div >
                )}
            </section >

            {/* Selected Card Details */}
            {
                activeCard && (
                    <>
                        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex overflow-x-auto gap-4 items-center pb-2 snap-x hide-scrollbar">
                                <button
                                    onClick={toggleBlockCard}
                                    className={`flex-shrink-0 md:flex-1 min-w-[200px] snap-center flex items-center justify-center gap-3 py-4 rounded-xl border transition-all duration-300 group ${activeCard.status === 'blocked' ? 'bg-[#1D3557] text-white border-[#1D3557]' : 'bg-red-50 text-[#E63746] border-red-100 hover:bg-[#E63746] hover:text-white'}`}
                                >
                                    {activeCard.status === 'blocked' ? <LockOpen size={20} /> : <Ban size={20} />}
                                    <span className="font-bold">{activeCard.status === 'blocked' ? t('cards.unlockCard') : t('cards.blockCard')}</span>
                                </button>
                                <button className="flex-shrink-0 md:flex-1 min-w-[200px] snap-center flex items-center justify-center gap-3 py-4 rounded-xl bg-gray-50 text-[#1D3557] hover:bg-[#1D3557] hover:text-white transition-all duration-300">
                                    <LockOpen size={20} />
                                    <span className="font-bold">{t('cards.changePin')}</span>
                                </button>
                                <button className="flex-shrink-0 md:flex-1 min-w-[200px] snap-center flex items-center justify-center gap-3 py-4 rounded-xl bg-gray-50 text-[#1D3557] hover:bg-[#1D3557] hover:text-white transition-all duration-300">
                                    <RefreshCw size={20} />
                                    <span className="font-bold">{t('cards.orderReplacement')}</span>
                                </button>
                                <button
                                    onClick={() => activeCard.linked_account ? handleLinkAccount(null) : setIsLinkingAccount(!isLinkingAccount)}
                                    className={`flex-shrink-0 md:flex-1 min-w-[200px] snap-center flex items-center justify-center gap-3 py-4 rounded-xl border transition-all duration-300 ${activeCard.linked_account ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-600 hover:text-white' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white'}`}
                                >
                                    <Wallet size={20} />
                                    <span className="font-bold">{activeCard.linked_account ? `${activeCard.linked_account.name} • ${t('cards.unlink')}` : t('cards.linkAccount')}</span>
                                </button>
                                <button
                                    onClick={() => setIsDeleting(true)}
                                    className="flex-shrink-0 md:flex-1 min-w-[200px] snap-center flex items-center justify-center gap-3 py-4 rounded-xl bg-red-50 text-[#E63746] border border-red-100 hover:bg-[#E63746] hover:text-white transition-all duration-300"
                                >
                                    <Trash2 size={20} />
                                    <span className="font-bold">{t('cards.deleteCard')}</span>
                                </button>
                            </div>
                        </section>

                        {/* Account Linking Modal */}
                        <AnimatePresence>
                            {isLinkingAccount && !activeCard.linked_account && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                                    onClick={() => setIsLinkingAccount(false)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="p-6 border-b border-gray-100">
                                            <h3 className="text-xl font-bold text-[#1D3557] flex items-center gap-2">
                                                <Wallet size={22} className="text-[#E63746]" />
                                                {t('cards.linkAccount')}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">{t('cards.selectAccountToLink')}</p>
                                        </div>
                                        <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
                                            {accounts.length === 0 ? (
                                                <p className="text-center text-gray-400 py-8">{t('cards.noAccounts')}</p>
                                            ) : accounts.map((acc) => (
                                                <button
                                                    key={acc.id}
                                                    onClick={() => handleLinkAccount(acc.id)}
                                                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border border-gray-100 transition-all text-left group"
                                                >
                                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-colors">
                                                        <Wallet size={18} className="text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-[#1D3557]">{acc.name}</p>
                                                        <p className="text-xs text-gray-500">{acc.type === 'checking' ? t('cards.checking') : acc.type === 'savings' ? t('cards.savingsAccount') : t('cards.investment')}</p>
                                                    </div>
                                                    <p className="font-bold text-[#1D3557]">{fc(Number(acc.balance), acc.currency)}</p>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="p-4 border-t border-gray-100">
                                            <button
                                                onClick={() => setIsLinkingAccount(false)}
                                                className="w-full py-3 rounded-xl text-sm font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
                                            >
                                                {t('common.cancel')}
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* Controls */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-[#1D3557] mb-6 flex items-center gap-2">
                                    <Shield className="text-[#E63746]" size={24} />
                                    {t('cards.cardControls')}
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {[
                                        { key: 'contactless', label: t('cards.contactless'), sub: t('cards.contactlessSub') },
                                        { key: 'international', label: t('cards.international'), sub: t('cards.internationalSub') },
                                        { key: 'online', label: t('cards.onlineTransactions'), sub: t('cards.onlineSub') },
                                        { key: 'atm', label: t('cards.atmWithdrawals'), sub: t('cards.atmSub') }
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                                            <div>
                                                <p className="font-bold text-[#1D3557]">{item.label}</p>
                                                <p className="text-sm text-gray-600">{item.sub}</p>
                                            </div>
                                            <button
                                                onClick={() => handleToggle(item.key)}
                                                className={`w-11 h-6 rounded-full relative transition-colors ${activeCard.controls?.[item.key] ? 'bg-[#E63746]' : 'bg-gray-300'}`}
                                            >
                                                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${activeCard.controls?.[item.key] ? 'translate-x-5' : ''}`}></div>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Limits */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                <h2 className="text-xl md:text-2xl font-bold text-[#1D3557] mb-2 flex flex-row items-center justify-center gap-2 text-center whitespace-nowrap">
                                    <BarChart2 className="text-[#E63746]" size={22} />
                                    <span>{t('cards.spendingLimits')}</span>
                                </h2>
                                <p className="text-sm text-gray-500 mb-8">
                                    {activeCard.type === 'visa_virtual' ? `💳 ${t('cards.virtualLimitDesc')}` :
                                        activeCard.type === 'visa_gold' ? `⭐ ${t('cards.goldLimitDesc')}` :
                                            `💎 ${t('cards.diamondLimitDesc')}`}
                                </p>
                                <div className="space-y-10">
                                    {[
                                        { key: 'daily', label: t('cards.dailyLimit'), max: getMaxLimits(activeCard.type).daily },
                                        { key: 'weekly', label: t('cards.weeklyLimit'), max: getMaxLimits(activeCard.type).weekly },
                                        { key: 'monthly', label: t('cards.monthlyLimit'), max: getMaxLimits(activeCard.type).monthly }
                                    ].map((limit) => (
                                        <div key={limit.key} className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="font-bold text-[#1D3557]">{limit.label}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {t('cards.spent')} : {fc((activeCard.limits?.[limit.key] || 0) * 0.4, activeCard.currency)} / {fc(activeCard.limits?.[limit.key] || 0, activeCard.currency)}
                                                    </p>
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                                        <motion.div
                                                            className="h-full bg-[#1D3557]"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: "40%" }}
                                                            transition={{ duration: 1, delay: 0.5 }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-[#E63746] font-bold text-xl">{fc(activeCard.limits?.[limit.key] || 0, activeCard.currency)}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max={limit.max}
                                                value={activeCard.limits?.[limit.key] || 0}
                                                onChange={(e) => handleLimitChange(limit.key, e.target.value)}
                                                onMouseUp={(e) => handleLimitCommit(limit.key, e.target.value)}
                                                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#E63746]"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )
            }

            {/* Modal de commande */}
            <AnimatePresence>
                {isOrdering && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#1D3557]/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                        onClick={() => { setIsOrdering(false); setOrderStep(1); setSelectedPlan(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="bg-[#1D3557] p-6 text-white relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                                <div className="flex justify-between items-center relative z-10">
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight">{t('cards.orderCard')}</h3>
                                        <div className="flex items-center gap-3 mt-2">
                                            {[1, 2, 3].map((s) => (
                                                <div key={s} className="flex items-center gap-1">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${orderStep >= s ? 'bg-[#E63746] text-white' : 'bg-white/10 text-white/40'}`}>{s}</div>
                                                    {s < 3 && <div className={`w-6 h-0.5 ${orderStep > s ? 'bg-[#E63746]' : 'bg-white/10'}`} />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={() => { setIsOrdering(false); setOrderStep(1); setSelectedPlan(null); }} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                                        <PlusCircle size={20} className="rotate-45" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Step 1: Card Type + Plan Selection */}
                                {orderStep === 1 && (
                                    <div className="space-y-6">
                                        <h4 className="font-bold text-[#1D3557] text-lg">{t('cards.chooseCard')}</h4>
                                        <div className="flex md:grid md:grid-cols-1 overflow-x-auto md:overflow-visible gap-4 pb-4 md:pb-0 snap-x hide-scrollbar -mx-2 px-2 md:mx-0 md:px-0">
                                            {Object.entries(CARD_CATALOG).map(([id, card]) => (
                                                <button
                                                    key={id}
                                                    onClick={() => { setOrderData({ ...orderData, type: id, is_physical: card.isPhy }); setSelectedPlan(null); }}
                                                    className={`min-w-[85vw] md:min-w-0 snap-center text-left p-5 rounded-2xl border-2 transition-all ${orderData.type === id ? 'border-[#E63746] bg-red-50/20 shadow-lg shadow-red-100/50' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'}`}
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-14 h-9 rounded-lg bg-gradient-to-br ${card.color} shadow-md flex items-center justify-center`}>
                                                                <span className="text-sm">{card.icon}</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-[#1D3557]">{card.name}</p>
                                                                <p className="text-xs text-gray-400">{card.isPhy ? t('cards.physicalCard') : t('cards.digitalCard')}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xl font-black text-[#E63746]">{fc(card.monthlyPrice, 'EUR')}</p>
                                                            <p className="text-[10px] text-gray-400 uppercase font-bold">/{t('cards.perMonth')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {card.features.map((f, i) => (
                                                            <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-white border border-gray-100 text-gray-500 font-medium">{f}</span>
                                                        ))}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Plan Selection */}
                                        {orderData.type && (
                                            <div className="space-y-3">
                                                <h4 className="font-bold text-[#1D3557]">{t('cards.choosePlan')}</h4>
                                                <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible gap-3 pb-4 pt-3 md:pb-0 md:pt-0 snap-x hide-scrollbar -mx-2 px-2 md:mx-0 md:px-0">
                                                    {getSelectedCardInfo().plans.map((plan) => {
                                                        const total = getPlanPrice(orderData.type, plan);
                                                        const monthlyEquiv = Math.round(total / plan.months);
                                                        const isSelected = selectedPlan?.id === plan.id;
                                                        return (
                                                            <button
                                                                key={plan.id}
                                                                onClick={() => setSelectedPlan(plan)}
                                                                className={`min-w-[55vw] md:min-w-0 snap-center relative p-4 rounded-xl border-2 transition-all text-center ${isSelected ? 'border-[#E63746] bg-red-50/30 shadow-md' : 'border-gray-100 hover:border-gray-200 md:mt-0'}`}
                                                            >
                                                                {plan.discount > 0 && (
                                                                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#E63746] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">-{plan.discount}%</span>
                                                                )}
                                                                <p className="font-bold text-[#1D3557] text-sm mt-1">{plan.label}</p>
                                                                <p className="text-2xl font-black text-[#1D3557] my-1">{fc(total, 'EUR')}</p>
                                                                <p className="text-[10px] text-gray-400">{fc(monthlyEquiv, 'EUR')}/{t('cards.perMonth')} • {plan.months} {t('cards.months')}</p>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            disabled={!selectedPlan}
                                            onClick={() => setOrderStep(orderData.is_physical ? 2 : 3)}
                                            className="w-full bg-[#1D3557] text-white py-4 rounded-2xl font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1D3557]/90 transition-colors"
                                        >
                                            {t('cards.continue')}
                                        </button>
                                    </div>
                                )}

                                {/* Step 2: Address */}
                                {orderStep === 2 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setOrderStep(1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><ArrowLeft size={16} /></button>
                                            <h4 className="font-bold text-[#1D3557] text-lg">{t('cards.deliveryAddress')}</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <input type="text" placeholder={t('cards.fullAddress')} value={orderData.address.street} onChange={(e) => setOrderData({ ...orderData, address: { ...orderData.address, street: e.target.value } })} className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 focus:border-[#E63746] focus:ring-2 focus:ring-[#E63746]/20 outline-none transition-all" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" placeholder={t('cards.postalCode')} value={orderData.address.zip} onChange={(e) => setOrderData({ ...orderData, address: { ...orderData.address, zip: e.target.value } })} className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 focus:border-[#E63746] focus:ring-2 focus:ring-[#E63746]/20 outline-none transition-all" />
                                                <input type="text" placeholder={t('cards.city')} value={orderData.address.city} onChange={(e) => setOrderData({ ...orderData, address: { ...orderData.address, city: e.target.value } })} className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 focus:border-[#E63746] focus:ring-2 focus:ring-[#E63746]/20 outline-none transition-all" />
                                            </div>
                                        </div>
                                        <button
                                            disabled={!orderData.address.street || !orderData.address.city}
                                            onClick={() => setOrderStep(3)}
                                            className="w-full bg-[#1D3557] text-white py-4 rounded-2xl font-black uppercase tracking-widest disabled:opacity-40"
                                        >
                                            {t('cards.validateAddress')}
                                        </button>
                                    </div>
                                )}

                                {/* Step 3: Confirmation */}
                                {orderStep === 3 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setOrderStep(orderData.is_physical ? 2 : 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><ArrowLeft size={16} /></button>
                                            <h4 className="font-bold text-[#1D3557] text-lg">{t('cards.summary')}</h4>
                                        </div>
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-16 h-10 rounded-lg bg-gradient-to-br ${getSelectedCardInfo().color} shadow-md flex items-center justify-center`}>
                                                    <span>{getSelectedCardInfo().icon}</span>
                                                </div>
                                                <div>
                                                    <p className="font-black text-[#1D3557]">{getSelectedCardInfo().name}</p>
                                                    <p className="text-xs text-gray-400">{t('cards.plan')} {selectedPlan?.label}</p>
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">{t('cards.monthlyRate')}</span>
                                                    <span className="font-bold text-[#1D3557]">{fc(getSelectedCardInfo().monthlyPrice, 'EUR')}/{t('cards.perMonth')}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">{t('cards.duration')}</span>
                                                    <span className="font-bold text-[#1D3557]">{selectedPlan?.months} {t('cards.months')}</span>
                                                </div>
                                                {selectedPlan?.discount > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">{t('cards.discount')}</span>
                                                        <span className="font-bold text-green-500">-{selectedPlan.discount}%</span>
                                                    </div>
                                                )}

                                                {/* Account check visualization */}
                                                <div className="flex justify-between text-sm pt-2">
                                                    <span className="text-gray-500">{t('cards.paymentMethod') || 'Moyen de paiement'}</span>
                                                    {accounts.find(a => a.balance >= getCardPrice()) ? (
                                                        <span className="font-bold text-[#1D3557] flex items-center gap-1">
                                                            <Wallet size={14} /> Solde disponible
                                                        </span>
                                                    ) : (
                                                        <span className="font-bold text-red-500 flex items-center gap-1">
                                                            <Ban size={14} /> Solde insuffisant
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between py-3 border-t border-gray-100 mt-2">
                                                    <span className="text-sm font-bold text-[#1D3557] tracking-tight">{t('cards.totalPay')}</span>
                                                    <span className="font-black text-[#E63746]">{fc(getCardPrice(), 'EUR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleOrderCard}
                                            disabled={isOrderingProcess}
                                            className="w-full bg-[#E63746] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#E63746]/90 transition-colors disabled:opacity-60"
                                        >
                                            {isOrderingProcess ? <RefreshCw className="animate-spin inline mr-2" size={18} /> : null}
                                            {isOrderingProcess ? t('cards.processing') : `${t('cards.pay')} ${fc(getCardPrice(), 'EUR')}`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de suppression */}
            <AnimatePresence>
                {isDeleting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#1D3557]/60 backdrop-blur-md z-[110] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white rounded-[40px] w-full max-w-md p-10 text-center shadow-2xl"
                        >
                            <div className="w-20 h-20 bg-red-50 text-[#E63746] rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trash2 size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-[#1D3557] mb-2">{t('cards.deleteConfirm')}</h3>
                            <p className="text-gray-500 text-sm mb-8">{t('cards.deleteIrreversible')}</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setIsDeleting(false)} className="py-4 rounded-2xl font-bold text-gray-500">{t('common.cancel')}</button>
                                <button onClick={handleDeleteCard} disabled={isDeletingProcess} className="py-4 rounded-2xl bg-[#E63746] text-white font-bold">
                                    {isDeletingProcess ? <RefreshCw className="animate-spin" /> : t('common.confirm')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageWrapper >
    );
};

export default Cards;

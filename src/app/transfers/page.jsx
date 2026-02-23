"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    Wallet,
    Search,
    Calendar,
    Send,
    Plus,
    CheckCircle2,
    Clock,
    Info,
    ChevronDown,
    User,
    X,
    Building2,
    CreditCard,
    AtSign,
    Hash,
    Loader2
} from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { useConfirm } from '@/contexts/ConfirmContext';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLocale } from '@/contexts/LocaleContext';

const Transfers = () => {
    const { user } = useAuth();
    const confirm = useConfirm();
    const { t, fc, cs, language } = useLocale();
    const [accounts, setAccounts] = useState([]);
    const [srcAccount, setSrcAccount] = useState(null);
    const [destAccount, setDestAccount] = useState(null);
    const [transferMode, setTransferMode] = useState('p2p'); // 'p2p', 'internal', 'external'
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    // Beneficiaries State
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
    const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
    const [newBeneficiary, setNewBeneficiary] = useState({ name: '', iban: '' });
    const [saveBeneficiary, setSaveBeneficiary] = useState(false);
    const [manualBeneficiaryName, setManualBeneficiaryName] = useState('');
    const [manualBeneficiaryIban, setManualBeneficiaryIban] = useState('');

    // P2P State
    const [p2pIdentifier, setP2pIdentifier] = useState('');
    const [p2pRecipient, setP2pRecipient] = useState(null); // { account_id, owner_name, identifier_type }
    const [isVerifyingP2P, setIsVerifyingP2P] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (user) {
            fetchAccounts();
            fetchBeneficiaries();
        }
    }, [user]);

    const fetchAccounts = async () => {
        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setAccounts(data || []);
            if (data?.length > 0 && !srcAccount) {
                setSrcAccount(data[0]);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            toast.error(t('transfers.loadError'));
        } finally {
            setIsFetching(false);
        }
    };

    const fetchBeneficiaries = async () => {
        try {
            const { data, error } = await supabase
                .from('beneficiaries')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBeneficiaries(data || []);
        } catch (error) {
            console.error('Error fetching beneficiaries:', error);
        }
    };

    const handleAddBeneficiary = async () => {
        if (!newBeneficiary.name || !newBeneficiary.iban) {
            toast.error(t('transfers.fillNameIban'));
            return;
        }
        try {
            const { error } = await supabase.from('beneficiaries').insert([{
                user_id: user.id,
                name: newBeneficiary.name,
                iban: newBeneficiary.iban
            }]);

            if (error) throw error;
            toast.success(t('transfers.beneficiaryAdded'));
            fetchBeneficiaries();
            setShowAddBeneficiary(false);
            setNewBeneficiary({ name: '', iban: '' });
        } catch (error) {
            toast.error(t('transfers.addError'));
            console.error(error);
        }
    };

    const verifyP2PRecipient = async () => {
        if (!p2pIdentifier.trim()) {
            toast.error(t('transfers.enterEmailOrAccount'));
            return;
        }

        setIsVerifyingP2P(true);
        setP2pRecipient(null);

        try {
            // Using RPC for secure lookup
            const { data, error } = await supabase.rpc('get_recipient_details', {
                identifier_text: p2pIdentifier.trim()
            });

            if (error) throw error;

            if (data && data.length > 0) {
                const recipient = data[0];
                // Prevent self-transfer if user enters their own details
                if (srcAccount && recipient.account_id === srcAccount.id) {
                    toast.error(t('transfers.cannotSelfTransfer'));
                    return;
                }
                setP2pRecipient(recipient);
                toast.success(`${t('transfers.recipientFound')} : ${recipient.owner_name}`);
            } else {
                toast.error(t('transfers.noRecipientFound'));
            }
        } catch (error) {
            console.error(error);
            toast.error(t('transfers.verificationError'));
        } finally {
            setIsVerifyingP2P(false);
        }
    };

    const handleBeneficiaryClick = async (b) => {
        if (!b.iban) return;

        const toastId = toast.loading(t('common.loading') || 'Vérification en cours...');

        try {
            // Check if this identifier exists as an internal user
            const { data, error } = await supabase.rpc('get_recipient_details', {
                identifier_text: b.iban.trim()
            });

            if (!error && data && data.length > 0) {
                // It is an internal transfer
                toast.dismiss(toastId);
                const recipient = data[0];
                if (srcAccount && recipient.account_id === srcAccount.id) {
                    toast.error(t('transfers.cannotSelfTransfer'));
                    return;
                }
                setTransferMode('p2p');
                setP2pIdentifier(b.iban);
                setP2pRecipient(recipient);
                toast.success(`${t('transfers.recipientFound')} : ${recipient.owner_name}`);
                return;
            }
        } catch (error) {
            // Fallback securely below
        }

        toast.dismiss(toastId);

        // If it looks like an email but wasn't found, it defaults to P2P anyway
        if (b.iban.includes('@')) {
            toast.error(t('transfers.noRecipientFound') || 'Bénéficiaire introuvable.');
            setTransferMode('p2p');
            setP2pIdentifier(b.iban);
        } else {
            // Otherwise it's classical external transfer
            setTransferMode('external');
            setSelectedBeneficiary(b);
        }
    };

    const handleTransfer = async () => {
        // Validation Common
        if (!srcAccount) {
            toast.error(t('transfers.selectSourceAccount'));
            return;
        }

        const amt = parseFloat(amount.replace(',', '.'));
        if (isNaN(amt) || amt <= 0) {
            toast.error(t('transfers.invalidAmount'));
            return;
        }

        if (amt > srcAccount.balance) {
            toast.error(t('transfers.insufficientFunds'));
            return;
        }

        let targetName = '';
        let targetDetail = '';
        let rpcToCall = '';
        let rpcParams = {};

        if (transferMode === 'internal') {
            if (!destAccount) {
                toast.error(t('transfers.selectDestAccount'));
                return;
            }
            targetName = destAccount.name;
            rpcToCall = 'transfer_funds';
            rpcParams = {
                sender_account_id: srcAccount.id,
                receiver_account_id: destAccount.id,
                amount_to_transfer: amt,
                description_text: description || t('transfers.internalTransfer')
            };
        } else if (transferMode === 'p2p') {
            if (!p2pRecipient) {
                toast.error(t('transfers.verifyRedBankRecipient'));
                return;
            }
            targetName = p2pRecipient.owner_name;
            targetDetail = p2pIdentifier;
            // P2P uses the same reliable internal transfer logic once Account ID is known
            rpcToCall = 'transfer_funds';
            rpcParams = {
                sender_account_id: srcAccount.id,
                receiver_account_id: p2pRecipient.account_id,
                amount_to_transfer: amt,
                description_text: description || `${t('transfers.redBankTransferTo')} ${targetName}`
            };
        } else {
            // External
            if (selectedBeneficiary) {
                targetName = selectedBeneficiary.name;
                targetDetail = selectedBeneficiary.iban;
            } else {
                if (!manualBeneficiaryName || !manualBeneficiaryIban) {
                    toast.error(t('transfers.enterBeneficiaryDetails'));
                    return;
                }
                targetName = manualBeneficiaryName;
                targetDetail = manualBeneficiaryIban;
            }
            // NEW: Instead of pay_external RPC (instant), create a PENDING transaction
            // Admin will validate it. Balance is NOT deducted yet.
            const { error: txErr } = await supabase.from('transactions').insert([{
                account_id: srcAccount.id,
                user_id: user.id,
                amount: -amt,
                type: 'external',
                description: description || t('transfers.transfer'),
                status: 'pending_approval',
                beneficiary_name: targetName,
                beneficiary_iban: targetDetail,
                date: new Date().toISOString().split('T')[0],
                created_at: new Date().toISOString()
            }]);

            if (txErr) throw txErr;

            // Success handling below bypasses RPC call
            toast.success("Demande de virement envoyée à l'administrateur !");
            setAmount('');
            setDescription('');
            setManualBeneficiaryName('');
            setManualBeneficiaryIban('');
            setSelectedBeneficiary(null);
            fetchAccounts();
            setIsLoading(false);
            return;
        }

        // Confirmation
        const isConfirmed = await confirm({
            title: t('transfers.confirmTitle'),
            message: (
                <div className="space-y-2">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all border-l-4 border-l-[#E63746]">
                        <p>{t('transfers.confirmMessage')} <strong className="text-[#1D3557]">{fc(amt, srcAccount?.currency)}</strong>.</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        <p><span className="text-gray-500">{t('transfers.from')} :</span> {srcAccount.name}</p>
                        <p><span className="text-gray-500">{t('transfers.to')} :</span> {targetName}</p>
                        {targetDetail && <p><span className="text-gray-500">{t('transfers.detail')} :</span> {targetDetail}</p>}
                    </div>
                </div>
            ),
            confirmText: t('transfers.confirmAndSend'),
            cancelText: t('common.cancel'),
            variant: 'danger'
        });

        if (!isConfirmed) return;

        setIsLoading(true);
        try {
            const { error } = await supabase.rpc(rpcToCall, rpcParams);
            if (error) throw error;

            // Save beneficiary logic for external
            if (transferMode === 'external' && saveBeneficiary && !selectedBeneficiary) {
                await supabase.from('beneficiaries').insert([{
                    user_id: user.id,
                    name: targetName,
                    iban: targetDetail
                }]);
                fetchBeneficiaries();
            }

            toast.success(t('transfers.transferSuccess'));
            setAmount('');
            setDescription('');
            setManualBeneficiaryName('');
            setManualBeneficiaryIban('');
            setSelectedBeneficiary(null);
            setP2pIdentifier('');
            setP2pRecipient(null);
            fetchAccounts(); // Refresh balances
        } catch (error) {
            console.error('Transfer Error:', error);
            toast.error(error.message || t('transfers.transferError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAmount = (val) => {
        const current = parseFloat(amount) || 0;
        setAmount((current + val).toString());
    };

    if (!isMounted) return null;

    if (isFetching) {
        return (
            <PageWrapper>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column Skeleton */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 space-y-8">
                            {/* Source Accounts Skeleton */}
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-32" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2].map((i) => (
                                        <Skeleton key={i} className="h-20 rounded-2xl" />
                                    ))}
                                </div>
                            </div>

                            {/* Mode Toggle Skeleton */}
                            <Skeleton className="h-12 w-64 rounded-2xl" />

                            {/* Destination Skeleton */}
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-24 rounded-2xl" />
                            </div>

                            {/* Amount Skeleton */}
                            <div className="py-12 bg-gray-50 rounded-3xl flex flex-col items-center justify-center space-y-4">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-20 w-48" />
                            </div>

                            <Skeleton className="h-14 w-full rounded-xl" />
                        </div>
                    </div>

                    {/* Right Column Skeleton */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Summary Card Skeleton */}
                        <Skeleton className="h-48 rounded-2xl" />

                        {/* Favorites Widget Skeleton */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                            <Skeleton className="h-6 w-32" />
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="pb-12 space-y-8 relative">
            {/* Add Beneficiary Modal */}
            <AnimatePresence>
                {showAddBeneficiary && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddBeneficiary(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-[#1D3557]">{t('transfers.newBeneficiary')}</h3>
                                <button onClick={() => setShowAddBeneficiary(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">
                                    <X size={20} className="text-gray-600" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('profile.fullName')}</label>
                                    <input
                                        type="text"
                                        value={newBeneficiary.name}
                                        onChange={e => setNewBeneficiary({ ...newBeneficiary, name: e.target.value })}
                                        className="w-full p-3 bg-gray-50 rounded-xl border-gray-100 focus:ring-[#E63746] focus:border-[#E63746]"
                                        placeholder="Ex: Jean Dupont"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('transfers.iban')}</label>
                                    <input
                                        type="text"
                                        value={newBeneficiary.iban}
                                        onChange={e => setNewBeneficiary({ ...newBeneficiary, iban: e.target.value })}
                                        className="w-full p-3 bg-gray-50 rounded-xl border-gray-100 focus:ring-[#E63746] focus:border-[#E63746]"
                                        placeholder="FR76 ..."
                                    />
                                </div>
                                <button
                                    onClick={handleAddBeneficiary}
                                    className="w-full py-3 bg-[#E63746] text-white font-bold rounded-xl mt-4 hover:bg-[#E63746]/90 transition-colors shadow-lg shadow-red-200"
                                >
                                    {t('transfers.addBeneficiary')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Transfer Form */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Tabs */}
                        {/* Tabs & Date/Motif Hidden by Request */}

                        <div className="p-8 space-y-8">
                            {/* Source Account */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('transfers.fromAccount')}</label>
                                <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                                    {accounts.map((acc) => (
                                        <div
                                            key={acc.id}
                                            onClick={() => setSrcAccount(acc)}
                                            className={`min-w-[75vw] md:min-w-0 md:flex-1 snap-center p-3 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden group active:scale-[0.98] ${srcAccount?.id === acc.id ? 'border-[#E63746] bg-white shadow-md' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg flex-shrink-0 ${srcAccount?.id === acc.id ? 'bg-[#E63746] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                    <Wallet size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-[10px] font-black truncate ${srcAccount?.id === acc.id ? 'text-[#1D3557]' : 'text-gray-500'}`}>{acc.name}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 tracking-tighter">{fc(parseFloat(acc.balance), acc.currency)}</p>
                                                </div>
                                            </div>
                                            {srcAccount?.id === acc.id && (
                                                <motion.div layoutId="src-check" className="absolute top-1.5 right-1.5 text-[#E63746]">
                                                    <CheckCircle2 size={14} />
                                                </motion.div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Transfer Mode Toggle */}
                            <div className="flex p-1 bg-gray-100 rounded-2xl w-full sm:w-fit overflow-x-auto">
                                <button
                                    onClick={() => { setTransferMode('p2p'); setP2pRecipient(null); setP2pIdentifier(''); }}
                                    className={`px-4 sm:px-6 py-2 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all whitespace-nowrap ${transferMode === 'p2p' ? 'bg-white text-[#E63746] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {t('transfers.internal')}
                                </button>
                                <button
                                    onClick={() => { setTransferMode('internal'); setDestAccount(null); }}
                                    className={`px-4 sm:px-6 py-2 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all whitespace-nowrap ${transferMode === 'internal' ? 'bg-white text-[#E63746] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {t('transfers.myAccounts')}
                                </button>
                                <button
                                    onClick={() => { setTransferMode('external'); setSelectedBeneficiary(null); }}
                                    className={`px-4 sm:px-6 py-2 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all whitespace-nowrap ${transferMode === 'external' ? 'bg-white text-[#1D3557] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {t('transfers.external')}
                                </button>
                            </div>

                            {/* Destination Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    {transferMode === 'internal' ? t('transfers.toAccount') :
                                        transferMode === 'p2p' ? t('transfers.redBankRecipient') : t('transfers.externalBeneficiary')}
                                </label>

                                {transferMode === 'internal' && (
                                    <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                                        {accounts.filter(acc => acc.id !== srcAccount?.id).map((acc) => (
                                            <div
                                                key={acc.id}
                                                onClick={() => setDestAccount(acc)}
                                                className={`min-w-[75vw] md:min-w-0 md:flex-1 snap-center p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${destAccount?.id === acc.id ? 'border-[#1D3557] bg-white shadow-lg' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl flex-shrink-0 ${destAccount?.id === acc.id ? 'bg-[#1D3557] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                        <Wallet size={18} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`text-xs font-black truncate ${destAccount?.id === acc.id ? 'text-[#1D3557]' : 'text-gray-500'}`}>{acc.name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400">{fc(parseFloat(acc.balance), acc.currency)}</p>
                                                    </div>
                                                </div>
                                                {destAccount?.id === acc.id && (
                                                    <motion.div layoutId="dest-check" className="absolute top-2 right-2 text-[#1D3557]">
                                                        <CheckCircle2 size={16} />
                                                    </motion.div>
                                                )}
                                            </div>
                                        ))}
                                        {accounts.length <= 1 && (
                                            <p className="text-xs font-medium text-gray-400 p-4 bg-gray-50 rounded-2xl italic">{t('transfers.noOtherAccount')}</p>
                                        )}
                                    </div>
                                )}

                                {transferMode === 'p2p' && (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <AtSign size={18} className="text-[#1D3557]/40" />
                                                    </div>
                                                    <input
                                                        className="w-full pl-12 pr-4 py-4 bg-white border border-blue-100 rounded-xl focus:ring-2 focus:ring-[#1D3557]/20 focus:border-[#1D3557] text-[#1D3557] placeholder:text-gray-400 transition-all font-medium text-sm"
                                                        placeholder={t('transfers.emailOrAccountPlaceholder')}
                                                        type="text"
                                                        value={p2pIdentifier}
                                                        onChange={(e) => setP2pIdentifier(e.target.value)}
                                                    />
                                                </div>
                                                <button
                                                    onClick={verifyP2PRecipient}
                                                    disabled={isVerifyingP2P || !p2pIdentifier}
                                                    className="px-6 rounded-xl bg-[#1D3557] text-white font-bold text-sm hover:bg-[#1D3557]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    {isVerifyingP2P ? <Loader2 className="animate-spin" size={18} /> : t('transfers.verify')}
                                                </button>
                                            </div>

                                            {p2pRecipient && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-4 flex items-center gap-3 p-4 bg-white rounded-xl border border-green-100 shadow-sm"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold">
                                                        <CheckCircle2 size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-[#1D3557]">{p2pRecipient.owner_name}</p>
                                                        <p className="text-xs text-green-600 font-bold uppercase tracking-wider">{t('transfers.verifiedAccount')} ({p2pRecipient.identifier_type})</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {transferMode === 'external' && (
                                    <div className="space-y-4">
                                        {/* External Transfer Input */}
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                            {/* Beneficiary Selection if any */}
                                            {selectedBeneficiary ? (
                                                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#1D3557]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-[#1D3557]/10 flex items-center justify-center text-[#1D3557] font-bold">
                                                            {selectedBeneficiary.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-[#1D3557]">{selectedBeneficiary.name}</p>
                                                            <p className="text-xs text-gray-500">{selectedBeneficiary.iban}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => setSelectedBeneficiary(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                                        <X size={16} className="text-gray-400" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                        <input
                                                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1D3557]/20 focus:border-[#1D3557] text-[#1D3557] placeholder:text-gray-400 transition-all font-medium text-sm"
                                                            placeholder={t('transfers.beneficiaryNamePlaceholder')}
                                                            type="text"
                                                            value={manualBeneficiaryName}
                                                            onChange={(e) => setManualBeneficiaryName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                        <input
                                                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1D3557]/20 focus:border-[#1D3557] text-[#1D3557] placeholder:text-gray-400 transition-all font-medium text-sm"
                                                            placeholder="IBAN (FR76 ...)"
                                                            type="text"
                                                            value={manualBeneficiaryIban}
                                                            onChange={(e) => setManualBeneficiaryIban(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Beneficiaries Quick Select */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2 px-1">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">{t('transfers.orChooseBeneficiary')}</span>
                                                <button onClick={() => setShowAddBeneficiary(true)} className="text-[10px] font-bold text-[#E63746] hover:underline flex items-center gap-1">
                                                    <Plus size={12} /> {t('transfers.new')}
                                                </button>
                                            </div>
                                            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                                {beneficiaries.map((b) => (
                                                    <div
                                                        key={b.id}
                                                        onClick={() => handleBeneficiaryClick(b)}
                                                        className={`flex-shrink-0 flex items-center gap-2 p-2 pr-4 rounded-full border cursor-pointer transition-all ${selectedBeneficiary?.id === b.id ? 'bg-[#1D3557] text-white border-[#1D3557]' : 'bg-white border-gray-100 hover:border-gray-200 text-gray-600'}`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${selectedBeneficiary?.id === b.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                            {b.name.charAt(0)}
                                                        </div>
                                                        <span className="text-xs font-bold whitespace-nowrap">{b.name}</span>
                                                    </div>
                                                ))}
                                                {beneficiaries.length === 0 && (
                                                    <span className="text-xs text-gray-400 italic pl-1">{t('transfers.noBeneficiaries')}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* XXL Amount Input Redesigned */}
                            <div className="py-8 md:py-12 bg-gray-50/50 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group hover:bg-white hover:shadow-xl hover:shadow-red-500/5 hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:border-red-100 px-4">
                                <label className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 md:mb-6 transition-colors group-hover:text-[#1D3557]">{t('transfers.transferAmount')}</label>

                                <div className="flex items-center justify-center gap-1 relative z-10 w-full">
                                    <input
                                        className="text-4xl sm:text-7xl md:text-8xl font-black text-center bg-transparent border-0 border-b-2 border-gray-200 focus:border-[#E63746] focus:ring-0 px-2 py-1 text-[#1D3557] w-full max-w-[60%] sm:max-w-[70%] placeholder-gray-200 tracking-tighter transition-colors"
                                        placeholder="0"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        min="0"
                                    />
                                    <span className="text-2xl sm:text-5xl md:text-6xl font-black text-[#E63746] animate-pulse-slow self-end sm:self-start mb-2 sm:mt-2 sm:mb-0 ml-1">{cs(srcAccount?.currency)}</span>
                                </div>

                                <div className="mt-6 md:mt-8 flex gap-2 md:gap-3 z-10 flex-wrap justify-center w-full">
                                    {[20, 50, 100, 200].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => handleAddAmount(val)}
                                            className="px-3 md:px-5 py-2 md:py-2.5 rounded-xl border border-gray-200 bg-white text-[10px] md:text-xs font-bold text-gray-500 hover:bg-[#E63746] hover:text-white hover:border-[#E63746] hover:shadow-lg hover:shadow-red-500/30 transition-all active:scale-95 flex items-center gap-1 flex-1 min-w-[60px] max-w-[100px] justify-center"
                                        >
                                            <Plus size={12} className="hidden sm:inline" /> +{val}
                                        </button>
                                    ))}
                                </div>

                                {/* Background Decoration */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#E63746]/5 rounded-full blur-3xl -z-10 -mr-20 -mt-20 pointer-events-none group-hover:bg-[#E63746]/10 transition-colors duration-500"></div>
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#1D3557]/5 rounded-full blur-2xl -z-10 -ml-10 -mb-10 pointer-events-none group-hover:bg-[#1D3557]/10 transition-colors duration-500"></div>
                            </div>

                            {/* Options Grid */}
                            {/* Date & Motif Hidden by Request */}

                            {/* Footer Actions */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
                                {transferMode === 'external' && !selectedBeneficiary && (
                                    <label className="flex items-center cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                className="sr-only peer"
                                                type="checkbox"
                                                checked={saveBeneficiary}
                                                onChange={(e) => setSaveBeneficiary(e.target.checked)}
                                            />
                                            <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#E63746] transition-colors"></div>
                                            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                                        </div>
                                        <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-[#E63746] transition-colors">{t('transfers.saveBeneficiary')}</span>
                                    </label>
                                )}
                                <div className="flex gap-6 text-xs font-medium ml-auto">
                                    <div className="flex flex-col text-right">
                                        <span className="text-gray-600 uppercase font-bold">{t('transfers.estimatedFees')}</span>
                                        <span className="text-[#1D3557]">{fc(0, srcAccount?.currency)}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-gray-600 uppercase font-bold">{t('transfers.processing')}</span>
                                        <span className="text-[#E63746] font-bold">{t('transfers.instant')}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleTransfer}
                                disabled={isLoading}
                                className="w-full py-4 bg-[#E63746] hover:bg-[#E63746]/90 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        {t('transfers.send')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Summary Card */}
                    <div className="bg-[#E63746] p-6 rounded-2xl text-white shadow-xl shadow-red-200 relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-6">{t('transfers.realTimeSummary')}</h3>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/60">
                                <span>{t('transfers.origin')}</span>
                                <span className="text-white bg-white/10 px-2 py-0.5 rounded truncate max-w-[150px]">{srcAccount?.name || '...'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-sm">{t('transfers.recipient')}</span>
                                <span className="font-semibold text-sm truncate max-w-[150px]">
                                    {transferMode === 'internal'
                                        ? (destAccount?.name || t('transfers.selectPlaceholder'))
                                        : transferMode === 'p2p'
                                            ? (p2pRecipient?.owner_name || t('transfers.verificationRequired'))
                                            : (selectedBeneficiary?.name || manualBeneficiaryName || t('transfers.selectPlaceholder'))}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-sm">{t('common.amount')}</span>
                                <span className="font-black text-2xl">{fc(parseFloat(amount.replace(',', '.')) || 0, srcAccount?.currency)}</span>
                            </div>
                            <div className="pt-4 border-t border-white/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-white/70 text-sm">{t('transfers.newBalance')}</span>
                                    <span className={`font-black text-lg ${srcAccount && (srcAccount.balance - (parseFloat(amount.replace(',', '.')) || 0) < 0) ? 'text-orange-300' : 'text-white'}`}>
                                        {srcAccount ? fc(srcAccount.balance - (parseFloat(amount.replace(',', '.')) || 0), srcAccount.currency) : fc(0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Beneficiaries List Widget */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-[#1D3557] uppercase tracking-wider">{t('transfers.favorites')}</h3>
                            <button onClick={() => setShowAddBeneficiary(true)} className="text-[#E63746] text-xs font-bold hover:underline">{t('transfers.addBeneficiary')}</button>
                        </div>
                        <div className="space-y-4">
                            {beneficiaries.map(b => (
                                <div
                                    key={b.id}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-[#E63746]/5 transition-colors cursor-pointer group"
                                    onClick={() => handleBeneficiaryClick(b)}
                                >
                                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-[#1D3557] group-hover:text-[#E63746] group-hover:border-[#E63746] transition-colors text-sm">
                                        {b.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-[#1D3557] text-sm group-hover:text-[#E63746] transition-colors">{b.name}</p>
                                        <p className="text-xs text-gray-400">{b.iban}</p>
                                    </div>
                                    <div className="text-gray-300 group-hover:text-[#E63746]">
                                        <Send size={16} />
                                    </div>
                                </div>
                            ))}
                            {beneficiaries.length === 0 && (
                                <p className="text-xs text-gray-400 text-center py-4">{t('transfers.noFavorites')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default Transfers;

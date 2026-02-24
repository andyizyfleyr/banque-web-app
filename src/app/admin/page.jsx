"use client";
import React, { useState, useEffect, useRef } from 'react';
import { countries } from '@/config/countries';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Users, CreditCard, ArrowLeftRight, Landmark, LayoutDashboard,
    ChevronDown, Search, MoreHorizontal, CheckCircle, XCircle,
    Clock, Eye, EyeOff, Ban, Trash2, Shield, LogOut, TrendingUp, AlertTriangle,
    RefreshCw, Filter, ChevronLeft, ChevronRight, Menu, X, Wallet,
    History, UserCog, Trash, Settings, Plus, UserPlus, Lock, CreditCard as CardIcon,
    MessageSquare
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const ADMIN_EMAILS = ['admin@financer.com', 'jacques@financer.com'];
const ADMIN_PASSWORD = 'Financer2026!';

const AdminPage = () => {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Admin auth gate
    const [adminAuth, setAdminAuth] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Data states
    const [users, setUsers] = useState([]);
    const [loans, setLoans] = useState([]);
    const [cards, setCards] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [stats, setStats] = useState({ users: 0, loans: 0, cards: 0, transfers: 0, totalBalance: 0, pendingLoans: 0, unreadMessages: 0 });
    const [conversations, setConversations] = useState({});
    const [activeConversation, setActiveConversation] = useState(null);
    const [adminReply, setAdminReply] = useState('');
    const chatScrollRef = useRef(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Advanced User Management
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [balanceForm, setBalanceForm] = useState({ amount: '', operation: 'credit', description: '', accountId: '' });
    const [actionLoading, setActionLoading] = useState(false);

    // Create User Feature
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [addUserForm, setAddUserForm] = useState({ email: '', password: '', fullName: '', initialBalance: '0', country: 'FR' });

    // Check session for admin auth
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = sessionStorage.getItem('adminAuth');
            if (stored === 'true') setAdminAuth(true);
        }
    }, []);

    // Fetch data when admin is authenticated
    useEffect(() => {
        if (adminAuth) fetchAllData();
    }, [adminAuth]);

    const handleAdminLogin = (e) => {
        e.preventDefault();
        if (adminPassword === ADMIN_PASSWORD) {
            setAdminAuth(true);
            setPasswordError('');
            sessionStorage.setItem('adminAuth', 'true');
            sessionStorage.setItem('adminPwd', adminPassword);
        } else {
            setPasswordError('Mot de passe incorrect');
            setAdminPassword('');
        }
    };

    // Admin login gate
    if (!adminAuth) return (
        <div className="min-h-screen bg-gradient-to-br from-[#1D3557] via-[#1D3557] to-[#0d1b2a] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#E63746] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/30">
                        <Shield size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white">Admin Panel</h1>
                    <p className="text-white/40 text-sm mt-2">Financer Group — Accès restreint</p>
                </div>
                <form onSubmit={handleAdminLogin} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Mot de passe administrateur</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={adminPassword}
                                onChange={(e) => { setAdminPassword(e.target.value); setPasswordError(''); }}
                                placeholder="Entrez le mot de passe..."
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 outline-none focus:border-[#E63746]/50 focus:ring-2 focus:ring-[#E63746]/20 transition-all text-sm"
                                autoFocus
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {passwordError && (
                            <p className="text-red-400 text-xs font-bold flex items-center gap-1 mt-1">
                                <XCircle size={14} />{passwordError}
                            </p>
                        )}
                    </div>
                    <button type="submit" className="w-full py-4 bg-[#E63746] text-white rounded-xl font-bold text-sm hover:bg-[#C1121F] transition-colors shadow-lg shadow-red-900/30 flex items-center justify-center gap-2">
                        <Shield size={16} />Accéder au panel admin
                    </button>
                    <p className="text-center text-white/20 text-xs">Session sécurisée • Financer Group</p>
                </form>
            </div>
        </div>
    );

    const adminApiCall = async (action, payload = {}) => {
        const storedPwd = sessionStorage.getItem('adminPwd');
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: storedPwd || ADMIN_PASSWORD, action, payload })
        });
        return res.json();
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const data = await adminApiCall('fetchAll');
            if (data.error) { toast.error('Erreur: ' + data.error); setLoading(false); return; }

            const u = data.users || [];
            const l = data.loans || [];
            const c = data.cards || [];
            const tx = data.transactions || [];
            const acc = data.accounts || [];
            const msgData = await adminApiCall('fetchMessages');
            const msgs = msgData.messages || [];

            setUsers(u); setLoans(l); setCards(c); setTransactions(tx); setAccounts(acc); setMessages(msgs);

            // Organize messages by user (conversation)
            const convs = {};
            msgs.forEach(m => {
                // Determine the "other user" in the conversation
                // If receiver_id is null, the message was sent TO admin, so group by sender_id
                // If sender is admin (user.id), group by receiver_id
                // Otherwise group by sender_id
                let conversationUserId;
                if (m.sender_id === user.id) {
                    conversationUserId = m.receiver_id;
                } else {
                    conversationUserId = m.sender_id;
                }
                if (!conversationUserId) return; // Skip if still null (admin sent to no one)
                if (!convs[conversationUserId]) convs[conversationUserId] = [];
                convs[conversationUserId].push(m);
            });
            setConversations(convs);

            setStats({
                users: u.length, loans: l.length, cards: c.length,
                transfers: tx.filter(t => t.type === 'transfer' || t.type === 'external').length,
                totalBalance: acc.reduce((s, a) => s + Number(a.balance || 0), 0),
                pendingLoans: l.filter(lo => lo.status === 'pending_approval').length,
                pendingTransfers: tx.filter(t => t.status === 'pending_approval').length,
                unreadMessages: msgs.filter(m => !m.is_read && m.sender_id !== user.id && (m.receiver_id === user.id || m.receiver_id === null)).length
            });
        } catch (e) { console.error(e); toast.error('Erreur de chargement'); }
        setLoading(false);
    };

    const updateTransferStatus = async (id, status) => {
        const res = await adminApiCall('updateTransfer', { id, status });
        if (res.error) toast.error('Erreur: ' + res.error); else { toast.success(`Virement ${status === 'completed' ? 'accepté' : 'rejeté'}`); fetchAllData(); }
    };

    // Actions
    const updateLoanStatus = async (id, status) => {
        const res = await adminApiCall('updateLoan', { id, status });
        if (res.error) toast.error('Erreur'); else { toast.success(`Prêt ${status === 'active' ? 'approuvé' : 'rejeté'}`); fetchAllData(); }
    };

    const toggleCardStatus = async (id, current) => {
        const next = current === 'blocked' ? 'active' : 'blocked';
        const res = await adminApiCall('updateCard', { id, status: next });
        if (res.error) toast.error('Erreur'); else { toast.success(`Carte ${next === 'blocked' ? 'bloquée' : 'activée'}`); fetchAllData(); }
    };

    const deleteCard = async (id) => {
        if (!confirm('Supprimer cette carte ?')) return;
        const res = await adminApiCall('deleteCard', { id });
        if (res.error) toast.error('Erreur'); else { toast.success('Carte supprimée'); fetchAllData(); }
    };

    // ═══════════ NEW FEATURE FUNCTIONS ═══════════

    const viewUserDetails = async (userId) => {
        setActionLoading(true);
        try {
            const data = await adminApiCall('getUserDetails', { userId });
            if (data.error) throw new Error(data.error);
            setUserDetails(data);
            setSelectedUser(userId);
            if (data.accounts?.length > 0) {
                setBalanceForm(prev => ({ ...prev, accountId: data.accounts[0].id }));
            }
            setShowUserModal(true);
        } catch (e) {
            toast.error("Erreur lors de la récupération des détails");
        }
        setActionLoading(false);
    };

    const handleUpdateBalance = async (e) => {
        e.preventDefault();
        if (!balanceForm.amount || !balanceForm.accountId) return;
        setActionLoading(true);
        try {
            const res = await adminApiCall('updateBalance', balanceForm);
            if (res.error) throw new Error(res.error);
            toast.success("Solde mis à jour !");
            setBalanceForm({ ...balanceForm, amount: '', description: '' });
            // Refresh details
            viewUserDetails(selectedUser);
            fetchAllData();
        } catch (e) {
            toast.error(e.message || "Erreur lors de la mise à jour");
        }
        setActionLoading(false);
    };


    const handleUpdateProfile = async (updates) => {
        setActionLoading(true);
        try {
            const res = await adminApiCall('updateProfile', { userId: selectedUser, updates });
            if (res.error) throw new Error(res.error);
            toast.success("Profil mis à jour !");
            viewUserDetails(selectedUser);
            fetchAllData();
        } catch (e) {
            toast.error(e.message || "Erreur de mise à jour");
        }
        setActionLoading(false);
    };

    const handleDeleteUser = async () => {
        if (!confirm("⚠️ ATTENTION : Cela supprimera définitivement l'utilisateur et TOUTES ses données (comptes, prêts, cartes). Continuer ?")) return;
        setActionLoading(true);
        try {
            const res = await adminApiCall('deleteUser', { userId: selectedUser });
            if (res.error) throw new Error(res.error);
            toast.success("Utilisateur supprimé !");
            setShowUserModal(false);
            fetchAllData();
        } catch (e) {
            toast.error(e.message || "Erreur lors de la suppression");
        }
        setActionLoading(false);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!addUserForm.email || !addUserForm.password || !addUserForm.fullName) return;
        setActionLoading(true);
        try {
            const res = await adminApiCall('createUser', addUserForm);
            if (res.error) throw new Error(res.error);
            toast.success("Utilisateur créé avec succès !");
            setShowAddUserModal(false);
            setAddUserForm({ email: '', password: '', fullName: '', initialBalance: '0' });
            fetchAllData();
        } catch (e) {
            toast.error(e.message || "Erreur lors de la création");
        }
        setActionLoading(false);
    };

    const handleResetPassword = async () => {
        const newPwd = prompt("Nouveau mot de passe (min 6 caractères) :");
        if (!newPwd || newPwd.length < 6) return;
        setActionLoading(true);
        try {
            const res = await adminApiCall('resetPassword', { userId: selectedUser, newPassword: newPwd });
            if (res.error) throw new Error(res.error);
            toast.success("Mot de passe réinitialisé !");
        } catch (e) {
            toast.error(e.message || "Erreur lors de la réinitialisation");
        }
        setActionLoading(false);
    };

    const fc = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);
    const fd = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    const statusBadge = (status) => {
        const map = {
            active: { bg: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle size={12} /> },
            pending_approval: { bg: 'bg-amber-100 text-amber-700', icon: <Clock size={12} /> },
            blocked: { bg: 'bg-red-100 text-red-700', icon: <Ban size={12} /> },
            rejected: { bg: 'bg-red-100 text-red-700', icon: <XCircle size={12} /> },
            completed: { bg: 'bg-blue-100 text-blue-700', icon: <CheckCircle size={12} /> },
        };
        const s = map[status] || { bg: 'bg-gray-100 text-gray-600', icon: null };
        return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${s.bg}`}>{s.icon}{status?.replace('_', ' ')}</span>;
    };

    const handleAdminReply = async (e) => {
        e.preventDefault();
        if (!adminReply.trim() || !activeConversation) return;
        const content = adminReply.trim();
        setAdminReply('');
        // Optimistically add message to local state
        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            sender_id: user.id,
            receiver_id: activeConversation,
            content: content,
            is_read: false,
            created_at: new Date().toISOString()
        };
        setConversations(prev => {
            const updated = { ...prev };
            if (!updated[activeConversation]) updated[activeConversation] = [];
            updated[activeConversation] = [optimisticMsg, ...updated[activeConversation]];
            return updated;
        });
        setMessages(prev => [...prev, optimisticMsg]);
        // Scroll to bottom
        setTimeout(() => {
            if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }, 50);
        try {
            const res = await adminApiCall('sendMessage', {
                receiverId: activeConversation,
                content: content,
                senderId: user.id
            });
            if (res.error) throw new Error(res.error);
        } catch (e) {
            toast.error("Erreur d'envoi");
        }
    };

    const handleOpenConversation = async (userId) => {
        setActiveConversation(userId);
        // Mark messages from this user as read locally
        setConversations(prev => {
            const updated = { ...prev };
            if (updated[userId]) {
                updated[userId] = updated[userId].map(m =>
                    m.sender_id === userId && !m.is_read ? { ...m, is_read: true } : m
                );
            }
            return updated;
        });
        setMessages(prev => prev.map(m =>
            m.sender_id === userId && !m.is_read ? { ...m, is_read: true } : m
        ));
        // Update unread count in stats
        setStats(prev => {
            const unreadInConv = (conversations[userId] || []).filter(m => !m.is_read && m.sender_id !== user.id).length;
            return { ...prev, unreadMessages: Math.max(0, prev.unreadMessages - unreadInConv) };
        });
        // Scroll to bottom after render
        setTimeout(() => {
            if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }, 100);
        // Mark as read on backend (fire and forget)
        adminApiCall('markMessagesRead', { senderUserId: userId });
    };

    const NavItem = ({ id, icon: Icon, label, badge = 0 }) => (
        <button
            onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === id ? 'bg-[#E63746] text-white shadow-lg shadow-red-900/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
        >
            <Icon size={18} />
            {label}
            {badge > 0 && <span className="ml-auto bg-[#E63746] text-white text-[10px] px-2 py-0.5 rounded-full ring-2 ring-black">{badge}</span>}
        </button>
    );

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'Utilisateurs', icon: Users },
        { id: 'loans', label: 'Prêts', icon: Landmark },
        { id: 'transfers', label: 'Virements', icon: ArrowLeftRight },
        { id: 'cards', label: 'Cartes', icon: CreditCard },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
    ];

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#E63746] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-gray-500 font-medium">Chargement de l'espace admin...</p>
            </div>
        </div>
    );

    const filteredLoans = loans.filter(l => statusFilter === 'all' || l.status === statusFilter);
    const filteredUsers = users.filter(u => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.id?.includes(q);
    });

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex">
            <Toaster position="top-right" />

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1D3557] text-white transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#E63746] rounded-xl flex items-center justify-center"><Shield size={20} /></div>
                            <div><h1 className="font-black text-lg">Admin Panel</h1><p className="text-[11px] text-white/40">Financer Group</p></div>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white"><X size={20} /></button>
                    </div>
                </div>
                <nav className="p-4 space-y-1">
                    {navItems.map(item => (
                        <NavItem
                            key={item.id}
                            id={item.id}
                            icon={item.icon}
                            label={item.label}
                            badge={
                                item.id === 'loans' ? stats.pendingLoans :
                                    item.id === 'transfers' ? stats.pendingTransfers :
                                        item.id === 'messages' ? stats.unreadMessages :
                                            0
                            }
                        />
                    ))}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        <div className="w-9 h-9 bg-[#E63746] rounded-full flex items-center justify-center text-sm font-bold">{user?.email?.charAt(0).toUpperCase()}</div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{user?.email}</p><p className="text-[10px] text-white/40">Administrateur</p></div>
                        <button onClick={() => { signOut(); router.push('/login'); }} className="text-white/40 hover:text-red-400"><LogOut size={16} /></button>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Main */}
            <main className="flex-1 lg:ml-72 min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600"><Menu size={24} /></button>
                        <h2 className="text-xl font-black text-[#1D3557]">{navItems.find(n => n.id === activeTab)?.label}</h2>
                    </div>
                    <button onClick={fetchAllData} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-600 transition-colors">
                        <RefreshCw size={14} />Actualiser
                    </button>
                </header>
                <div className="p-4 lg:p-8">
                    {/* MESSAGES */}
                    {activeTab === 'messages' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)] animate-fade-in">
                            {/* Conversations List */}
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="font-black text-[#1D3557] flex items-center gap-2">
                                        <MessageSquare size={18} className="text-[#E63746]" />
                                        Conversations
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                    {Object.keys(conversations).length === 0 ? (
                                        <div className="text-center py-10">
                                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Aucun message</p>
                                        </div>
                                    ) : (
                                        Object.entries(conversations).map(([userId, msgs]) => {
                                            const lastMsg = msgs[0]; // Ordered by created_at desc
                                            const u = users.find(usr => usr.id === userId);
                                            const unread = msgs.filter(m => !m.is_read && m.sender_id !== user.id && (m.receiver_id === user.id || m.receiver_id === null)).length;
                                            return (
                                                <button
                                                    key={userId}
                                                    onClick={() => handleOpenConversation(userId)}
                                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeConversation === userId ? 'bg-[#1D3557] text-white shadow-lg' : 'hover:bg-gray-50 text-[#1D3557]'}`}
                                                >
                                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold flex-shrink-0 text-[#1D3557]">
                                                        {u?.full_name?.charAt(0) || '?'}
                                                    </div>
                                                    <div className="flex-1 text-left min-w-0">
                                                        <p className="font-bold truncate">{u?.full_name || 'Utilisateur inconnu'}</p>
                                                        <p className={`text-xs truncate ${activeConversation === userId ? 'text-white/60' : 'text-gray-400'}`}>
                                                            {lastMsg.content}
                                                        </p>
                                                    </div>
                                                    {unread > 0 && (
                                                        <span className="w-5 h-5 bg-[#E63746] text-white text-[10px] flex items-center justify-center rounded-full font-black animate-pulse">
                                                            {unread}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Active Discussion */}
                            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                                {activeConversation ? (
                                    <>
                                        <div className="p-6 border-b border-gray-100 bg-white flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1D3557] flex items-center justify-center font-bold border border-blue-100 shadow-sm">
                                                    {users.find(u => u.id === activeConversation)?.full_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-[#1D3557]">{users.find(u => u.id === activeConversation)?.full_name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{users.find(u => u.id === activeConversation)?.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                                            {[...(conversations[activeConversation] || [])].reverse().map((m, i) => (
                                                <div key={i} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm ${m.sender_id === user.id ? 'bg-[#1D3557] text-white rounded-tr-none' : 'bg-white text-[#1D3557] border border-gray-100 rounded-tl-none'}`}>
                                                        {m.content}
                                                        <p className={`text-[9px] mt-2 font-bold uppercase opacity-50 ${m.sender_id === user.id ? 'text-right' : ''}`}>
                                                            {new Date(m.created_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <form onSubmit={handleAdminReply} className="p-4 border-t border-gray-100 flex gap-2">
                                            <input
                                                type="text"
                                                value={adminReply}
                                                onChange={(e) => setAdminReply(e.target.value)}
                                                placeholder="Répondre à l'utilisateur..."
                                                className="flex-1 py-3 px-5 bg-gray-50 border-0 focus:ring-2 focus:ring-[#E63746]/20 rounded-xl text-sm font-medium"
                                            />
                                            <button
                                                disabled={!adminReply.trim() || actionLoading}
                                                type="submit"
                                                className="px-6 py-3 bg-[#E63746] text-white rounded-xl font-bold text-sm hover:bg-[#C1121F] shadow-lg shadow-red-900/20 disabled:opacity-50 transition-all active:scale-95"
                                            >
                                                Envoyer
                                            </button>
                                        </form>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 grayscale opacity-30">
                                        <MessageSquare size={60} className="mb-4" />
                                        <h4 className="text-xl font-black text-[#1D3557]">Sélectionnez une conversation</h4>
                                        <p className="text-sm text-gray-500 max-w-xs mt-2 font-medium">Cliquez sur un utilisateur à gauche pour commencer à discuter avec lui.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* DASHBOARD */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Utilisateurs', value: stats.users, icon: Users, color: 'from-blue-500 to-blue-600' },
                                    { label: 'Prêts en cours', value: stats.loans, icon: Landmark, color: 'from-emerald-500 to-emerald-600', sub: `${stats.pendingLoans} en attente` },
                                    { label: 'Cartes actives', value: stats.cards, icon: CreditCard, color: 'from-purple-500 to-purple-600' },
                                    { label: 'Virements', value: stats.transfers, icon: ArrowLeftRight, color: 'from-blue-400 to-blue-500' },
                                    { label: 'Solde total', value: fc(stats.totalBalance), icon: TrendingUp, color: 'from-[#E63746] to-rose-600' },
                                ].map((s, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}><s.icon size={18} /></div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                                        <p className="text-2xl font-black text-[#1D3557] mt-1">{s.value}</p>
                                        {s.sub && <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1"><AlertTriangle size={12} />{s.sub}</p>}
                                        {s.label === 'Virements' && stats.pendingTransfers > 0 && <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1"><AlertTriangle size={12} />{stats.pendingTransfers} à valider</p>}
                                    </div>
                                ))}
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-gray-100"><h3 className="font-bold text-[#1D3557]">Dernières transactions</h3></div>
                                <div className="divide-y divide-gray-50">
                                    {transactions.slice(0, 8).map((tx, i) => (
                                        <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${tx.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                    {tx.amount > 0 ? '+' : '−'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#1D3557]">{tx.description || tx.type}</p>
                                                    <p className="text-[11px] text-gray-400">{fd(tx.created_at)}</p>
                                                </div>
                                            </div>
                                            <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fc(tx.amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* USERS */}
                    {activeTab === 'users' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex flex-col sm:flex-row gap-3 items-center">
                                <div className="relative flex-1 w-full"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher par nom, email ou ID..." className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#E63746]/20 outline-none" />
                                </div>
                                <button onClick={() => setShowAddUserModal(true)} className="w-full sm:w-auto px-6 py-3 bg-[#E63746] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#C1121F] transition-all shadow-lg shadow-red-200">
                                    <Plus size={18} /> Ajouter un utilisateur
                                </button>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                                            <th className="text-left px-5 py-3 font-bold text-gray-500 text-[11px] uppercase">Utilisateur</th>
                                            <th className="text-left px-5 py-3 font-bold text-gray-500 text-[11px] uppercase hidden md:table-cell">Email</th>
                                            <th className="text-left px-5 py-3 font-bold text-gray-500 text-[11px] uppercase hidden lg:table-cell">ID Unique</th>
                                            <th className="text-left px-5 py-3 font-bold text-gray-500 text-[11px] uppercase">Solde Total</th>
                                            <th className="text-right px-5 py-3 font-bold text-gray-500 text-[11px] uppercase">Actions</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredUsers.map(u => {
                                                const userAccounts = accounts.filter(a => a.user_id === u.id);
                                                const totalBal = userAccounts.reduce((s, a) => s + Number(a.balance || 0), 0);
                                                return (
                                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-5 py-4"><div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-[#1D3557] text-white rounded-full flex items-center justify-center text-sm font-bold">{(u.full_name || u.email || '?').charAt(0).toUpperCase()}</div>
                                                            <div><p className="font-bold text-[#1D3557]">{u.full_name || '—'}</p><p className="text-[11px] text-gray-400 md:hidden">{u.email}</p></div>
                                                        </div></td>
                                                        <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{u.email}</td>
                                                        <td className="px-5 py-4 text-gray-400 hidden lg:table-cell font-mono text-[10px]">{u.id}</td>
                                                        <td className="px-5 py-4"><span className="font-bold text-[#1D3557]">{fc(totalBal)}</span><span className="text-[11px] text-gray-400 ml-1 block md:inline">({userAccounts.length} comptes)</span></td>
                                                        <td className="px-5 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button onClick={() => viewUserDetails(u.id)} className="px-3 py-1.5 bg-[#1D3557] text-white rounded-lg text-xs font-bold hover:bg-[#457B9D] transition-colors flex items-center gap-1">
                                                                    <UserCog size={14} /> Gérer
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {filteredUsers.length === 0 && (
                                                <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Aucun utilisateur trouvé</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LOANS */}
                    {activeTab === 'loans' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex flex-wrap gap-2">
                                {['all', 'pending_approval', 'active', 'rejected'].map(f => (
                                    <button key={f} onClick={() => setStatusFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === f ? 'bg-[#1D3557] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}>
                                        {f === 'all' ? 'Tous' : f === 'pending_approval' ? '⏳ En attente' : f === 'active' ? '✅ Approuvés' : '❌ Rejetés'}
                                        {f === 'pending_approval' && stats.pendingLoans > 0 && <span className="ml-1 bg-amber-400 text-black px-1.5 rounded-full">{stats.pendingLoans}</span>}
                                    </button>
                                ))}
                            </div>
                            <div className="grid gap-4">
                                {filteredLoans.map(loan => (
                                    <div key={loan.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"><Landmark size={20} className="text-blue-600" /></div>
                                                <div>
                                                    <p className="font-bold text-[#1D3557] text-lg">{fc(loan.amount)}</p>
                                                    <p className="text-xs text-gray-500">{loan.type} • {loan.duration_months} mois • {loan.interest_rate}%</p>
                                                    <p className="text-[11px] text-gray-400">ID: {loan.user_id?.slice(0, 8)}... • {fd(loan.created_at)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {statusBadge(loan.status)}
                                                {loan.status === 'pending_approval' && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => updateLoanStatus(loan.id, 'active')} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 flex items-center gap-1"><CheckCircle size={14} />Approuver</button>
                                                        <button onClick={() => updateLoanStatus(loan.id, 'rejected')} className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 flex items-center gap-1"><XCircle size={14} />Rejeter</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-50">
                                            <div><p className="text-[10px] text-gray-400 uppercase font-bold">Mensualité</p><p className="font-bold text-[#1D3557]">{fc(loan.monthly_payment)}</p></div>
                                            <div><p className="text-[10px] text-gray-400 uppercase font-bold">Revenu</p><p className="font-bold text-[#1D3557]">{fc(loan.monthly_income)}</p></div>
                                            <div><p className="text-[10px] text-gray-400 uppercase font-bold">Devise</p><p className="font-bold text-[#1D3557]">{loan.currency || 'EUR'}</p></div>
                                        </div>
                                    </div>
                                ))}
                                {filteredLoans.length === 0 && <div className="text-center py-12 text-gray-400">Aucun prêt trouvé</div>}
                            </div>
                        </div>
                    )}

                    {/* TRANSFERS */}
                    {activeTab === 'transfers' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                                            <th className="text-left px-5 py-3 font-bold text-gray-500 text-[11px] uppercase">Transaction</th>
                                            <th className="text-left px-5 py-3 font-bold text-gray-500 text-[11px] uppercase hidden md:table-cell">Statut</th>
                                            <th className="text-left px-5 py-3 font-bold text-gray-500 text-[11px] uppercase hidden lg:table-cell">Date</th>
                                            <th className="text-right px-5 py-3 font-bold text-gray-500 text-[11px] uppercase">Montant</th>
                                            <th className="text-right px-5 py-3 font-bold text-gray-500 text-[11px] uppercase">Action</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {transactions.map((tx, i) => (
                                                <tr key={i} className="hover:bg-gray-50/50">
                                                    <td className="px-5 py-3">
                                                        <p className="font-medium text-[#1D3557]">{tx.description || '—'}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${tx.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{tx.type}</span>
                                                            <p className="text-[11px] text-gray-400 md:hidden">{fd(tx.created_at)}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 hidden md:table-cell">{statusBadge(tx.status || 'completed')}</td>
                                                    <td className="px-5 py-3 text-gray-500 hidden lg:table-cell">{fd(tx.created_at)}</td>
                                                    <td className={`px-5 py-3 text-right font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fc(tx.amount)}</td>
                                                    <td className="px-5 py-3 text-right">
                                                        {tx.status === 'pending_approval' && (
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button onClick={() => updateTransferStatus(tx.id, 'completed')} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="Accepter"><CheckCircle size={14} /></button>
                                                                <button onClick={() => updateTransferStatus(tx.id, 'rejected')} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Refuser"><XCircle size={14} /></button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CARDS */}
                    {activeTab === 'cards' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {cards.map(card => (
                                    <div key={card.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                                        <div className={`h-32 rounded-xl bg-gradient-to-br mb-4 p-4 flex flex-col justify-between text-white ${card.type === 'visa_gold' ? 'from-yellow-400 to-yellow-600' : card.type === 'mastercard_black' ? 'from-gray-800 to-black' : 'from-[#E63746] to-rose-700'}`}>
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-bold uppercase opacity-70">{card.type?.replace('_', ' ')}</span>
                                                {statusBadge(card.status)}
                                            </div>
                                            <div>
                                                <p className="font-mono text-lg tracking-wider">•••• {card.last_4}</p>
                                                <p className="text-xs opacity-70">{card.holder_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[11px] text-gray-400">Expire: {card.expiry}</p>
                                                <p className="text-[11px] text-gray-400">ID: {card.user_id?.slice(0, 8)}...</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => toggleCardStatus(card.id, card.status)} className={`p-2 rounded-lg text-xs font-bold transition-colors ${card.status === 'blocked' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                                                    {card.status === 'blocked' ? <CheckCircle size={16} /> : <Ban size={16} />}
                                                </button>
                                                <button onClick={() => deleteCard(card.id)} className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {cards.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">Aucune carte trouvée</div>}
                            </div>
                        </div>
                    )}
                </div>

                {/* USER DETAILS MODAL */}
                {showUserModal && userDetails && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowUserModal(false)} />
                        <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#1D3557] text-white rounded-full flex items-center justify-center text-xl font-black">
                                        {(userDetails.profile?.full_name || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-[#1D3557]">{userDetails.profile?.full_name || 'Utilisateur'}</h3>
                                        <p className="text-xs text-gray-400">{userDetails.profile?.email} • ID: {selectedUser.slice(0, 8)}...</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} /></button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                <div className="grid lg:grid-cols-3 gap-8">
                                    {/* Left Column: Actions & Profile */}
                                    <div className="space-y-6">
                                        {/* Status & Quick Actions */}
                                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">État du compte</h4>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold">Statut Actuel</span>
                                                {statusBadge(userDetails.profile?.account_status || 'active')}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleUpdateProfile({ account_status: userDetails.profile?.account_status === 'blocked' ? 'active' : 'blocked' })}
                                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 ${userDetails.profile?.account_status === 'blocked' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                                    {userDetails.profile?.account_status === 'blocked' ? <CheckCircle size={14} /> : <Ban size={14} />}
                                                    {userDetails.profile?.account_status === 'blocked' ? 'Débloquer' : 'Bloquer'}
                                                </button>
                                                <button onClick={handleResetPassword} className="p-2 bg-gray-200 text-[#1D3557] hover:bg-[#1D3557] hover:text-white rounded-xl transition-all" title="Réinitialiser le mot de passe">
                                                    <Lock size={18} />
                                                </button>
                                                <button onClick={handleDeleteUser} className="p-2 bg-gray-200 text-gray-400 hover:bg-red-600 hover:text-white rounded-xl transition-all" title="Supprimer l'utilisateur">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Right Column: Balance & Transactions */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Update Balance Form */}
                                        <form onSubmit={handleUpdateBalance} className="bg-[#1D3557] rounded-3xl p-6 text-white space-y-4 shadow-xl shadow-navy/20">
                                            <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                                                <Wallet size={16} /> Modification du Solde
                                            </h4>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-white/40 uppercase">Compte à modifier</label>
                                                    <select value={balanceForm.accountId} onChange={e => setBalanceForm({ ...balanceForm, accountId: e.target.value })} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none">
                                                        {userDetails.accounts?.map(acc => (
                                                            <option key={acc.id} value={acc.id} className="text-black">{acc.name} ({fc(acc.balance)})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-white/40 uppercase">Type d'opération</label>
                                                    <div className="flex bg-white/10 rounded-xl p-1">
                                                        <button type="button" onClick={() => setBalanceForm({ ...balanceForm, operation: 'credit' })} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${balanceForm.operation === 'credit' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/60'}`}>CRÉDITER</button>
                                                        <button type="button" onClick={() => setBalanceForm({ ...balanceForm, operation: 'debit' })} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${balanceForm.operation === 'debit' ? 'bg-red-500 text-white shadow-lg' : 'text-white/60'}`}>DÉBITER</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-white/40 uppercase">Montant</label>
                                                    <input type="number" step="0.01" value={balanceForm.amount} onChange={e => setBalanceForm({ ...balanceForm, amount: e.target.value })} placeholder="0.00 €" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-lg font-black outline-none placeholder:text-white/20" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-white/40 uppercase">Motif (Optionnel)</label>
                                                    <input value={balanceForm.description} onChange={e => setBalanceForm({ ...balanceForm, description: e.target.value })} placeholder="Ex: Prime exceptionnelle..." className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none" />
                                                </div>
                                            </div>
                                            <button disabled={actionLoading} className={`w-full py-4 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${balanceForm.operation === 'credit' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-900/40' : 'bg-[#E63746] hover:bg-[#C1121F] shadow-red-900/40'} text-white`}>
                                                {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                {balanceForm.operation === 'credit' ? 'Confirmer le Crédit' : 'Confirmer le Débit'}
                                            </button>
                                        </form>

                                        {/* Activity Tabs */}
                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="flex border-b border-gray-100">
                                                <button className="px-6 py-4 text-xs font-bold border-b-2 border-[#1D3557] text-[#1D3557] flex items-center gap-2">
                                                    <History size={14} /> Transactions Récentes
                                                </button>
                                            </div>
                                            <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
                                                {userDetails.transactions?.map((tx, i) => (
                                                    <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                                                        <div>
                                                            <p className="text-sm font-bold text-[#1D3557]">{tx.description || tx.type}</p>
                                                            <p className="text-[10px] text-gray-400">{fd(tx.created_at)}</p>
                                                        </div>
                                                        <span className={`text-sm font-black ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            {tx.amount > 0 ? '+' : ''}{fc(tx.amount)}
                                                        </span>
                                                    </div>
                                                ))}
                                                {userDetails.transactions?.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">Aucune transaction répertoriée</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* USER DETAILS MODAL END */}

                {/* ADD USER MODAL */}
                {showAddUserModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-[#1D3557]/80 backdrop-blur-md" onClick={() => setShowAddUserModal(false)} />
                        <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
                            <div className="p-8 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-[#1D3557]">Nouvel Utilisateur</h3>
                                    <p className="text-sm text-gray-400">Créer un profil et un compte courant</p>
                                </div>
                                <button onClick={() => setShowAddUserModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Nom complet</label>
                                        <input required value={addUserForm.fullName} onChange={e => setAddUserForm({ ...addUserForm, fullName: e.target.value })} placeholder="Ex: Jean Dupont" className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#E63746] focus:bg-white rounded-2xl outline-none transition-all font-bold" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Adresse Email</label>
                                        <input required type="email" value={addUserForm.email} onChange={e => setAddUserForm({ ...addUserForm, email: e.target.value })} placeholder="jean.dupont@exemple.com" className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#E63746] focus:bg-white rounded-2xl outline-none transition-all font-bold" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Mot de passe</label>
                                            <input required type="password" value={addUserForm.password} onChange={e => setAddUserForm({ ...addUserForm, password: e.target.value })} placeholder="••••••••" className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#E63746] focus:bg-white rounded-2xl outline-none transition-all font-bold" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Pays de résidence</label>
                                            <select
                                                value={addUserForm.country}
                                                onChange={e => setAddUserForm({ ...addUserForm, country: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#E63746] focus:bg-white rounded-2xl outline-none transition-all font-bold appearance-none"
                                            >
                                                {countries.map(c => (
                                                    <option key={c.code} value={c.code}>{c.flag} {c.country}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Solde Initial (€)</label>
                                        <input type="number" value={addUserForm.initialBalance} onChange={e => setAddUserForm({ ...addUserForm, initialBalance: e.target.value })} placeholder="0.00" className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#E63746] focus:bg-white rounded-2xl outline-none transition-all font-bold" />
                                    </div>
                                </div>
                                <button disabled={actionLoading} className="w-full py-4 bg-[#E63746] hover:bg-[#C1121F] text-white rounded-2xl font-black text-sm uppercase tracking-[0.1em] shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-2">
                                    {actionLoading ? <RefreshCw className="animate-spin" size={20} /> : <UserPlus size={20} />}
                                    Créer le compte utilisateur
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* GLOBAL ACTION LOADER */}
                {actionLoading && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
                        <div className="bg-[#1D3557] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
                            <RefreshCw size={24} className="animate-spin text-[#E63746]" />
                            <span className="font-bold">Traitement en cours...</span>
                        </div>
                    </div>
                )}
            </main>
        </div >
    );
};

export default AdminPage;

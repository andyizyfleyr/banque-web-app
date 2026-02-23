"use client";
import React, { useState, useEffect } from 'react';
import {
    Bell,
    CheckCheck,
    Trash2,
    ArrowRightLeft,
    Shield,
    FileText,
    CreditCard,
    Gift,
    Settings,
    Filter,
    Clock,
    CheckCircle,
    AlertCircle,
    Info,
    X
} from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/Skeleton';

const Notifications = () => {
    const { user } = useAuth();
    const { t } = useLocale();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [typeFilter, setTypeFilter] = useState('all');

    const typeConfig = {
        transaction: { icon: ArrowRightLeft, labelKey: 'notifications.transaction', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        security: { icon: Shield, labelKey: 'notifications.security', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
        loan: { icon: FileText, labelKey: 'notifications.loan', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        card: { icon: CreditCard, labelKey: 'notifications.card', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
        promotion: { icon: Gift, labelKey: 'notifications.promotion', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
        system: { icon: Settings, labelKey: 'notifications.system', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100' }
    };

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Real-time subscription
        if (!user) return;
        const channel = supabase
            .channel('notifications-realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                setNotifications(prev => [payload.new, ...prev]);
                toast.success(t('notifications.newNotification'), { icon: '🔔' });
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user]);

    // Mark single as read
    const markAsRead = async (id) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);
        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds);

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success(t('notifications.allMarkedRead'));
        }
    };

    // Delete notification
    const deleteNotification = async (id) => {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);
        if (!error) {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }
    };

    // Delete all read
    const deleteAllRead = async () => {
        const readIds = notifications.filter(n => n.is_read).map(n => n.id);
        if (readIds.length === 0) return;

        const { error } = await supabase
            .from('notifications')
            .delete()
            .in('id', readIds);

        if (!error) {
            setNotifications(prev => prev.filter(n => !n.is_read));
            toast.success(t('notifications.readDeleted'));
        }
    };

    // Format time ago
    const timeAgo = (dateStr) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return t('notifications.justNow');
        if (diffMins < 60) return t('notifications.minutesAgo', { count: diffMins });
        if (diffHours < 24) return t('notifications.hoursAgo', { count: diffHours });
        if (diffDays < 7) return t('notifications.daysAgo', { count: diffDays });
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    // Filter notifications
    const filtered = notifications.filter(n => {
        if (filter === 'unread' && n.is_read) return false;
        if (filter === 'read' && !n.is_read) return false;
        if (typeFilter !== 'all' && n.type !== typeFilter) return false;
        return true;
    });

    // Group by date
    const groupByDate = (notifs) => {
        const groups = {};
        notifs.forEach(n => {
            const date = new Date(n.created_at);
            const today = new Date();
            const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

            let key;
            if (date.toDateString() === today.toDateString()) key = t('notifications.today');
            else if (date.toDateString() === yesterday.toDateString()) key = t('notifications.yesterday');
            else key = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

            if (!groups[key]) groups[key] = [];
            groups[key].push(n);
        });
        return groups;
    };

    const grouped = groupByDate(filtered);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) {
        return (
            <PageWrapper className="space-y-6 pb-12">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1D3557] flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#E63746]/10 rounded-2xl flex items-center justify-center">
                            <Bell className="text-[#E63746]" size={24} />
                        </div>
                        {t('notifications.title')}
                        {unreadCount > 0 && (
                            <span className="text-sm bg-[#E63746] text-white px-3 py-1 rounded-full font-bold">{unreadCount} {t('notifications.newCount')}</span>
                        )}
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">{t('notifications.subtitle')}</p>
                </div>

                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D3557] text-white font-bold text-xs hover:bg-[#1D3557]/80 transition-colors shadow-md"
                        >
                            <CheckCheck size={16} />
                            {t('notifications.markAllRead')}
                        </button>
                    )}
                    {notifications.some(n => n.is_read) && (
                        <button
                            onClick={deleteAllRead}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-xs hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={16} />
                            {t('notifications.deleteAllRead')}
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase">{t('notifications.statusLabel')} :</span>
                    {[
                        { id: 'all', label: t('notifications.allFilter') },
                        { id: 'unread', label: t('notifications.unread') },
                        { id: 'read', label: t('notifications.read') }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f.id ? 'bg-[#E63746] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-gray-500 uppercase">{t('notifications.typeLabel')} :</span>
                    <button
                        onClick={() => setTypeFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${typeFilter === 'all' ? 'bg-[#1D3557] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {t('notifications.allTypes')}
                    </button>
                    {Object.entries(typeConfig).map(([key, cfg]) => (
                        <button
                            key={key}
                            onClick={() => setTypeFilter(key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${typeFilter === key ? `${cfg.bg} ${cfg.color} ${cfg.border} border` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            <cfg.icon size={12} />
                            {t(cfg.labelKey)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="text-gray-300" size={36} />
                    </div>
                    <h3 className="text-lg font-bold text-[#1D3557]">{t('notifications.noNotifications')}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                        {filter !== 'all' || typeFilter !== 'all' ? t('notifications.tryChangeFilters') : t('notifications.willBeNotified')}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([date, notifs]) => (
                        <div key={date}>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Clock size={12} />
                                {date}
                            </h3>
                            <div className="space-y-2">
                                {notifs.map((notif) => {
                                    const config = typeConfig[notif.type] || typeConfig.system;
                                    const IconComp = config.icon;
                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                                            className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${notif.is_read
                                                ? 'bg-white border-gray-100 hover:border-gray-200'
                                                : 'bg-gradient-to-r from-[#E63746]/5 to-white border-[#E63746]/20 hover:border-[#E63746]/40 shadow-sm'
                                                }`}
                                        >
                                            <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center ${config.bg} ${config.color}`}>
                                                <IconComp size={20} />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className={`font-bold text-sm ${notif.is_read ? 'text-gray-600' : 'text-[#1D3557]'}`}>{notif.title}</h4>
                                                    {!notif.is_read && (
                                                        <span className="w-2 h-2 bg-[#E63746] rounded-full animate-pulse flex-shrink-0"></span>
                                                    )}
                                                </div>
                                                <p className={`text-sm mt-0.5 ${notif.is_read ? 'text-gray-400' : 'text-gray-600'}`}>{notif.message}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}>{t(config.labelKey)}</span>
                                                    <span className="text-[10px] text-gray-400">{timeAgo(notif.created_at)}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                                className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Footer */}
            {notifications.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-black text-[#1D3557]">{notifications.length}</p>
                            <p className="text-xs text-gray-400 font-bold">{t('notifications.total')}</p>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-[#E63746]">{unreadCount}</p>
                            <p className="text-xs text-gray-400 font-bold">{t('notifications.unread')}</p>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-green-600">{notifications.filter(n => n.is_read).length}</p>
                            <p className="text-xs text-gray-400 font-bold">{t('notifications.read')}</p>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-blue-600">{notifications.filter(n => n.type === 'transaction').length}</p>
                            <p className="text-xs text-gray-400 font-bold">{t('notifications.transactionsCount')}</p>
                        </div>
                    </div>
                </div>
            )}
        </PageWrapper>
    );
};

export default Notifications;

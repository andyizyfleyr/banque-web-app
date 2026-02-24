"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    MessageSquare,
    CheckCheck,
    Loader2,
    Shield,
    Lock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const MessagesPage = () => {
    const { user } = useAuth();
    const { t } = useLocale();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef(null);

    const fetchMessages = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: true });
            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        if (!user) return;
        const channel = supabase
            .channel('messages-realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                const newMsg = payload.new;
                // Only process messages from admin (not our own - those are added optimistically)
                if (newMsg.sender_id === user.id) return;
                // Only process messages intended for this user
                if (newMsg.receiver_id !== user.id) return;
                // Avoid duplicates
                setMessages(prev => {
                    if (prev.some(m => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [user]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending || !user) return;
        const content = newMessage.trim();
        setNewMessage('');
        // Optimistically add message to UI instantly
        const tempId = 'temp-' + Date.now();
        const optimisticMsg = {
            id: tempId,
            sender_id: user.id,
            receiver_id: null,
            content: content,
            is_read: false,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setIsSending(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .insert([{ sender_id: user.id, content: content }])
                .select()
                .single();
            if (error) throw error;
            // Replace optimistic message with real one
            setMessages(prev => prev.map(m => m.id === tempId ? data : m));
        } catch (error) {
            toast.error(t('common.error'));
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== tempId));
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    // Group messages by date
    const groupMessagesByDate = (msgs) => {
        const groups = {};
        msgs.forEach(msg => {
            const date = new Date(msg.created_at);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let key;
            if (date.toDateString() === today.toDateString()) {
                key = "Aujourd'hui";
            } else if (date.toDateString() === yesterday.toDateString()) {
                key = "Hier";
            } else {
                key = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
            }
            if (!groups[key]) groups[key] = [];
            groups[key].push(msg);
        });
        return groups;
    };

    const groupedMessages = groupMessagesByDate(messages);

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#ECE5DD] md:bg-white z-50">
                <Loader2 className="animate-spin text-[#E63746]" size={36} />
            </div>
        );
    }

    return (
        <>
            {/* ═══ MOBILE LAYOUT ═══ */}
            <div className="md:hidden fixed inset-0 flex flex-col bg-[#ECE5DD]" style={{ paddingBottom: '64px' }}>
                {/* Compact Header */}
                <div className="bg-[#1D3557] px-4 py-3 flex items-center gap-3 flex-shrink-0 safe-area-top">
                    <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center">
                        <Shield size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-[15px] leading-tight">
                            {t('messages.supportAgent')}
                        </p>
                        <p className="text-white/50 text-[11px] font-medium">
                            <Lock size={9} className="inline mr-0.5 -mt-px" />
                            {t('messages.secureChat')}
                        </p>
                    </div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                </div>

                {/* Chat Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto px-3 py-2"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 15 L30 25 L25 15Z' fill='%23d4cfc4' opacity='0.15'/%3E%3C/svg%3E")`,
                    }}
                >
                    {/* Encryption notice */}
                    <div className="flex justify-center my-3">
                        <div className="bg-[#FCF4CB] rounded-lg px-3 py-1.5 max-w-[280px]">
                            <p className="text-[11px] text-[#54656F] text-center leading-snug">
                                <Lock size={10} className="inline mr-1 -mt-px" />
                                {t('messages.secureChatDesc')}
                            </p>
                        </div>
                    </div>

                    {/* Messages grouped by date */}
                    {Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="flex justify-center my-2">
                                <span className="bg-white/80 backdrop-blur-sm text-[11px] text-[#54656F] font-medium px-3 py-1 rounded-lg shadow-sm">
                                    {date}
                                </span>
                            </div>
                            {msgs.map((msg, idx) => {
                                const isMine = msg.sender_id === user.id;
                                return (
                                    <motion.div
                                        key={msg.id || idx}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className={`flex mb-1 ${isMine ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`relative max-w-[82%] px-2.5 py-1.5 rounded-lg shadow-sm text-[14px] leading-[19px] ${isMine
                                                ? 'bg-[#D9FDD3] text-[#111B21] rounded-tr-none'
                                                : 'bg-white text-[#111B21] rounded-tl-none'
                                                }`}
                                        >
                                            {!isMine && (
                                                <p className="text-[12px] font-bold text-[#E63746] mb-0.5">
                                                    {t('messages.supportAgent')}
                                                </p>
                                            )}
                                            <span>{msg.content}</span>
                                            <span className={`inline-flex items-center gap-1 float-right ml-2 mt-1 ${isMine ? '' : ''}`}>
                                                <span className="text-[10px] text-[#667781] leading-none whitespace-nowrap">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMine && (
                                                    <CheckCheck size={14} className={msg.is_read ? 'text-[#53BDEB]' : 'text-[#667781]'} />
                                                )}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))}

                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 opacity-60">
                            <MessageSquare size={40} className="text-[#667781] mb-3" />
                            <p className="text-[13px] text-[#667781] font-medium text-center">
                                {t('messages.noMessages')}
                            </p>
                            <p className="text-[11px] text-[#667781]/70 mt-1">
                                {t('messages.startConversation')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Compact Input Bar */}
                <form
                    onSubmit={handleSendMessage}
                    className="bg-[#F0F2F5] px-2 py-1.5 flex items-end gap-1.5 flex-shrink-0"
                >
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={t('messages.placeholder')}
                            className="w-full bg-white rounded-full py-2.5 pl-4 pr-4 text-[15px] text-[#111B21] placeholder:text-[#667781] border-0 outline-none focus:ring-0 shadow-sm"
                        />
                    </div>
                    <button
                        disabled={!newMessage.trim() || isSending}
                        type="submit"
                        className="w-10 h-10 bg-[#E63746] rounded-full flex items-center justify-center text-white flex-shrink-0 active:scale-90 transition-transform disabled:opacity-40"
                    >
                        {isSending
                            ? <Loader2 className="animate-spin" size={18} />
                            : <Send size={18} className="ml-0.5" />
                        }
                    </button>
                </form>
            </div>

            {/* ═══ DESKTOP LAYOUT ═══ */}
            <div className="hidden md:flex flex-col h-[calc(100vh-120px)]">
                {/* Desktop Header */}
                <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#E63746] rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
                            <MessageSquare className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-[#1D3557]">{t('nav.messages')}</h1>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t('messages.supportAgent')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 bg-emerald-50 rounded-full flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-[11px] font-bold text-emerald-600 uppercase">En ligne</span>
                        </div>
                    </div>
                </div>

                {/* Desktop Chat Area */}
                <div
                    ref={!loading ? undefined : scrollRef}
                    className="flex-1 overflow-y-auto custom-scrollbar p-6 mt-4 bg-gray-50/50 rounded-3xl border border-gray-100 flex flex-col gap-3 min-h-0"
                >
                    <div className="flex flex-col items-center justify-center py-6 opacity-40">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                            <Shield className="text-[#1D3557]" size={22} />
                        </div>
                        <p className="text-xs font-black text-[#1D3557] uppercase tracking-widest">{t('messages.secureChat')}</p>
                        <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] text-center">{t('messages.secureChatDesc')}</p>
                    </div>

                    <AnimatePresence initial={false}>
                        {messages.map((msg, idx) => {
                            const isMine = msg.sender_id === user.id;
                            return (
                                <motion.div
                                    key={msg.id || idx}
                                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${isMine
                                            ? 'bg-[#1D3557] text-white rounded-tr-none'
                                            : 'bg-white text-[#1D3557] border border-gray-100 rounded-tl-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 px-1">
                                            <span className="text-[10px] text-gray-400 font-bold">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isMine && (
                                                <CheckCheck size={12} className={msg.is_read ? 'text-blue-500' : 'text-gray-300'} />
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 opacity-40">
                            <MessageSquare size={50} className="text-gray-300 mb-3" />
                            <p className="text-sm font-bold text-gray-400">{t('messages.noMessages')}</p>
                            <p className="text-xs text-gray-300 mt-1">{t('messages.startConversation')}</p>
                        </div>
                    )}
                </div>

                {/* Desktop Input */}
                <form
                    onSubmit={handleSendMessage}
                    className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex items-center gap-3 flex-shrink-0 mt-4"
                >
                    <div className="flex-grow relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={t('messages.placeholder')}
                            className="w-full bg-gray-50 border-0 focus:ring-2 focus:ring-[#E63746]/20 rounded-xl py-3 px-5 text-sm font-medium text-[#1D3557] placeholder:text-gray-400"
                        />
                    </div>
                    <button
                        disabled={!newMessage.trim() || isSending}
                        type="submit"
                        className="w-12 h-12 bg-[#E63746] rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200 hover:bg-[#c92d3a] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                    >
                        {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                </form>
            </div>
        </>
    );
};

export default MessagesPage;

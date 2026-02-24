"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    MessageSquare,
    User,
    Clock,
    MoreVertical,
    Search,
    Paperclip,
    Smile,
    ArrowLeft,
    CheckCheck,
    Loader2
} from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const MessagesPage = () => {
    const { user } = useAuth();
    const { t } = useLocale();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef(null);

    // Fetch messages for the current user
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

        // Real-time subscription
        if (!user) return;
        const channel = supabase
            .channel('messages-realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${user.id}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new]);
                // If message is new and from admin, mark as read after a delay or when visible
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

        setIsSending(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .insert([{
                    sender_id: user.id,
                    content: newMessage.trim(),
                    // receiver_id is NULL for now (meaning Admin) or we could find an admin ID
                }])
                .select()
                .single();

            if (error) throw error;
            setMessages(prev => [...prev, data]);
            setNewMessage('');
        } catch (error) {
            toast.error(t('common.error'));
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    if (loading) {
        return (
            <PageWrapper className="h-[calc(100vh-120px)] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#E63746]" size={40} />
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="h-[calc(100vh-120px)] flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#E63746] rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
                        <MessageSquare className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-[#1D3557]">{t('nav.messages')}</h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t('messages.supportAgent') || 'Support REDBANK'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors">
                        <Search size={20} />
                    </button>
                    <button className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-grow overflow-y-auto custom-scrollbar p-6 bg-gray-50/50 rounded-3xl border border-gray-100 flex flex-col gap-4"
            >
                <div className="flex flex-col items-center justify-center py-10 opacity-50">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <Shield className="text-[#1D3557]" size={24} />
                    </div>
                    <p className="text-xs font-black text-[#1D3557] uppercase tracking-widest">{t('messages.secureChat') || 'Conversation Sécurisée'}</p>
                    <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] text-center">{t('messages.secureChatDesc') || 'Vos échanges sont protégés par un cryptage de bout en bout.'}</p>
                </div>

                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => {
                        const isMine = msg.sender_id === user.id;
                        return (
                            <motion.div
                                key={msg.id || idx}
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] sm:max-w-[70%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
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
            </div>

            {/* Input Area */}
            <form
                onSubmit={handleSendMessage}
                className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex items-center gap-3 flex-shrink-0"
            >
                <button type="button" className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors">
                    <Paperclip size={20} />
                </button>
                <div className="flex-grow relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={t('messages.placeholder') || "Écrivez votre message..."}
                        className="w-full bg-gray-50 border-0 focus:ring-2 focus:ring-[#E63746]/20 rounded-xl py-3 px-4 text-sm font-medium text-[#1D3557] placeholder:text-gray-400"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E63746] transition-colors">
                        <Smile size={20} />
                    </button>
                </div>
                <button
                    disabled={!newMessage.trim() || isSending}
                    type="submit"
                    className="w-12 h-12 bg-[#E63746] rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200 hover:bg-[#c92d3a] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                    {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
            </form>
        </PageWrapper>
    );
};

export default MessagesPage;

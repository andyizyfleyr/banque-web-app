"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ArrowLeftRight,
    CreditCard,
    PiggyBank,
    TrendingUp,
    User,
    FileText,
    Landmark,
    LogOut,
    MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useLocale } from '@/contexts/LocaleContext';
import SafeHydration from './SafeHydration';

const Sidebar = () => {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const confirm = useConfirm();
    const { t } = useLocale();

    const navItems = [
        { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/dashboard' },
        { icon: ArrowLeftRight, label: t('nav.transfers'), path: '/transfers' },
        { icon: FileText, label: t('nav.loans'), path: '/loans' },
        { icon: CreditCard, label: t('nav.cards'), path: '/cards' },
        { icon: PiggyBank, label: t('nav.savings'), path: '/savings' },
        { icon: Landmark, label: t('nav.transactions'), path: '/transactions' },
        { icon: MessageSquare, label: t('nav.messages'), path: '/messages' },
        { icon: User, label: t('nav.profile'), path: '/profile' },
    ];

    const handleSignOut = async () => {
        const isConfirmed = await confirm({
            title: t('auth.signOutTitle'),
            message: t('auth.signOutMessage'),
            confirmText: t('auth.signOutConfirm'),
            cancelText: t('auth.signOutCancel'),
            variant: 'danger'
        });

        if (!isConfirmed) return;

        try {
            await signOut();
            window.location.href = '/login';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <aside className="w-64 bg-white h-screen border-r border-gray-100 flex-shrink-0 sticky top-0 z-50 hidden md:flex flex-col shadow-xl shadow-gray-200/50">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#e63746] rounded-lg flex items-center justify-center shadow-md shadow-red-200">
                    <Landmark className="text-white" size={18} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-[#1D3557]">
                    RED<span className="text-[#e63746]">BANK</span>
                </h1>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${pathname === item.path
                            ? 'bg-[#e63746]/10 text-[#e63746]'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-[#1D3557]'
                            }`}
                    >
                        <item.icon
                            className={`mr-3 h-5 w-5 transition-transform group-hover:scale-110 ${pathname === item.path ? 'text-[#e63746]' : 'text-gray-400 group-hover:text-[#e63746]'}`}
                            strokeWidth={2}
                        />
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 space-y-2">
                <SafeHydration>
                    <div className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group" suppressHydrationWarning={true}>
                        <div className="h-10 w-10 rounded-full bg-[#e63746]/10 flex items-center justify-center text-[#e63746] font-bold overflow-hidden border-2 border-white ring-2 ring-gray-100 group-hover:ring-[#e63746]/20 transition-all relative" suppressHydrationWarning={true}>
                            <Image
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || 'User')}&background=random`}
                                alt="Profile"
                                className="object-cover"
                                fill
                            />
                        </div>
                        <div className="ml-3 overflow-hidden" suppressHydrationWarning={true}>
                            <p className="text-sm font-bold text-[#1D3557] truncate" suppressHydrationWarning={true}>
                                {user?.user_metadata?.full_name || t('common.user')}
                            </p>
                            <p className="text-xs text-gray-500 truncate group-hover:text-[#e63746] transition-colors" suppressHydrationWarning={true}>{t('common.premiumMember')}</p>
                        </div>
                    </div>
                </SafeHydration>

                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-2"
                >
                    <LogOut size={18} />
                    {t('nav.logout')}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

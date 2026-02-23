"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ArrowLeftRight,
    CreditCard,
    PiggyBank,
    FileText
} from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const MobileBottomNav = () => {
    const pathname = usePathname();
    const { t } = useLocale();

    const navItems = [
        { icon: LayoutDashboard, label: t('nav.dashboard') === 'Tableau de Bord' ? 'Accueil' : t('nav.dashboard'), path: '/dashboard' },
        { icon: ArrowLeftRight, label: t('nav.transfers'), path: '/transfers' },
        { icon: CreditCard, label: t('nav.cards'), path: '/cards' },
        { icon: PiggyBank, label: t('nav.savings'), path: '/savings' },
        { icon: FileText, label: t('nav.loans'), path: '/loans' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-16 z-50 md:hidden safe-area-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex flex-col items-center justify-center flex-1 h-full tap-feedback ${isActive ? 'text-[#e63746]' : 'text-gray-400'
                            }`}
                    >
                        <item.icon
                            size={20}
                            className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}
                            strokeWidth={isActive ? 2.5 : 2}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
};

export default MobileBottomNav;

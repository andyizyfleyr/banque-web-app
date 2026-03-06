"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Landmark, Coins, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import SafeHydration from './SafeHydration';
import CountrySelector from './CountrySelector';

const Header = () => {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const { t, country, fc } = useLocale();
    const confirm = useConfirm();
    const [profile, setProfile] = useState(null);
    const [showSelector, setShowSelector] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('preferred_currency')
                .eq('id', user.id)
                .single();
            if (!error && data) setProfile(data);
        };

        fetchProfile();
    }, [user]);

    return (
        <>
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm md:shadow-none">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        {/* Logo - Only visible on mobile since Sidebar handles desktop */}
                        <Link href="/dashboard" className="flex items-center gap-2 group md:hidden">
                            <Image src="/landing-page-assert/logo.svg" alt="Crediwize" width={130} height={38} className="object-contain pr-2" priority />
                        </Link>

                    </div>

                    <div className="flex items-center gap-4">
                        {/* Country/Language Selector Button */}
                        <button
                            onClick={() => setShowSelector(true)}
                            className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 relative transition-colors flex items-center gap-1.5"
                            title={t('countrySelector.title')}
                        >
                            <span className="text-lg">{country?.flag || '🌍'}</span>
                            <Globe size={14} className="text-gray-400" />
                        </button>

                        {/* Mobile Logout Button */}
                        <button
                            onClick={async () => {
                                const confirmed = await confirm({
                                    title: t('auth.signOutTitle') || 'Déconnexion',
                                    message: t('auth.signOutMessage') || 'Êtes-vous sûr de vouloir vous déconnecter ?',
                                    confirmText: t('auth.signOutConfirm') || 'Oui, me déconnecter',
                                    cancelText: t('auth.signOutCancel') || 'Annuler',
                                    variant: 'danger',
                                });

                                if (confirmed) {
                                    await signOut();
                                    // Redirection is handled by auth state change / middleware
                                }
                            }}
                            className="md:hidden p-2.5 rounded-full hover:bg-gray-100 text-red-500 transition-colors"
                            title={t('auth.signOutTitle')}
                        >
                            <LogOut size={20} />
                        </button>
                        <SafeHydration>
                            <Link href="/profile" className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors pr-2 py-1" suppressHydrationWarning={true}>
                                <div className="text-right hidden sm:block" suppressHydrationWarning={true}>
                                    <p className="text-sm font-bold text-[#2B2D42]" suppressHydrationWarning={true}>
                                        {user?.user_metadata?.full_name || t('common.user')}
                                    </p>
                                    <p className="text-xs text-gray-400 font-medium" suppressHydrationWarning={true}>{t('common.premiumMember')}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-[#e63746]/10 overflow-hidden border-2 border-white ring-2 ring-gray-100 p-0.5 relative" suppressHydrationWarning={true}>
                                    <Image
                                        src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || 'User')}&background=random`}
                                        alt="Profile"
                                        className="object-cover rounded-full"
                                        fill
                                    />
                                </div>
                            </Link>
                        </SafeHydration>
                    </div>
                </div>
            </header>

            {showSelector && (
                <CountrySelector onClose={() => setShowSelector(false)} />
            )}
        </>
    );
};

export default Header;

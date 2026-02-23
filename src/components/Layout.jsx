"use client";
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';

const Layout = ({ children }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();
    const isLoginPage = pathname === '/login';
    const isLandingPage = pathname === '/' || pathname?.startsWith('/landing');
    const isAboutPage = pathname?.startsWith('/about');
    const isServicesPage = pathname?.startsWith('/services');
    const isContactPage = pathname?.startsWith('/contact');
    const isRachatCreditsPage = pathname?.startsWith('/rachat-credits');
    const isPretPage = pathname?.startsWith('/pret');
    const isFraudePage = pathname?.startsWith('/fraude-bancaire');
    const isLegalPage = pathname?.startsWith('/legal');
    const isMentionsPage = pathname?.startsWith('/mentions-legales');
    const isPrivacyPage = pathname?.startsWith('/politique-confidentialite');
    const isCguPage = pathname?.startsWith('/cgu');
    const isAdminPage = pathname?.startsWith('/admin');
    const isPublicPage = isLoginPage || isLandingPage || isAboutPage || isServicesPage || isContactPage || isRachatCreditsPage || isPretPage || isFraudePage || isLegalPage || isMentionsPage || isPrivacyPage || isCguPage || isAdminPage;

    // Auth redirection is handled centrally in AuthContext to avoid race conditions

    // Try to use locale, but provide fallback for non-locale contexts
    let t, country;
    try {
        const locale = useLocale();
        t = locale.t;
        country = locale.country;
    } catch {
        t = (key) => {
            const fallback = {
                'footer.copyright': '© 2026 REDBANK Financial Services. All rights reserved.',
                'footer.privacy': 'Privacy Policy',
                'footer.terms': 'Terms of Service',
                'footer.security': 'Security',
                'footer.help': 'Help Center'
            };
            return fallback[key] || key;
        };
    }

    if (isPublicPage) {
        return <div className="min-h-screen bg-[--color-background-light] w-full">{children}</div>;
    }

    return (
        <div className="min-h-screen bg-[--color-background-light] text-[--color-charcoal] font-sans flex flex-col md:flex-row text-sm" suppressHydrationWarning={true}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 min-w-0 overflow-x-hidden pb-16 md:pb-0" suppressHydrationWarning={true}>
                <Header />
                <main className="max-w-7xl mx-auto px-4 py-8 animate-fade-in w-full flex-grow" suppressHydrationWarning={true}>
                    {children}
                </main>
                <footer className="max-w-7xl mx-auto px-4 py-8 border-t border-[--color-primary-red]/10 w-full hidden md:block">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-xs">
                        <p>{t('footer.copyright')}</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-[--color-primary-red] transition-colors">{t('footer.privacy')}</a>
                            <a href="#" className="hover:text-[--color-primary-red] transition-colors">{t('footer.terms')}</a>
                            <a href="#" className="hover:text-[--color-primary-red] transition-colors">{t('footer.security')}</a>
                            <a href="#" className="hover:text-[--color-primary-red] transition-colors">{t('footer.help')}</a>
                        </div>
                    </div>
                </footer>
            </div>
            <MobileBottomNav />
        </div>
    );
};

export default Layout;

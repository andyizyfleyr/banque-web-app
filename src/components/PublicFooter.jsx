import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Send, Lock } from 'lucide-react';
import { useLocale } from "@/contexts/LocaleContext";

const PublicFooter = () => {
    const { t } = useLocale();

    // Utility function to format numbers, since fc() might not be available here
    const fc = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(n);

    const quickLinks = [
        { name: t('publicFooter.home'), path: "/" },
        { name: t('publicFooter.about'), path: "/about" },
        { name: t('publicFooter.services'), path: "/services" },
        { name: t('publicFooter.contact'), path: "/contact" },
        { name: t('publicFooter.creditBuyback'), path: "/rachat-credits" },
    ];

    const serviceLinks = [
        { name: t('publicFooter.personalLoan'), path: "/pret" },
        { name: t('publicFooter.bankFraud'), path: "/fraude-bancaire" },
        { name: t('publicFooter.legalNotice'), path: "/mentions-legales" },
        { name: t('publicFooter.privacyPolicy'), path: "/politique-confidentialite" },
        { name: t('publicFooter.termsOfUse'), path: "/cgu" },
    ];

    return (
        <footer className="bg-[#1D3557] pt-24 pb-16 text-white overflow-hidden relative border-t-[10px] border-[#e63746] mt-auto">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#e63746] to-transparent opacity-30" />
            <div className="max-w-[1400px] mx-auto px-6 lg:px-16 grid lg:grid-cols-12 gap-20">
                <div className="lg:col-span-5 space-y-12">
                    <Link href="/" className="flex items-center gap-3">
                        <Image src="/landing-page-assert/footer-logo.png" alt="Financer" width={160} height={50} className="brightness-0 invert opacity-90" />
                    </Link>
                    <p className="text-white/40 text-lg leading-relaxed max-w-md font-light italic">
                        {t('publicFooter.description')}
                    </p>
                    <div className="flex p-2 bg-white/5 rounded-3xl border border-white/10 focus-within:border-[#e63746]/50 transition-colors max-w-sm">
                        <input type="email" placeholder={t('publicFooter.emailPlaceholder')} className="bg-transparent border-none outline-none flex-1 px-6 text-white placeholder:text-white/20 text-sm" />
                        <button className="bg-[#e63746] p-4 rounded-2xl hover:bg-[#C1121F] transition-all group shadow-lg">
                            <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-10">
                    <h4 className="text-lg font-black uppercase tracking-[0.2em]">{t('publicFooter.quickLinks')}</h4>
                    <ul className="space-y-5">
                        {quickLinks.map((link, i) => (
                            <li key={i}>
                                <Link href={link.path} className="text-white/50 hover:text-white transition-colors flex items-center gap-2 group text-[15px] font-bold">
                                    <div className="w-1.5 h-1.5 bg-[#e63746] rounded-full scale-0 group-hover:scale-100 transition-transform" />
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="lg:col-span-2 space-y-10">
                    <h4 className="text-lg font-black uppercase tracking-[0.2em]">{t('publicFooter.information')}</h4>
                    <ul className="space-y-5">
                        {serviceLinks.map((link, i) => (
                            <li key={i}>
                                <Link href={link.path} className="text-white/50 hover:text-white transition-colors flex items-center gap-2 group text-[15px] font-bold">
                                    <div className="w-1.5 h-1.5 bg-[#DF73F8] rounded-full scale-0 group-hover:scale-100 transition-transform" />
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="lg:col-span-3 space-y-12">
                    <h4 className="text-lg font-black uppercase tracking-[0.2em]">{t('publicFooter.security')}</h4>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 group">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-[#e63746]/20 transition-colors">
                                <Lock className="text-white/40 group-hover:text-[#e63746]" size={24} />
                            </div>
                            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">{t('publicFooter.securePayments')}</p>
                        </div>
                        <div className="p-6 xl:p-8 bg-gradient-to-br from-white/10 to-transparent rounded-3xl border border-white/10 shadow-inner overflow-hidden">
                            <p className="text-xl xl:text-3xl font-black mb-1 whitespace-nowrap">{fc(1250000000)}</p>
                            <p className="text-[10px] xl:text-[11px] text-white/30 font-bold uppercase tracking-widest whitespace-nowrap">{t('publicFooter.securedTransactions')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 lg:px-16 mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                <p className="text-white/30 text-sm font-bold tracking-wider">{t('publicFooter.copyright')}</p>
                <div className="flex items-center gap-6">
                    <Link href="/mentions-legales" className="text-white/30 hover:text-white text-sm font-medium transition-colors">{t('publicFooter.legalNotice')}</Link>
                    <Link href="/politique-confidentialite" className="text-white/30 hover:text-white text-sm font-medium transition-colors">{t('publicFooter.privacy')}</Link>
                    <Link href="/cgu" className="text-white/30 hover:text-white text-sm font-medium transition-colors">{t('publicFooter.termsOfUse')}</Link>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;

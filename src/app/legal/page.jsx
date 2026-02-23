"use client";
import React, { useState } from 'react';
import { useLocale } from "@/contexts/LocaleContext";
import Image from 'next/image';
import Link from 'next/link';
import {
    Scale,
    ShieldCheck,
    FileText,
    Globe,
    Menu,
    X,
    ChevronRight,
    Building2,
    Mail,
    Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CountrySelector from '@/components/CountrySelector';
import PublicFooter from '@/components/PublicFooter';

const LegalPage = () => {
    const { t, language } = useLocale();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSelector, setShowSelector] = useState(false);
    const [activeTab, setActiveTab] = useState('mentions'); // mentions, privacy, cgu

    const navLinks = [
        { name: t('public_nav.home'), active: false, path: "/" },
        { name: t('public_nav.about'), active: false, path: "/about" },
        { name: t('public_nav.services'), active: false, path: "/services" },
        { name: t('public_nav.contact'), active: false, path: "/contact" }
    ];

    const tabs = [
        { id: 'mentions', label: 'Mentions Légales', icon: Scale },
        { id: 'privacy', label: 'Politique de Confidentialité', icon: ShieldCheck },
        { id: 'cgu', label: "Conditions Générales d'Utilisation", icon: FileText }
    ];

    return (
        <div className="min-h-screen bg-gray-50 selection:bg-[#E63746]/10 selection:text-[#E63746] font-sans overflow-x-hidden">

            {showSelector && (
                <CountrySelector onClose={() => setShowSelector(false)} />
            )}

            {/* Header / Nav */}
            <nav className="fixed w-full z-[100] transition-all duration-500 py-0 md:py-8">
                <div className="max-w-[1400px] mx-auto px-0 md:px-6 lg:px-16">
                    <div className="bg-white/80 backdrop-blur-2xl rounded-none md:rounded-[2.5rem] border-b md:border border-white/50 shadow-[0_15px_40px_rgba(0,0,0,0.04)] px-6 md:px-10 py-4 flex items-center justify-between transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
                        <Link href="/" className="flex items-center gap-3 group shrink-0">
                            <Image
                                src="/landing-page-assert/logo.png"
                                alt="Financer"
                                width={140}
                                height={40}
                                className="object-contain"
                                priority
                            />
                        </Link>

                        <div className="hidden xl:flex items-center space-x-12">
                            {navLinks.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.path}
                                    className={`text-[15px] font-bold transition-all relative group text-[#1D3557] hover:text-[#E63746]`}
                                >
                                    {link.name}
                                    <span className={`absolute -bottom-1.5 left-0 w-full h-0.5 bg-[#E63746] rounded-full transition-transform origin-left scale-x-0 group-hover:scale-x-100`} />
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center space-x-4 md:space-x-10">
                            <div className="hidden lg:flex items-center gap-3 pr-8 border-r border-gray-100">
                                <button
                                    onClick={() => setShowSelector(true)}
                                    className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-[#1D3557] hover:bg-[#E63746]/5 hover:text-[#E63746] transition-colors"
                                >
                                    <Globe size={18} />
                                </button>
                                <button
                                    onClick={() => setShowSelector(true)}
                                    className="text-sm font-bold text-[#1D3557] hover:text-[#E63746] transition-colors uppercase"
                                >
                                    {language === 'en' ? 'English' : language === 'fr' ? 'Français' : language?.toUpperCase() || 'FR'}
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="hidden sm:block text-[#1D3557] font-bold text-[15px] hover:text-[#E63746] transition-colors"
                                >
                                    {t('public_nav.login')}
                                </Link>
                                <button
                                    onClick={() => setShowSelector(true)}
                                    className="lg:hidden w-11 h-11 flex items-center justify-center text-[#1D3557] hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <Globe size={22} />
                                </button>
                                <button
                                    className="xl:hidden w-11 h-11 flex items-center justify-center text-[#1D3557] hover:bg-gray-100 rounded-full transition-colors"
                                    onClick={() => setIsMobileMenuOpen(true)}
                                >
                                    <Menu size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#1D3557]/60 backdrop-blur-md z-[200] xl:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 w-full max-w-sm h-full bg-white shadow-2xl p-10 flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-16">
                                <Image src="/landing-page-assert/logo.png" alt="Financer" width={120} height={35} />
                                <button
                                    className="w-11 h-11 flex items-center justify-center text-[#1D3557] hover:bg-gray-100 rounded-full"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-8 mb-auto">
                                {navLinks.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.path}
                                        className={`block text-2xl font-black text-[#1D3557] hover:text-[#E63746]`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>

                            <div className="pt-10 border-t border-gray-100 space-y-6">
                                <button
                                    onClick={() => setShowSelector(true)}
                                    className="flex items-center gap-3 w-full p-4 rounded-2xl bg-gray-50 text-[#1D3557] font-black"
                                >
                                    <Globe size={20} />
                                    <span>{language === 'en' ? 'English' : language === 'fr' ? 'Français' : language?.toUpperCase() || 'FR'}</span>
                                </button>
                                <Link
                                    href="/login"
                                    className="block w-full text-center py-4 rounded-2xl bg-[#1D3557] text-white font-black shadow-lg"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {t('public_nav.login')}
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="pt-32 lg:pt-48 pb-24">

                {/* Hero Section */}
                <section className="max-w-[1400px] mx-auto px-6 lg:px-16 mb-16">
                    <div className="bg-[#1D3557] rounded-[2.5rem] p-10 md:p-16 lg:p-20 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
                        <div className="relative z-10 space-y-6">
                            <span className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest bg-[#E63746] text-white uppercase inline-block shadow-lg shadow-red-500/30">
                                Informations sur notre plateforme
                            </span>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                                Pages Légales
                            </h1>
                            <p className="text-blue-100/90 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                                Transparence et sécurité sont nos priorités. Retrouvez ici toues les informations légales concernant notre plateforme, notre politique de confidentialité et nos conditions générales d'utilisation.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="max-w-[1400px] mx-auto px-6 lg:px-16">
                    <div className="flex flex-col lg:flex-row gap-12 items-start">

                        {/* Sidebar */}
                        <div className="w-full lg:w-1/3 space-y-4 sticky top-36 shrink-0">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left p-6 rounded-[1.5rem] border flex items-center justify-between transition-all duration-300 group ${activeTab === tab.id
                                        ? 'bg-white border-[#E63746] shadow-lg shadow-red-500/10'
                                        : 'bg-transparent border-gray-200 hover:border-gray-300 hover:bg-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${activeTab === tab.id ? 'bg-red-50 text-[#E63746]' : 'bg-gray-100 text-[#1D3557] group-hover:bg-gray-200'
                                            }`}>
                                            <tab.icon size={22} />
                                        </div>
                                        <span className={`font-bold text-lg ${activeTab === tab.id ? 'text-[#E63746]' : 'text-[#1D3557]'}`}>
                                            {tab.label}
                                        </span>
                                    </div>
                                    <ChevronRight size={20} className={`transition-transform duration-300 ${activeTab === tab.id ? 'text-[#E63746] translate-x-1' : 'text-gray-400 group-hover:translate-x-1'}`} />
                                </button>
                            ))}

                            <div className="mt-8 bg-blue-50/50 p-8 rounded-[1.5rem] border border-blue-100">
                                <h3 className="font-bold text-[#1D3557] text-lg mb-4">Besoin d'aide supplémentaire ?</h3>
                                <p className="text-gray-500 text-sm mb-6 leading-relaxed">Notre équipe support ou notre Délégué à la Protection des Données est à votre disposition.</p>
                                <Link href="/contact" className="bg-[#1D3557] hover:bg-[#E63746] text-white w-full py-3 rounded-xl font-bold flex items-center justify-center transition-colors shadow-sm">
                                    Nous contacter
                                </Link>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="w-full lg:w-2/3 bg-white p-8 md:p-12 lg:p-16 rounded-[2.5rem] shadow-sm border border-gray-100 relative min-h-[600px]">

                            <AnimatePresence mode="wait">
                                {activeTab === 'mentions' && (
                                    <motion.div
                                        key="mentions"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-10"
                                    >
                                        <div className="border-b border-gray-100 pb-8">
                                            <h2 className="text-3xl lg:text-4xl font-black text-[#1D3557]">Mentions Légales</h2>
                                            <p className="text-gray-500 mt-3 text-lg">En vigueur au 01/01/2026</p>
                                        </div>

                                        <div className="space-y-8 text-gray-600 leading-loose">
                                            <div>
                                                <h3 className="text-xl font-bold text-[#1D3557] mb-4 flex items-center gap-2">
                                                    <Building2 className="text-[#E63746]" size={22} /> Éditeur du site
                                                </h3>
                                                <p>Le site internet <strong className="text-[#1D3557]">www.notre-banque.com</strong> est édité par :</p>
                                                <ul className="mt-2 space-y-1 pl-6 list-disc marker:text-[#E63746]">
                                                    <li>Raison sociale : Financer Group SA</li>
                                                    <li>Siège social : 123 Avenue des Champs-Élysées, 75008 Paris, France</li>
                                                    <li>Capital social : 5 000 000 €</li>
                                                    <li>RCS : Paris B 123 456 789</li>
                                                    <li>Numéro de TVA intracommunautaire : FR 12 3456789</li>
                                                    <li>Numéro ORIAS : 12345678 (www.orias.fr)</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-[#1D3557] mb-4 flex items-center gap-2">
                                                    <Phone className="text-[#E63746]" size={22} /> Directeur de la publication
                                                </h3>
                                                <p>M. Jean Dupont, en sa qualité de Directeur Général de Financer Group SA.</p>
                                                <p className="mt-2">Contact : <a href="mailto:contact@notre-banque.com" className="text-[#E63746] font-medium hover:underline">contact@notre-banque.com</a></p>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-[#1D3557] mb-4 flex items-center gap-2">
                                                    <Globe className="text-[#E63746]" size={22} /> Hébergement
                                                </h3>
                                                <p>Ce site est hébergé par :</p>
                                                <ul className="mt-2 space-y-1 pl-6 list-disc marker:text-[#E63746]">
                                                    <li>AWS France (Amazon Web Services)</li>
                                                    <li>31 Place des Corolles, 92400 Courbevoie, France</li>
                                                    <li>Téléphone : +33 1 23 45 67 89</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-[#1D3557] mb-4">Autorité de contrôle</h3>
                                                <p>Financer Group est un établissement de crédit de droit français agréé et contrôlé par l'Autorité de Contrôle Prudentiel et de Résolution (ACPR).</p>
                                                <p className="mt-2">Adresse de l'ACPR : 4 Place de Budapest, CS 92459, 75436 Paris Cedex 09.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'privacy' && (
                                    <motion.div
                                        key="privacy"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-10"
                                    >
                                        <div className="border-b border-gray-100 pb-8">
                                            <h2 className="text-3xl lg:text-4xl font-black text-[#1D3557]">Politique de Confidentialité</h2>
                                            <p className="text-gray-500 mt-3 text-lg">Mise à jour le 01/01/2026</p>
                                        </div>

                                        <div className="space-y-8 text-gray-600 leading-loose">
                                            <p>
                                                La protection de vos données personnelles est au cœur de nos préoccupations. La présente politique détaille comment Financer Group collecte, utilise, protège et partage vos données dans le cadre de l'utilisation de nos services en ligne.
                                            </p>

                                            <div>
                                                <h3 className="text-xl font-bold text-[#1D3557] mb-4">1. Collecte des données</h3>
                                                <p>Nous collectons différentes catégories de données personnelles, notamment :</p>
                                                <ul className="mt-2 space-y-2 pl-6 list-disc marker:text-[#E63746]">
                                                    <li><strong className="text-[#1D3557]">Données d'identification :</strong> Nom, prénom, date de naissance, pièce d'identité.</li>
                                                    <li><strong className="text-[#1D3557]">Coordonnées :</strong> Email, adresse postale, numéro de téléphone.</li>
                                                    <li><strong className="text-[#1D3557]">Données financières :</strong> Revenus, patrimoine, historiques de transactions.</li>
                                                    <li><strong className="text-[#1D3557]">Données de connexion :</strong> Adresse IP, cookies, identifiants de l'appareil.</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-[#1D3557] mb-4">2. Finalités de l'utilisation</h3>
                                                <p>Vos données sont traitées pour les finalités suivantes :</p>
                                                <ul className="mt-2 space-y-1 pl-6 list-disc marker:text-[#E63746]">
                                                    <li>Ouverture et gestion de vos comptes bancaires et crédits.</li>
                                                    <li>Respect de nos obligations légales (lutte contre le blanchiment d'argent et le financement du terrorisme).</li>
                                                    <li>Mise à disposition de l'application et de ses services associés.</li>
                                                    <li>Prévention de la fraude.</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-[#1D3557] mb-4">3. Durée de conservation</h3>
                                                <p>Nous conservons vos données pendant la durée de votre contrat, puis pendant les durées légales de prescription ou de conservation applicables en droit français (ex: conservation de 5 ans pour les données transactionnelles et contrats à des fins de lutte contre le blanchiment).</p>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-[#1D3557] mb-4 flex items-center gap-2">
                                                    <Lock className="text-[#E63746]" size={22} /> 4. Vos droits (RGPD)
                                                </h3>
                                                <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
                                                <ul className="mt-2 space-y-1 pl-6 list-disc marker:text-[#E63746]">
                                                    <li>Droit d'accès et de rectification.</li>
                                                    <li>Droit à l'effacement de vos données (droit à l'oubli).</li>
                                                    <li>Droit à la limitation et à la portabilité.</li>
                                                    <li>Droit d'opposition au traitement pour des motifs légitimes.</li>
                                                </ul>
                                                <p className="mt-4">
                                                    Pour exercer ces droits, vous pouvez contacter notre Délégué à la Protection des Données (DPO) à l'adresse : <a href="mailto:dpo@notre-banque.com" className="text-[#E63746] font-medium hover:underline">dpo@notre-banque.com</a>
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'cgu' && (
                                    <motion.div
                                        key="cgu"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-10"
                                    >
                                        <div className="border-b border-gray-100 pb-8">
                                            <h2 className="text-3xl lg:text-4xl font-black text-[#1D3557]">Conditions Générales d'Utilisation</h2>
                                            <p className="text-gray-500 mt-3 text-lg">Applicables au 01/01/2026</p>
                                        </div>

                                        <div className="space-y-8 text-gray-600 leading-loose">
                                            <p className="font-medium text-[#1D3557]">
                                                Les présentes Conditions Générales d'Utilisation (CGU) déterminent les règles d'accès et d'utilisation du site de Financer Group. Tout accès ou utilisation du site emporte l'acceptation sans réserve de ces conditions.
                                            </p>

                                            <div>
                                                <h3 className="text-xl font-bold text-[#1D3557] mb-4">Article 1 : Accès au site</h3>
                                                <p>Le site est accessible gratuitement en tout lieu à tout utilisateur ayant un accès à Internet. Tous les frais supportés par l'utilisateur pour accéder au service (matériel informatique, logiciels, connexion Internet, etc.) sont à sa charge. Le site est normalement accessible 24h/24 et 7j/7. En cas de force majeure, ou lors d'une maintenance technique périodique, l'accès peut être suspendu ou limité.</p>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-[#1D3557] mb-4">Article 2 : Compte utilisateur</h3>
                                                <p>L'accès à l'espace client nécessite la création d'un compte où l'utilisateur s'engage à fournir des informations véridiques, exactes et complètes. L'utilisateur est responsable de la conservation du caractère confidentiel de ses identifiants et de son mot de passe, ainsi que de toute action réalisée sur son compte. Toute fraude ou soupçon de fraude doit nous être signalé immédiatement.</p>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-[#1D3557] mb-4">Article 3 : Propriété intellectuelle</h3>
                                                <p>La structure générale du site, ainsi que les textes, graphiques, images, sons et vidéos la composant, sont la propriété de l'éditeur ou de ses partenaires. Toute représentation, reproduction, ou exploitation partielle ou totale des contenus et services sans l'autorisation préalable et par écrit de l'éditeur est strictement interdite et serait susceptible de constituer une contrefaçon.</p>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-[#1D3557] mb-4">Article 4 : Responsabilité</h3>
                                                <p>L'éditeur décline toute responsabilité pour toute interruption du site ou survenance de bogues, pour toute inexactitude ou omission portant sur des informations disponibles sur le site, ou plus généralement pour tout dommage direct ou indirect, qu'elles qu'en soient les causes ou la nature, provoqué à raison de l'accès de quiconque au site ou de l'impossibilité d'y accéder.</p>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-[#1D3557] mb-4">Article 5 : Liens hypertextes</h3>
                                                <p>Des liens hypertextes peuvent être présents sur le site. L'utilisateur est informé qu'en cliquant sur ces liens, il sortira du site de Financer Group. Ce dernier n'a pas de contrôle sur les pages web sur lesquelles aboutissent ces liens et ne saurait, en aucun cas, être responsable de leur contenu.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                </section>

            </main>

            <PublicFooter />
        </div>
    );
};

export default LegalPage;

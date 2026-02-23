"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    User,
    Shield,
    Bell,
    Settings,
    Camera,
    Smartphone,
    Laptop,
    Sun,
    Moon,
    ChevronDown,
    Info,
    Save,
    Eye,
    EyeOff,
    X,
    CheckCircle,
    Lock,
    Mail,
    Phone,
    MapPin,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { currencies } from '@/config/currencies';

const Profile = () => {
    const { user } = useAuth();
    const { t } = useLocale();
    const fileInputRef = useRef(null);

    // Loading
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Active section (sidebar nav)
    const [activeSection, setActiveSection] = useState('personal');

    // Personal info (editable)
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Password change
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Notification preferences
    const [notifications, setNotifications] = useState({
        transactions: true,
        security: true,
        promotions: false,
        loanUpdates: true,
        cardAlerts: true,
        monthlyReport: true
    });

    // Theme
    const [theme, setTheme] = useState('light');

    // 2FA
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);

    // Track changes
    const [hasChanges, setHasChanges] = useState(false);
    const [preferredCurrency, setPreferredCurrency] = useState('EUR');

    // Load user data
    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata?.full_name || '');
            setEmail(user.email || '');
            setPhone(user.user_metadata?.phone || '');
            setAddress(user.user_metadata?.address || '');
            setAvatarUrl(user.user_metadata?.avatar_url || '');

            // Load notification prefs from metadata
            if (user.user_metadata?.notification_prefs) {
                setNotifications(prev => ({ ...prev, ...user.user_metadata.notification_prefs }));
            }

            if (user.user_metadata?.preferred_currency) {
                setPreferredCurrency(user.user_metadata.preferred_currency);
            } else {
                // Fetch from DB if not in metadata
                const fetchProfile = async () => {
                    const { data } = await supabase.from('profiles').select('preferred_currency').eq('id', user.id).single();
                    if (data?.preferred_currency) {
                        setPreferredCurrency(data.preferred_currency);
                    }
                };
                fetchProfile();
            }

            setLoading(false);
        }
    }, [user]);

    // Detect changes
    useEffect(() => {
        if (!user) return;
        const nameChanged = fullName !== (user.user_metadata?.full_name || '');
        const phoneChanged = phone !== (user.user_metadata?.phone || '');
        const addressChanged = address !== (user.user_metadata?.address || '');
        const currencyChanged = preferredCurrency !== (user.user_metadata?.preferred_currency || 'EUR');
        const avatarChanged = avatarFile !== null;
        setHasChanges(nameChanged || phoneChanged || addressChanged || currencyChanged || avatarChanged);
    }, [fullName, phone, address, avatarFile, preferredCurrency, user]);

    // Handle avatar selection
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.error(t('profile.fileSizeError'));
            return;
        }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    // Save profile
    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);

        try {
            let newAvatarUrl = avatarUrl;

            // Upload avatar if changed
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const filePath = `avatars/${user.id}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile, { upsert: true });

                if (uploadError) {
                    console.error('Avatar upload error:', uploadError);
                    // Fallback: use a generated avatar URL instead
                    newAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e63746&color=fff&size=128`;
                } else {
                    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
                    newAvatarUrl = urlData.publicUrl;
                }
            }

            // Update auth user metadata
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    phone: phone,
                    address: address,
                    avatar_url: newAvatarUrl,
                    notification_prefs: notifications,
                    preferred_currency: preferredCurrency
                }
            });

            // Also update the profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ preferred_currency: preferredCurrency })
                .eq('id', user.id);

            if (profileError) throw profileError;

            if (error) throw error;

            setAvatarUrl(newAvatarUrl);
            setAvatarFile(null);
            setAvatarPreview(null);
            setHasChanges(false);
            toast.success(t('profile.profileUpdated'));
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error(t('profile.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    // Change password
    const handleChangePassword = async () => {
        if (newPassword.length < 6) {
            toast.error(t('profile.passwordMinLength'));
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error(t('profile.passwordMismatch'));
            return;
        }

        setIsChangingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            toast.success(t('profile.passwordChanged'));
            setShowPasswordModal(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(error.message || t('profile.passwordChangeError'));
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Toggle notification
    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        setHasChanges(true);
    };

    // Get display avatar
    const getAvatarSrc = () => {
        if (avatarPreview) return avatarPreview;
        if (avatarUrl) return avatarUrl;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=e63746&color=fff&size=128`;
    };

    const sidebarItems = [
        { id: 'personal', icon: User, label: t('profile.personalInfo') },
        { id: 'security', icon: Shield, label: t('profile.security') },
    ];

    if (loading) {
        return (
            <PageWrapper className="flex flex-col lg:flex-row gap-8 pb-24">
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
                    </div>
                </aside>
                <main className="flex-grow space-y-8">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-48 w-full rounded-2xl" />
                </main>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="flex flex-col lg:flex-row gap-8 pb-24 relative">

            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-64 flex-shrink-0">
                <div className="space-y-1 bg-white rounded-2xl p-2 shadow-sm border border-gray-100 lg:bg-transparent lg:shadow-none lg:border-none lg:p-0">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left ${activeSection === item.id ? 'bg-[#E63746]/10 text-[#E63746]' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow space-y-8">

                {/* ===== PERSONAL INFO ===== */}
                {activeSection === 'personal' && (
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-[#1D3557]">{t('profile.personalDetails')}</h2>
                            <p className="text-sm text-gray-500">{t('profile.personalDetailsDesc')}</p>
                        </div>
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Avatar */}
                                <div className="flex-shrink-0 flex flex-col items-center mx-auto md:mx-0">
                                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <div className="w-32 h-32 rounded-full border-4 border-gray-50 overflow-hidden relative shadow-lg">
                                            <Image className="object-cover" src={getAvatarSrc()} alt="Profile" fill />
                                        </div>
                                        <button className="absolute bottom-0 right-0 bg-[#E63746] text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform">
                                            <Camera size={16} />
                                        </button>
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-semibold">{t('profile.edit')}</span>
                                        </div>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                    <p className="mt-3 text-xs text-gray-400 text-center">{t('profile.avatarFormats')}<br />{t('profile.avatarMaxSize')}</p>
                                    {avatarPreview && (
                                        <button
                                            onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                                            className="mt-2 text-xs text-red-500 font-bold hover:underline"
                                        >
                                            {t('profile.cancelPhoto')}
                                        </button>
                                    )}
                                </div>

                                {/* Form fields */}
                                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 w-full">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <User size={12} /> {t('profile.fullName')}
                                        </label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#E63746]/20 focus:border-[#E63746] transition-all outline-none font-medium text-[#1D3557]"
                                            placeholder={t('profile.fullNamePlaceholder')}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <Mail size={12} /> {t('profile.emailAddress')}
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            disabled
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed font-medium"
                                        />
                                        <p className="text-[10px] text-gray-400">{t('profile.emailReadonly')}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <Phone size={12} /> {t('profile.phoneNumber')}
                                        </label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#E63746]/20 focus:border-[#E63746] transition-all outline-none font-medium text-[#1D3557]"
                                            placeholder="+33 6 12 34 56 78"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <MapPin size={12} /> {t('profile.address')}
                                        </label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#E63746]/20 focus:border-[#E63746] transition-all outline-none font-medium text-[#1D3557]"
                                            placeholder={t('profile.addressPlaceholder')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Member since */}
                            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3 text-sm text-gray-400">
                                <Info size={14} />
                                <span>{t('profile.memberSince')} {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                            </div>
                        </div>
                    </section>
                )}

                {/* ===== SECURITY ===== */}
                {activeSection === 'security' && (
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-[#1D3557]">{t('profile.securitySettings')}</h2>
                            <p className="text-sm text-gray-500">{t('profile.securitySettingsDesc')}</p>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Password Change */}
                            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#1D3557]/10 rounded-xl flex items-center justify-center text-[#1D3557]">
                                        <Lock size={22} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#1D3557]">{t('profile.password')}</h3>
                                        <p className="text-sm text-gray-500">{t('profile.passwordDesc')}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="px-5 py-2.5 bg-[#E63746] text-white rounded-xl text-sm font-bold hover:bg-[#E63746]/90 transition-colors shadow-md shadow-red-100"
                                >
                                    {t('profile.edit')}
                                </button>
                            </div>

                            {/* 2FA Toggle */}
                            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#E63746]/10 rounded-xl flex items-center justify-center text-[#E63746]">
                                        <Smartphone size={22} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#1D3557]">{t('profile.twoFA')}</h3>
                                        <p className="text-sm text-gray-500">{t('profile.twoFADesc')}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setTwoFAEnabled(!twoFAEnabled); toast.success(twoFAEnabled ? t('profile.twoFADisabled') : t('profile.twoFAEnabled')); }}
                                    className={`w-12 h-7 rounded-full relative transition-colors ${twoFAEnabled ? 'bg-[#E63746]' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${twoFAEnabled ? 'translate-x-6' : 'translate-x-1'}`}></div>
                                </button>
                            </div>

                            {/* Connected Devices */}
                            <div className="mt-4">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t('profile.connectedDevices')}</h3>
                                <div className="space-y-3">
                                    {[
                                        { name: t('profile.webBrowser'), loc: `${t('profile.currentSession')} • ${new Date().toLocaleDateString('fr-FR')}`, icon: Laptop, current: true },
                                        { name: t('profile.mobileApp'), loc: t('profile.lastActivity'), icon: Smartphone, current: false }
                                    ].map((device, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <device.icon className="text-gray-400" size={24} />
                                                <div>
                                                    <p className="font-bold text-[#1D3557] flex items-center gap-2">
                                                        {device.name}
                                                        {device.current && <span className="text-[9px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-black uppercase">{t('profile.active')}</span>}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{device.loc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}


            </main>

            {/* Sticky Footer Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 py-4 px-6 z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="hidden sm:block">
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Info size={16} className="text-[#E63746]" />
                            {hasChanges ? <span className="text-[#E63746] font-bold">{t('profile.unsavedChanges')}</span> : t('profile.allSaved')}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                        {hasChanges && (
                            <button
                                onClick={() => {
                                    setFullName(user.user_metadata?.full_name || '');
                                    setPhone(user.user_metadata?.phone || '');
                                    setAddress(user.user_metadata?.address || '');
                                    setPreferredCurrency(user.user_metadata?.preferred_currency || 'EUR');
                                    setAvatarFile(null);
                                    setAvatarPreview(null);
                                }}
                                className="text-sm font-bold text-gray-500 hover:text-[#1D3557] transition-colors"
                            >
                                {t('profile.cancel')}
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges || isSaving}
                            className="px-10 py-3 bg-[#E63746] text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-[#E63746]/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            {isSaving ? t('profile.saving') : t('profile.save')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowPasswordModal(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-[#1D3557] p-6 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold">{t('profile.changePassword')}</h3>
                                <p className="text-sm text-white/60 mt-1">{t('profile.changePasswordDesc')}</p>
                            </div>
                            <button onClick={() => setShowPasswordModal(false)} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t('profile.newPassword')}</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#E63746]/20 focus:border-[#E63746] transition-all outline-none font-medium text-[#1D3557]"
                                        placeholder={t('profile.minChars')}
                                    />
                                    <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t('profile.confirmPassword')}</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#E63746]/20 focus:border-[#E63746] transition-all outline-none font-medium text-[#1D3557]"
                                        placeholder={t('profile.confirmPasswordPlaceholder')}
                                    />
                                    <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                        <AlertTriangle size={12} /> {t('profile.passwordMismatch')}
                                    </p>
                                )}
                                {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                                    <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                                        <CheckCircle size={12} /> {t('profile.passwordsMatch')}
                                    </p>
                                )}
                            </div>

                            {/* Password strength */}
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-gray-400 uppercase">{t('profile.passwordStrength')}</p>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1.5 flex-1 rounded-full transition-colors ${newPassword.length >= level * 3
                                                ? newPassword.length >= 12 ? 'bg-green-500' : newPassword.length >= 8 ? 'bg-yellow-500' : 'bg-red-400'
                                                : 'bg-gray-200'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400">
                                    {newPassword.length === 0 ? '' : newPassword.length < 6 ? t('profile.tooShort') : newPassword.length < 8 ? t('profile.weak') : newPassword.length < 12 ? t('profile.medium') : t('profile.strong')}
                                </p>
                            </div>

                            <button
                                onClick={handleChangePassword}
                                disabled={newPassword.length < 6 || newPassword !== confirmPassword || isChangingPassword}
                                className="w-full py-3.5 bg-[#E63746] text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-[#E63746]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isChangingPassword ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Lock size={18} />
                                )}
                                {isChangingPassword ? t('profile.changing') : t('profile.changePassword')}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </PageWrapper >
    );
};

export default Profile;

"use client";
import React, { useState } from 'react';
import { PageWrapper } from '@/components/PageWrapper';
import { UploadCloud, CheckCircle, AlertCircle, FileText, Smartphone, Camera, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function KYCPage() {
    const { user } = useAuth();
    const { t } = useLocale();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [documentType, setDocumentType] = useState('');
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check initial user status
    const initialKycStatus = user?.user_metadata?.kyc_status || 'unverified';
    const [kycStatus, setKycStatus] = useState(initialKycStatus);
    const [isSuccess, setIsSuccess] = useState(initialKycStatus === 'pending' || initialKycStatus === 'verified');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Check size (max 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error("Le fichier est trop volumineux (max 5MB).");
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async () => {
        if (!user || !file || !documentType) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', user.id);
            formData.append('documentType', documentType);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || response.statusText);
            }

            setIsSuccess(true);
            setKycStatus('pending');

            // Wait for auth to refresh locally so metadata is correct on next dashboard load
            await supabase.auth.refreshSession();

            setStep(3);
        } catch (error) {
            console.error("KYC Error:", error);
            toast.error(error.message || "Une erreur est survenue lors de la soumission.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageWrapper className="max-w-3xl mx-auto py-8 lg:py-16">
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-[#1D3557] px-8 py-10 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <svg className="h-full w-full" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <polygon points="0,100 100,0 100,100" />
                        </svg>
                    </div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-black mb-2">Vérification d'Identité</h1>
                        <p className="text-white/80 max-w-md mx-auto">
                            {kycStatus === 'verified' ? "Votre identité a été vérifiée avec succès." :
                                kycStatus === 'pending' ? "Vos documents sont en cours d'analyse." :
                                    "Conformément à la réglementation bancaire, nous devons vérifier votre identité."}
                        </p>
                    </div>
                </div>

                {/* Already submitted states */}
                {(kycStatus === 'pending' || kycStatus === 'verified') ? (
                    <div className="p-8 text-center py-16">
                        {kycStatus === 'verified' ? (
                            <div className="animate-fade-in flex flex-col items-center">
                                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle size={48} />
                                </div>
                                <h2 className="text-2xl font-black text-[#1D3557] mb-3">Identité vérifiée</h2>
                                <p className="text-gray-500 mb-8 max-w-md">
                                    Merci. Votre identité a été vérifiée avec succès. Vous avez désormais un accès complet à toutes nos fonctionnalités financières.
                                </p>
                            </div>
                        ) : (
                            <div className="animate-fade-in flex flex-col items-center">
                                <div className="w-24 h-24 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-6">
                                    <Loader2 size={48} className="animate-spin" />
                                </div>
                                <h2 className="text-2xl font-black text-[#1D3557] mb-3">En cours de vérification</h2>
                                <p className="text-gray-500 mb-8 max-w-sm">
                                    Vos documents ont bien été reçus et sont actuelement en cours de traitement par notre équipe.
                                    Vous recevrez une notification d'ici 24 à 48h.
                                </p>
                            </div>
                        )}
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-8 py-3 bg-[#1D3557] text-white rounded-xl font-bold hover:bg-[#1D3557]/90 transition-all shadow-md active:scale-95"
                        >
                            Retour au tableau de bord
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Stepper */}
                        <div className="flex px-8 py-6 bg-gray-50 border-b border-gray-100">
                            {[
                                { num: 1, title: 'Type de document' },
                                { num: 2, title: 'Téléchargement' },
                                { num: 3, title: 'Confirmation' }
                            ].map((s) => (
                                <div key={s.num} className="flex-1 flex flex-col items-center relative">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 z-10 transition-colors ${step >= s.num ? 'bg-[#E63746] text-white shadow-md shadow-red-200' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                                        {step > s.num ? <CheckCircle size={16} /> : s.num}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${step >= s.num ? 'text-[#1D3557]' : 'text-gray-400'}`}>
                                        {s.title}
                                    </span>
                                    {s.num < 3 && (
                                        <div className={`absolute top-4 left-[50%] right-[-50%] h-[2px] ${step > s.num ? 'bg-[#E63746]' : 'bg-gray-200'}`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {/* Step 1: Select Document Type */}
                            {step === 1 && (
                                <div className="animate-fade-in space-y-6">
                                    <div className="text-center mb-8">
                                        <h2 className="text-xl font-bold text-[#1D3557] mb-2">Choisissez un document</h2>
                                        <p className="text-gray-500 text-sm">Sélectionnez le type de document d'identité que vous souhaitez fournir.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { id: 'id_card', icon: FileText, title: "Carte d'identité", desc: "Format recto-verso" },
                                            { id: 'passport', icon: FileText, title: "Passeport", desc: "Page avec photo" },
                                            { id: 'driving_license', icon: Camera, title: "Permis de conduire", desc: "Nouveau format européen" }
                                        ].map((doc) => (
                                            <button
                                                key={doc.id}
                                                onClick={() => setDocumentType(doc.id)}
                                                className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col items-start gap-4 ${documentType === doc.id ? 'border-[#E63746] bg-red-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                            >
                                                <div className={`p-3 rounded-xl ${documentType === doc.id ? 'bg-[#E63746] text-white' : 'bg-gray-50 text-gray-400'}`}>
                                                    <doc.icon size={24} />
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold ${documentType === doc.id ? 'text-[#1D3557]' : 'text-gray-700'}`}>{doc.title}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">{doc.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <button
                                            onClick={() => setStep(2)}
                                            disabled={!documentType}
                                            className="px-8 py-3 bg-[#E63746] text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-[#C1121F] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            Continuer <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Upload File */}
                            {step === 2 && (
                                <div className="animate-fade-in space-y-6">
                                    <div className="text-center mb-8">
                                        <h2 className="text-xl font-bold text-[#1D3557] mb-2">Téléchargez votre document</h2>
                                        <p className="text-gray-500 text-sm">Assurez-vous que le document est bien lisible, sans reflets et non tronqué.</p>
                                    </div>

                                    <div className="border-2 border-dashed border-gray-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors relative cursor-pointer group">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />

                                        {file ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                                                    <CheckCircle size={32} />
                                                </div>
                                                <p className="font-bold text-[#1D3557]">{file.name}</p>
                                                <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                <button className="text-[10px] font-bold text-[#E63746] uppercase tracking-wider mt-2 hover:underline relative z-20">
                                                    Changer de fichier
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-[#E63746] group-hover:scale-110 transition-transform">
                                                    <UploadCloud size={32} />
                                                </div>
                                                <h3 className="font-bold text-[#1D3557] text-lg mb-1">Cliquez pour importer</h3>
                                                <p className="text-sm text-gray-500 mb-4">ou glissez-déposez votre fichier ici</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">JPG, PNG ou PDF (Max. 5MB)</p>
                                            </>
                                        )}
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
                                        <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                                        <div className="text-sm text-blue-900">
                                            <p className="font-bold mb-1">Conseils pour une vérification rapide :</p>
                                            <ul className="list-disc list-inside space-y-1 text-blue-800/80 text-xs">
                                                <li>Le document doit être en cours de validité</li>
                                                <li>Format couleur uniquement (pas de noir et blanc)</li>
                                                <li>Les 4 coins du document doivent être visibles</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-between">
                                        <button
                                            onClick={() => { setStep(1); setFile(null); }}
                                            className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                                            disabled={isSubmitting}
                                        >
                                            Retour
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!file || isSubmitting}
                                            className="px-8 py-3 bg-[#E63746] text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-[#C1121F] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <><Loader2 size={18} className="animate-spin" /> Envoi en cours...</>
                                            ) : (
                                                <>Soumettre <CheckCircle size={18} /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Success */}
                            {step === 3 && isSuccess && (
                                <div className="animate-fade-in text-center py-8">
                                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle size={48} />
                                    </div>
                                    <h2 className="text-2xl font-black text-[#1D3557] mb-3">Documents envoyés !</h2>
                                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                        Merci. Vos documents ont été reçus avec succès et sont en cours de vérification par notre équipe.
                                    </p>

                                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 max-w-sm mx-auto text-left">
                                        <h3 className="font-bold text-[#1D3557] mb-2 text-sm">Prochaines étapes :</h3>
                                        <div className="space-y-4">
                                            <div className="flex gap-3 relative">
                                                <div className="w-1.5 h-full bg-green-500 absolute left-[9px] top-6 rounded-full opacity-20"></div>
                                                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 z-10">
                                                    <CheckCircle size={12} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-[#1D3557]">Documents reçus</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 relative">
                                                <div className="w-1.5 h-full bg-gray-200 absolute left-[9px] top-6 rounded-full opacity-50"></div>
                                                <div className="w-6 h-6 rounded-full border-2 border-[#E63746] bg-white flex items-center justify-center flex-shrink-0 z-10">
                                                    <div className="w-2 h-2 bg-[#E63746] rounded-full animate-pulse"></div>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-[#1D3557]">En de cours de vérification</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">Délai estimé : 24 à 48h ouvrées</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="w-6 h-6 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center flex-shrink-0 z-10">
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-400">Validation finale</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className="px-8 py-3 bg-[#1D3557] text-white rounded-xl font-bold hover:bg-[#1D3557]/90 transition-all shadow-md active:scale-95"
                                    >
                                        Retour au tableau de bord
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </PageWrapper>
    );
}

// Add ShieldCheck icon since it wasn't in the initial import list for this component
const ShieldCheck = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

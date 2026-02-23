"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, ShieldCheck } from 'lucide-react';

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
    const [config, setConfig] = useState(null);

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setConfig({
                ...options,
                resolve
            });
        });
    }, []);

    const handleClose = (value) => {
        if (config?.resolve) {
            config.resolve(value);
        }
        setConfig(null);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <AnimatePresence>
                {config && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => handleClose(false)}
                            className="absolute inset-0 bg-[#1D3557]/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2rem] p-8 shadow-2xl relative z-10 w-full max-w-sm border border-gray-100 overflow-hidden"
                        >
                            {/* Decorative Background Element */}
                            <div className={`absolute -right-8 -top-8 opacity-[0.05] ${config.variant === 'danger' ? 'text-red-600' : 'text-[#1D3557]'}`}>
                                {config.variant === 'danger' ? <AlertTriangle size={160} /> : <ShieldCheck size={160} />}
                            </div>

                            <div className="relative z-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${config.variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#1D3557]'}`}>
                                    {config.variant === 'danger' ? <AlertTriangle size={28} /> : <ShieldCheck size={28} />}
                                </div>

                                <h3 className="text-xl font-black text-[--color-navy] tracking-tight mb-2">
                                    {config.title || 'Confirmation'}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
                                    {config.message}
                                </p>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => handleClose(true)}
                                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${config.variant === 'danger'
                                                ? 'bg-[#e63746] text-white shadow-red-200 hover:bg-[#C1121F]'
                                                : 'bg-[#1D3557] text-white shadow-blue-200 hover:bg-[#152a47]'
                                            }`}
                                    >
                                        {config.confirmText || 'Confirmer'}
                                    </button>
                                    <button
                                        onClick={() => handleClose(false)}
                                        className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
                                    >
                                        {config.cancelText || 'Annuler'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};

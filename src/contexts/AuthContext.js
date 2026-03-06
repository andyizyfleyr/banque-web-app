"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Initialize Auth (once on mount)
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
            } catch (error) {
                console.error('AuthContext: Init error', error);
            } finally {
                setLoading(false);
            }
        };

        const { data: { listener } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth Event:", event, "User:", session?.user?.email);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        initAuth();

        return () => {
            listener?.unsubscribe();
        };
    }, []);

    // Handle Route Protection
    useEffect(() => {
        if (loading) return;

        const publicPaths = [
            '/', '/login', '/landing', '/about', '/services', '/contact',
            '/rachat-credits', '/pret', '/fraude-bancaire', '/legal',
            '/mentions-legales', '/politique-confidentialite', '/cgu',
            '/admin', '/api', '/kyc'
        ];

        const isPublicRoute = publicPaths.some(path => pathname === path || pathname?.startsWith(path + '/'));

        // Token detection to prevent premature redirect
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hasAuthToken = hashParams.has('access_token') || searchParams.has('code') || searchParams.has('token_hash');

        if (user) {
            if (pathname === '/login') {
                router.push('/dashboard');
            }
        } else {
            if (!isPublicRoute && !hasAuthToken) {
                router.push('/login');
            }
        }
    }, [pathname, user, loading, router]);

    const value = React.useMemo(() => ({
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        user,
        loading,
    }), [user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

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

    useEffect(() => {
        const publicPaths = [
            '/', '/login', '/landing', '/about', '/services', '/contact',
            '/rachat-credits', '/pret', '/fraude-bancaire', '/legal',
            '/mentions-legales', '/politique-confidentialite', '/cgu',
            '/admin'
        ];

        const isPublicRoute = publicPaths.some(path => pathname === path || pathname?.startsWith(path + '/'));

        const checkAuth = (currentUser, currentPath) => {
            const searchParams = new URLSearchParams(window.location.search);
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const hasAuthToken = hashParams.has('access_token') || searchParams.has('code') || searchParams.has('token_hash');

            if (currentUser) {
                if (currentPath === '/login') {
                    router.push('/dashboard');
                }
            } else {
                if (!isPublicRoute && !hasAuthToken) {
                    router.push('/login');
                }
            }
        };

        const initAuth = async () => {
            try {
                // Check initial session
                const { data: { session } } = await supabase.auth.getSession();
                const initialUser = session?.user ?? null;
                setUser(initialUser);

                // Token detection to prevent premature redirect
                const searchParams = new URLSearchParams(window.location.search);
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const hasAuthToken = hashParams.has('access_token') || searchParams.has('code') || searchParams.has('token_hash');

                if (!initialUser && hasAuthToken) {
                    console.log("AuthContext: Token detected, waiting for event...");
                } else {
                    setLoading(false);
                    checkAuth(initialUser, pathname);
                }
            } catch (error) {
                console.error('AuthContext: Init error', error);
                setLoading(false);
            }
        };

        const { data: { listener } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth Event:", event, "User:", session?.user?.email);
            const updatedUser = session?.user ?? null;
            setUser(updatedUser);
            setLoading(false);

            if (event === 'SIGNED_IN' && pathname === '/login') {
                router.push('/dashboard');
            }

            checkAuth(updatedUser, pathname);
        });

        initAuth();

        return () => {
            listener?.unsubscribe();
        };
    }, [pathname, router]);

    const value = {
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        user,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

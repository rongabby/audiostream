import { supabase } from './supabase';

// Sign up
export const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    return { data, error };
};

// Sign in
export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
};

// Sign out
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, db } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signUp = async ({ email, password, name, phone, role = 'member' }) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          name,
          email,
          phone,
          role,
          wallet_balance: 0,
        });
        if (profileError) throw profileError;
      }

      if (data.user && data.session) {
        await db.logActivity({
          user_id: data.user.id,
          event_type: 'signup',
          metadata: 'Account created',
        });
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data?.user) {
        await db.logActivity({
          user_id: data.user.id,
          event_type: 'login',
          metadata: 'User signed in',
        });
      }
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    if (user?.id) {
      try {
        await db.logActivity({
          user_id: user.id,
          event_type: 'logout',
          metadata: 'User signed out',
        });
      } catch (error) {
        console.warn('Logout activity log failed:', error.message || error);
      }
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      setProfile(data);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile: () => user && fetchProfile(user.id),
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isLeader: profile?.role === 'leader',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

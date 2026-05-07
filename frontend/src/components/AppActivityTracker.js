import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/supabase';

export default function AppActivityTracker() {
  const { isAuthenticated, profile } = useAuth();
  const appState = useRef(AppState.currentState);
  const sessionStart = useRef(null);

  const logActivity = async (payload) => {
    if (!profile?.id) return;
    try {
      await db.logActivity({
        user_id: profile.id,
        ...payload,
      });
    } catch (error) {
      console.warn('Activity log failed:', error?.message || error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !profile?.id) {
      sessionStart.current = null;
      return;
    }

    sessionStart.current = Date.now();
    logActivity({ event_type: 'app_open', metadata: 'App opened' });
  }, [isAuthenticated, profile?.id]);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      const previousState = appState.current;

      if (previousState.match(/inactive|background/) && nextAppState === 'active') {
        sessionStart.current = Date.now();
        await logActivity({ event_type: 'app_open', metadata: 'App resumed' });
      }

      if (previousState === 'active' && nextAppState.match(/inactive|background/)) {
        if (sessionStart.current) {
          const durationSeconds = Math.max(1, Math.round((Date.now() - sessionStart.current) / 1000));
          await logActivity({
            event_type: 'session',
            metadata: 'App session ended',
            duration_seconds: durationSeconds,
          });
          sessionStart.current = null;
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      if (sessionStart.current && profile?.id) {
        const durationSeconds = Math.max(1, Math.round((Date.now() - sessionStart.current) / 1000));
        logActivity({
          event_type: 'session',
          metadata: 'App session ended',
          duration_seconds: durationSeconds,
        });
      }
    };
  }, [profile?.id]);

  return null;
}

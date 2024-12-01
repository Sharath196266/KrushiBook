import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'
import Storage from './AsyncStorage';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const supabaseUrl = "https://ahztltkxqakjxbrejcsy.supabase.co"
export const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoenRsdGt4cWFranhicmVqY3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwOTMxNzksImV4cCI6MjA0NTY2OTE3OX0.ZqBywlzBBDZhmtfbe6KNnndtqsMk-aDatV7ofQYZrY4"


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for non-browser environments
  },
});

if (typeof window !== 'undefined') {

  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
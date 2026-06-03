import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginWithGoogle, logout as firebaseLogout, onAuthChange } from '../firebase/auth';
import { migrateFromLocalStorage, saveTurmas as firestoreSave } from '../firebase/firestore';

const AuthContext = createContext(null);

const LOCAL_KEY = 'dashboard_turmas_v2';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialTurmas, setInitialTurmas] = useState(null);

  useEffect(() => {
    const unsub = onAuthChange(async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          const turmas = await migrateFromLocalStorage(fbUser.uid);
          setInitialTurmas(turmas);
        } catch {
          // fallback to localStorage
          const raw = localStorage.getItem(LOCAL_KEY);
          setInitialTurmas(raw ? JSON.parse(raw) : null);
        }
      } else {
        setInitialTurmas(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = useCallback(async () => {
    await loginWithGoogle();
  }, []);

  const logout = useCallback(async () => {
    await firebaseLogout();
  }, []);

  const persistTurmas = useCallback((turmas) => {
    // localStorage cache
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(turmas));
    } catch {}
    // Firestore
    if (user) {
      firestoreSave(user.uid, turmas);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, initialTurmas, login, logout, persistTurmas }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

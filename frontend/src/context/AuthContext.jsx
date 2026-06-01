import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, getAuthToken, setAuthToken } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(Boolean(getAuthToken()));

  useEffect(() => {
    let active = true;
    const expire = () => {
      setAuthToken('');
      setUser(null);
    };
    window.addEventListener('kaoyan-buddy-auth-expired', expire);

    if (!getAuthToken()) {
      setBooting(false);
      return () => window.removeEventListener('kaoyan-buddy-auth-expired', expire);
    }

    api.me()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        setAuthToken('');
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setBooting(false);
        }
      });

    return () => {
      active = false;
      window.removeEventListener('kaoyan-buddy-auth-expired', expire);
    };
  }, []);

  const value = useMemo(() => ({
    user,
    booting,
    authenticated: Boolean(user),
    async login(payload) {
      const response = await api.login(payload);
      setAuthToken(response.token);
      setUser(response.user);
      return response.user;
    },
    async register(payload) {
      const response = await api.register(payload);
      setAuthToken(response.token);
      setUser(response.user);
      return response.user;
    },
    logout() {
      setAuthToken('');
      setUser(null);
    },
  }), [user, booting]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}

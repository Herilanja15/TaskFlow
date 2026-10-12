import { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token'));

  useEffect(() => {
    let active = true;
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return () => { active = false; };
    }

    setIsLoading(true);
    apiRequest('/auth/me')
      .then(({ user: currentUser }) => { if (active) setUser(currentUser); })
      .catch(() => {
        localStorage.removeItem('taskflow_token');
        if (active) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => { if (active) setIsLoading(false); });

    return () => { active = false; };
  }, [token]);

  async function authenticate(endpoint, credentials) {
    const session = await apiRequest(endpoint, { method: 'POST', body: credentials });
    localStorage.setItem('taskflow_token', session.token);
    setToken(session.token);
    setUser(session.user);
  }

  async function updateProfile(profile) {
    const result = await apiRequest('/auth/me', { method: 'PATCH', body: profile });
    setUser(result.user);
    return result.user;
  }

  function signOut() {
    localStorage.removeItem('taskflow_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login: (credentials) => authenticate('/auth/login', credentials),
      register: (credentials) => authenticate('/auth/register', credentials),
      updateProfile,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ilkal_user')) || null; } catch { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem('ilkal_user', JSON.stringify(user));
    else localStorage.removeItem('ilkal_user');
  }, [user]);

  const login = ({ name, mobile }) => setUser({
    name, mobile,
    joinedAt: new Date().toISOString(),
    avatar: name?.trim()?.[0]?.toUpperCase() || 'I'
  });
  const logout = () => setUser(null);
  const update = (patch) => setUser(u => u ? { ...u, ...patch } : u);

  return (
    <AuthContext.Provider value={{ user, login, logout, update }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

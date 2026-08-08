import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { 'x-auth-token': token }
          });
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

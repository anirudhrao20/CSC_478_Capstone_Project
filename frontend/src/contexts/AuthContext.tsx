import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Set the token in axios defaults
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user data
          const userResponse = await api.get('/users/me');
          setUser(userResponse.data);
          setIsAuthenticated(true);
        } catch (error) {
          // If token is invalid, clear it
          localStorage.removeItem('token');
          api.defaults.headers.common['Authorization'] = '';
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });
      const token = response.data.access_token;
      localStorage.setItem('token', token);
      
      // Update axios default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user data
      const userResponse = await api.get('/users/me');
      setUser(userResponse.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    api.defaults.headers.common['Authorization'] = '';
    setIsAuthenticated(false);
    setUser(null);
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      await api.post('/auth/register', {
        username,  // Ensure username is included
        email,
        password,
      });
    } catch (error) {
      throw error;
    }
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

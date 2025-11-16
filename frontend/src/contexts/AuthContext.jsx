import { createContext, useContext, useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signUpMutation = useMutation(api.auth.signUp);
  const signInMutation = useMutation(api.auth.signIn);

  // Charger l'utilisateur depuis le localStorage au démarrage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async ({ name, email, password }) => {
    setLoading(true);
    try {
      const result = await signUpMutation({ name, email, password });
      const userData = {
        userId: result.userId,
        name: result.name,
        email: result.email,
        role: 'user',
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async ({ email, password }) => {
    setLoading(true);
    try {
      const result = await signInMutation({ email, password });
      console.log('🔍 [AuthContext] Résultat de signInMutation:', result);
      
      const userData = {
        userId: result.userId,
        name: result.name,
        email: result.email,
        role: result.role,
      };
      
      console.log('🔍 [AuthContext] userData créé:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('🔍 [AuthContext] userData stocké et état mis à jour');
      
      return result;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}

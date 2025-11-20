import { useState } from 'react';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import InstallButton from './InstallButton';
import NotificationBell from './NotificationBell';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const { user, signIn, signUp, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => {
    setAuthMode('signin');
    setAuthModalOpen(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  const handleAuthSubmit = async (formData) => {
    let result;
    if (authMode === 'signup') {
      result = await signUp(formData);
    } else {
      result = await signIn(formData);
    }
    
    // Debug: Afficher le résultat de la connexion
    console.log('🔍 [Header] Résultat de connexion:', result);
    console.log('🔍 [Header] Rôle de l\'utilisateur:', result?.role);
    console.log('🔍 [Header] Type du rôle:', typeof result?.role);
    console.log('🔍 [Header] Comparaison stricte (role === "admin"):', result?.role === 'admin');
    console.log('🔍 [Header] Comparaison lowercase:', result?.role?.toLowerCase() === 'admin');
    
    // Fermer le modal après authentification réussie
    if (result) {
      setAuthModalOpen(false);
      
      // Rediriger automatiquement les admins vers /admin après connexion
      // Les utilisateurs normaux restent sur la page d'accueil
      if (result.role?.toLowerCase() === 'admin') {
        console.log('✅ Redirection vers /admin');
        navigate('/admin');
      } else {
        console.log('➡️ Redirection vers la page d\'accueil');
        navigate('/');
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-black/10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-black">APP</h1>
            </div>

            {/* Navigation Links */}
            {user && (
              <nav className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => navigate('/offres')}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Received Offers
                </button>
                <button
                  onClick={() => navigate('/mes-offres')}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                >
                  My Offers
                </button>
              </nav>
            )}

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              {user && <NotificationBell />}
              <InstallButton />
              {loading ? (
                <div className="px-4 py-2 text-gray-500">Loading...</div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate('/dashboard?tab=profile')}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <User size={18} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleSignIn}
                    className="px-4 py-2 text-gray-700 hover:text-black font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleSignUp}
                    className="px-6 py-2 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors shadow-sm"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSubmit={handleAuthSubmit}
      />
    </>
  );
}

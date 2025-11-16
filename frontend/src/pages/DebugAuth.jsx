import { useAuth } from '../contexts/AuthContext'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useNavigate } from 'react-router-dom'

export default function DebugAuth() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  
  // Récupérer l'utilisateur depuis Convex pour comparer
  // Toujours appeler useQuery, mais avec undefined si pas d'userId
  const convexUser = useQuery(
    api.users.getUserById, 
    user?.userId ? { id: user.userId } : "skip"
  )

  const handleClearStorage = () => {
    localStorage.clear()
    window.location.reload()
  }

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  const handleTestRedirect = () => {
    if (user?.role === 'admin') {
      navigate('/admin')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔧 Debug Authentification</h1>
        
        {/* User from localStorage */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📦 Utilisateur (localStorage)</h2>
          {user ? (
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">Aucun utilisateur connecté</p>
          )}
        </div>

        {/* User from Convex */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">☁️ Utilisateur (Convex)</h2>
          {convexUser ? (
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(convexUser, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">
              {user ? 'Chargement...' : 'Aucun utilisateur connecté'}
            </p>
          )}
        </div>

        {/* Comparison */}
        {user && convexUser && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">⚖️ Comparaison</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">Rôle (localStorage):</span>
                <span className={`px-3 py-1 rounded ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">Rôle (Convex):</span>
                <span className={`px-3 py-1 rounded ${
                  convexUser.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {convexUser.role}
                </span>
              </div>
              {user.role !== convexUser.role && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 mt-4">
                  <p className="font-semibold">⚠️ Incohérence détectée !</p>
                  <p className="text-sm mt-1">
                    Le rôle dans le localStorage ne correspond pas au rôle dans Convex.
                    Cliquez sur "Effacer localStorage" puis reconnectez-vous.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🎯 Actions</h2>
          <div className="space-y-3">
            <button
              onClick={handleClearStorage}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              🗑️ Effacer localStorage et recharger
            </button>
            
            {user && (
              <>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  🚪 Se déconnecter
                </button>
                
                <button
                  onClick={handleTestRedirect}
                  className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  🧪 Tester la redirection
                </button>
              </>
            )}
            
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
            >
              🏠 Retour à l'accueil
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 border-l-4 border-gray-400 p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-2">💡 Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-800 text-sm">
            <li>Vérifiez que le rôle dans Convex est bien "admin"</li>
            <li>Si les rôles ne correspondent pas, cliquez sur "Effacer localStorage"</li>
            <li>Reconnectez-vous avec vos identifiants</li>
            <li>Vous devriez être redirigé automatiquement vers /admin</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

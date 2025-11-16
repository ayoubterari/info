import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import { AdminHeader } from '../components/admin/AdminHeader'
import { StatsCard } from '../components/admin/StatsCard'
import { RecentActivity } from '../components/admin/RecentActivity'
import { UsersTable } from '../components/admin/UsersTable'
import { Users, FileText, CheckCircle, Clock } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function Admin() {
  const { user, signOut, loading } = useAuth()
  const navigate = useNavigate()

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    console.log('🔍 [Admin] Loading:', loading, 'User:', user?.role)
    
    // Ne rien faire pendant le chargement
    if (loading) {
      console.log('⏳ [Admin] Chargement en cours...')
      return
    }
    
    if (!user) {
      console.log('❌ [Admin] Pas d\'utilisateur, redirection vers /')
      navigate('/')
    } else if (user.role?.toLowerCase() !== 'admin') {
      console.log('❌ [Admin] Rôle non-admin, redirection vers /dashboard')
      navigate('/dashboard')
    } else {
      console.log('✅ [Admin] Accès autorisé au dashboard admin')
    }
  }, [user, navigate, loading])

  // Récupérer les données depuis Convex
  const allUsers = useQuery(api.users.getAllUsers) || []
  const allDemandes = useQuery(api.demandes.getAllDemandes) || []
  const allOffres = useQuery(api.offres.getAllOffres) || []

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  // Calculer les statistiques
  const stats = {
    totalUsers: allUsers.length,
    totalDemandes: allDemandes.length,
    completedDemandes: allDemandes.filter(d => d.status === 'completed').length,
    pendingDemandes: allDemandes.filter(d => d.status === 'pending').length,
  }

  // Préparer les activités récentes
  const recentActivities = allDemandes
    .slice(0, 5)
    .map(demande => {
      const user = allUsers.find(u => u._id === demande.userId)
      return {
        userName: user?.name || 'Utilisateur inconnu',
        action: demande.title || 'Nouvelle demande',
        status: demande.status || 'pending',
        timestamp: new Date(demande._creationTime).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    })

  // Préparer les utilisateurs pour le tableau
  const usersForTable = allUsers.slice(0, 10).map(u => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role || 'user',
    isActive: true,
  }))

  // Afficher un écran de chargement pendant la vérification
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Ne rien afficher si pas admin (la redirection se fera via useEffect)
  if (!user || user.role?.toLowerCase() !== 'admin') {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar onLogout={handleLogout} />
      
      <div className="flex-1 lg:ml-64">
        <AdminHeader user={user} />
        
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Bienvenue sur votre tableau de bord administrateur
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCard
              title="Total Utilisateurs"
              value={stats.totalUsers}
              description="Utilisateurs inscrits"
              icon={Users}
              trend={{ value: '+12%', isPositive: true }}
            />
            <StatsCard
              title="Demandes Totales"
              value={stats.totalDemandes}
              description="Toutes les demandes"
              icon={FileText}
              trend={{ value: '+8%', isPositive: true }}
            />
            <StatsCard
              title="Demandes Complétées"
              value={stats.completedDemandes}
              description="Demandes terminées"
              icon={CheckCircle}
              trend={{ value: '+23%', isPositive: true }}
            />
            <StatsCard
              title="En Attente"
              value={stats.pendingDemandes}
              description="Demandes en cours"
              icon={Clock}
              trend={{ value: '-5%', isPositive: false }}
            />
          </div>

          {/* Recent Activity and Users Table */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <UsersTable users={usersForTable} />
            </div>
            <div>
              <RecentActivity activities={recentActivities} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

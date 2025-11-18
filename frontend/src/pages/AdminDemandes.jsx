import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import { AdminHeader } from '../components/admin/AdminHeader'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Eye, Search, Filter, Download } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'

export default function AdminDemandes() {
  const { user, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (loading) return
    
    if (!user) {
      navigate('/')
    } else if (user.role?.toLowerCase() !== 'admin') {
      navigate('/dashboard')
    }
  }, [user, navigate, loading])

  // Récupérer toutes les demandes
  const allDemandes = useQuery(api.demandes.getAllDemandes) || []
  const allUsers = useQuery(api.users.getAllUsers) || []

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  // Enrichir les demandes avec les informations utilisateur
  const demandesWithUsers = allDemandes.map(demande => {
    const userInfo = allUsers.find(u => u._id === demande.userId)
    return {
      ...demande,
      userName: userInfo?.name || 'Utilisateur inconnu',
      userEmail: userInfo?.email || 'N/A'
    }
  })

  // Filtrer les demandes
  const filteredDemandes = demandesWithUsers.filter(demande => {
    const matchesSearch = 
      demande.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || demande.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Statistiques
  const stats = {
    total: allDemandes.length,
    pending: allDemandes.filter(d => d.status === 'pending').length,
    in_progress: allDemandes.filter(d => d.status === 'in_progress').length,
    completed: allDemandes.filter(d => d.status === 'completed').length,
    cancelled: allDemandes.filter(d => d.status === 'cancelled').length,
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', label: 'En attente' },
      in_progress: { variant: 'info', label: 'En cours' },
      completed: { variant: 'success', label: 'Terminée' },
      cancelled: { variant: 'destructive', label: 'Annulée' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

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

  if (!user || user.role?.toLowerCase() !== 'admin') {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar onLogout={handleLogout} />
      
      <div className="flex-1 lg:ml-64 overflow-auto">
        <AdminHeader user={user} />
        
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Demandes</h1>
            <p className="text-gray-500 mt-1">
              Liste complète de toutes les demandes effectuées par les utilisateurs
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid gap-4 md:grid-cols-5 mb-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm text-gray-500 mb-1">Total</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm text-gray-500 mb-1">En attente</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm text-gray-500 mb-1">En cours</div>
              <div className="text-2xl font-bold text-gray-600">{stats.in_progress}</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm text-gray-500 mb-1">Terminées</div>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm text-gray-500 mb-1">Annulées</div>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Barre de recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, utilisateur ou catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              {/* Filtre par statut */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminées</option>
                  <option value="cancelled">Annulées</option>
                </select>
              </div>

              {/* Bouton export */}
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          {/* Tableau des demandes */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Titre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDemandes.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        Aucune demande trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredDemandes.map((demande) => (
                      <tr key={demande._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">
                              {demande.userName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {demande.userEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {demande.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary">{demande.category}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatPrice(demande.price)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(demande.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(demande.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Ouvrir un modal avec les détails
                              console.log('Voir détails:', demande)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination info */}
          <div className="mt-4 text-sm text-gray-500 text-center">
            Affichage de {filteredDemandes.length} demande{filteredDemandes.length !== 1 ? 's' : ''} sur {allDemandes.length} au total
          </div>
        </main>
      </div>
    </div>
  )
}

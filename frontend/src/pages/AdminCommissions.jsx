import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import { AdminHeader } from '../components/admin/AdminHeader'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { DollarSign, TrendingUp, Users, Settings, Save, Eye } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'

export default function AdminCommissions() {
  const { user, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const [commissionRate, setCommissionRate] = useState(10)
  const [isSaving, setIsSaving] = useState(false)

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (loading) return
    
    if (!user) {
      navigate('/')
    } else if (user.role?.toLowerCase() !== 'admin') {
      navigate('/dashboard')
    }
  }, [user, navigate, loading])

  // Récupérer les données
  const currentCommissionRate = useQuery(api.appSettings.getCommissionRate)
  const commissionStats = useQuery(api.commissionStats.getCommissionStats)
  const allTransactions = useQuery(api.transactions.getAllTransactions) || []

  const updateSetting = useMutation(api.appSettings.updateSetting)
  const initializeSettings = useMutation(api.appSettings.initializeDefaultSettings)

  // Debug: afficher les données chargées
  useEffect(() => {
    console.log('📊 Commission Rate:', currentCommissionRate)
    console.log('📈 Commission Stats:', commissionStats)
    console.log('💰 All Transactions:', allTransactions)
  }, [currentCommissionRate, commissionStats, allTransactions])

  useEffect(() => {
    if (currentCommissionRate !== undefined) {
      setCommissionRate(currentCommissionRate)
    }
  }, [currentCommissionRate])

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  const handleSaveCommissionRate = async () => {
    if (!user?.userId) return
    
    setIsSaving(true)
    try {
      await updateSetting({
        key: 'commission_rate',
        value: commissionRate,
        description: 'Taux de commission de la plateforme en pourcentage',
        userId: user.userId,
      })
      alert(`✅ Taux de commission mis à jour: ${commissionRate}%`)
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la mise à jour')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInitialize = async () => {
    if (!user?.userId) return
    
    try {
      await initializeSettings({ userId: user.userId })
      alert('✅ Paramètres initialisés')
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de l\'initialisation')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Commissions</h1>
            <p className="text-gray-500 mt-1">
              Configurez le taux de commission et consultez les revenus de la plateforme
            </p>
          </div>

          {/* Configuration du taux de commission */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Configuration du taux de commission</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taux de commission (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Taux actuel: {currentCommissionRate}%
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveCommissionRate}
                  disabled={isSaving || commissionRate === currentCommissionRate}
                  className="mt-6"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                
                {currentCommissionRate === undefined && (
                  <Button
                    onClick={handleInitialize}
                    variant="outline"
                    className="mt-6"
                  >
                    Initialiser
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Info:</strong> Le taux de commission est prélevé sur chaque transaction.
                Par exemple, avec un taux de {commissionRate}%, sur un paiement de $100, 
                la plateforme reçoit ${(100 * commissionRate / 100).toFixed(2)} et 
                le prestataire reçoit ${(100 - (100 * commissionRate / 100)).toFixed(2)}.
              </p>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500">Total Transactions</div>
                <Users className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{commissionStats?.totalTransactions || 0}</div>
            </div>
            
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500">Revenu Total</div>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(commissionStats?.totalRevenue || 0)}
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500">Commissions</div>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(commissionStats?.totalCommissions || 0)}
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500">Gains Prestataires</div>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {formatPrice(commissionStats?.totalProviderEarnings || 0)}
              </div>
            </div>
          </div>

          {/* Liste des transactions */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Historique des transactions</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Demandeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prestataire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prestataire reçoit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        Aucune transaction pour le moment
                      </td>
                    </tr>
                  ) : (
                    allTransactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.demandeurName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.demandeurEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.offreurName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.offreurEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatPrice(transaction.totalAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            {formatPrice(transaction.commissionAmount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ({transaction.commissionRate}%)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-purple-600">
                            {formatPrice(transaction.providerAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={transaction.status === 'completed' ? 'success' : 'warning'}>
                            {transaction.status === 'completed' ? 'Complétée' : 'En attente'}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

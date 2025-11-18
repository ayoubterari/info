import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Overview } from '../components/dashboard/Overview'
import { RecentSales } from '../components/dashboard/RecentSales'
import { ProfileTab } from '../components/dashboard/ProfileTab'
import { DemandesTab } from '../components/dashboard/DemandesTab'
import { OffresTab } from '../components/dashboard/OffresTab'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { User, Settings, BarChart3, MessageSquare, HelpCircle, Send, DollarSign, TrendingUp, CheckCircle, Clock, Home } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Récupérer les statistiques réelles
  const stats = useQuery(api.dashboard.getUserStats, { userId: user?.userId })
  const recentActivity = useQuery(api.dashboard.getRecentActivity, { userId: user?.userId, limit: 5 })
  const accountStatus = useQuery(api.stripeConnect.checkAccountStatus, user?.userId ? { userId: user.userId } : "skip")

  useEffect(() => {
    if (!loading && !user) {
      navigate('/')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Alerte Stripe Onboarding */}
        {accountStatus && !accountStatus.onboardingComplete && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-1">
                  💳 Configurez vos paiements pour recevoir de l'argent !
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  Pour recevoir des paiements en tant que prestataire, vous devez configurer votre compte Stripe Connect.
                  C'est rapide et sécurisé !
                </p>
                <Button 
                  onClick={() => navigate('/stripe-onboarding')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Configurer maintenant →
                </Button>
              </div>
            </div>
          </div>
        )}

        {accountStatus?.onboardingComplete && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <span className="text-sm font-medium text-green-900">
                  ✅ Votre compte de paiement est configuré ! Vous pouvez recevoir des paiements.
                </span>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate('/stripe-onboarding')}
                className="border-green-600 text-green-600 hover:bg-green-100"
              >
                Voir les détails
              </Button>
            </div>
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Bienvenue, {user.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => navigate('/')}>
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="profile">Mon Profil</TabsTrigger>
            <TabsTrigger value="demandes">Mes Demandes</TabsTrigger>
            <TabsTrigger value="offres">Mes Offres</TabsTrigger>
            <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Mes Demandes
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalDemandes || 0}</div>
                  <p className="text-xs text-gray-500">
                    {stats?.demandesPending || 0} en attente • {stats?.demandesCompleted || 0} terminées
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Offres Reçues
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalOffresRecues || 0}</div>
                  <p className="text-xs text-gray-500">
                    {stats?.offresRecuesPending || 0} en attente • {stats?.offresRecuesAccepted || 0} acceptées
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Offres Envoyées</CardTitle>
                  <Send className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalOffresEnvoyees || 0}</div>
                  <p className="text-xs text-gray-500">
                    {stats?.offresEnvoyeesAccepted || 0} acceptées • {stats?.offresEnvoyeesRejected || 0} refusées
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Montant Total
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${((stats?.totalMontantDemandes || 0) + (stats?.totalMontantOffresRecues || 0)).toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500">
                    Demandes + Offres reçues
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Vue d'ensemble</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Activités Récentes</CardTitle>
                  <CardDescription>
                    Vos dernières demandes et offres
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!recentActivity ? (
                      <div className="text-center py-4 text-gray-500">Chargement...</div>
                    ) : recentActivity.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">Aucune activité récente</div>
                    ) : (
                      recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-4">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                            activity.type === 'demande' ? 'bg-gray-100' : 'bg-green-100'
                          }`}>
                            {activity.type === 'demande' ? (
                              <MessageSquare className="h-4 w-4 text-gray-600" />
                            ) : (
                              <Send className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none truncate">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activity.type === 'demande' ? 'Demande créée' : 'Offre envoyée'} • {
                                new Date(activity.createdAt).toLocaleDateString('fr-FR', { 
                                  day: 'numeric', 
                                  month: 'short' 
                                })
                              }
                            </p>
                          </div>
                          <div className="text-sm font-medium">
                            ${activity.price.toFixed(2)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4" forceMount>
            <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
              <ProfileTab />
            </div>
          </TabsContent>

          <TabsContent value="demandes" className="space-y-4" forceMount>
            <div className={activeTab === 'demandes' ? 'block' : 'hidden'}>
              <DemandesTab />
            </div>
          </TabsContent>

          <TabsContent value="offres" className="space-y-4" forceMount>
            <div className={activeTab === 'offres' ? 'block' : 'hidden'}>
              <OffresTab />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytiques</CardTitle>
                <CardDescription>
                  Fonctionnalité à venir...
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

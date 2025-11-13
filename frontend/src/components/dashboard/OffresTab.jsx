import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAuth } from '../../hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Badge } from '../ui/badge'
import { MessageSquare, Volume2 } from 'lucide-react'

export function OffresTab() {
  const { user } = useAuth()
  const offres = useQuery(api.offres.getUserOffresWithDemandes, { userId: user?.userId })

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', label: 'En attente' },
      accepted: { variant: 'success', label: 'Acceptée' },
      rejected: { variant: 'destructive', label: 'Refusée' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getDemandeStatusBadge = (status) => {
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
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mes Offres Envoyées</CardTitle>
              <CardDescription>
                Liste de toutes les offres que vous avez proposées
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!offres ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Chargement...</div>
            </div>
          ) : offres.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <MessageSquare className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune offre envoyée
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Vous n'avez pas encore proposé d'aide
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Demande</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix initial</TableHead>
                    <TableHead>Prix proposé</TableHead>
                    <TableHead>Statut offre</TableHead>
                    <TableHead>Statut demande</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offres.map((offre) => (
                    <TableRow key={offre._id}>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate" title={offre.demande?.title}>
                          {offre.demande?.title || 'Demande supprimée'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {offre.demande?.category ? (
                          <Badge variant="secondary">{offre.demande.category}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-600">
                        {offre.demande?.price ? formatPrice(offre.demande.price) : '-'}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatPrice(offre.proposedPrice)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(offre.status)}
                      </TableCell>
                      <TableCell>
                        {offre.demande?.status ? (
                          getDemandeStatusBadge(offre.demande.status)
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {formatDate(offre.createdAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {offre.message && (
                            <div className="group relative">
                              <MessageSquare className="h-4 w-4 text-gray-500 cursor-help" />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                Message inclus
                              </div>
                            </div>
                          )}
                          {offre.audioUrl && (
                            <div className="group relative">
                              <Volume2 className="h-4 w-4 text-gray-500 cursor-help" />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                Audio inclus
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques */}
      {offres && offres.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-3xl">{offres.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>En attente</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">
                {offres.filter(o => o.status === 'pending').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Acceptées</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {offres.filter(o => o.status === 'accepted').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Refusées</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {offres.filter(o => o.status === 'rejected').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  )
}

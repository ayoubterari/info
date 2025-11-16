import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Eye, Trash2, Plus, MessageSquare } from 'lucide-react'
import { CreateDemandeModal } from './CreateDemandeModal'
import { ViewDemandeModal } from './ViewDemandeModal'
import { OffresRecuesModal } from './OffresRecuesModal'

export function DemandesTab() {
  const { user } = useAuth()
  const demandes = useQuery(api.demandes.getUserDemandes, { userId: user?.userId })
  
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [offresModalOpen, setOffresModalOpen] = useState(false)
  const [selectedDemande, setSelectedDemande] = useState(null)

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
      month: '2-digit',
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

  const handleViewDemande = (demande) => {
    setSelectedDemande(demande)
    setViewModalOpen(true)
  }

  const handleViewOffres = (demande) => {
    setSelectedDemande(demande)
    setOffresModalOpen(true)
  }

  const handleCreateSuccess = () => {
    // La liste se mettra à jour automatiquement grâce à useQuery
  }

  if (!user) {
    return null
  }

  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mes Demandes d'Aide</CardTitle>
                <CardDescription>
                  Liste de toutes vos demandes d'aide
                </CardDescription>
              </div>
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle demande
              </Button>
            </div>
          </CardHeader>
        <CardContent>
          {!demandes ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Chargement...</div>
            </div>
          ) : demandes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune demande
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Vous n'avez pas encore créé de demande d'aide
              </p>
              <Button onClick={() => setCreateModalOpen(true)}>
                Créer ma première demande
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Offres</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demandes.map((demande) => (
                    <TableRow key={demande._id}>
                      <TableCell className="font-medium">
                        {demande.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{demande.category}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(demande.price)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(demande.status)}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {formatDate(demande.createdAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOffres(demande)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Voir les offres
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDemande(demande)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
      {demandes && demandes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-3xl">{demandes.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>En attente</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">
                {demandes.filter(d => d.status === 'pending').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>En cours</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {demandes.filter(d => d.status === 'in_progress').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Terminées</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {demandes.filter(d => d.status === 'completed').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>

    {/* Modals */}
    <CreateDemandeModal
      open={createModalOpen}
      onOpenChange={setCreateModalOpen}
      onSuccess={handleCreateSuccess}
    />
    <ViewDemandeModal
      open={viewModalOpen}
      onOpenChange={setViewModalOpen}
      demande={selectedDemande}
    />
    <OffresRecuesModal
      open={offresModalOpen}
      onOpenChange={setOffresModalOpen}
      demandeId={selectedDemande?._id}
      demandeTitle={selectedDemande?.title}
    />
  </>
  )
}

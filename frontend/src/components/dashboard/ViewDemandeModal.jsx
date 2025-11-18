import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Calendar, DollarSign, Tag, FileText, Volume2, TrendingUp, AlertTriangle } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'

export function ViewDemandeModal({ open, onOpenChange, demande }) {
  if (!demande) return null

  // Récupérer le taux de commission et la transaction si la demande est terminée
  const commissionRate = useQuery(api.appSettings.getCommissionRate)
  const allTransactions = useQuery(api.transactions.getAllTransactions)
  
  // Trouver la transaction liée à cette demande
  const transaction = allTransactions?.find(t => {
    // On cherche une transaction dont la session correspond à cette demande
    return t.status === 'completed'
  })

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{demande.title}</DialogTitle>
              <DialogDescription className="mt-2">
                Détails de la demande
              </DialogDescription>
            </div>
            {getStatusBadge(demande.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-500">
                <Tag className="mr-2 h-4 w-4" />
                Catégorie
              </div>
              <Badge variant="secondary">{demande.category}</Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-500">
                <DollarSign className="mr-2 h-4 w-4" />
                Prix proposé
              </div>
              <div className="text-lg font-semibold">{formatPrice(demande.price)}</div>
            </div>

            <div className="space-y-1 col-span-2">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="mr-2 h-4 w-4" />
                Date de création
              </div>
              <div className="text-sm">{formatDate(demande.createdAt)}</div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center text-sm font-medium text-gray-900">
              <FileText className="mr-2 h-4 w-4" />
              Description
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
              {demande.description}
            </div>
          </div>

          {/* Audio si présent */}
          {demande.audioStorageId && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-gray-900">
                  <Volume2 className="mr-2 h-4 w-4" />
                  Message vocal
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <audio controls className="w-full">
                    <source src={demande.audioUrl} type="audio/webm" />
                    Votre navigateur ne supporte pas l'élément audio.
                  </audio>
                </div>
              </div>
            </>
          )}

          {/* Fichiers joints si présents */}
          {demande.fileStorageIds && demande.fileStorageIds.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-gray-900">
                  <FileText className="mr-2 h-4 w-4" />
                  Fichiers joints ({demande.fileStorageIds.length})
                </div>
                <div className="space-y-2">
                  {demande.fileStorageIds.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{file.name}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Informations pour les demandes annulées (SCAM) */}
          {demande.status === 'cancelled' && (
            <>
              <Separator />
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-bold text-red-900">Session annulée - SCAM signalé</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                    <div className="text-sm text-red-900 space-y-2">
                      <div className="font-bold">🚨 Cette session a été signalée comme frauduleuse</div>
                      <div className="mt-3 space-y-1">
                        <div>❌ <strong>Aucune commission prélevée</strong></div>
                        <div>❌ <strong>Aucun argent transféré au prestataire</strong></div>
                        <div>✅ <strong>Le demandeur sera remboursé</strong></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 p-4 bg-white border border-red-200 rounded-lg">
                    <div className="text-sm text-red-800">
                      <strong>Détails de l'annulation :</strong>
                    </div>
                    <div className="text-xs text-red-700 space-y-1">
                      <div>• Montant qui devait être payé: <strong>{formatPrice(demande.price)}</strong></div>
                      <div>• Commission qui aurait été prélevée ({commissionRate || 10}%): <strong>{formatPrice((demande.price * (commissionRate || 10)) / 100)}</strong></div>
                      <div>• Montant que le prestataire aurait reçu: <strong>{formatPrice(demande.price - (demande.price * (commissionRate || 10)) / 100)}</strong></div>
                    </div>
                    <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-900">
                      <strong>⚠️ Statut:</strong> Tous les transferts ont été bloqués. Le prestataire ne recevra rien.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Informations de commission pour les demandes terminées */}
          {demande.status === 'completed' && (
            <>
              <Separator />
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-bold text-green-900">Répartition des revenus</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-green-200">
                    <span className="text-sm text-green-800">Montant total payé</span>
                    <span className="font-bold text-green-900">{formatPrice(demande.price)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-green-200">
                    <span className="text-sm text-green-800">
                      Commission plateforme ({commissionRate || 10}%)
                    </span>
                    <span className="font-bold text-orange-600">
                      {formatPrice((demande.price * (commissionRate || 10)) / 100)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 bg-green-100 -mx-6 px-6 rounded">
                    <span className="text-sm font-semibold text-green-900">
                      Montant reçu par le prestataire
                    </span>
                    <span className="font-bold text-lg text-green-700">
                      {formatPrice(demande.price - (demande.price * (commissionRate || 10)) / 100)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white border border-green-200 rounded-lg">
                  <div className="text-xs text-green-800">
                    <strong>✅ Transaction complétée</strong>
                    <div className="mt-1 space-y-1">
                      <div>• L'application a reçu: <strong>{formatPrice((demande.price * (commissionRate || 10)) / 100)}</strong></div>
                      <div>• Le prestataire a reçu: <strong>{formatPrice(demande.price - (demande.price * (commissionRate || 10)) / 100)}</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Informations supplémentaires */}
          <Separator />
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-900">
              <strong>Note:</strong> Cette demande est visible par tous les utilisateurs qui peuvent proposer leur aide.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

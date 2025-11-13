import { useState } from 'react'
import { ArrowLeft, DollarSign, Clock, Tag, Mic, Check, X as XIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api.js'
import Header from '../components/Header'
import { useAuth } from '../hooks/useAuth'

export default function Offres() {
  const navigate = useNavigate()
  const { user } = useAuth()
  // Récupérer uniquement les offres reçues sur les demandes de l'utilisateur
  const offres = useQuery(api.offres.getOffresRecues, { userId: user?.userId })
  const updateOffreStatus = useMutation(api.offres.updateOffreStatus)
  const [processingOfferId, setProcessingOfferId] = useState(null)

  const handleStatusUpdate = async (offreId, status) => {
    setProcessingOfferId(offreId)
    try {
      const result = await updateOffreStatus({
        offreId,
        status,
      })
      
      if (status === 'accepted' && result?.meetSessionId) {
        // Rediriger vers la page meet
        navigate(`/meet/${result.meetSessionId}`)
      } else {
        alert(`Offre ${status === 'accepted' ? 'acceptée' : 'refusée'} avec succès!`)
      }
    } catch (error) {
      console.error('Error updating offer status:', error)
      alert('Erreur lors de la mise à jour du statut')
    } finally {
      setProcessingOfferId(null)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: 'Acceptée', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Refusée', color: 'bg-red-100 text-red-800' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure'
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    if (diffInHours < 48) return 'Hier'
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="w-full min-h-screen bg-white text-black overflow-hidden flex flex-col">
      {/* Header */}
      <Header />

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/human-service')}
            className="flex items-center gap-2 mb-6 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Retour</span>
          </button>

          {/* Hero Section */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              <span className="block">Offres reçues</span>
              <span className="bg-gradient-to-r from-black via-gray-700 to-gray-500 bg-clip-text text-transparent">
                Propositions d'aide
              </span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Consultez et gérez les offres d'aide pour vos demandes
            </p>
          </div>

          {/* Offres Grid */}
          {!offres ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <p className="mt-4 text-gray-600">Chargement des offres...</p>
            </div>
          ) : offres.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Aucune offre pour le moment</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {offres.map((offre) => {
                const isCreator = offre.demande?.userId === user?.userId
                return (
                  <div
                    key={offre._id}
                    className="relative group"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-black/20 to-black/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative bg-white border-2 border-black/20 rounded-xl p-6 hover:border-black/40 transition-all duration-300">
                      {/* Header with Demande Info */}
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-black mb-1">
                              Offre pour: {offre.demande?.title}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(offre.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                <span className="capitalize">{offre.demande?.category}</span>
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(offre.status)}
                        </div>
                      </div>

                      {/* Price Comparison */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-xs text-gray-600 mb-1">Prix initial</p>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-gray-700" />
                            <span className="text-lg font-bold text-gray-900">{offre.demande?.price.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-xs text-green-700 mb-1">Prix proposé</p>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-700" />
                            <span className="text-lg font-bold text-green-900">{offre.proposedPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Message:</p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {offre.message}
                        </p>
                      </div>

                      {/* Audio Player */}
                      {offre.audioUrl && (
                        <div className="mb-4">
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-black rounded-full animate-pulse">
                                <Mic className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-black">Message audio de l'offrant</p>
                                <p className="text-xs text-gray-600">Écoutez sa proposition vocale</p>
                              </div>
                            </div>
                            <audio 
                              controls 
                              className="w-full h-12 mt-2"
                              src={offre.audioUrl}
                            >
                              Votre navigateur ne supporte pas l'élément audio.
                            </audio>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons - Only for creator */}
                      {isCreator && offre.status === 'pending' && (
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => handleStatusUpdate(offre._id, 'accepted')}
                            disabled={processingOfferId === offre._id}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accepter</span>
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(offre._id, 'rejected')}
                            disabled={processingOfferId === offre._id}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XIcon className="w-4 h-4" />
                            <span>Refuser</span>
                          </button>
                        </div>
                      )}

                      {/* Info for non-creators */}
                      {!isCreator && (
                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500 text-center">
                            Seul le créateur de la demande peut accepter ou refuser cette offre
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-black/10 backdrop-blur-md bg-white/40 py-3 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500">
          <p>© 2025 FreeL AI. Powered by multiple AI agents. Always learning, always improving.</p>
        </div>
      </footer>
    </div>
  )
}

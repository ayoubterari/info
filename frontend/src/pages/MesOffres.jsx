import { useState, useEffect } from 'react'
import { ArrowLeft, DollarSign, Clock, Tag, Mic, CheckCircle, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api.js'
import Header from '../components/Header'
import PaymentStatusModal from '../components/PaymentStatusModal'
import { useAuth } from '../contexts/AuthContext'

export default function MesOffres() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Récupérer les offres proposées par l'utilisateur
  const offres = useQuery(api.offres.getOffresProposees, { userId: user?.userId })
  
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState(null)

  // Surveiller les offres acceptées pour ouvrir automatiquement le modal
  useEffect(() => {
    if (offres) {
      console.log('🔍 [MesOffres] Vérification des offres:', offres)
      const acceptedOffre = offres.find(
        offre => offre.status === 'accepted' && 
        offre.meetSessionId && 
        !offre.paymentCompleted
      )
      
      console.log('🔍 [MesOffres] Offre acceptée trouvée:', acceptedOffre)
      
      if (acceptedOffre && acceptedOffre.meetSessionId) {
        console.log('✅ [MesOffres] Ouverture du modal de paiement pour session:', acceptedOffre.meetSessionId)
        // Délai pour s'assurer que la page est complètement chargée (important pour mobile)
        setTimeout(() => {
          setSelectedSessionId(acceptedOffre.meetSessionId)
          setPaymentModalOpen(true)
        }, 300)
      }
    }
  }, [offres])

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'tech', label: 'Technologie' },
    { value: 'education', label: 'Éducation' },
    { value: 'health', label: 'Santé' },
    { value: 'business', label: 'Business' },
    { value: 'creative', label: 'Créatif' },
    { value: 'other', label: 'Autre' },
  ]

  const filteredOffres = offres?.filter(
    (offre) => selectedCategory === 'all' || offre.demande?.category === selectedCategory
  )

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      accepted: { label: 'Acceptée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Refusée', color: 'bg-red-100 text-red-800', icon: XCircle },
    }
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">Veuillez vous connecter pour voir vos offres.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Debug info for mobile */}
      {console.log('📱 [MesOffres] Rendu de la page:', { 
        userExists: !!user, 
        offresCount: offres?.length,
        paymentModalOpen,
        selectedSessionId 
      })}
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes offres proposées</h1>
              <p className="text-gray-600 mt-1">
                {filteredOffres?.length || 0} offre{filteredOffres?.length !== 1 ? 's' : ''} proposée{filteredOffres?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.value
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Offres List */}
        <div className="space-y-4">
          {!filteredOffres ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
              <p className="text-gray-600 mt-4">Chargement...</p>
            </div>
          ) : filteredOffres.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <p className="text-gray-600">Aucune offre proposée pour le moment.</p>
            </div>
          ) : (
            filteredOffres.map((offre) => (
              <div
                key={offre._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {offre.demande?.title || 'Demande'}
                      </h3>
                      {getStatusBadge(offre.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {offre.demande?.category || 'Général'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(offre.createdAt)}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4">
                      {offre.demande?.description || 'Pas de description'}
                    </p>
                  </div>
                </div>

                {/* Offre Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Votre offre</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Prix proposé</span>
                      <span className="font-semibold text-lg flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {offre.proposedPrice}
                      </span>
                    </div>
                    {offre.message && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-sm text-gray-700">{offre.message}</p>
                      </div>
                    )}
                    {offre.audioStorageId && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mic className="w-4 h-4" />
                        Message vocal inclus
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions pour offre acceptée */}
                {offre.status === 'accepted' && offre.meetSessionId && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-green-900">Offre acceptée !</p>
                        <p className="text-sm text-green-700">
                          En attente du paiement du demandeur
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSessionId(offre.meetSessionId)
                          setPaymentModalOpen(true)
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                      >
                        Voir le statut
                      </button>
                    </div>
                  </div>
                )}

                {/* Info pour offre en attente */}
                {offre.status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      ⏳ En attente de la réponse du demandeur
                    </p>
                  </div>
                )}

                {/* Info pour offre refusée */}
                {offre.status === 'rejected' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      ❌ Cette offre a été refusée par le demandeur
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Status Modal - Seulement si sessionId existe */}
      {selectedSessionId && (
        <PaymentStatusModal
          isOpen={paymentModalOpen}
          onClose={() => {
            console.log('🔴 [MesOffres] Fermeture du modal')
            setPaymentModalOpen(false)
            setSelectedSessionId(null)
          }}
          sessionId={selectedSessionId}
        />
      )}
    </div>
  )
}

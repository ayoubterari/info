import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { X, Loader2, CreditCard, Video, CheckCircle } from 'lucide-react'

export default function PaymentStatusModal({ isOpen, onClose, sessionId }) {
  const navigate = useNavigate()
  const [showJoinButton, setShowJoinButton] = useState(false)

  // Récupérer le statut de la session en temps réel
  const session = useQuery(
    api.meetSessions.getSessionById,
    sessionId ? { sessionId } : "skip"
  )

  useEffect(() => {
    if (session?.paymentStatus === 'completed') {
      setShowJoinButton(true)
    }
  }, [session?.paymentStatus])

  const handleJoinMeet = () => {
    navigate(`/meet/${sessionId}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              {showJoinButton ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <CreditCard className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">Statut de la session</h2>
              <p className="text-sm text-white/80">
                {session?.demandeTitle || 'Chargement...'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showJoinButton ? (
            // En attente de paiement
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                En cours de paiement
              </h3>
              
              <p className="text-gray-600 mb-6">
                Le demandeur est en train de finaliser le paiement.
                Veuillez patienter...
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Astuce :</strong> Préparez votre matériel (caméra, micro) 
                  pendant que vous attendez. Vous serez notifié dès que le paiement sera confirmé.
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Prix de la session</span>
                  <span className="font-semibold text-gray-900">
                    ${session?.offre?.proposedPrice || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Durée estimée</span>
                  <span className="font-semibold text-gray-900">
                    {session?.duration || 30} minutes
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Paiement confirmé
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Paiement confirmé !
              </h3>
              
              <p className="text-gray-600 mb-6">
                Le demandeur a finalisé le paiement.
                Vous pouvez maintenant rejoindre la session de visioconférence.
              </p>

              <button
                onClick={handleJoinMeet}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl"
              >
                <Video className="w-6 h-6" />
                Rejoindre le meet maintenant
              </button>

              <p className="text-xs text-gray-500 mt-4">
                🎥 La session démarrera dès que vous rejoindrez
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Session ID: {sessionId?.slice(-8)}</span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${showJoinButton ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
              {showJoinButton ? 'Prêt' : 'En attente'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

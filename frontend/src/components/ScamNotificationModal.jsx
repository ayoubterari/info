import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, XCircle, DollarSign } from 'lucide-react'

export default function ScamNotificationModal({ isOpen, onClose, sessionInfo }) {
  const navigate = useNavigate()

  // Bloquer le scroll quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  // Redirection automatique après 10 secondes
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        handleClose()
      }, 10000)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleClose = () => {
    onClose()
    navigate('/dashboard')
  }

  if (!isOpen) return null

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80 p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-shake">
        {/* Header avec fond rouge */}
        <div className="relative bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Session Annulée</h2>
              <p className="text-sm text-white/90">SCAM Signalé</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Message principal */}
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 mb-1">
                  Le demandeur a signalé cette session comme frauduleuse
                </h3>
                <p className="text-sm text-red-800">
                  La session a été immédiatement terminée et vous avez été déconnecté.
                </p>
              </div>
            </div>

            {/* Informations sur la transaction */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Statut de la transaction
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-red-700">
                  <span className="text-xl">❌</span>
                  <span className="font-semibold">Transaction annulée</span>
                </div>
                <div className="flex items-center gap-2 text-red-700">
                  <span className="text-xl">❌</span>
                  <span>Aucun argent ne sera transféré</span>
                </div>
                <div className="flex items-center gap-2 text-blue-700">
                  <span className="text-xl">💰</span>
                  <span>Le demandeur sera remboursé</span>
                </div>
              </div>
            </div>

            {/* Informations de la session */}
            {sessionInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Session :</strong> {sessionInfo.demandeTitle || 'Service'}
                </p>
                {sessionInfo.proposedPrice && (
                  <p className="text-sm text-blue-900 mt-1">
                    <strong>Montant :</strong> ${sessionInfo.proposedPrice}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleClose}
              className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
            >
              Retour au Dashboard
            </button>
            
            <p className="text-xs text-center text-gray-500">
              Redirection automatique dans 10 secondes...
            </p>
          </div>

          {/* Note importante */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>⚠️ Note :</strong> Si vous pensez que ce signalement est injustifié, 
              veuillez contacter le support avec les détails de la session.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )

  return createPortal(modalContent, document.body)
}

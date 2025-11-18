import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import { CreditCard, CheckCircle, AlertCircle, Loader2, Video, FileText } from 'lucide-react'

export default function Payment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  
  const offreId = searchParams.get('offreId')
  const sessionId = searchParams.get('sessionId')
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')
  
  // Récupérer les détails de l'offre et de la session
  const offre = useQuery(api.offres.getOffreById, offreId ? { id: offreId } : "skip")
  const meetSession = useQuery(api.meetSessions.getSessionById, sessionId ? { sessionId } : "skip")
  const commissionRate = useQuery(api.appSettings.getCommissionRate)
  
  const updatePaymentStatus = useMutation(api.meetSessions.updatePaymentStatus)
  const createTransaction = useMutation(api.transactions.createTransaction)

  useEffect(() => {
    if (!user) {
      navigate('/')
    }
  }, [user, navigate])

  const handlePayment = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Simuler un délai de traitement de paiement
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Vérifier les numéros de carte de test Stripe
      const testCards = ['4242424242424242', '4000056655665556']
      const cleanCardNumber = cardNumber.replace(/\s/g, '')
      
      if (testCards.includes(cleanCardNumber)) {
        // Paiement réussi - Mettre à jour le statut
        if (sessionId && offreId && meetSession && offre) {
          console.log('💳 Paiement réussi, mise à jour du statut...')
          await updatePaymentStatus({
            sessionId,
            paymentStatus: 'completed',
            paymentMethod: 'stripe_test'
          })

          // ⚠️ IMPORTANT: Ne créer une transaction QUE si la session n'est pas annulée
          // Si un scam est signalé plus tard, la transaction ne sera pas créée
          console.log('💰 Préparation de la transaction...', {
            sessionId,
            offreId,
            demandeurId: meetSession.demandeurId,
            offreurId: meetSession.offreurId,
            totalAmount: offre.proposedPrice,
          })

          // Note: La transaction sera créée à la fin du meet si tout se passe bien
          // Pour l'instant, on marque juste le paiement comme complété
          console.log('✅ Paiement enregistré (transaction sera créée à la fin du meet)')
        }
        
        setPaymentSuccess(true)
      } else {
        alert('Carte de test invalide. Utilisez 4242 4242 4242 4242 pour tester.')
        setIsProcessing(false)
      }
    } catch (error) {
      console.error('Erreur de paiement:', error)
      alert('Erreur lors du traitement du paiement')
      setIsProcessing(false)
    }
  }

  const handleJoinMeet = () => {
    if (sessionId) {
      navigate(`/meet/${sessionId}`)
    }
  }

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '')
    const chunks = cleaned.match(/.{1,4}/g)
    return chunks ? chunks.join(' ') : cleaned
  }

  if (!offre || !meetSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Paiement réussi !
            </h1>
            <p className="text-gray-600 mb-8">
              Votre paiement de <span className="font-semibold">${offre.proposedPrice}</span> a été traité avec succès.
              Vous pouvez maintenant rejoindre la session de visioconférence.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                Instructions pour la session
              </h3>
              <ul className="text-left text-sm text-blue-800 space-y-2">
                <li>• Assurez-vous que votre caméra et microphone fonctionnent</li>
                <li>• Préparez vos questions ou documents nécessaires</li>
                <li>• La session durera environ {meetSession.duration || 30} minutes</li>
                <li>• Soyez ponctuel et respectueux</li>
              </ul>
            </div>

            <button
              onClick={handleJoinMeet}
              className="w-full py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-lg"
            >
              <Video className="w-6 h-6" />
              Rejoindre la session maintenant
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Instructions et détails */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Détails de la session
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold">{meetSession.demandeTitle}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Prix du service</span>
                  <span className="font-semibold">${offre.proposedPrice}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Commission plateforme ({commissionRate || 10}%)</span>
                  <span className="font-semibold text-orange-600">
                    ${((offre.proposedPrice * (commissionRate || 10)) / 100).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b bg-gray-50 -mx-6 px-6">
                  <span className="text-gray-900 font-bold">Total à payer</span>
                  <span className="font-bold text-2xl text-gray-900">${offre.proposedPrice}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Le prestataire recevra</span>
                  <span className="font-semibold text-green-600">
                    ${(offre.proposedPrice - (offre.proposedPrice * (commissionRate || 10)) / 100).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Durée estimée</span>
                  <span className="font-semibold">{meetSession.duration || 30} minutes</span>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Prestataire</span>
                  <span className="font-semibold">{meetSession.helperName}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Instructions importantes
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Le paiement est sécurisé via Stripe (mode test)</li>
                <li>• Utilisez la carte de test : <strong>4242 4242 4242 4242</strong></li>
                <li>• Date d'expiration : n'importe quelle date future</li>
                <li>• CVV : n'importe quel code à 3 chiffres</li>
                <li>• Après paiement, vous accéderez directement au meet</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Mode test :</strong> Aucun paiement réel ne sera effectué. 
                  Utilisez uniquement les cartes de test Stripe.
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de paiement */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Paiement</h2>
                <p className="text-sm text-gray-500">Mode test Stripe</p>
              </div>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de carte
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))
                    setCardNumber(formatted)
                  }}
                  placeholder="4242 4242 4242 4242"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                  required
                  maxLength="19"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom sur la carte
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'expiration
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '')
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4)
                      }
                      setExpiryDate(value)
                    }}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                    required
                    maxLength="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="123"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                    required
                    maxLength="3"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    isProcessing
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-800 hover:shadow-lg'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Payer ${offre.proposedPrice}
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-center text-gray-500 mt-4">
                🔒 Paiement sécurisé par Stripe (Mode Test)
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

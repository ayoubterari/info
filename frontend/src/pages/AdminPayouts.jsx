import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Header from '../components/Header'
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Building2
} from 'lucide-react'
import { Button } from '../components/ui/button'

export default function AdminPayouts() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer')
  const [payoutReference, setPayoutReference] = useState('')
  const [payoutNotes, setPayoutNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Vérifier que l'utilisateur est admin
  if (user?.role !== 'admin') {
    navigate('/')
    return null
  }

  const pendingPayouts = useQuery(api.payments.getPendingPayouts)
  const payoutStats = useQuery(api.payments.getPayoutStats)
  const markPayoutCompleted = useMutation(api.payments.markPayoutAsCompleted)

  const handleMarkAsCompleted = async () => {
    if (!selectedTransaction || !payoutReference.trim()) {
      alert('Veuillez remplir tous les champs requis')
      return
    }

    setIsProcessing(true)
    try {
      await markPayoutCompleted({
        transactionId: selectedTransaction._id,
        payoutMethod,
        payoutReference,
        payoutNotes: payoutNotes.trim() || undefined,
      })

      alert('✅ Payout marqué comme complété')
      setSelectedTransaction(null)
      setPayoutReference('')
      setPayoutNotes('')
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors du traitement')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Retour au dashboard admin
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des Payouts
            </h1>
          </div>
          <p className="text-gray-600">
            Gérez les paiements aux prestataires
          </p>
        </div>

        {/* Stats */}
        {payoutStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">En attente</span>
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {payoutStats.pendingPayouts}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ${payoutStats.pendingAmount.toFixed(2)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Complétés</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {payoutStats.completedPayouts}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ${payoutStats.completedAmount.toFixed(2)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Total</span>
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {payoutStats.totalTransactions}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ${payoutStats.totalAmount.toFixed(2)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-100 text-sm">À traiter</span>
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <p className="text-2xl font-bold">
                ${payoutStats.pendingAmount.toFixed(2)}
              </p>
              <p className="text-sm text-green-100 mt-1">
                Montant en attente
              </p>
            </div>
          </div>
        )}

        {/* Liste des payouts en attente */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Payouts en attente de traitement
            </h2>
          </div>

          <div className="overflow-x-auto">
            {!pendingPayouts ? (
              <div className="p-8 text-center text-gray-500">
                Chargement...
              </div>
            ) : pendingPayouts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="font-medium">Aucun payout en attente</p>
                <p className="text-sm mt-1">Tous les paiements sont à jour</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Prestataire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Info bancaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingPayouts.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.offreurName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.offreurEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-green-600">
                            ${transaction.providerAmount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Total: ${transaction.totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          ${transaction.commissionAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ({transaction.commissionRate}%)
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        {transaction.offreurBankInfo ? (
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">
                              {transaction.offreurBankInfo.bankName}
                            </p>
                            <p className="text-gray-500 font-mono text-xs">
                              {transaction.offreurBankInfo.accountNumber}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} />
                            Non renseigné
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => setSelectedTransaction(transaction)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Traiter
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal de traitement */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  Traiter le payout
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Infos transaction */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Informations de la transaction
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Prestataire:</span>
                      <p className="font-medium text-gray-900">
                        {selectedTransaction.offreurName}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium text-gray-900">
                        {selectedTransaction.offreurEmail}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Montant à verser:</span>
                      <p className="font-bold text-green-600 text-lg">
                        ${selectedTransaction.providerAmount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Commission:</span>
                      <p className="font-medium text-gray-900">
                        ${selectedTransaction.commissionAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {selectedTransaction.offreurBankInfo && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Building2 size={16} />
                        Informations bancaires
                      </h5>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-gray-600">Titulaire:</span>{' '}
                          <span className="font-medium">
                            {selectedTransaction.offreurBankInfo.accountHolderName}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-600">Banque:</span>{' '}
                          <span className="font-medium">
                            {selectedTransaction.offreurBankInfo.bankName}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-600">Compte:</span>{' '}
                          <span className="font-mono text-xs">
                            {selectedTransaction.offreurBankInfo.accountNumber}
                          </span>
                        </p>
                        {selectedTransaction.offreurBankInfo.iban && (
                          <p>
                            <span className="text-gray-600">IBAN:</span>{' '}
                            <span className="font-mono text-xs">
                              {selectedTransaction.offreurBankInfo.iban}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Formulaire de payout */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Méthode de paiement
                    </label>
                    <select
                      value={payoutMethod}
                      onChange={(e) => setPayoutMethod(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="bank_transfer">Virement bancaire</option>
                      <option value="paypal">PayPal</option>
                      <option value="wise">Wise</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Référence du paiement *
                    </label>
                    <input
                      type="text"
                      value={payoutReference}
                      onChange={(e) => setPayoutReference(e.target.value)}
                      placeholder="Ex: VIREMENT-20250118-001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={payoutNotes}
                      onChange={(e) => setPayoutNotes(e.target.value)}
                      placeholder="Notes internes..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <Button
                  onClick={() => {
                    setSelectedTransaction(null)
                    setPayoutReference('')
                    setPayoutNotes('')
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleMarkAsCompleted}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isProcessing || !payoutReference.trim()}
                >
                  {isProcessing ? (
                    'Traitement...'
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Marquer comme payé
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

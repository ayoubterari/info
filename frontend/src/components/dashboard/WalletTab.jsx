import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Wallet, DollarSign, CreditCard, Send, CheckCircle, Clock, XCircle, Building2 } from 'lucide-react'

export function WalletTab({ userId }) {
  const [showBankForm, setShowBankForm] = useState(false)
  const [showPayoutForm, setShowPayoutForm] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')
  
  // Bank account form
  const [accountHolderName, setAccountHolderName] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [iban, setIban] = useState('')
  const [swift, setSwift] = useState('')

  const wallet = useQuery(api.wallet.getUserWallet, { userId })
  const payoutRequests = useQuery(api.wallet.getUserPayoutRequests, { userId })
  const updateBankInfo = useMutation(api.wallet.updateBankAccountInfo)
  const createPayoutRequest = useMutation(api.wallet.createPayoutRequest)

  const handleSaveBankInfo = async (e) => {
    e.preventDefault()
    
    try {
      await updateBankInfo({
        userId,
        bankAccountInfo: {
          accountHolderName,
          bankName,
          accountNumber,
          iban: iban || undefined,
          swift: swift || undefined,
        },
      })
      
      alert('✅ Informations bancaires enregistrées avec succès')
      setShowBankForm(false)
      
      // Reset form
      setAccountHolderName('')
      setBankName('')
      setAccountNumber('')
      setIban('')
      setSwift('')
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de l\'enregistrement')
    }
  }

  const handleRequestPayout = async (e) => {
    e.preventDefault()
    
    const amount = parseFloat(payoutAmount)
    
    if (isNaN(amount) || amount <= 0) {
      alert('Veuillez entrer un montant valide')
      return
    }

    if (amount > (wallet?.balance || 0)) {
      alert('Solde insuffisant')
      return
    }

    try {
      await createPayoutRequest({
        userId,
        amount,
      })
      
      alert('✅ Demande de retrait envoyée avec succès')
      setShowPayoutForm(false)
      setPayoutAmount('')
    } catch (error) {
      console.error('Erreur:', error)
      alert(`❌ ${error.message || 'Erreur lors de la demande'}`)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, color: 'text-orange-600 bg-orange-50', label: 'En attente' },
      processing: { icon: Clock, color: 'text-blue-600 bg-blue-50', label: 'En cours' },
      completed: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Complété' },
      rejected: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Rejeté' },
    }
    
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    )
  }

  if (!wallet) {
    return <div className="p-8 text-center">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-600" />
            Votre Wallet
          </CardTitle>
          <CardDescription>Balance disponible pour retrait</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-green-600">
                ${wallet.balance?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Balance disponible</p>
            </div>
            <Button
              onClick={() => setShowPayoutForm(true)}
              disabled={!wallet.bankAccountInfo || (wallet.balance || 0) < 10}
              className="bg-green-600 hover:bg-green-700"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Demander un retrait
            </Button>
          </div>

          {!wallet.bankAccountInfo && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Veuillez d'abord ajouter vos informations bancaires pour pouvoir effectuer des retraits
              </p>
            </div>
          )}

          {wallet.balance < 10 && wallet.balance > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Le montant minimum de retrait est de $10.00
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informations Bancaires
          </CardTitle>
          <CardDescription>
            Gérez vos informations bancaires pour les retraits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wallet.bankAccountInfo ? (
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Titulaire</p>
                    <p className="font-medium">{wallet.bankAccountInfo.accountHolderName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Banque</p>
                    <p className="font-medium">{wallet.bankAccountInfo.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Numéro de compte</p>
                    <p className="font-mono text-sm">•••• {wallet.bankAccountInfo.accountNumber.slice(-4)}</p>
                  </div>
                  {wallet.bankAccountInfo.iban && (
                    <div>
                      <p className="text-sm text-gray-600">IBAN</p>
                      <p className="font-mono text-sm">{wallet.bankAccountInfo.iban}</p>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowBankForm(true)}
              >
                Modifier les informations
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">Aucune information bancaire enregistrée</p>
              <Button onClick={() => setShowBankForm(true)}>
                Ajouter mes informations bancaires
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Requests History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des retraits</CardTitle>
          <CardDescription>Vos demandes de retrait passées et en cours</CardDescription>
        </CardHeader>
        <CardContent>
          {!payoutRequests || payoutRequests.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucune demande de retrait</p>
          ) : (
            <div className="space-y-3">
              {payoutRequests.map((request) => (
                <div
                  key={request._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-lg">${request.amount.toFixed(2)}</p>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {request.payoutReference && (
                      <p className="text-xs text-gray-500 mt-1">
                        Réf: {request.payoutReference}
                      </p>
                    )}
                    {request.rejectionReason && (
                      <p className="text-xs text-red-600 mt-1">
                        Raison: {request.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Form Modal */}
      {showBankForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Informations Bancaires</h3>
            </div>
            <form onSubmit={handleSaveBankInfo} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom du titulaire *</label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nom de la banque *</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Numéro de compte *</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">IBAN (optionnel)</label>
                <input
                  type="text"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Code SWIFT (optionnel)</label>
                <input
                  type="text"
                  value={swift}
                  onChange={(e) => setSwift(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBankForm(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                  Enregistrer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Request Modal */}
      {showPayoutForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Demander un retrait</h3>
              <p className="text-sm text-gray-600 mt-1">
                Balance disponible: ${wallet.balance?.toFixed(2)}
              </p>
            </div>
            <form onSubmit={handleRequestPayout} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Montant à retirer *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="10"
                    max={wallet.balance}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Montant minimum: $10.00</p>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Le retrait sera traité sous 2-5 jours ouvrables
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPayoutForm(false)
                    setPayoutAmount('')
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                  <Send className="mr-2 h-4 w-4" />
                  Confirmer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

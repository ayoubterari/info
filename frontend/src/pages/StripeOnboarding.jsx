import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Header from '../components/Header'
import { CreditCard, CheckCircle, AlertCircle, Loader2, Building2, DollarSign } from 'lucide-react'
import { Button } from '../components/ui/button'

export default function StripeOnboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [isCompletingOnboarding, setIsCompletingOnboarding] = useState(false)
  const [bankAccountLast4, setBankAccountLast4] = useState('')

  const accountStatus = useQuery(
    api.stripeConnect.checkAccountStatus,
    user?.userId ? { userId: user.userId } : "skip"
  )

  const createAccount = useMutation(api.stripeConnect.createConnectAccount)
  const createLink = useMutation(api.stripeConnect.createAccountLink)
  const completeOnboarding = useMutation(api.stripeConnect.completeOnboarding)

  useEffect(() => {
    if (!user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleCreateAccount = async () => {
    if (!user?.userId) return

    setIsCreatingAccount(true)
    try {
      const result = await createAccount({ userId: user.userId })
      console.log('✅ Compte créé:', result)
      alert('✅ ' + result.message)
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la création du compte')
    } finally {
      setIsCreatingAccount(false)
    }
  }

  const handleStartOnboarding = async () => {
    if (!user?.userId) return

    try {
      const result = await createLink({ userId: user.userId })
      console.log('✅ Lien créé:', result)
      
      // En mode DEMO, on simule juste la complétion
      alert('🎭 MODE DEMO\n\nEn production, vous seriez redirigé vers Stripe pour:\n- Vérifier votre identité\n- Ajouter vos informations bancaires\n- Accepter les conditions\n\nPour la démo, cliquez sur "Simuler la complétion"')
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la génération du lien')
    }
  }

  const handleCompleteOnboarding = async () => {
    if (!user?.userId) return
    if (!bankAccountLast4 || bankAccountLast4.length !== 4) {
      alert('Veuillez entrer les 4 derniers chiffres d\'un compte bancaire (ex: 4242)')
      return
    }

    setIsCompletingOnboarding(true)
    try {
      const result = await completeOnboarding({
        userId: user.userId,
        bankAccountLast4,
      })
      console.log('✅ Onboarding complété:', result)
      alert('✅ ' + result.message + '\n\nVous pouvez maintenant recevoir des paiements!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la complétion')
    } finally {
      setIsCompletingOnboarding(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configuration des Paiements
            </h1>
            <p className="text-gray-600">
              Configurez votre compte pour recevoir des paiements en tant que prestataire
            </p>
          </div>

          {/* Mode DEMO Banner */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>🎭 MODE DÉMO</strong>
                <p className="mt-1">
                  Cette page simule le processus Stripe Connect. En production, vous serez redirigé vers Stripe
                  pour vérifier votre identité et ajouter vos informations bancaires.
                </p>
              </div>
            </div>
          </div>

          {/* Statut actuel */}
          {accountStatus && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Statut de votre compte</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Compte Connect</span>
                  <div className="flex items-center gap-2">
                    {accountStatus.hasAccount ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-600 font-medium">Créé</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-500">Non créé</span>
                      </>
                    )}
                  </div>
                </div>

                {accountStatus.hasAccount && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Onboarding</span>
                      <div className="flex items-center gap-2">
                        {accountStatus.onboardingComplete ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-green-600 font-medium">Complété</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                            <span className="text-orange-500 font-medium">En attente</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Statut</span>
                      <span className={`font-medium ${
                        accountStatus.status === 'active' ? 'text-green-600' :
                        accountStatus.status === 'pending' ? 'text-orange-500' :
                        'text-gray-500'
                      }`}>
                        {accountStatus.status === 'active' ? '✅ Actif' :
                         accountStatus.status === 'pending' ? '⏳ En attente' :
                         '❌ Inactif'}
                      </span>
                    </div>

                    {accountStatus.bankAccountLast4 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Compte bancaire</span>
                        <span className="font-mono text-gray-900">
                          •••• {accountStatus.bankAccountLast4}
                        </span>
                      </div>
                    )}

                    {accountStatus.accountId && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">ID du compte</span>
                        <span className="font-mono text-gray-600">
                          {accountStatus.accountId}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            {!accountStatus?.hasAccount && (
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="flex items-start gap-4">
                  <Building2 className="h-6 w-6 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Étape 1 : Créer votre compte Connect
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Créez un compte Stripe Connect pour recevoir des paiements
                    </p>
                    <Button
                      onClick={handleCreateAccount}
                      disabled={isCreatingAccount}
                      className="w-full sm:w-auto"
                    >
                      {isCreatingAccount ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Création...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Créer mon compte
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {accountStatus?.hasAccount && !accountStatus?.onboardingComplete && (
              <>
                <div className="p-6 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                  <div className="flex items-start gap-4">
                    <DollarSign className="h-6 w-6 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Étape 2 : Compléter l'onboarding
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        En production, vous serez redirigé vers Stripe pour vérifier votre identité
                        et ajouter vos informations bancaires.
                      </p>
                      <Button
                        onClick={handleStartOnboarding}
                        variant="outline"
                        className="w-full sm:w-auto mb-4"
                      >
                        Démarrer l'onboarding (DEMO)
                      </Button>

                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <p className="text-sm font-medium text-gray-900 mb-3">
                          🎭 Mode DEMO - Simuler la complétion :
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="4 derniers chiffres (ex: 4242)"
                            maxLength="4"
                            value={bankAccountLast4}
                            onChange={(e) => setBankAccountLast4(e.target.value.replace(/\D/g, ''))}
                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <Button
                            onClick={handleCompleteOnboarding}
                            disabled={isCompletingOnboarding || bankAccountLast4.length !== 4}
                          >
                            {isCompletingOnboarding ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Simuler'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {accountStatus?.onboardingComplete && accountStatus?.status === 'active' && (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-2">
                      ✅ Compte configuré avec succès !
                    </h3>
                    <p className="text-sm text-green-800 mb-4">
                      Vous pouvez maintenant recevoir des paiements en tant que prestataire.
                      Les fonds seront transférés automatiquement sur votre compte bancaire.
                    </p>
                    <Button
                      onClick={() => navigate('/dashboard')}
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-100"
                    >
                      Retour au dashboard
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Informations */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              💡 Comment ça fonctionne ?
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Vous recevez automatiquement votre part après chaque session</li>
              <li>• La plateforme prélève sa commission (10% par défaut)</li>
              <li>• Les fonds sont transférés sur votre compte bancaire</li>
              <li>• Vous pouvez suivre vos gains dans le dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

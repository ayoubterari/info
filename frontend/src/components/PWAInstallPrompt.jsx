import { useState, useEffect } from 'react'
import { Download, X, Share } from 'lucide-react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App already installed')
      return
    }

    // Vérifier si l'utilisateur a déjà refusé l'installation
    const hasDeclined = localStorage.getItem('pwa-install-declined')
    if (hasDeclined) {
      console.log('User has declined installation')
      return
    }

    // Détecter le système d'exploitation
    const userAgent = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(userAgent)
    const android = /android/.test(userAgent)
    
    setIsIOS(ios)
    setIsAndroid(android)

    console.log('Device detected:', { ios, android })

    // Écouter l'événement beforeinstallprompt (Android Chrome)
    const handler = (e) => {
      console.log('beforeinstallprompt event fired')
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Afficher le prompt après 3 secondes
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Pour iOS ou si beforeinstallprompt ne se déclenche pas, afficher quand même
    if (ios || android) {
      setTimeout(() => {
        console.log('Showing prompt for mobile device')
        setShowPrompt(true)
      }, 3000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return
    }

    // Afficher le prompt d'installation natif
    deferredPrompt.prompt()

    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice
    
    console.log(`User response to the install prompt: ${outcome}`)

    // Réinitialiser le prompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-declined', 'true')
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-gradient-to-br from-black via-gray-800 to-gray-700 text-white rounded-2xl shadow-2xl border border-gray-600 overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-full transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5">
          {/* Icon */}
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/10 rounded-lg">
              {isIOS ? <Share className="w-6 h-6" /> : <Download className="w-6 h-6" />}
            </div>
            <h3 className="text-lg font-bold">Installer FreeL AI</h3>
          </div>

          {/* Description */}
          <p className="text-gray-200 text-sm mb-4 leading-relaxed">
            {isIOS 
              ? "Installez l'application sur votre écran d'accueil pour un accès rapide !"
              : "Installez l'application pour un accès rapide et une meilleure expérience, même hors ligne !"
            }
          </p>

          {/* Instructions d'installation */}
          {!deferredPrompt && (
            <div className="bg-white/10 rounded-lg p-3 mb-4 text-xs text-gray-200">
              <p className="font-semibold mb-2">📱 Comment installer :</p>
              {isIOS ? (
                <ol className="space-y-1.5 list-decimal list-inside">
                  <li>Appuyez sur le bouton <Share className="w-3 h-3 inline mx-1" /> <strong>Partager</strong> en bas de Safari</li>
                  <li>Faites défiler et sélectionnez <strong>"Sur l'écran d'accueil"</strong></li>
                  <li>Appuyez sur <strong>"Ajouter"</strong> en haut à droite</li>
                </ol>
              ) : isAndroid ? (
                <ol className="space-y-1.5 list-decimal list-inside">
                  <li>Appuyez sur le menu <strong>⋮</strong> (3 points) en haut à droite</li>
                  <li>Sélectionnez <strong>"Installer l'application"</strong> ou <strong>"Ajouter à l'écran d'accueil"</strong></li>
                  <li>Confirmez l'installation</li>
                </ol>
              ) : (
                <p>Utilisez le menu de votre navigateur pour ajouter cette app à votre écran d'accueil.</p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            {deferredPrompt ? (
              <button
                onClick={handleInstall}
                className="flex-1 bg-white text-black px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Installer maintenant
              </button>
            ) : (
              <button
                onClick={handleDismiss}
                className="flex-1 bg-white text-black px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-all duration-300"
              >
                J'ai compris
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-white/10 transition-all duration-300"
            >
              Plus tard
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

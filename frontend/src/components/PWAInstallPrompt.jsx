import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // Vérifier si l'utilisateur a déjà refusé l'installation
    const hasDeclined = localStorage.getItem('pwa-install-declined')
    if (hasDeclined) {
      return
    }

    // Écouter l'événement beforeinstallprompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Afficher le prompt après 3 secondes
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

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

  if (!showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-gradient-to-br from-black via-gray-800 to-gray-700 text-white rounded-2xl shadow-2xl border border-gray-600 overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5">
          {/* Icon */}
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Installer FreeL AI</h3>
          </div>

          {/* Description */}
          <p className="text-gray-200 text-sm mb-4 leading-relaxed">
            Installez l'application pour un accès rapide et une meilleure expérience, même hors ligne !
          </p>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-white text-black px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Installer
            </button>
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

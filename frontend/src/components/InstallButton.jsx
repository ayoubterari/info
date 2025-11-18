import { Download } from 'lucide-react'

export default function InstallButton() {
  const handleClick = () => {
    // Réinitialiser le localStorage
    localStorage.removeItem('pwa-install-declined')
    
    // Recharger la page pour déclencher le prompt
    window.location.reload()
  }

  // Ne montrer que sur mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  
  if (!isMobile) {
    return null
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all"
      title="Installer l'application"
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Installer</span>
    </button>
  )
}

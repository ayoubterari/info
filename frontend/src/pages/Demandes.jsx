import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api.js'
import { ArrowLeft, Heart, Clock, Tag, FileText, Mic, ChevronRight, DollarSign } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import OfferModal from '../components/OfferModal'
import { useAuth } from '../contexts/AuthContext'

export default function Demandes() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const demandes = useQuery(api.demandes.getAllDemandes)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)
  const [selectedDemande, setSelectedDemande] = useState(null)

  const categories = [
    { value: 'all', label: 'Toutes' },
    { value: 'general', label: 'Général' },
    { value: 'moving', label: 'Déménagement' },
    { value: 'tech', label: 'Technologie' },
    { value: 'education', label: 'Éducation' },
    { value: 'other', label: 'Autre' },
  ]

  const filteredDemandes = demandes?.filter(
    (demande) => selectedCategory === 'all' || demande.category === selectedCategory
  )

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      in_progress: { label: 'En cours', color: 'bg-gray-100 text-gray-800' },
      completed: { label: 'Terminée', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Annulée', color: 'bg-gray-100 text-gray-800' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure'
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    if (diffInHours < 48) return 'Hier'
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="w-full min-h-screen bg-white text-black overflow-hidden flex flex-col">
      {/* Header */}
      <Header />

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mb-6 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Retour</span>
          </button>

          {/* Hero Section */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              <span className="block">Demandes d'aide</span>
              <span className="bg-gradient-to-r from-black via-gray-700 to-gray-500 bg-clip-text text-transparent">
                Trouvez comment aider
              </span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Parcourez les demandes et proposez votre aide
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category.value
                    ? 'bg-black text-white'
                    : 'bg-black/10 text-gray-700 hover:bg-black/20'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Demandes Grid */}
          {!demandes ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <p className="mt-4 text-gray-600">Chargement des demandes...</p>
            </div>
          ) : filteredDemandes?.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Aucune demande pour le moment</p>
            </div>
          ) : (
            <div className="grid gap-4 md:gap-6">
              {filteredDemandes?.map((demande) => (
                <div
                  key={demande._id}
                  className="relative group cursor-pointer"
                  onClick={() => {
                    // TODO: Navigate to demande detail page
                    console.log('View demande:', demande._id)
                  }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-black/20 to-black/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-white border-2 border-black/20 rounded-xl p-4 md:p-6 hover:border-black/40 transition-all duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg md:text-xl font-bold text-black line-clamp-1">
                                {demande.title}
                              </h3>
                              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-lg font-bold text-sm whitespace-nowrap">
                                <DollarSign className="w-4 h-4" />
                                <span>{demande.price.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(demande.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Tag className="w-3 h-3" />
                                <span className="capitalize">{demande.category}</span>
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(demande.status)}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                          {demande.description}
                        </p>

                        {/* Media Display */}
                        {(demande.audioUrl || (demande.fileUrls && demande.fileUrls.length > 0)) && (
                          <div className="space-y-3 mb-4">
                            {/* Audio Player */}
                            {demande.audioUrl && (
                              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="p-2 bg-black rounded-full">
                                    <Mic className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-black">Message audio</p>
                                    <p className="text-xs text-gray-600">Écoutez la description vocale</p>
                                  </div>
                                </div>
                                <audio 
                                  controls 
                                  className="w-full h-10 mt-2"
                                  src={demande.audioUrl}
                                >
                                  Votre navigateur ne supporte pas l'élément audio.
                                </audio>
                              </div>
                            )}

                            {/* Files List */}
                            {demande.fileUrls && demande.fileUrls.length > 0 && (
                              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="p-2 bg-black rounded-full">
                                    <FileText className="w-4 h-4 text-white" />
                                  </div>
                                  <p className="text-sm font-bold text-black">
                                    {demande.fileUrls.length} fichier{demande.fileUrls.length > 1 ? 's' : ''} joint{demande.fileUrls.length > 1 ? 's' : ''}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  {demande.fileUrls.map((file, index) => (
                                    <a
                                      key={index}
                                      href={file.url}
                                      download={file.name}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 bg-white border border-gray-200 p-3 rounded-lg hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer group"
                                    >
                                      <FileText className="w-4 h-4 text-gray-700 flex-shrink-0 group-hover:text-black" />
                                      <div className="flex-1 min-w-0">
                                        <span className="text-sm text-gray-900 font-medium truncate block group-hover:text-black">
                                          {file.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {(file.size / 1024).toFixed(1)} KB
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full font-semibold group-hover:bg-black group-hover:text-white transition-colors">
                                        #{index + 1}
                                      </span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action */}
                        <div className="flex items-center justify-between">
                          {user && demande.userId === user.userId ? (
                            <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-semibold cursor-not-allowed">
                              Votre demande
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedDemande(demande)
                                setIsOfferModalOpen(true)
                              }}
                              className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all"
                            >
                              Proposer mon aide
                            </button>
                          )}
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-black/10 backdrop-blur-md bg-white/40 py-3 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500">
          <p>© 2025 FreeL AI. Powered by multiple AI agents. Always learning, always improving.</p>
        </div>
      </footer>

      {/* Offer Modal */}
      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => {
          setIsOfferModalOpen(false)
          setSelectedDemande(null)
        }}
        demande={selectedDemande}
      />

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

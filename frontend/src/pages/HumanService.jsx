import { useState, useRef } from 'react'
import { Users, Heart, ArrowLeft, Mic, MicOff, Upload, X, FileText, Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api.js'
import Header from '../components/Header'
import AuthModal from '../components/AuthModal'
import { useAuth } from '../contexts/AuthContext'

export default function HumanService() {
  const navigate = useNavigate()
  const { user, signIn, signUp } = useAuth()
  const createDemande = useMutation(api.demandes.createDemande)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  
  const [needHelpForm, setNeedHelpForm] = useState({
    title: '',
    description: '',
    category: 'general',
    price: '',
    duration: ''
  })
  
  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  
  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState([])
  const fileInputRef = useRef(null)
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle auth submit
  const handleAuthSubmit = async (formData) => {
    try {
      if (authMode === 'signup') {
        await signUp(formData)
      } else {
        await signIn(formData)
      }
      // Fermer le modal après une connexion réussie
      setAuthModalOpen(false)
    } catch (error) {
      // L'erreur sera gérée par le modal AuthModal
      console.error('Erreur d\'authentification:', error)
    }
  }

  // Handle login button click
  const handleLoginClick = () => {
    setAuthMode('signin')
    setAuthModalOpen(true)
  }

  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioBlob(audioBlob)
        setAudioUrl(url)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Impossible d\'accéder au microphone. Veuillez vérifier les permissions.')
    }
  }

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Remove audio recording
  const removeAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setUploadedFiles(prev => [...prev, ...files])
  }

  // Remove a file
  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleNeedHelpSubmit = async (e) => {
    e.preventDefault()
    
    // Vérifier l'authentification
    if (!user?.userId) {
      alert('Vous devez être connecté pour soumettre une demande')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Upload audio file if exists
      let audioStorageId = undefined
      if (audioBlob) {
        const uploadUrl = await generateUploadUrl()
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": audioBlob.type },
          body: audioBlob,
        })
        const { storageId } = await result.json()
        audioStorageId = storageId
      }

      // Upload files if exist
      let fileStorageIds = undefined
      if (uploadedFiles.length > 0) {
        fileStorageIds = await Promise.all(
          uploadedFiles.map(async (file) => {
            const uploadUrl = await generateUploadUrl()
            const result = await fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": file.type },
              body: file,
            })
            const { storageId } = await result.json()
            return {
              storageId,
              name: file.name,
              size: file.size,
            }
          })
        )
      }
      
      await createDemande({
        userId: user.userId,
        title: needHelpForm.title,
        category: needHelpForm.category,
        description: needHelpForm.description,
        price: parseFloat(needHelpForm.price) || 0,
        duration: needHelpForm.duration ? parseInt(needHelpForm.duration) : undefined,
        audioStorageId,
        fileStorageIds,
      })
      
      alert('Votre demande d\'aide a été enregistrée avec succès! Vous allez être redirigé vers la page des offres.')
      
      // Rediriger vers la page des offres
      navigate('/offres')
    } catch (error) {
      console.error('Error submitting demande:', error)
      alert('Erreur lors de l\'enregistrement de la demande. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
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
            <span className="text-sm font-semibold">Retour à l'accueil</span>
          </button>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
              <span className="block">Human Service</span>
              <span className="bg-gradient-to-r from-black via-gray-700 to-gray-500 bg-clip-text text-transparent">
                Entraide Communautaire
              </span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              Connectez-vous avec d'autres personnes pour demander ou offrir de l'aide
            </p>
          </div>

          {/* First Row: Two Blocks Grid */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Block 1: J'ai besoin d'aide */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-black/20 to-black/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white border-2 border-black/20 rounded-xl p-6 hover:border-black/40 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-black/10 rounded-lg">
                    <Heart className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-black">J'ai besoin d'aide</h2>
                    <p className="text-sm text-gray-600">Décrivez votre besoin</p>
                  </div>
                </div>

                <form onSubmit={handleNeedHelpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Titre de la demande
                    </label>
                    <input
                      type="text"
                      value={needHelpForm.title}
                      onChange={(e) => setNeedHelpForm({ ...needHelpForm, title: e.target.value })}
                      placeholder="Ex: Aide pour déménagement"
                      className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-black focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                      required
                      disabled={!user}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={needHelpForm.category}
                      onChange={(e) => setNeedHelpForm({ ...needHelpForm, category: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-black focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                      disabled={!user}
                    >
                      <option value="general">Général</option>
                      <option value="moving">Déménagement</option>
                      <option value="tech">Technologie</option>
                      <option value="education">Éducation</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Prix proposé ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={needHelpForm.price}
                          onChange={(e) => setNeedHelpForm({ ...needHelpForm, price: e.target.value })}
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-2 border-2 border-black/20 rounded-lg focus:border-black focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                          required
                          disabled={!user}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Montant que vous êtes prêt à payer</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Durée estimée (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={needHelpForm.duration}
                        onChange={(e) => setNeedHelpForm({ ...needHelpForm, duration: e.target.value })}
                        placeholder="30"
                        className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-black focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                        disabled={!user}
                      />
                      <p className="text-xs text-gray-500 mt-1">Temps estimé pour l'aide</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description détaillée
                    </label>
                    <textarea
                      value={needHelpForm.description}
                      onChange={(e) => setNeedHelpForm({ ...needHelpForm, description: e.target.value })}
                      placeholder="Décrivez en détail ce dont vous avez besoin..."
                      className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-black focus:outline-none transition-colors resize-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                      rows="4"
                      required
                      disabled={!user}
                    />
                  </div>

                  {/* Audio Recording */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Enregistrement audio (optionnel)
                    </label>
                    <div className="flex items-center gap-2">
                      {!audioUrl ? (
                        <button
                          type="button"
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 ${
                            isRecording
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-black/10 text-black hover:bg-black/20'
                          }`}
                          disabled={!user}
                        >
                          {isRecording ? (
                            <>
                              <MicOff className="w-4 h-4" />
                              <span>Arrêter</span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-4 h-4" />
                              <span>Enregistrer</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          <audio src={audioUrl} controls className="flex-1" />
                          <button
                            type="button"
                            onClick={removeAudio}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    {isRecording && (
                      <p className="text-xs text-red-500 mt-1 animate-pulse">
                        Enregistrement en cours...
                      </p>
                    )}
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fichiers joints (optionnel)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-black/10 text-black rounded-lg hover:bg-black/20 transition-colors font-semibold text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                      disabled={!user}
                    >
                      <Upload className="w-4 h-4" />
                      <span>Ajouter des fichiers</span>
                    </button>
                    
                    {/* Display uploaded files */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-black/5 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {user ? (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                        isSubmitting
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-black text-white hover:bg-gray-800 hover:shadow-lg hover:shadow-black/30'
                      }`}
                    >
                      {isSubmitting ? 'Enregistrement...' : 'Publier ma demande'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLoginClick}
                      className="w-full py-3 rounded-lg font-semibold transition-all duration-300 bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg hover:shadow-gray-600/30"
                    >
                      Connectez-vous pour publier
                    </button>
                  )}
                </form>
              </div>
            </div>

            {/* Block 2: Services disponibles */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-black/20 to-black/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white border-2 border-black/20 rounded-xl p-6 hover:border-black/40 transition-all duration-300 flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="inline-flex p-3 bg-black/10 rounded-full">
                      <Users className="w-10 h-10 text-black" />
                    </div>
                    <div className="inline-flex p-3 bg-black/10 rounded-full">
                      <Briefcase className="w-10 h-10 text-black" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-black mb-2">Services & Offres</h2>
                  <p className="text-sm text-gray-600 max-w-sm">
                    Proposez vos services ou trouvez des professionnels
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <button
                    onClick={() => navigate('/demandes')}
                    className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:shadow-black/30"
                  >
                    Voir les demandes
                  </button>
                  <button
                    onClick={() => navigate('/offres')}
                    className="flex-1 px-6 py-3 bg-white text-black border-2 border-black rounded-lg font-semibold hover:bg-black hover:text-white transition-all duration-300"
                  >
                    Voir les offres
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-black/10 backdrop-blur-md bg-white/40 py-3 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500">
          <p>© 2025 FreeL AI. Powered by multiple AI agents. Always learning, always improving.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSubmit={handleAuthSubmit}
      />
    </div>
  )
}

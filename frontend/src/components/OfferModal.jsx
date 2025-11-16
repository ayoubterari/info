import { useState, useRef } from 'react'
import { X, Mic, MicOff, DollarSign } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api.js'
import AuthModal from './AuthModal'
import { useAuth } from '../contexts/AuthContext'

export default function OfferModal({ isOpen, onClose, demande }) {
  const { user, signIn, signUp } = useAuth()
  const createOffre = useMutation(api.offres.createOffre)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  
  const [proposedPrice, setProposedPrice] = useState(demande?.price || 0)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Vérifier l'authentification
    if (!user?.userId) {
      alert('Vous devez être connecté pour proposer une offre')
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

      await createOffre({
        demandeId: demande._id,
        userId: user.userId,
        proposedPrice: parseFloat(proposedPrice),
        message: message,
        audioStorageId,
      })

      alert('Votre offre a été soumise avec succès!')
      onClose()
      
      // Reset form
      setProposedPrice(demande?.price || 0)
      setMessage('')
      removeAudio()
    } catch (error) {
      console.error('Error submitting offer:', error)
      alert('Erreur lors de la soumission de l\'offre. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-black">Proposer mon aide</h2>
            <p className="text-sm text-gray-600 mt-1">Pour: {demande?.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Original Price Display */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Prix initial proposé par le demandeur</p>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-700" />
              <span className="text-2xl font-bold text-gray-900">{demande?.price.toFixed(2)}</span>
            </div>
          </div>

          {/* Proposed Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Votre prix proposé ($)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
              <input
                type="number"
                min={demande?.price || 0}
                step="0.01"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border-2 border-black/20 rounded-lg focus:border-black focus:outline-none transition-colors text-lg font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                required
                disabled={!user}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Vous pouvez augmenter le prix ou le laisser inchangé
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Votre message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Expliquez pourquoi vous êtes la personne idéale pour cette tâche..."
              className="w-full px-4 py-3 border-2 border-black/20 rounded-lg focus:border-black focus:outline-none transition-colors resize-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
              rows="4"
              required
              disabled={!user}
            />
          </div>

          {/* Audio Recording */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message audio (optionnel)
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

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Annuler
            </button>
            {user ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  isSubmitting
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800 hover:shadow-lg'
                }`}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Soumettre mon offre'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLoginClick}
                className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg"
              >
                Connectez-vous pour proposer
              </button>
            )}
          </div>
        </form>
      </div>

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

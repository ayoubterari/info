import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAuth } from '../../contexts/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Mic, MicOff, Upload, X, FileText, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react'

export function CreateDemandeModal({ open, onOpenChange, onSuccess }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const createDemande = useMutation(api.demandes.createDemande)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    price: '',
    duration: ''
  })

  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const [uploadedFiles, setUploadedFiles] = useState([])
  const fileInputRef = useRef(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const steps = [
    { number: 1, title: 'Informations', icon: Sparkles },
    { number: 2, title: 'Détails', icon: FileText },
    { number: 3, title: 'Médias', icon: Upload },
  ]

  const categories = [
    { value: 'general', label: 'Général' },
    { value: 'technique', label: 'Technique' },
    { value: 'conseil', label: 'Conseil' },
    { value: 'service', label: 'Service' },
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

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
      alert('Impossible d\'accéder au microphone.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const removeAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioBlob(null)
    setAudioUrl(null)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Vérifier l'authentification
    if (!user?.userId) {
      alert('Vous devez être connecté pour créer une demande')
      return
    }
    
    setIsSubmitting(true)

    try {
      let audioStorageId = undefined
      if (audioBlob) {
        const uploadUrl = await generateUploadUrl()
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': audioBlob.type },
          body: audioBlob,
        })
        const { storageId } = await result.json()
        audioStorageId = storageId
      }

      let fileStorageIds = undefined
      if (uploadedFiles.length > 0) {
        fileStorageIds = await Promise.all(
          uploadedFiles.map(async (file) => {
            const uploadUrl = await generateUploadUrl()
            const result = await fetch(uploadUrl, {
              method: 'POST',
              headers: { 'Content-Type': file.type },
              body: file,
            })
            const { storageId } = await result.json()
            return { storageId, name: file.name, size: file.size }
          })
        )
      }

      await createDemande({
        userId: user.userId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        audioStorageId,
        fileStorageIds,
      })

      // Reset form
      setFormData({ title: '', description: '', category: 'general', price: '', duration: '' })
      setAudioBlob(null)
      setAudioUrl(null)
      setUploadedFiles([])
      
      onSuccess?.()
      onOpenChange(false)
      
      // Rediriger vers la page des offres
      alert('Votre demande a été créée avec succès! Vous allez être redirigé vers la page des offres.')
      navigate('/offres')
    } catch (error) {
      console.error('Error creating demande:', error)
      alert('Erreur lors de la création de la demande')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const canProceed = () => {
    if (currentStep === 1) return formData.title && formData.category
    if (currentStep === 2) return formData.description && formData.price
    return true
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'max-w-full h-full m-0 rounded-none' : 'max-w-2xl'} max-h-[100vh] overflow-hidden p-0`}>
        {/* Header créatif avec gradient */}
        <div className="relative bg-gradient-to-br from-black via-gray-800 to-gray-700 text-white p-6 pb-8">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Nouvelle Demande
              </DialogTitle>
              <DialogDescription className="text-gray-200 text-sm mt-2">
                Créez votre demande en {steps.length} étapes simples
              </DialogDescription>
            </DialogHeader>

            {/* Progress Steps - Mobile Optimized */}
            {isMobile && (
              <div className="mt-6 flex justify-between items-center">
                {steps.map((step, index) => {
                  const StepIcon = step.icon
                  const isActive = currentStep === step.number
                  const isCompleted = currentStep > step.number
                  
                  return (
                    <div key={step.number} className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : isActive ? 'bg-white text-black' : 'bg-white/20'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <StepIcon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-white'}`} />
                        )}
                      </div>
                      <span className={`text-xs mt-2 ${isActive ? 'text-white font-semibold' : 'text-gray-300'}`}>
                        {step.title}
                      </span>
                      {index < steps.length - 1 && (
                        <div className={`absolute h-0.5 w-16 top-5 transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-white/20'
                        }`} style={{ left: `calc(${(index + 1) * 33.33}% - 2rem)` }} />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Informations */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-base font-semibold">Quel est votre besoin ? *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Besoin d'aide pour créer un site web..."
                  required
                  disabled={!user}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="category" className="text-base font-semibold">Catégorie *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        formData.category === cat.value
                          ? 'border-black bg-black text-white shadow-lg'
                          : 'border-gray-200 bg-white hover:border-gray-400'
                      }`}
                    >
                      <span className="font-semibold">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Détails */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-3">
                <Label htmlFor="description" className="text-base font-semibold">Décrivez votre besoin *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Expliquez en détail ce dont vous avez besoin..."
                  rows={6}
                  required
                  disabled={!user}
                  className="text-base resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="price" className="text-base font-semibold">Prix (USD) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="50.00"
                      required
                      disabled={!user}
                      className="h-12 pl-8 text-base"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="duration" className="text-base font-semibold">Durée (min)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="30"
                    disabled={!user}
                    className="h-12 text-base"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Médias */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Audio Recording */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Message vocal (optionnel)</Label>
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl">
                  {!audioUrl ? (
                    <Button
                      type="button"
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={!user}
                      className="w-full h-12"
                    >
                      {isRecording ? (
                        <><MicOff className="mr-2 h-5 w-5" /> Arrêter l'enregistrement</>
                      ) : (
                        <><Mic className="mr-2 h-5 w-5" /> Enregistrer un message</>
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <audio src={audioUrl} controls className="flex-1" />
                      <Button type="button" variant="ghost" size="sm" onClick={removeAudio}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Fichiers joints (optionnel)</Label>
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!user}
                    className="w-full h-12"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Ajouter des fichiers
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <span className="text-sm flex-1 truncate">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer avec boutons de navigation */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex-1 h-12"
              >
                <ChevronLeft className="mr-2 h-5 w-5" />
                Précédent
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-12"
              >
                Annuler
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex-1 h-12 bg-black text-white hover:bg-gray-800"
              >
                Suivant
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || !user}
                className="flex-1 h-12 bg-green-600 text-white hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Créer la demande
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
      
      {/* Styles pour les animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </Dialog>
  )
}

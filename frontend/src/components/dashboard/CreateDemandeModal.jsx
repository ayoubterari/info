import { useState, useRef } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAuth } from '../../hooks/useAuth'
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
import { Mic, MicOff, Upload, X, FileText } from 'lucide-react'

export function CreateDemandeModal({ open, onOpenChange, onSuccess }) {
  const { user } = useAuth()
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
        userId: user?.userId,
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
    } catch (error) {
      console.error('Error creating demande:', error)
      alert('Erreur lors de la création de la demande')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle Demande d'Aide</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire pour créer une nouvelle demande
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ex: Besoin d'aide pour..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              required
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Décrivez votre besoin en détail..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix proposé (USD) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Ex: 50.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Durée estimée (minutes)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="1"
                step="1"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="Ex: 30"
              />
            </div>
          </div>

          {/* Audio Recording */}
          <div className="space-y-2">
            <Label>Message vocal (optionnel)</Label>
            <div className="flex items-center gap-2">
              {!audioUrl ? (
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? (
                    <><MicOff className="mr-2 h-4 w-4" /> Arrêter</>
                  ) : (
                    <><Mic className="mr-2 h-4 w-4" /> Enregistrer</>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <audio src={audioUrl} controls className="flex-1" />
                  <Button type="button" variant="ghost" size="sm" onClick={removeAudio}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Fichiers joints (optionnel)</Label>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
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
                <div className="space-y-1">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm flex-1">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer la demande'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

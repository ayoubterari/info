import { useState, useRef } from 'react'
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
import { Mic, MicOff, Upload, X, FileText } from 'lucide-react'

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

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'technique', label: 'Technical' },
    { value: 'conseil', label: 'Advice' },
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
      
      // Redirect to offers page
      alert('Your request has been created successfully! You will be redirected to the offers page.')
      navigate('/offres')
    } catch (error) {
      console.error('Error creating demande:', error)
      alert('Error creating the request')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg sm:text-xl">New Help Request</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Fill out the form to create a new request
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ex: Need help with..."
              required
              disabled={!user}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
              required
              disabled={!user}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your need in detail..."
              rows={3}
              required
              disabled={!user}
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs sm:text-sm">Price (USD) *</Label>
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
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="duration" className="text-xs sm:text-sm">Duration (min)</Label>
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
                className="text-sm"
              />
            </div>
          </div>

          {/* Audio Recording & File Upload - Same Line */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Audio Recording */}
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Voice</Label>
              <div className="flex items-center gap-2">
                {!audioUrl ? (
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!user}
                    className="w-full text-xs sm:text-sm"
                  >
                    {isRecording ? (
                      <><MicOff className="h-3 w-3 sm:h-4 sm:w-4" /></>
                    ) : (
                      <><Mic className="h-3 w-3 sm:h-4 sm:w-4" /></>
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center gap-1 flex-1">
                    <audio src={audioUrl} controls className="w-full h-8" />
                    <Button type="button" variant="ghost" size="sm" onClick={removeAudio} className="p-1">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Files</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={!user}
                className="w-full text-xs sm:text-sm"
              >
                <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-1">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded text-xs">
                  <FileText className="h-3 w-3 text-gray-500 flex-shrink-0" />
                  <span className="flex-1 truncate">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !user}>
              {isSubmitting ? 'Creating...' : !user ? 'Sign in first' : 'Create Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Separator } from '../components/ui/separator'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { User, Mail, Calendar, Shield, ArrowLeft, Save, Trash2 } from 'lucide-react'

export default function Profile() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const updateProfileMutation = useMutation(api.users.updateProfile)
  const deleteAccountMutation = useMutation(api.users.deleteAccount)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (!loading && !user) {
      navigate('/')
    }
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      })
    }
  }, [user, loading, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const result = await updateProfileMutation({
        userId: user.userId,
        name: formData.name,
        email: formData.email,
      })

      // Mettre à jour le localStorage
      const updatedUser = {
        ...user,
        name: result.name,
        email: result.email,
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      window.location.reload() // Recharger pour mettre à jour le contexte

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès!' })
      setIsEditing(false)
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte? Cette action est irréversible.')) {
      return
    }

    try {
      await deleteAccountMutation({ userId: user.userId })
      signOut()
      navigate('/')
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la suppression' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mon Profil</h1>
          <p className="text-gray-500 mt-1">Gérez vos informations personnelles</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Sidebar - Informations de base */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-2xl bg-black text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              
              <Separator className="my-4" />
              
              <div className="w-full space-y-3">
                <div className="flex items-center text-sm">
                  <Shield className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Rôle:</span>
                  <span className="ml-auto font-medium capitalize">{user.role}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Membre depuis</span>
                  <span className="ml-auto font-medium">
                    {new Date().toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content - Formulaire de modification */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Modifiez vos informations de profil
                </CardDescription>
              </CardHeader>
              <CardContent>
                {message.text && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    message.type === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <User className="inline mr-2 h-4 w-4" />
                      Nom complet
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="inline mr-2 h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    {!isEditing ? (
                      <Button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="w-full"
                      >
                        Modifier le profil
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="submit"
                          disabled={isSaving}
                          className="flex-1"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false)
                            setFormData({
                              name: user.name || '',
                              email: user.email || '',
                            })
                            setMessage({ type: '', text: '' })
                          }}
                        >
                          Annuler
                        </Button>
                      </>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Zone dangereuse */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Zone dangereuse</CardTitle>
                <CardDescription>
                  Actions irréversibles sur votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-red-900">Supprimer le compte</h3>
                      <p className="text-sm text-red-700">
                        Supprime définitivement votre compte et toutes vos données
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

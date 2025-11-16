import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import { AdminHeader } from '../components/admin/AdminHeader'
import { UserManagementTable } from '../components/admin/UserManagementTable'
import { EditUserModal } from '../components/admin/EditUserModal'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function AdminUsers() {
  const { user, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const [editingUser, setEditingUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (loading) return
    
    if (!user) {
      navigate('/')
    } else if (user.role?.toLowerCase() !== 'admin') {
      navigate('/dashboard')
    }
  }, [user, navigate, loading])

  // Récupérer tous les utilisateurs
  const allUsers = useQuery(api.users.getAllUsers) || []
  
  // Mutations pour gérer les utilisateurs
  const updateUserMutation = useMutation(api.users.updateUser)
  const deleteUserMutation = useMutation(api.users.deleteUser)

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  const handleEditUser = (userToEdit) => {
    setEditingUser(userToEdit)
    setIsModalOpen(true)
  }

  const handleSaveUser = async (updatedUser) => {
    try {
      await updateUserMutation({
        id: updatedUser.id,
        name: updatedUser.name,
        role: updatedUser.role,
      })
      alert('Utilisateur mis à jour avec succès')
    } catch (error) {
      alert('Erreur lors de la mise à jour: ' + error.message)
    }
  }

  const handleDeleteUser = async (userToDelete) => {
    if (userToDelete.id === user.userId) {
      alert('Vous ne pouvez pas supprimer votre propre compte !')
      return
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userToDelete.name} ?`)) {
      try {
        await deleteUserMutation({ id: userToDelete.id })
        alert('Utilisateur supprimé avec succès')
      } catch (error) {
        alert('Erreur lors de la suppression: ' + error.message)
      }
    }
  }

  const handleToggleStatus = async (userToToggle) => {
    if (userToToggle.id === user.userId) {
      alert('Vous ne pouvez pas désactiver votre propre compte !')
      return
    }

    const newStatus = !userToToggle.isActive
    console.log(`${newStatus ? 'Activer' : 'Désactiver'} l'utilisateur:`, userToToggle)
    // TODO: Implémenter la mutation pour changer le statut
  }

  const handleChangeRole = async (userToUpdate, newRole) => {
    if (userToUpdate.id === user.userId) {
      alert('Vous ne pouvez pas changer votre propre rôle !')
      return
    }

    try {
      await updateUserMutation({ 
        id: userToUpdate.id, 
        role: newRole 
      })
      alert('Rôle mis à jour avec succès')
    } catch (error) {
      alert('Erreur lors de la mise à jour: ' + error.message)
    }
  }

  // Préparer les données pour la table
  const usersForTable = allUsers.map(u => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role || 'user',
    isActive: true, // Par défaut actif (à implémenter dans le schéma)
    createdAt: u.createdAt || Date.now(),
  }))

  // Afficher un écran de chargement
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Ne rien afficher si pas admin
  if (!user || user.role?.toLowerCase() !== 'admin') {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar onLogout={handleLogout} />
      
      <div className="flex-1 lg:ml-64 overflow-auto">
        <AdminHeader user={user} />
        
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="text-gray-500 mt-1">
              Gérez les utilisateurs, leurs rôles et leurs permissions
            </p>
          </div>

          <UserManagementTable
            users={usersForTable}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleStatus}
            onChangeRole={handleChangeRole}
          />
        </main>
      </div>

      {/* Modal d'édition */}
      <EditUserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingUser(null)
        }}
        user={editingUser}
        onSave={handleSaveUser}
      />
    </div>
  )
}

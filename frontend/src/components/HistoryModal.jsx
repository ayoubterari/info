import { useState } from 'react';
import { X, Trash2, MessageSquare, Clock, Sparkles } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api.js';
import { useAuth } from '../contexts/AuthContext';

export default function HistoryModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  
  // Récupérer l'historique filtré par utilisateur
  const conversations = useQuery(
    api.conversations.getConversations,
    user?.userId ? { userId: user.userId, limit: 50 } : "skip"
  );
  const deleteConversation = useMutation(api.conversations.deleteConversation);
  const clearHistory = useMutation(api.conversations.clearHistory);

  const handleDelete = async (id) => {
    if (confirm('Supprimer cette conversation ?')) {
      await deleteConversation({ id });
    }
  };

  const handleClearAll = async () => {
    if (confirm('Supprimer tout l\'historique ? Cette action est irréversible.')) {
      await clearHistory({ userId: user?.userId });
      setSelectedConversation(null);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Il y a quelques minutes';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)} heures`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-5xl h-[80vh] bg-white rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Sidebar - Liste des conversations */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock size={24} className="text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Historique</h2>
                <p className="text-sm text-gray-500">
                  {conversations?.length || 0} conversations
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Liste des conversations */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {conversations && conversations.length > 0 ? (
              conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    selectedConversation?._id === conv._id
                      ? 'bg-gray-50 border-2 border-gray-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <MessageSquare size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-blue-600">
                        {conv.agentName}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(conv.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {conv.userMessage}
                  </p>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Sparkles size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm">
                  Aucune conversation pour le moment
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Vos conversations avec l'IA apparaîtront ici
                </p>
              </div>
            )}
          </div>

          {/* Footer - Bouton Clear All */}
          {conversations && conversations.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleClearAll}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                <span className="text-sm font-medium">Tout supprimer</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Content - Détails de la conversation */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header de la conversation */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        {selectedConversation.agentName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(selectedConversation.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedConversation.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedConversation._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Contenu de la conversation */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Message utilisateur */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-gray-600 text-white rounded-2xl rounded-tr-sm p-4 shadow-md">
                    <p className="text-sm font-medium mb-1">Vous</p>
                    <p className="text-base leading-relaxed">
                      {selectedConversation.userMessage}
                    </p>
                  </div>
                </div>

                {/* Réponse IA */}
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm p-4 shadow-md">
                    <p className="text-sm font-medium text-blue-600 mb-2">
                      {selectedConversation.agentName}
                    </p>
                    <div className="text-base leading-relaxed whitespace-pre-wrap">
                      {selectedConversation.aiResponse}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare size={64} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-gray-500 text-sm max-w-md">
                Choisissez une conversation dans la liste pour voir les détails
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react'
import { Send, Sparkles, Code, Zap, Brain, Lightbulb, Clock, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api.js'
import ResponseModal from '../components/ResponseModal'
import HistoryModal from '../components/HistoryModal'
import AuthModal from '../components/AuthModal'
import Header from '../components/Header'
import { useOpenAI } from '../hooks/useOpenAI'
import { useAuth } from '../contexts/AuthContext'

const agents = [
  { id: 1, name: 'GPT-4', icon: Brain, color: 'from-purple-600 to-purple-400' },
  { id: 2, name: 'Claude', icon: Zap, color: 'from-blue-600 to-blue-400' },
  { id: 3, name: 'Student', icon: Sparkles, color: 'from-orange-600 to-orange-400' },
  { id: 4, name: 'Code Expert', icon: Code, color: 'from-green-600 to-green-400' },
  { id: 5, name: 'Creative', icon: Lightbulb, color: 'from-pink-600 to-pink-400' },
]

export default function Home() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [selectedAgent, setSelectedAgent] = useState(agents[0]) // Default to GPT-4
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [modalResponse, setModalResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { generateResponse } = useOpenAI()
  const { user, signIn, signUp } = useAuth()
  const saveConversation = useMutation(api.conversations.saveConversation)
  const incrementQuestionCount = useMutation(api.userQuestions.incrementQuestionCount)
  
  // Vérifier la limite de questions
  const userStats = useQuery(
    api.userQuestions.getUserStats,
    user?.userId ? { userId: user.userId } : "skip"
  )
  
  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signin')

  // Réinitialiser les messages quand l'utilisateur change
  useEffect(() => {
    setMessages([])
    setPrompt('')
    setModalResponse('')
    setIsModalOpen(false)
  }, [user?.userId])

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
    
    if (prompt.trim()) {
      const userPrompt = prompt
      
      // Add user message
      setMessages([...messages, { role: 'user', content: userPrompt, agent: selectedAgent.name }])
      
      // Clear prompt and show loading
      setPrompt('')
      setIsLoading(true)
      setModalResponse('Génération de la réponse en cours...')
      setIsModalOpen(true)
      
      try {
        // Vérifier l'authentification
        if (!user?.userId) {
          throw new Error("Vous devez être connecté pour poser une question à l'IA")
        }

        // Vérifier la limite de questions
        if (userStats && userStats.remaining <= 0) {
          setIsLoading(false)
          setIsModalOpen(false)
          alert(`Vous avez atteint votre limite de ${userStats.questionsLimit} questions. Vous allez être redirigé vers la section "J'ai besoin d'aide" pour obtenir de l'assistance humaine.`)
          navigate('/human-service')
          return
        }

        // Call OpenAI API through Convex
        const result = await generateResponse(userPrompt, selectedAgent.name, user.userId)
        
        // Incrémenter le compteur de questions
        await incrementQuestionCount({ userId: user.userId })
        
        // Update modal with response
        setModalResponse(result.response)
        setIsLoading(false)
        
        // Add AI response to messages
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: result.response, 
          agent: selectedAgent.name 
        }])

        // Sauvegarder la conversation dans l'historique
        try {
          await saveConversation({
            userId: user.userId,
            userMessage: userPrompt,
            aiResponse: result.response,
            agentName: selectedAgent.name,
          })
        } catch (error) {
          console.error('Erreur lors de la sauvegarde:', error)
        }
      } catch (error) {
        console.error('Erreur:', error)
        setModalResponse(`Erreur: ${error.message || 'Impossible de générer une réponse'}`)
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="w-full h-screen bg-white text-black overflow-hidden flex flex-col">
      {/* Header */}
      <Header />

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 md:py-0">
        {/* Hero Section */}
        {(
          <div className="text-center mb-10 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-5">
              <span className="block">Ask Anything</span>
              <span className="bg-gradient-to-r from-black via-gray-700 to-gray-500 bg-clip-text text-transparent">Get Everything</span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-6">
              Harness the power of multiple AI agents. Choose your expert, ask your question, and get instant answers.
            </p>
          </div>
        )}

        {/* Agent Selector */}
        <div className="w-full max-w-4xl mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-gray-700">Select AI Agent</label>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden text-xs bg-black/10 hover:bg-black/20 border border-black/20 px-2 py-0.5 rounded-full transition"
            >
              {isExpanded ? 'Hide' : 'Show'} All
            </button>
          </div>

          {/* Agent Grid - Desktop */}
          <div className="hidden md:grid grid-cols-5 gap-2 mb-5">
            {agents.map((agent) => {
              const Icon = agent.icon
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`group relative p-3 rounded-lg border-2 transition-all duration-300 ${
                    selectedAgent.id === agent.id
                      ? 'border-black bg-black/10 shadow-lg shadow-black/20'
                      : 'border-black/20 bg-black/5 hover:border-black/40 hover:bg-black/10'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Icon className={`w-5 h-5 transition-all ${
                      selectedAgent.id === agent.id ? 'text-black' : 'text-gray-600 group-hover:text-gray-800'
                    }`} />
                    <span className={`text-xs font-semibold transition-all ${
                      selectedAgent.id === agent.id ? 'text-black' : 'text-gray-600 group-hover:text-gray-800'
                    }`}>
                      {agent.name}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Agent Carousel - Mobile */}
          <div className="md:hidden mb-5">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {agents.map((agent) => {
                const Icon = agent.icon
                return (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent(agent)
                      setIsExpanded(false)
                    }}
                    className={`flex-shrink-0 p-2 rounded-lg border-2 transition-all ${
                      selectedAgent.id === agent.id
                        ? 'border-black bg-black/10'
                        : 'border-black/20 bg-black/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${
                      selectedAgent.id === agent.id ? 'text-black' : 'text-gray-600'
                    }`} />
                  </button>
                )
              })}
            </div>
            {isExpanded && (
              <div className="grid grid-cols-2 gap-2">
                {agents.map((agent) => {
                  const Icon = agent.icon
                  return (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgent(agent)
                        setIsExpanded(false)
                      }}
                      className={`p-2 rounded-lg border-2 transition-all text-left ${
                        selectedAgent.id === agent.id
                          ? 'border-black bg-black/10'
                          : 'border-black/20 bg-black/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${
                        selectedAgent.id === agent.id ? 'text-black' : 'text-gray-600'
                      }`} />
                      <p className={`text-xs font-semibold ${
                        selectedAgent.id === agent.id ? 'text-black' : 'text-gray-600'
                      }`}>
                        {agent.name}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Selected Agent Info */}
          <div className="flex items-center gap-2 p-3 bg-black/5 border border-black/10 rounded-lg mb-5">
            {(() => {
              const Icon = selectedAgent.icon
              return <Icon className="w-4 h-4 text-black" />
            })()}
            <div className="flex-1">
              <p className="text-xs text-gray-600">Current Agent</p>
              <p className="text-xs font-semibold text-black">{selectedAgent.name}</p>
            </div>
            {user && userStats && (
              <div className="text-right">
                <p className="text-xs text-gray-600">Questions restantes</p>
                <p className={`text-xs font-semibold ${userStats.remaining <= 1 ? 'text-red-600' : 'text-green-600'}`}>
                  {userStats.remaining}/{userStats.questionsLimit}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="w-full max-w-4xl">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-black/20 to-black/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

            {/* Input container */}
            <div className="relative bg-white border-2 border-black/20 rounded-xl p-3 md:p-5 hover:border-black/40 transition-all duration-300 focus-within:border-black focus-within:shadow-lg focus-within:shadow-black/10">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={user ? "Ask anything... Describe your idea, ask a question, or request code..." : "Connectez-vous pour poser une question..."}
                className="w-full bg-transparent text-black placeholder-gray-500 outline-none resize-none text-sm md:text-base leading-relaxed disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                rows="3"
                maxLength="2000"
                disabled={!user}
              />

              {/* Avertissement limite de questions */}
              {user && userStats && userStats.remaining <= 1 && userStats.remaining > 0 && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Attention : Il vous reste seulement {userStats.remaining} question{userStats.remaining > 1 ? 's' : ''}. 
                    Après cela, vous serez redirigé vers "J'ai besoin d'aide" pour une assistance humaine.
                  </p>
                </div>
              )}

              {/* Footer with character count and submit */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{prompt.length}/2000</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Bouton Human Service */}
                  <button
                    type="button"
                    onClick={() => navigate('/human-service')}
                    className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-all duration-300"
                    title="Service d'entraide"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Human Service</span>
                  </button>

                  {/* Bouton Historique */}
                  <button
                    type="button"
                    onClick={() => setHistoryModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-all duration-300"
                    title="Historique des conversations"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Historique</span>
                  </button>

                  {/* Bouton Send ou Login */}
                  {user ? (
                    <button
                      type="submit"
                      disabled={!prompt.trim()}
                      className={`flex items-center gap-2 px-5 py-1.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                        prompt.trim()
                          ? 'bg-black text-white hover:bg-gray-800 hover:shadow-lg hover:shadow-black/30 cursor-pointer'
                          : 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLoginClick}
                      className="flex items-center gap-2 px-5 py-1.5 rounded-lg font-semibold text-sm transition-all duration-300 bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg hover:shadow-gray-600/30"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Connectez-vous</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {messages.length === 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {user && [
                'Explain quantum computing',
                'Write a React component',
                'Design a landing page',
                'Debug this code',
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(suggestion)}
                  className="p-2 text-left text-xs text-gray-600 border border-black/10 rounded-lg hover:border-black/30 hover:bg-black/5 transition-all duration-300 group"
                >
                  <span className="group-hover:text-black transition-colors">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </form>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-black/10 backdrop-blur-md bg-white/40 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500">
          <p>© 2025 FreeL AI. Powered by multiple AI agents. Always learning, always improving.</p>
        </div>
      </footer>

      {/* Response Modal */}
      <ResponseModal
        isOpen={isModalOpen}
        response={modalResponse}
        isLoading={isLoading}
        onClose={() => setIsModalOpen(false)}
        agentName={selectedAgent.name}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSubmit={handleAuthSubmit}
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
      `}</style>
    </div>
  )
}

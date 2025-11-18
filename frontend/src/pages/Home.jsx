import { useState, useEffect } from 'react'
import { Send, Sparkles, Code, Zap, Brain, Lightbulb, Clock, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api.js'
import ResponseModal from '../components/ResponseModal'
import HistoryModal from '../components/HistoryModal'
import AuthModal from '../components/AuthModal'
import Header from '../components/Header'
import { CreateDemandeModal } from '../components/dashboard/CreateDemandeModal'
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
  
  // Create demande modal state
  const [createDemandeModalOpen, setCreateDemandeModalOpen] = useState(false)

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
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-3 sm:px-4 md:px-6 lg:px-8 pt-3 sm:pt-4 pb-6 sm:pb-8 overflow-y-auto">
        {/* Hero Section - AI Part */}
        {(
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-5">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold">
                <span className="bg-gradient-to-r from-black via-gray-700 to-gray-500 bg-clip-text text-transparent">Ask Anything to AI</span>
              </h1>
              <div className="p-1.5 sm:p-2.5 bg-black/10 rounded-xl">
                <Brain className="w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9 text-black" />
              </div>
            </div>
          </div>
        )}

        {/* Agent Selector - Compact Version */}
        <div className="w-full max-w-4xl mb-3 sm:mb-4">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
            {agents.map((agent) => {
              const Icon = agent.icon
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`group relative px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border-2 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 ${
                    selectedAgent.id === agent.id
                      ? 'border-black bg-black/10 shadow-md'
                      : 'border-black/20 bg-black/5 hover:border-black/40 hover:bg-black/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all ${
                    selectedAgent.id === agent.id ? 'text-black' : 'text-gray-600 group-hover:text-gray-800'
                  }`} />
                  <span className={`text-[10px] sm:text-xs font-semibold transition-all ${
                    selectedAgent.id === agent.id ? 'text-black' : 'text-gray-600 group-hover:text-gray-800'
                  }`}>
                    {agent.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="w-full max-w-4xl">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-black/20 to-black/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

            {/* Input container */}
            <div className="relative bg-white border-2 border-black/20 rounded-xl p-2.5 sm:p-3 md:p-5 hover:border-black/40 transition-all duration-300 focus-within:border-black focus-within:shadow-lg focus-within:shadow-black/10">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={user ? "Ask anything... Describe your idea, ask a question, or request code..." : "Ask anything... Describe your idea, ask a question, or request code..."}
                className="w-full bg-transparent text-black placeholder-gray-400 outline-none resize-none text-xs sm:text-sm md:text-base leading-relaxed disabled:cursor-not-allowed disabled:text-gray-400 disabled:placeholder-gray-300"
                rows="3"
                maxLength="2000"
                disabled={!user}
              />

              {/* Avertissement limite de questions */}
              {user && userStats && userStats.remaining <= 1 && userStats.remaining > 0 && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Warning: You have only {userStats.remaining} question{userStats.remaining > 1 ? 's' : ''} left. 
                    After that, you will be redirected to "Need Help" for human assistance.
                  </p>
                </div>
              )}

              {/* Footer with character count and submit */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-black/10">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs text-gray-500">{prompt.length}/2000</span>
                  {user && userStats && (
                    <span className={`text-xs font-semibold ${userStats.remaining <= 1 ? 'text-red-600' : 'text-green-600'}`}>
                      Questions: {userStats.remaining}/{userStats.questionsLimit}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                  {/* Bouton Human Service */}
                  <button
                    type="button"
                    onClick={() => navigate('/human-service')}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 flex-1 sm:flex-initial"
                    title="Service d'entraide"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Human Service</span>
                  </button>

                  {/* Bouton Historique */}
                  <button
                    type="button"
                    onClick={() => setHistoryModalOpen(true)}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 flex-1 sm:flex-initial"
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
                      className={`flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 flex-1 sm:flex-initial ${
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
                      className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg hover:shadow-gray-600/30 flex-1 sm:flex-initial"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sign In</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>


        </form>

        {/* Human Section Title */}
        <div className="text-center my-5 sm:my-7 md:my-9">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2.5 bg-black/10 rounded-xl">
              <Users className="w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9 text-black" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold">
              <span className="bg-gradient-to-r from-black via-gray-700 to-gray-500 bg-clip-text text-transparent">Or Get Everything from Human</span>
            </h2>
          </div>
        </div>

        {/* Creative Banners */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Banner 1: Pour les utilisateurs - Créer une demande */}
          <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-black via-gray-800 to-gray-700 p-6 sm:p-8 hover:shadow-2xl hover:shadow-black/50 transition-all duration-500 cursor-pointer border border-gray-700 min-h-[200px] flex flex-col justify-between"
               onClick={() => setCreateDemandeModalOpen(true)}>
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Large Icon at top */}
            <div className="relative z-10 flex justify-center mb-4">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Need Human Help?</h3>
              <p className="text-gray-300 text-sm mb-4">
                Get expert solutions tailored to you
              </p>
              
              <div className="inline-flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                <span>Create Request</span>
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          </div>

          {/* Banner 2: Pour les humains - Voir les demandes */}
          <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-900 via-gray-700 to-gray-600 p-6 sm:p-8 hover:shadow-2xl hover:shadow-gray-800/50 transition-all duration-500 cursor-pointer border border-gray-600 min-h-[200px] flex flex-col justify-between"
               onClick={() => navigate('/demandes')}>
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Large Icon at top */}
            <div className="relative z-10 flex justify-center mb-4">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                <Lightbulb className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Are You an Expert?</h3>
              <p className="text-gray-300 text-sm mb-4">
                Share knowledge, earn money
              </p>
              
              <div className="inline-flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                <span>View Requests</span>
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-black/10 backdrop-blur-md bg-white/40 py-2 sm:py-3">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 text-center text-[10px] sm:text-xs text-gray-500">
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

      {/* Create Demande Modal */}
      <CreateDemandeModal
        open={createDemandeModalOpen}
        onOpenChange={setCreateDemandeModalOpen}
        onSuccess={() => {
          console.log('Demande créée avec succès')
        }}
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

import { useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Video, X } from 'lucide-react'

export function MeetNotification() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(new Set())
  const [previousSessionIds, setPreviousSessionIds] = useState(new Set())
  
  const activeSessions = useQuery(
    api.meetSessions.getUserActiveMeetSessions,
    user?.userId ? { userId: user.userId } : "skip"
  )

  // Détecter les nouvelles sessions
  useEffect(() => {
    if (!activeSessions) return

    const currentSessionIds = new Set(activeSessions.map(s => s._id))
    const newSessions = activeSessions.filter(
      s => !previousSessionIds.has(s._id) && !s.isCreator
    )

    if (newSessions.length > 0) {
      console.log('🔔 Nouvelle session meet détectée!', newSessions)
    }

    setPreviousSessionIds(currentSessionIds)
  }, [activeSessions])

  const visibleSessions = activeSessions?.filter(
    session => !dismissed.has(session._id)
  ) || []

  const handleJoinMeet = (sessionId) => {
    navigate(`/meet/${sessionId}`)
  }

  const handleDismiss = (sessionId) => {
    setDismissed(prev => new Set([...prev, sessionId]))
  }

  if (!visibleSessions.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {visibleSessions.map((session) => (
        <div
          key={session._id}
          className="bg-white border-2 border-green-500 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Video className="h-5 w-5 text-green-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {session.isCreator ? 'Offre acceptée !' : 'Votre offre a été acceptée !'}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {session.demande?.title}
                  </p>
                </div>
                <button
                  onClick={() => handleDismiss(session._id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mb-3">
                Avec: {session.otherUser?.name}
              </p>
              
              <button
                onClick={() => handleJoinMeet(session._id)}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Video className="h-4 w-4" />
                Rejoindre le Meet
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

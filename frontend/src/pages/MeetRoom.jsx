import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../contexts/AuthContext'
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk'
import '@stream-io/video-react-sdk/dist/css/styles.css'
import Header from '../components/Header'
import { Loader2, Video, Phone, Mic, MicOff, VideoIcon, VideoOff, Monitor, PhoneOff, Settings, Clock, AlertTriangle } from 'lucide-react'

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY

export default function MeetRoom() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [client, setClient] = useState(null)
  const [call, setCall] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const session = useQuery(api.meetSessions.getMeetSession, 
    sessionId ? { sessionId } : "skip"
  )
  const generateToken = useAction(api.stream.generateStreamToken)
  const endMeetSession = useMutation(api.meetSessions.endMeetSession)

  useEffect(() => {
    if (!user || !session) {
      console.log('Waiting for:', { user: !!user, session: !!session })
      return
    }

    const initializeCall = async () => {
      try {
        // Générer le token via l'action Convex
        console.log('Generating token for user:', user.userId)
        const { token } = await generateToken({ userId: user.userId })
        console.log('Token received from server')
        
        // Créer le client Stream.io
        const streamClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: {
            id: user.userId,
            name: user.name,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`,
          },
          token: token,
        })

        setClient(streamClient)

        // Créer ou rejoindre l'appel
        const videoCall = streamClient.call('default', session.callId)
        await videoCall.join({ create: true })

        setCall(videoCall)
        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing call:', error)
        alert('Erreur lors de l\'initialisation de l\'appel: ' + error.message)
        setIsLoading(false)
      }
    }

    initializeCall()

    // Cleanup
    return () => {
      if (call) {
        call.leave().catch(console.error)
      }
      if (client) {
        client.disconnectUser().catch(console.error)
      }
    }
  }, [user, session])

  const handleEndCall = async () => {
    try {
      if (call) {
        await call.leave()
      }
      if (client) {
        await client.disconnectUser()
      }
      if (sessionId) {
        await endMeetSession({ sessionId })
      }
      navigate('/dashboard')
    } catch (error) {
      console.error('Error ending call:', error)
      navigate('/dashboard')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Vous devez être connecté pour accéder à cette page</p>
        </div>
      </div>
    )
  }

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement de la session...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!client || !call) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600">Connexion à l'appel...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-4">
        {/* Session Info */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{session.demande?.title}</h2>
              <p className="text-sm text-gray-600">
                Avec: {session.demandeur?.name === user.name ? session.offreur?.name : session.demandeur?.name}
              </p>
              {session.demande?.duration && (
                <p className="text-xs text-gray-500 mt-1">
                  Durée prévue: {session.demande.duration} minutes
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center gap-2">
                <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></div>
                En direct
              </div>
            </div>
          </div>
        </div>

        {/* Video Call */}
        <div className="bg-gray-800 rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <MeetingUI onEndCall={handleEndCall} duration={session.demande?.duration} />
            </StreamCall>
          </StreamVideo>
        </div>
      </div>
    </div>
  )
}

function MeetingUI({ onEndCall, duration }) {
  const { useCallCallingState, useParticipantCount, useMicrophoneState, useCameraState } = useCallStateHooks()
  const callingState = useCallCallingState()
  const participantCount = useParticipantCount()
  const { microphone, isMute } = useMicrophoneState()
  const { camera, isMute: isCameraOff } = useCameraState()
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  
  // Compte à rebours
  const [timeRemaining, setTimeRemaining] = useState(duration ? duration * 60 : null) // Convertir minutes en secondes
  const [isTimerWarning, setIsTimerWarning] = useState(false)
  const [timerStarted, setTimerStarted] = useState(false)
  
  // Système de signalement de scam
  const [scamReported, setScamReported] = useState(false)
  const [showScamButton, setShowScamButton] = useState(false)
  const initialDuration = duration ? duration * 60 : null
  const scamWindowDuration = initialDuration ? initialDuration * 0.25 : null // 25% de la durée

  // Démarrer le timer uniquement quand les 2 participants sont présents
  useEffect(() => {
    if (participantCount >= 2 && !timerStarted && timeRemaining) {
      console.log('🎬 Les 2 participants sont présents, démarrage du timer!')
      setTimerStarted(true)
      setShowScamButton(true) // Afficher le bouton de scam
    }
  }, [participantCount, timerStarted, timeRemaining])

  // Gérer la fenêtre de signalement de scam (25% premiers)
  useEffect(() => {
    if (!timerStarted || !initialDuration || !timeRemaining) return
    
    const timeElapsed = initialDuration - timeRemaining
    const scamWindowEnd = scamWindowDuration
    
    // Cacher le bouton après 25% de la durée
    if (timeElapsed >= scamWindowEnd && showScamButton) {
      console.log('⏰ Fenêtre de signalement de scam terminée')
      setShowScamButton(false)
    }
  }, [timeRemaining, timerStarted, initialDuration, scamWindowDuration, showScamButton])

  // Gérer le compte à rebours (ne démarre que si timerStarted est true)
  useEffect(() => {
    if (!timeRemaining || !timerStarted) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          // Fin automatique du meeting
          alert('Le temps de la session est écoulé. L\'appel va se terminer.')
          onEndCall()
          return 0
        }
        
        // Avertissement à 5 minutes
        if (prev === 300) {
          setIsTimerWarning(true)
          alert('⚠️ Il reste 5 minutes avant la fin automatique de la session.')
        }
        
        // Avertissement à 1 minute
        if (prev === 60) {
          alert('⚠️ Il reste 1 minute avant la fin automatique de la session.')
        }
        
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, timerStarted, onEndCall])

  // Formater le temps restant
  const formatTime = (seconds) => {
    if (!seconds) return null
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (callingState !== 'joined') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Connexion à l'appel...</p>
        </div>
      </div>
    )
  }

  const toggleMicrophone = async () => {
    if (microphone) {
      await microphone.toggle()
    }
  }

  const toggleCamera = async () => {
    if (camera) {
      await camera.toggle()
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        setIsScreenSharing(false)
      } else {
        // Start screen sharing
        setIsScreenSharing(true)
      }
    } catch (error) {
      console.error('Error toggling screen share:', error)
    }
  }

  const handleScamReport = () => {
    const confirmed = window.confirm(
      '⚠️ SIGNALEMENT DE SCAM\n\n' +
      'Vous êtes sur le point de signaler cette session comme frauduleuse.\n' +
      'La réunion sera immédiatement terminée et l\'incident sera enregistré.\n\n' +
      'Êtes-vous sûr de vouloir continuer ?'
    )
    
    if (confirmed) {
      setScamReported(true)
      alert('🚨 Session signalée comme scam. La réunion va se terminer immédiatement.')
      // Terminer immédiatement la session
      onEndCall()
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <SpeakerLayout />
        
        {/* Bouton de signalement de scam (visible pendant les 25% premiers) */}
        {showScamButton && (
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={handleScamReport}
              className="group relative bg-red-600/90 hover:bg-red-700 backdrop-blur-sm px-4 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse"
              title="Signaler un scam"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚨</span>
                <div className="text-left">
                  <div className="text-sm font-bold">Signaler un SCAM</div>
                  <div className="text-xs opacity-90">
                    Disponible pendant {Math.floor(scamWindowDuration / 60)} min
                  </div>
                </div>
              </div>
              {/* Indicateur de temps restant */}
              <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full rounded-b-lg overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-1000"
                  style={{
                    width: `${((scamWindowDuration - (initialDuration - timeRemaining)) / scamWindowDuration) * 100}%`
                  }}
                />
              </div>
            </button>
          </div>
        )}
        
        {/* Timer and Participant Count */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* Compte à rebours */}
          {timeRemaining && (
            <div className={`backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm font-mono flex items-center gap-2 transition-all ${
              !timerStarted
                ? 'bg-yellow-500/80 animate-pulse'
                : timeRemaining <= 300 
                ? 'bg-red-500/80 animate-pulse' 
                : timeRemaining <= 600
                ? 'bg-orange-500/80'
                : 'bg-black/50'
            }`}>
              <Clock className="h-4 w-4" />
              <span className="font-bold">{formatTime(timeRemaining)}</span>
              {!timerStarted && (
                <span className="text-xs ml-2">(En attente)</span>
              )}
            </div>
          )}
          
          {/* Participant Count */}
          <div className={`backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm flex items-center gap-2 ${
            participantCount >= 2 ? 'bg-green-500/80' : 'bg-black/50'
          }`}>
            <Video className="h-4 w-4" />
            {participantCount} participant{participantCount > 1 ? 's' : ''}
          </div>
          
          {/* Message d'attente si un seul participant */}
          {participantCount < 2 && (
            <div className="bg-yellow-500/80 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-xs max-w-[200px]">
              ⏳ En attente du 2ème participant...
            </div>
          )}
        </div>
      </div>

      {/* Custom Creative Controls */}
      <div className="bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            {/* Microphone Button */}
            <button
              onClick={toggleMicrophone}
              className={`group relative h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                isMute 
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50' 
                  : 'bg-gray-700 hover:bg-gray-600 shadow-lg shadow-gray-700/50'
              }`}
              title={isMute ? 'Activer le micro' : 'Désactiver le micro'}
            >
              {isMute ? (
                <MicOff className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {isMute ? 'Activer' : 'Désactiver'}
              </span>
            </button>

            {/* Camera Button */}
            <button
              onClick={toggleCamera}
              className={`group relative h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                isCameraOff 
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50' 
                  : 'bg-gray-700 hover:bg-gray-600 shadow-lg shadow-gray-700/50'
              }`}
              title={isCameraOff ? 'Activer la caméra' : 'Désactiver la caméra'}
            >
              {isCameraOff ? (
                <VideoOff className="h-6 w-6 text-white" />
              ) : (
                <VideoIcon className="h-6 w-6 text-white" />
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {isCameraOff ? 'Activer' : 'Désactiver'}
              </span>
            </button>

            {/* Screen Share Button */}
            <button
              onClick={toggleScreenShare}
              className={`group relative h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                isScreenSharing 
                  ? 'bg-gray-500 hover:bg-gray-600 shadow-lg shadow-gray-500/50' 
                  : 'bg-gray-700 hover:bg-gray-600 shadow-lg shadow-gray-700/50'
              }`}
              title={isScreenSharing ? 'Arrêter le partage' : 'Partager l\'écran'}
            >
              <Monitor className="h-6 w-6 text-white" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Partager
              </span>
            </button>

            {/* Settings Button */}
            <button
              className="group relative h-14 w-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg shadow-gray-700/50"
              title="Paramètres"
            >
              <Settings className="h-6 w-6 text-white" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Paramètres
              </span>
            </button>

            {/* Divider */}
            <div className="h-10 w-px bg-gray-700 mx-2"></div>

            {/* End Call Button */}
            <button
              onClick={onEndCall}
              className="group relative h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg shadow-red-600/50 hover:shadow-red-700/70"
              title="Quitter l'appel"
            >
              <PhoneOff className="h-6 w-6 text-white" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Quitter
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

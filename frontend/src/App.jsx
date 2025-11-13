import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import HumanService from './pages/HumanService'
import Demandes from './pages/Demandes'
import Offres from './pages/Offres'
import Dashboard from './pages/Dashboard'
import MeetRoom from './pages/MeetRoom'
import { MeetNotification } from './components/MeetNotification'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/human-service" element={<HumanService />} />
        <Route path="/demandes" element={<Demandes />} />
        <Route path="/offres" element={<Offres />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meet/:sessionId" element={<MeetRoom />} />
      </Routes>
      
      {/* Notification globale pour les sessions meet actives */}
      <MeetNotification />
    </>
  )
}

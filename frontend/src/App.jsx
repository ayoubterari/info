import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import HumanService from './pages/HumanService'
import Demandes from './pages/Demandes'
import Offres from './pages/Offres'
import MesOffres from './pages/MesOffres'
import Dashboard from './pages/Dashboard'
import MeetRoom from './pages/MeetRoom'
import Payment from './pages/Payment'
import Admin from './pages/Admin'
import AdminUsers from './pages/AdminUsers'
import DebugAuth from './pages/DebugAuth'
import { OffreAcceptedNotification } from './components/OffreAcceptedNotification'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/human-service" element={<HumanService />} />
        <Route path="/demandes" element={<Demandes />} />
        <Route path="/offres" element={<Offres />} />
        <Route path="/mes-offres" element={<MesOffres />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/debug-auth" element={<DebugAuth />} />
        <Route path="/meet/:sessionId" element={<MeetRoom />} />
      </Routes>
      
      {/* Notification et redirection automatique quand une offre est acceptée */}
      <OffreAcceptedNotification />
    </>
  )
}

import jwt from 'jsonwebtoken'

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY
const STREAM_API_SECRET = 'your_secret_key_here' // En production, ceci doit être côté serveur

/**
 * Génère un token Stream.io pour le développement
 * EN PRODUCTION: Cette fonction doit être déplacée côté serveur (Convex)
 */
export function generateStreamToken(userId) {
  // Pour le développement, on utilise une clé secrète temporaire
  // En production, utilisez votre vraie clé secrète Stream.io
  const payload = {
    user_id: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 heures
  }

  try {
    // Génération du token JWT
    const token = jwt.sign(payload, STREAM_API_SECRET, { algorithm: 'HS256' })
    return token
  } catch (error) {
    console.error('Error generating token:', error)
    // Fallback: retourner un token simple pour le développement
    return btoa(JSON.stringify(payload))
  }
}

/**
 * Version simplifiée pour le développement sans dépendance
 * Utilise l'API Key directement (mode développement Stream.io)
 */
export function getDevToken(userId) {
  // En mode développement, Stream.io accepte un format simplifié
  const payload = {
    user_id: userId,
  }
  return btoa(JSON.stringify(payload))
}

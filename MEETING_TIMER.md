# Système de Compte à Rebours pour les Meetings

## 🎯 Fonctionnalité

Ajout d'un **compte à rebours automatique** basé sur la durée de la demande qui met fin automatiquement au meeting lorsque le temps est écoulé.

## ⏱️ Caractéristiques

### 1. Durée du Meeting
- Basée sur le champ `duration` de la demande (en minutes)
- Convertie automatiquement en secondes pour le compte à rebours
- Si aucune durée n'est définie, pas de timer (meeting illimité)

### 2. Affichage du Timer
**Position:** En haut à droite de l'écran vidéo

**Format d'affichage:**
- Moins d'1 heure: `MM:SS` (ex: `25:30`)
- Plus d'1 heure: `H:MM:SS` (ex: `1:25:30`)

**Changements de couleur:**
```javascript
- Plus de 10 minutes: bg-black/50 (noir transparent)
- 10 à 5 minutes: bg-orange-500/80 (orange)
- Moins de 5 minutes: bg-red-500/80 + animate-pulse (rouge clignotant)
```

### 3. Alertes Automatiques

**À 5 minutes:**
```
⚠️ Il reste 5 minutes avant la fin automatique de la session.
```
- Le timer devient orange
- Alert JavaScript

**À 1 minute:**
```
⚠️ Il reste 1 minute avant la fin automatique de la session.
```
- Le timer est rouge et clignote
- Alert JavaScript

**À 0 seconde:**
```
Le temps de la session est écoulé. L'appel va se terminer.
```
- Appel automatique de `onEndCall()`
- Redirection vers le dashboard

### 4. Interface Visuelle

```
┌─────────────────────────────────┐
│                    ┌──────────┐ │
│                    │ ⏰ 25:30 │ │ ← Timer
│                    └──────────┘ │
│                    ┌──────────┐ │
│      VIDEO         │ 📹 2 part│ │ ← Participants
│                    └──────────┘ │
│                                 │
└─────────────────────────────────┘
```

## 💻 Implémentation

### État du Timer

```javascript
const [timeRemaining, setTimeRemaining] = useState(duration ? duration * 60 : null)
const [isTimerWarning, setIsTimerWarning] = useState(false)
```

### Logique du Compte à Rebours

```javascript
useEffect(() => {
  if (!timeRemaining) return

  const interval = setInterval(() => {
    setTimeRemaining(prev => {
      if (prev <= 1) {
        clearInterval(interval)
        alert('Le temps de la session est écoulé.')
        onEndCall()
        return 0
      }
      
      // Alertes aux moments clés
      if (prev === 300) {
        setIsTimerWarning(true)
        alert('⚠️ Il reste 5 minutes...')
      }
      
      if (prev === 60) {
        alert('⚠️ Il reste 1 minute...')
      }
      
      return prev - 1
    })
  }, 1000)

  return () => clearInterval(interval)
}, [timeRemaining, onEndCall])
```

### Formatage du Temps

```javascript
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
```

## 🎨 Styles CSS

### Timer Normal (> 10 min)
```css
bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg text-white
```

### Timer Warning (5-10 min)
```css
bg-orange-500/80 backdrop-blur-sm px-4 py-2 rounded-lg text-white
```

### Timer Critical (< 5 min)
```css
bg-red-500/80 animate-pulse backdrop-blur-sm px-4 py-2 rounded-lg text-white
```

## 📊 Exemples d'Utilisation

### Demande avec durée de 30 minutes
```javascript
{
  title: "Aide déménagement",
  duration: 30, // minutes
  // ...
}
```
**Résultat:**
- Timer démarre à `30:00`
- Alert à `5:00` (orange)
- Alert à `1:00` (rouge clignotant)
- Fin automatique à `0:00`

### Demande avec durée de 2 heures
```javascript
{
  title: "Cours particulier",
  duration: 120, // minutes
  // ...
}
```
**Résultat:**
- Timer démarre à `2:00:00`
- Alert à `5:00` (orange)
- Alert à `1:00` (rouge clignotant)
- Fin automatique à `0:00`

### Demande sans durée
```javascript
{
  title: "Consultation",
  duration: undefined,
  // ...
}
```
**Résultat:**
- Pas de timer affiché
- Meeting illimité
- Fin manuelle uniquement

## 🔄 Flux de Fin Automatique

```
Timer atteint 0:00
    ↓
Alert "Le temps est écoulé"
    ↓
Appel de onEndCall()
    ↓
call.leave()
    ↓
client.disconnectUser()
    ↓
endMeetSession (Convex)
    ↓
navigate('/dashboard')
```

## ⚙️ Configuration

### Modifier les seuils d'alerte

```javascript
// Dans MeetingUI component
if (prev === 300) {  // 5 minutes → Modifier ici
  setIsTimerWarning(true)
  alert('⚠️ Il reste 5 minutes...')
}

if (prev === 60) {  // 1 minute → Modifier ici
  alert('⚠️ Il reste 1 minute...')
}
```

### Modifier les couleurs

```javascript
timeRemaining <= 300   // Rouge à 5 min → Modifier ici
  ? 'bg-red-500/80 animate-pulse' 
  : timeRemaining <= 600  // Orange à 10 min → Modifier ici
  ? 'bg-orange-500/80'
  : 'bg-black/50'
```

## 🧪 Tests Recommandés

1. **Test avec durée courte (2 minutes):**
   - Créer une demande avec `duration: 2`
   - Vérifier que le timer s'affiche
   - Vérifier l'alert à 1 minute
   - Vérifier la fin automatique

2. **Test avec durée longue (60 minutes):**
   - Créer une demande avec `duration: 60`
   - Vérifier l'affichage `60:00`
   - Vérifier les changements de couleur

3. **Test sans durée:**
   - Créer une demande sans `duration`
   - Vérifier que le timer ne s'affiche pas
   - Vérifier que le meeting continue indéfiniment

4. **Test de fin manuelle avant la fin du timer:**
   - Créer une demande avec durée
   - Quitter manuellement avant la fin
   - Vérifier que le timer s'arrête correctement

## 💡 Améliorations Futures

1. **Prolongation du temps:**
   - Bouton "Prolonger de 15 min"
   - Accord des deux participants requis

2. **Notifications sonores:**
   - Son à 5 minutes
   - Son à 1 minute
   - Son différent à la fin

3. **Historique du temps:**
   - Enregistrer le temps réel passé
   - Comparer avec le temps prévu
   - Statistiques de durée moyenne

4. **Pause du timer:**
   - Mettre en pause le compte à rebours
   - Reprendre le timer

5. **Affichage dans le header:**
   - Timer également visible dans le header
   - Synchronisé avec le timer principal

## ✅ Résumé

**Fichiers modifiés:**
- `frontend/src/pages/MeetRoom.jsx`

**Fonctionnalités ajoutées:**
- ✅ Compte à rebours basé sur `duration` de la demande
- ✅ Affichage en temps réel (format MM:SS ou H:MM:SS)
- ✅ Changement de couleur selon le temps restant
- ✅ Alertes à 5 minutes et 1 minute
- ✅ Fin automatique du meeting à 0:00
- ✅ Animation pulse quand critique (< 5 min)
- ✅ Nettoyage automatique de l'intervalle

**Expérience utilisateur:**
- Timer visible en permanence
- Alertes claires et anticipées
- Fin automatique sans surprise
- Pas de timer si pas de durée définie

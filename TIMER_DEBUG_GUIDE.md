# Guide de Debug du Timer

## 🔍 Problème
Le timer ne s'affiche pas dans l'interface de visioconférence.

## ✅ Corrections Appliquées

### 1. Backend - Ajout de `duration` dans la réponse
**Fichier:** `backend/convex/meetSessions.ts`

```typescript
demande: demande ? {
  title: demande.title,
  category: demande.category,
  description: demande.description,
  duration: demande.duration, // ✅ AJOUTÉ
} : null,
```

### 2. Frontend - Logs de debug
**Fichier:** `frontend/src/pages/MeetRoom.jsx`

```javascript
// Debug: Log de la durée
useEffect(() => {
  console.log('Duration reçue:', duration)
  console.log('Time remaining initialisé:', timeRemaining)
}, [duration, timeRemaining])
```

### 3. Affichage de la durée dans le header
```javascript
{session.demande?.duration && (
  <p className="text-xs text-gray-500 mt-1">
    Durée prévue: {session.demande.duration} minutes
  </p>
)}
```

## 🧪 Comment Tester

### Étape 1: Créer une nouvelle demande avec durée

1. Allez sur "J'ai besoin d'aide"
2. Remplissez le formulaire:
   - Titre: "Test Timer"
   - Catégorie: Général
   - Prix: 10
   - **Durée: 5** ← IMPORTANT
   - Description: "Test du timer"
3. Soumettez la demande

### Étape 2: Faire une offre et accepter

1. Avec un autre compte, faites une offre sur cette demande
2. Acceptez l'offre
3. Les deux utilisateurs seront redirigés vers le meeting

### Étape 3: Vérifier le timer

**Dans le header (en haut):**
```
Demande Test Timer
Avec: [nom de l'autre utilisateur]
Durée prévue: 5 minutes  ← Doit apparaître ici
```

**En haut à droite de la vidéo:**
```
⏰ 5:00  ← Timer doit apparaître ici
📹 2 participants
```

### Étape 4: Vérifier les logs console

Ouvrez la console (F12) et cherchez:
```
Duration reçue: 5
Time remaining initialisé: 300
```

## 🐛 Si le timer ne s'affiche toujours pas

### Vérification 1: La demande a-t-elle une durée?

**Console du navigateur:**
```javascript
// Dans la page du meeting, tapez:
console.log(session)
// Vérifiez que session.demande.duration existe
```

### Vérification 2: Le backend renvoie-t-il la durée?

**Dans Convex Dashboard:**
1. Allez sur https://dashboard.convex.dev
2. Ouvrez votre projet
3. Allez dans "Data" → "demandes"
4. Vérifiez que votre demande a un champ `duration`

### Vérification 3: Convex est-il déployé?

```bash
# Dans le terminal backend
cd backend
npx convex dev
```

Attendez que le message "Convex functions ready!" apparaisse.

### Vérification 4: Rechargez complètement

1. Fermez tous les onglets du meeting
2. Videz le cache (Ctrl+Shift+Delete)
3. Rechargez la page
4. Acceptez une nouvelle offre

## 📊 Cas de Test

### Test 1: Durée courte (2 minutes)
```
duration: 2
Timer: 2:00 → 1:00 (alert) → 0:00 (fin auto)
```

### Test 2: Durée moyenne (30 minutes)
```
duration: 30
Timer: 30:00 → 5:00 (alert + orange) → 1:00 (alert + rouge) → 0:00
```

### Test 3: Durée longue (90 minutes)
```
duration: 90
Timer: 1:30:00 → 5:00 (alert) → 0:00
```

### Test 4: Sans durée
```
duration: undefined
Timer: N'apparaît pas (normal)
Meeting illimité
```

## 🔧 Solutions aux Problèmes Courants

### Problème: "Duration reçue: undefined"

**Cause:** La demande n'a pas de durée définie

**Solution:**
1. Créez une NOUVELLE demande avec une durée
2. Ne testez pas avec d'anciennes demandes

### Problème: Le timer s'affiche mais ne décompte pas

**Cause:** L'intervalle ne se lance pas

**Solution:**
```javascript
// Vérifiez dans la console
console.log('timeRemaining:', timeRemaining)
// Si null ou undefined, le timer ne démarre pas
```

### Problème: Le timer ne change pas de couleur

**Cause:** Les seuils ne sont pas atteints

**Solution:**
- Testez avec `duration: 2` (2 minutes)
- Le timer deviendra rouge à 1:00

### Problème: Pas d'alerte à 5 minutes

**Cause:** La durée est < 5 minutes

**Solution:**
- Testez avec `duration: 10` minimum
- Ou modifiez le seuil dans le code

## 📝 Checklist de Vérification

- [ ] Backend déployé (Convex)
- [ ] Frontend rechargé
- [ ] Nouvelle demande créée AVEC durée
- [ ] Offre acceptée
- [ ] Console ouverte (F12)
- [ ] Logs "Duration reçue" visible
- [ ] Header affiche "Durée prévue"
- [ ] Timer visible en haut à droite

## 🎯 Résultat Attendu

**Interface complète:**
```
┌─────────────────────────────────────────┐
│ Demande Test Timer                      │
│ Avec: hanae                             │
│ Durée prévue: 5 minutes    [En direct] │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                          ┌────────────┐ │
│                          │ ⏰ 5:00    │ │ ← TIMER
│                          └────────────┘ │
│                          ┌────────────┐ │
│        VIDEO             │ 📹 2 part  │ │
│                          └────────────┘ │
│                                         │
│      [🎤] [📹] [🖥️] [⚙️] | [☎️]       │
└─────────────────────────────────────────┘
```

## 🚀 Prochaines Étapes

Si tout fonctionne:
1. ✅ Timer s'affiche
2. ✅ Décompte en temps réel
3. ✅ Change de couleur
4. ✅ Alertes fonctionnent
5. ✅ Fin automatique

Vous pouvez alors:
- Tester avec différentes durées
- Personnaliser les seuils d'alerte
- Ajouter des sons de notification
- Implémenter la prolongation du temps

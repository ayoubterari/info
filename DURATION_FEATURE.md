# Ajout du champ Durée dans les demandes

## 🎯 Fonctionnalité ajoutée

Ajout d'un champ **Durée estimée (en minutes)** dans le formulaire de création de demande d'aide.

## 📊 Modifications apportées

### 1. Backend - Schema Convex

**Fichier: `backend/convex/schema.ts`**
- ✅ Ajout du champ `duration: v.optional(v.number())` dans la table `demandes`
- Type: Nombre optionnel représentant la durée en minutes

### 2. Backend - Mutation

**Fichier: `backend/convex/demandes.ts`**
- ✅ Ajout de `duration: v.optional(v.number())` dans les args de `createDemande`
- ✅ Insertion de `duration` dans la base de données lors de la création

### 3. Frontend - Page HumanService

**Fichier: `frontend/src/pages/HumanService.jsx`**

**État du formulaire:**
```javascript
const [needHelpForm, setNeedHelpForm] = useState({
  title: '',
  description: '',
  category: 'general',
  price: '',
  duration: '' // ✅ Nouveau champ
})
```

**Soumission:**
```javascript
await createDemande({
  // ... autres champs
  duration: needHelpForm.duration ? parseInt(needHelpForm.duration) : undefined,
})
```

**Interface:**
- Champ "Durée estimée (minutes)" ajouté à côté du champ "Prix proposé"
- Layout responsive en grille (2 colonnes sur desktop, 1 colonne sur mobile)
- Placeholder: "30" minutes
- Type: number avec min="1" et step="1"
- Optionnel (pas de `required`)

### 4. Frontend - Modal CreateDemandeModal

**Fichier: `frontend/src/components/dashboard/CreateDemandeModal.jsx`**

**Mêmes modifications que HumanService:**
- ✅ État du formulaire avec `duration`
- ✅ Soumission avec conversion en entier
- ✅ Reset du formulaire incluant `duration`
- ✅ Champ dans l'interface en grille avec le prix

## 🎨 Interface utilisateur

### Disposition

```
┌─────────────────────────────────────────────┐
│  Prix proposé ($) *    │  Durée estimée     │
│  [50.00]               │  [30] minutes      │
└─────────────────────────────────────────────┘
```

### Caractéristiques du champ

- **Label:** "Durée estimée (minutes)"
- **Placeholder:** "30"
- **Type:** Nombre entier positif
- **Minimum:** 1 minute
- **Optionnel:** Oui
- **Aide:** "Temps estimé pour l'aide"

## 📝 Utilisation

### Créer une demande avec durée

```javascript
{
  title: "Aide déménagement",
  description: "Besoin d'aide pour déménager",
  category: "moving",
  price: 100,
  duration: 120, // 2 heures = 120 minutes
  // ... autres champs
}
```

### Créer une demande sans durée

```javascript
{
  title: "Conseil technique",
  description: "Besoin de conseils",
  category: "tech",
  price: 50,
  duration: undefined, // Optionnel
  // ... autres champs
}
```

## 🔄 Compatibilité

- ✅ **Rétrocompatible:** Les demandes existantes sans durée fonctionnent toujours
- ✅ **Optionnel:** Le champ n'est pas obligatoire
- ✅ **Type sûr:** Validation du type nombre en backend

## 🧪 Tests recommandés

1. **Créer une demande avec durée:**
   - Remplir tous les champs incluant la durée
   - Vérifier que la durée est sauvegardée
   - Vérifier l'affichage dans le dashboard

2. **Créer une demande sans durée:**
   - Laisser le champ durée vide
   - Vérifier que la demande est créée sans erreur
   - Vérifier que `duration` est `undefined` en base

3. **Validation:**
   - Tester avec des valeurs négatives (devrait être bloqué par min="1")
   - Tester avec des décimales (devrait être arrondi)
   - Tester avec des valeurs très grandes

4. **Responsive:**
   - Vérifier l'affichage sur mobile (1 colonne)
   - Vérifier l'affichage sur desktop (2 colonnes)

## 💡 Améliorations futures possibles

1. **Affichage de la durée:**
   - Afficher la durée dans les cartes de demandes
   - Afficher la durée dans les détails de demande
   - Format: "2h 30min" au lieu de "150 minutes"

2. **Filtrage:**
   - Filtrer les demandes par durée
   - Rechercher par plage de durée

3. **Statistiques:**
   - Durée moyenne des demandes
   - Durée totale des demandes complétées

4. **Validation avancée:**
   - Durée maximale (ex: 480 minutes = 8 heures)
   - Suggestions de durée selon la catégorie

5. **Sélecteur amélioré:**
   - Sélecteur d'heures et minutes séparés
   - Boutons rapides (30min, 1h, 2h, etc.)

## 📚 Documentation

- Le champ est optionnel pour ne pas perturber les utilisateurs existants
- La durée aide les offreurs à estimer le temps nécessaire
- Peut être utilisée pour calculer un tarif horaire implicite (prix / durée)

## ✅ Résumé

**Fichiers modifiés:**
- `backend/convex/schema.ts`
- `backend/convex/demandes.ts`
- `frontend/src/pages/HumanService.jsx`
- `frontend/src/components/dashboard/CreateDemandeModal.jsx`

**Fonctionnalité:**
- Champ "Durée estimée (minutes)" ajouté au formulaire
- Optionnel, type number, minimum 1
- Layout responsive en grille avec le prix
- Sauvegardé en base de données

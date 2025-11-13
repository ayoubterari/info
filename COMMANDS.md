# Commandes rapides

## 🚀 Démarrage

### Première fois
```bash
# 1. Backend - Installation
cd backend
npm install

# 2. Frontend - Installation
cd ../frontend
npm install

# 3. Backend - Démarrer (Terminal 1)
cd ../backend
npm run dev

# 4. Frontend - Démarrer (Terminal 2)
cd ../frontend
npm run dev
```

### Démarrage quotidien
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## 📦 Backend (Convex)

### Développement
```bash
cd backend
npm run dev          # Démarrer en mode développement avec hot-reload
```

### Déploiement
```bash
cd backend
npm run deploy       # Déployer en production sur Convex
```

### Gestion des dépendances
```bash
cd backend
npm install          # Installer les dépendances
npm update           # Mettre à jour les dépendances
```

## 🎨 Frontend (React + Vite)

### Développement
```bash
cd frontend
npm run dev          # Démarrer le serveur de développement (port 5173)
```

### Build
```bash
cd frontend
npm run build        # Build pour la production (output: dist/)
npm run preview      # Prévisualiser le build de production
```

### Linting
```bash
cd frontend
npm run lint         # Vérifier le code avec ESLint
```

### Gestion des dépendances
```bash
cd frontend
npm install          # Installer les dépendances
npm update           # Mettre à jour les dépendances
```

## 🔧 Utilitaires

### Nettoyer et réinstaller
```bash
# Backend
cd backend
rm -rf node_modules
rm package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
```

### Vérifier les versions
```bash
node --version       # Version de Node.js
npm --version        # Version de npm
```

### Voir les processus en cours
```bash
# Windows
netstat -ano | findstr :5173    # Frontend
netstat -ano | findstr :3000    # Backend (si applicable)

# Tuer un processus par port
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process
```

## 🗄️ Convex CLI

### Authentification
```bash
cd backend
npx convex login     # Se connecter à Convex
npx convex logout    # Se déconnecter
```

### Gestion du projet
```bash
cd backend
npx convex dev       # Mode développement (équivalent à npm run dev)
npx convex deploy    # Déployer (équivalent à npm run deploy)
```

### Données
```bash
cd backend
npx convex data      # Ouvrir le dashboard des données
npx convex logs      # Voir les logs en temps réel
```

## 🔍 Debugging

### Logs backend
```bash
cd backend
npm run dev          # Les logs s'affichent dans le terminal
```

### Logs frontend
- Ouvrir DevTools (F12)
- Onglet Console

### Vérifier la connexion Convex
```bash
# Dans le terminal backend, vous devriez voir :
# ✓ Connected to Convex
# ✓ Watching for changes...
```

## 📊 Monitoring

### Dashboard Convex
```bash
# Ouvrir dans le navigateur
https://dashboard.convex.dev
```

### Vérifier l'état de l'application
```bash
# Frontend
curl http://localhost:5173

# Backend Convex
# Vérifier dans le terminal si "Connected to Convex" apparaît
```

## 🧪 Tests

### Tester l'authentification
```bash
# 1. Démarrer l'application
# 2. Ouvrir http://localhost:5173
# 3. Suivre les instructions dans TEST.md
```

## 🔄 Mise à jour

### Mettre à jour Convex
```bash
cd backend
npm update convex
```

### Mettre à jour React et Vite
```bash
cd frontend
npm update react react-dom vite
```

## 📝 Scripts personnalisés

### Créer un script de démarrage complet

**Windows (start.bat)**
```batch
@echo off
start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"
start http://localhost:5173
```

**Linux/Mac (start.sh)**
```bash
#!/bin/bash
gnome-terminal -- bash -c "cd backend && npm run dev; exec bash"
gnome-terminal -- bash -c "cd frontend && npm run dev; exec bash"
sleep 3
xdg-open http://localhost:5173
```

## 🛑 Arrêter l'application

### Arrêter proprement
```bash
# Dans chaque terminal
Ctrl + C

# Ou fermer les fenêtres de terminal
```

### Forcer l'arrêt (si bloqué)
```bash
# Windows
taskkill /F /IM node.exe

# Linux/Mac
killall node
```

## 📚 Aide

### Aide Convex
```bash
npx convex --help
npx convex dev --help
npx convex deploy --help
```

### Aide npm
```bash
npm help
npm help install
npm help run-script
```

## 🔗 Liens rapides

- Frontend local : http://localhost:5173
- Convex Dashboard : https://dashboard.convex.dev
- Projet Convex : https://calculating-magpie-762.convex.cloud

## ⚡ Raccourcis

```bash
# Tout démarrer en une commande (nécessite tmux ou screen)
tmux new-session -d -s backend 'cd backend && npm run dev'
tmux new-session -d -s frontend 'cd frontend && npm run dev'

# Arrêter tout
tmux kill-session -t backend
tmux kill-session -t frontend
```

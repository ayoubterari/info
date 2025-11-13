# FreeL Frontend

Un projet React moderne et performant construit avec Vite, TailwindCSS et Lucide icons.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 16+ et npm/yarn/pnpm

### Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Construire pour la production
npm run build

# Prévisualiser la build de production
npm run preview
```

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── main.jsx          # Point d'entrée React
│   ├── App.jsx           # Composant principal
│   └── index.css         # Styles globaux avec TailwindCSS
├── index.html            # HTML principal
├── vite.config.js        # Configuration Vite
├── tailwind.config.js    # Configuration TailwindCSS
├── postcss.config.js     # Configuration PostCSS
└── package.json          # Dépendances du projet
```

## 🛠️ Technologies utilisées

- **React 18** - Bibliothèque UI
- **Vite** - Build tool et dev server ultra-rapide
- **TailwindCSS** - Framework CSS utilitaire
- **Lucide React** - Icônes SVG modernes

## 📦 Scripts disponibles

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Créer une build de production
- `npm run preview` - Prévisualiser la build de production
- `npm run lint` - Vérifier le code avec ESLint

## 🎨 Personnalisation

### Ajouter des composants
Créez des fichiers `.jsx` dans le dossier `src/components/` et importez-les dans `App.jsx`.

### Modifier les styles
- Modifiez `src/index.css` pour les styles globaux
- Utilisez les classes TailwindCSS directement dans vos composants
- Personnalisez `tailwind.config.js` pour étendre le thème

## 📝 Licence

MIT

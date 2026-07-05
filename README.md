# PDF++ Annotation Companion

Vue latérale Obsidian qui liste les annotations du PDF actif (plugin PDF++) et permet de naviguer rapidement dans le document.

## Prérequis

- Node.js + pnpm ou npm
- Obsidian installé
- Plugin **PDF++ (obsidian-pdf-plus)** installé et activé

## Installation des dépendances

Dans le dossier du plugin :

```bash
pnpm install
# ou
npm install
```

## Build

```bash
pnpm run build
# ou
npm run build
```

Le build génère le fichier `main.js` à la racine du plugin.

## Installation dans Obsidian

1. Copier le dossier du plugin (contenant `manifest.json`, `main.js`, `styles.css` éventuel) dans :
   - `<votre_vault>/.obsidian/plugins/pdf-annotation-companion`
2. Redémarrer Obsidian ou recharger les plugins (`Ctrl+P` → « Reload app without saving »).
3. Activer **PDF++ Annotation Companion** dans les paramètres → Plugins communautaires.

## Catalogue Obsidian

- **ID plugin** : `pdf-annotation-companion`
- **Dépôt** : [github.com/Morglaf/PDF---Annotation-Companion](https://github.com/Morglaf/PDF---Annotation-Companion)
- **Licence** : MIT — [LICENSE](LICENSE)
- **Réseau** : non — lit les annotations via l’API du plugin PDF++ déjà installé
- **Dépendance** : [PDF++](https://github.com/RyotaUshio/obsidian-pdf-plus) (`obsidian-pdf-plus`) doit être installé et activé
- **Télémétrie / mise à jour auto** : non
- **Release** : `.\Release-Plugin.ps1`


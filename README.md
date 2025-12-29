# Lecteur de Livres

Une application web moderne pour lire vos livres numériques (PDF) avec un design minimaliste et élégant.

## Caractéristiques

- **Design Soft & Minimaliste** : Interface épurée avec des couleurs douces et apaisantes
- **Lecture Sécurisée** : Les livres ne peuvent pas être téléchargés depuis la page de lecture
- **Glisser-Déposer** : Importez vos livres facilement par glisser-déposer
- **Navigation Intuitive** : Changez de page, zoomez, et naviguez facilement
- **Privé** : Tous les fichiers restent sur votre appareil, rien n'est envoyé à un serveur
- **Responsive** : Fonctionne sur desktop, tablette et mobile

## Technologies Utilisées

- **React** : Framework JavaScript pour l'interface utilisateur
- **Bootstrap 5** : Framework CSS pour le design responsive
- **React Router** : Navigation entre les pages
- **React PDF** : Affichage des fichiers PDF
- **Vite** : Outil de build rapide

## Installation

1. Clonez le repository
2. Installez les dépendances :
```bash
npm install
```

3. Lancez le serveur de développement :
```bash
npm run dev
```

4. Ouvrez votre navigateur à l'adresse indiquée (généralement http://localhost:5173)

## Utilisation

1. **Importez un livre** : Sur la page d'accueil, glissez-déposez un fichier PDF ou cliquez sur "Parcourir les fichiers"
2. **Lisez votre livre** : Cliquez sur "Commencer la lecture" pour ouvrir le lecteur
3. **Naviguez** : Utilisez les boutons "Précédent" et "Suivant" pour changer de page
4. **Zoomez** : Utilisez les boutons + et - pour ajuster le zoom
5. **Fermez** : Cliquez sur la flèche retour pour revenir à la page d'accueil

## Sécurité

- Le clic droit est désactivé dans le lecteur pour empêcher le téléchargement
- Les raccourcis clavier de sauvegarde (Ctrl+S, Ctrl+P) sont désactivés
- Les fichiers sont stockés localement et ne sont jamais envoyés à un serveur

## Build pour Production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`.

## License

MIT

# Aristem

Centre de contrôle personnel installable (PWA) : tableau de bord (météo, marchés, ISS, séismes, globe interactif), projets avec étapes, chat IA, caméra « Satoru » et veille d'actualités.

Site statique : aucun serveur ni build.

## Lancer en local

```bash
npx serve .
```

Puis ouvrir l'adresse affichée. Le Service Worker et la caméra exigent HTTPS ou `localhost`.

## Déployer

1. Pousser ce dépôt sur GitHub.
2. Sur vercel.com : **Add New → Project**, choisir le dépôt, **Framework Preset : Other**, **Deploy**.
3. Sur téléphone : ouvrir l'adresse puis « Ajouter à l'écran d'accueil ».

## Clés API (gratuites)

Saisies dans **Réglages**, elles restent dans le navigateur de chaque appareil. Ne jamais les écrire dans le code.

- Gemini : https://aistudio.google.com/apikey
- Groq : https://console.groq.com/keys
- OpenRouter : https://openrouter.ai/keys

Un nouveau service d'IA doit être ajouté à `connect-src` dans la balise Content-Security-Policy de `index.html`.

## Mettre à jour

À chaque modification, changer le nom du cache dans `sw.js` (`aristem-v6` → `aristem-v7`) pour que les appareils récupèrent la nouvelle version.

## Sauvegarde

Réglages → **Exporter mes données** (le fichier ne contient pas les clés).

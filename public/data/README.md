# Guide d'utilisation des fichiers de données

## Structure des fichiers

Les exercices sont stockés dans des fichiers JSON dans le dossier `public/data/`.

### Exercices de français

#### CP et CE1 (par thème)
- `french-cp.json` : exercices CP avec choix multiples
- `french-ce1.json` : exercices CE1 avec choix multiples

Structure :
```json
{
  "on": [
    {
      "word": "MAISON",
      "image": "🏠",
      "definition": "Endroit où on habite avec sa famille",
      "pronunciation": "/mè-zon/",
      "options": ["MAISON", "MEZON", "MAZON"]
    }
  ],
  "ou": [...],
  "an": [...],
  "in": [...],
  "oi": [...],
  "ch": [...]
}
```

Pour CE1, ajouter aussi le thème "tion".

#### CE2, CM1, CM2 (orthographe générale)
- `french-ce2.json`
- `french-cm1.json`
- `french-cm2.json`

Structure :
```json
[
  {
    "word": "ÉLÉPHANT",
    "image": "🐘",
    "definition": "Très grand animal gris avec une longue trompe",
    "pronunciation": "/é-lé-fan/"
  }
]
```

## Comment ajouter des mots

### Pour CP/CE1 :

1. Ouvrir `public/data/french-cp.json` ou `french-ce1.json`
2. Trouver le thème (on, ou, an, in, oi, ch, tion)
3. Ajouter un nouvel objet dans le tableau :

```json
{
  "word": "NOUVEAU_MOT",
  "image": "🎨",
  "definition": "La définition du mot",
  "pronunciation": "/prononciation/",
  "options": ["BONNE_ORTHO", "MAUVAISE1", "MAUVAISE2"]
}
```

### Pour CE2/CM1/CM2 :

1. Ouvrir le fichier correspondant
2. Ajouter un nouvel objet dans le tableau :

```json
{
  "word": "NOUVEAU_MOT",
  "image": "🎨",
  "definition": "La définition du mot",
  "pronunciation": "/prononciation/"
}
```

## Conseils

- Utilisez des emojis pertinents pour l'image
- Les mots doivent être en MAJUSCULES
- La prononciation est entre / /
- Pour les choix multiples, mettez toujours la bonne réponse en premier
- Ajoutez 8 mots par thème pour un exercice complet

## Validation

Après modification, vérifiez que le JSON est valide :
- Utilisez un validateur JSON en ligne
- Ou testez directement en lançant l'application

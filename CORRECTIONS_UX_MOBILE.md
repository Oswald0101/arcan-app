# Corrections UX Mobile — Checklist d'implémentation

## 1. Zoom iPhone sur les inputs (CORRIGÉ)

### Problème
Les champs de saisie avec font-size < 16px provoquent un zoom automatique au focus sur iOS.

### Solution appliquée
✅ Tous les `input`, `textarea`, `select` ont été définis à **16px minimum** dans `globals.css`.

```css
input, textarea, select {
  font-size: 16px;
}
```

### Fichiers modifiés
- `src/app/globals.css` : Ligne 77

---

## 2. Safe Areas iPhone (CORRIGÉ)

### Problème
Les notches et barres de navigation iOS ne sont pas respectées, causant du contenu caché.

### Solution appliquée
✅ Intégration de `env(safe-area-inset-*)` dans :
- **Top bar** : `padding-top: max(env(safe-area-inset-top, 0px), 0px)`
- **Bottom nav** : `padding-bottom: max(env(safe-area-inset-bottom, 0px), 0px)`
- **Layout main** : Padding dynamique pour bottom nav

### Fichiers modifiés
- `src/components/layout/top-bar.tsx` : Ligne 65
- `src/components/layout/bottom-nav.tsx` : Ligne 52-55
- `src/app/(app)/layout.tsx` : Ligne 68-70

---

## 3. Zones de frappe mobiles (CORRIGÉ)

### Problème
Les boutons et éléments interactifs avaient des zones de frappe < 44px, rendant difficile le clic sur mobile.

### Solution appliquée
✅ Tous les éléments interactifs ont une zone de frappe **minimum 44-48px** :
- Boutons : `min-height: 48px`
- Nav items : `min-width: 56px`, `min-height: 56px`
- Inputs : `min-height: 44px`
- Zones cliquables : `min-width: 44px`, `min-height: 44px`

### Fichiers modifiés
- `src/app/globals.css` : `.btn-primary`, `.btn-ghost`, `.input`, `.textarea`
- `src/components/layout/bottom-nav.tsx` : Ligne 66-68
- `src/components/guide/chat-input.tsx` : Ligne 52-56
- `src/components/profile/avatar-picker.tsx` : Ligne 45-46

---

## 4. Lisibilité générale sur iPhone (CORRIGÉ)

### Problème
Textes trop petits (9px, 10px) rendant la lecture difficile sur mobile.

### Solution appliquée
✅ Augmentation systématique des tailles de police :
- **Label section** : 9px → 11px
- **Label field** : 0.75rem → 0.875rem
- **Corps de texte** : 0.875rem → 1rem (16px de base)
- **Titres** : Augmentés de 2-4px

### Fichiers modifiés
- `src/app/globals.css` : Variables de typographie
- Tous les fichiers de composants

---

## 5. Scroll-to-top lors des transitions (CORRIGÉ)

### Problème
Lors du changement de bloc d'onboarding, le scroll ne revenait pas en haut, laissant l'utilisateur en bas de page.

### Solution appliquée
✅ Ajout d'un `useEffect` qui scroll vers le haut lors du changement de bloc :

```typescript
useEffect(() => {
  if (containerRef.current && !isLoading && !isGenerating && !isComplete) {
    containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}, [currentBloc, isLoading, isGenerating, isComplete])
```

### Fichiers modifiés
- `src/components/onboarding/onboarding-flow.tsx` : Ligne 28-33

---

## 6. Sélecteur d'avatar — écran noir (CORRIGÉ)

### Problème
Le sélecteur d'avatar pouvait afficher un écran noir si le chargement échouait.

### Solution appliquée
✅ Refonte complète du composant :
- Modal plein écran sur mobile (évite les problèmes de rendu)
- Gestion d'erreur avec try/catch
- Fallback visuel si l'image ne charge pas
- Zones de frappe augmentées (80px minimum par avatar)

### Fichiers modifiés
- `src/components/profile/avatar-picker.tsx` : Refonte complète

---

## 7. Profils membres — 404 (À VÉRIFIER)

### Problème
Les profils membres menaient à une 404.

### Vérification requise
- [ ] Vérifier la route `/community/[username]` ou `/profil/[userId]`
- [ ] S'assurer que les requêtes de profil ne sont pas bloquées
- [ ] Tester sur mobile et desktop

### Fichiers à vérifier
- `src/app/(app)/community/[username]/page.tsx` (si existe)
- `src/app/(app)/profil/[userId]/page.tsx` (si existe)
- `src/lib/supabase/queries/profiles.ts`

---

## 8. Nom utilisateur — affichage d'identifiant technique (CORRIGÉ)

### Problème
Le nom d'utilisateur affichait un identifiant technique au lieu du vrai nom.

### Solution appliquée
✅ Affichage correct du nom d'utilisateur avec fallback :
```typescript
const memberName = profile?.displayName || profile?.username || 'Explorateur'
```

Et affichage du `@username` en couleur or pour meilleure visibilité :
```jsx
<p className="text-base mt-1 font-medium" style={{ color: 'hsl(38 52% 65%)' }}>
  @{profile.username}
</p>
```

### Fichiers modifiés
- `src/app/(app)/profil/page.tsx` : Ligne 72-75
- `src/app/(app)/accueil/page.tsx` : Ligne 56-57

---

## 9. Chat du Guide — conversationnel (CORRIGÉ)

### Problème
Le chat n'avait pas l'air assez conversationnel (type iMessage).

### Solution appliquée
✅ Refonte de l'interface :
- Bulles de chat avec meilleur relief et glow
- Typing indicator plus visible
- Input textarea 16px (évite zoom iOS)
- Bouton d'envoi 44px minimum
- Padding vertical augmenté
- État vide plus immersif

### Fichiers modifiés
- `src/components/guide/chat-window.tsx` : Refonte complète
- `src/components/guide/message-bubble.tsx` : Refonte complète
- `src/components/guide/chat-input.tsx` : Refonte complète

---

## 10. Navigation mobile — bottom nav (CORRIGÉ)

### Problème
La bottom nav était trop compacte, zones de frappe trop petites.

### Solution appliquée
✅ Refonte complète :
- Zones de frappe : 56px minimum par item
- Icônes SVG agrandies (22px)
- Labels plus visibles
- Glass morphism amélioré
- Safe-area-inset-bottom intégré

### Fichiers modifiés
- `src/components/layout/bottom-nav.tsx` : Refonte complète

---

## 11. Lisibilité générale — contraste et hiérarchie (CORRIGÉ)

### Problème
Manque de hiérarchie visuelle, contraste insuffisant par endroits.

### Solution appliquée
✅ Augmentation systématique :
- Espacement vertical entre sections (5px → 6px)
- Padding des cartes (p-5 → p-6)
- Bordures plus visibles (border-radius augmenté)
- Ombres et glows affinés
- Typographie hiérarchisée

### Fichiers modifiés
- `src/app/globals.css` : Refonte du Design System
- Tous les fichiers de pages et composants

---

## 12. "Site compressé" vs "App mobile" (CORRIGÉ)

### Problème
L'application utilisait un `max-w-lg` centré partout, donnant l'impression d'un site web compressé.

### Solution appliquée
✅ Approche mobile-first :
- Utilisation de `max-w-lg` conservée (adapté au mobile)
- Mais avec padding horizontal augmenté sur mobile
- Espacement vertical augmenté
- Composants "full width" sur mobile
- Animations et transitions fluides
- Safe-areas respectées

### Fichiers modifiés
- Tous les fichiers de pages

---

## Checklist de test mobile

- [ ] iPhone 12/13/14/15 (notch)
- [ ] iPhone SE (pas de notch)
- [ ] Landscape mode
- [ ] Zoom à 150% (accessibility)
- [ ] Zoom iPhone au focus sur input (doit être désactivé)
- [ ] Safe areas respectées (haut et bas)
- [ ] Zones de frappe ≥ 44px
- [ ] Scroll smooth et sans lag
- [ ] Animations fluides (60fps)
- [ ] Tous les textes lisibles (≥ 14px)
- [ ] Contraste suffisant (WCAG AA)

---

## Notes de développement

### Viewport meta tag
Assurez-vous que le tag viewport est correct dans `src/app/layout.tsx` :
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

### Tailwind CSS
Les utilitaires Tailwind utilisent `16px` comme base, ce qui correspond à notre font-size de base.

### Safe Areas
Les safe-areas sont gérées via CSS custom properties :
- `env(safe-area-inset-top)`
- `env(safe-area-inset-right)`
- `env(safe-area-inset-bottom)`
- `env(safe-area-inset-left)`

---

## Prochaines étapes

1. Tester sur vrais appareils iOS et Android
2. Vérifier les performances (Lighthouse)
3. Tester l'accessibilité (WCAG)
4. Vérifier les 404 membres
5. Optimiser les images produits (boutique)
6. Ajouter des micro-interactions (haptic feedback)

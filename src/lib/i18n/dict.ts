// src/lib/i18n/dict.ts
// Dictionnaire de traductions UI — FR (référence) + EN, ES, PT

export type Lang = 'fr' | 'en' | 'es' | 'pt'

const dict = {
  // ── Navigation ──
  nav_home:        { fr: 'Accueil',    en: 'Home',       es: 'Inicio',    pt: 'Início'      },
  nav_guide:       { fr: 'Guide',      en: 'Guide',      es: 'Guía',      pt: 'Guia'        },
  nav_paths:       { fr: 'Voies',      en: 'Paths',      es: 'Vías',      pt: 'Vias'        },
  nav_community:   { fr: 'Communauté', en: 'Community',  es: 'Comunidad', pt: 'Comunidade'  },
  nav_codex:       { fr: 'Codex',      en: 'Codex',      es: 'Códex',     pt: 'Codex'       },
  nav_profile:     { fr: 'Profil',     en: 'Profile',    es: 'Perfil',    pt: 'Perfil'      },

  // ── Accueil ──
  greeting_morning:   { fr: 'Bonjour,',        en: 'Good morning,',   es: 'Buenos días,',    pt: 'Bom dia,'      },
  greeting_afternoon: { fr: 'Bon après-midi,', en: 'Good afternoon,', es: 'Buenas tardes,',  pt: 'Boa tarde,'    },
  greeting_evening:   { fr: 'Bonsoir,',        en: 'Good evening,',   es: 'Buenas noches,',  pt: 'Boa noite,'    },
  greeting_night:     { fr: 'Bonne nuit,',     en: 'Good night,',     es: 'Buenas noches,',  pt: 'Boa noite,'    },

  streak_days:     { fr: 'Jours consécutifs', en: 'Day streak', es: 'Días seguidos',   pt: 'Dias seguidos' },
  practices_today: { fr: 'Pratiques du jour', en: 'Today\'s practices', es: 'Prácticas del día', pt: 'Práticas do dia' },
  see_all:         { fr: 'Voir tout →',       en: 'See all →',        es: 'Ver todo →',       pt: 'Ver tudo →'     },
  my_path:         { fr: 'Ma Voie',           en: 'My Path',          es: 'Mi Vía',           pt: 'Minha Via'       },
  recent_badges:   { fr: 'Badges récents',    en: 'Recent badges',    es: 'Medallas recientes', pt: 'Medalhas recentes' },
  go_premium:      { fr: 'Passe au Premium',  en: 'Go Premium',       es: 'Hazte Premium',    pt: 'Seja Premium'   },

  // ── Guide ──
  guide_online:    { fr: 'En ligne',       en: 'Online',           es: 'En línea',         pt: 'Online'         },
  guide_typing:    { fr: 'En train d\'écrire…', en: 'Typing…',     es: 'Escribiendo…',     pt: 'Digitando…'     },
  guide_placeholder: { fr: 'Écris quelque chose…', en: 'Write something…', es: 'Escribe algo…', pt: 'Escreva algo…' },
  guide_empty_title: { fr: 'Prêt à t\'accompagner', en: 'Ready to accompany you', es: 'Listo para acompañarte', pt: 'Pronto para acompanhar' },
  guide_empty_sub:   { fr: 'Pose une question, partage une pensée.', en: 'Ask a question, share a thought.', es: 'Haz una pregunta, comparte un pensamiento.', pt: 'Faça uma pergunta, compartilhe um pensamento.' },

  // ── Profil ──
  profile_edit:     { fr: 'Modifier',           en: 'Edit',              es: 'Editar',           pt: 'Editar'           },
  profile_since:    { fr: 'Membre depuis',       en: 'Member since',      es: 'Miembro desde',    pt: 'Membro desde'     },
  profile_level:    { fr: 'Niveau',              en: 'Level',             es: 'Nivel',            pt: 'Nível'            },
  profile_logout:   { fr: 'Se déconnecter',      en: 'Log out',           es: 'Cerrar sesión',    pt: 'Sair'             },
  profile_settings: { fr: 'Paramètres',          en: 'Settings',          es: 'Ajustes',          pt: 'Configurações'    },
  profile_privacy:  { fr: 'Confidentialité',     en: 'Privacy',           es: 'Privacidad',       pt: 'Privacidade'      },
  profile_shop:     { fr: 'Boutique',            en: 'Shop',              es: 'Tienda',           pt: 'Loja'             },
  profile_referral: { fr: 'Parrainage',          en: 'Referral',          es: 'Referidos',        pt: 'Indicações'       },
  consecutive_days: { fr: 'jours consécutifs de pratique', en: 'consecutive days of practice', es: 'días consecutivos de práctica', pt: 'dias consecutivos de prática' },

  // ── Auth ──
  auth_login_title:    { fr: 'Bienvenue',           en: 'Welcome back',      es: 'Bienvenido',       pt: 'Bem-vindo'        },
  auth_login_sub:      { fr: 'Reprends ta Voie',    en: 'Continue your Path', es: 'Continúa tu Vía', pt: 'Continue sua Via' },
  auth_register_title: { fr: 'Commence ta Voie',    en: 'Start your Path',   es: 'Empieza tu Vía',   pt: 'Comece sua Via'   },
  auth_email:          { fr: 'Email',               en: 'Email',             es: 'Correo',           pt: 'E-mail'           },
  auth_password:       { fr: 'Mot de passe',        en: 'Password',          es: 'Contraseña',       pt: 'Senha'            },
  auth_username:       { fr: 'Nom d\'utilisateur',  en: 'Username',          es: 'Nombre de usuario', pt: 'Nome de usuário' },
  auth_login_btn:      { fr: 'Se connecter',        en: 'Log in',            es: 'Iniciar sesión',   pt: 'Entrar'           },
  auth_register_btn:   { fr: 'Créer mon compte',    en: 'Create account',    es: 'Crear cuenta',     pt: 'Criar conta'      },
  auth_google:         { fr: 'Continuer avec Google', en: 'Continue with Google', es: 'Continuar con Google', pt: 'Continuar com Google' },

  // ── Général ──
  save:            { fr: 'Sauvegarder',        en: 'Save',              es: 'Guardar',          pt: 'Salvar'           },
  cancel:          { fr: 'Annuler',            en: 'Cancel',            es: 'Cancelar',         pt: 'Cancelar'         },
  loading:         { fr: 'Chargement…',        en: 'Loading…',          es: 'Cargando…',        pt: 'Carregando…'      },
  error_generic:   { fr: 'Une erreur est survenue. Réessaie.', en: 'An error occurred. Please try again.', es: 'Ocurrió un error. Inténtalo de nuevo.', pt: 'Ocorreu um erro. Tente novamente.' },
}

export type DictKey = keyof typeof dict

/** Traduit une clé selon la langue — fallback FR si manquant */
export function t(lang: Lang, key: DictKey): string {
  const entry = dict[key]
  if (!entry) return key
  return entry[lang] ?? entry['fr']
}

/** Crée un traducteur lié à une langue — usage: const tr = useT('en'); tr('nav_home') */
export function makeT(lang: Lang) {
  return (key: DictKey): string => t(lang, key)
}

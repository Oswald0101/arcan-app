// src/lib/onboarding/questions.ts
// Source unique de vérité pour toutes les questions d'onboarding
// 8 blocs, questions fermées + ouvertes, multilingue FR/EN/ES/PT

export type QuestionType = 'free_text' | 'single_choice' | 'multi_choice' | 'scale'

export interface OnboardingQuestion {
  key: string
  type: QuestionType
  bloc: number
  required: boolean
  labels: Record<string, string>
  placeholder?: Record<string, string>
  options?: Record<string, string[]>
  min?: number
  max?: number
  // Poids pour le scoring du profil de sensibilité
  scoring?: {
    dimension: ScoringDimension
    direction: 'positive' | 'negative' // positive = score augmente avec la valeur
    weight: number // 0.0 à 1.0
  }[]
}

export type ScoringDimension =
  | 'need_for_structure'
  | 'need_for_meaning'
  | 'spiritual_affinity'
  | 'symbolic_affinity'
  | 'rational_affinity'
  | 'community_desire'
  | 'confrontation_preference'
  | 'softness_preference'
  | 'commitment_level'
  | 'emotional_stability'
  | 'creation_desire'

// ============================================================
// BLOC 1 — Intention
// ============================================================

export const BLOC_1: OnboardingQuestion[] = [
  {
    key: 'arrival_reason',
    type: 'single_choice',
    bloc: 1,
    required: true,
    labels: {
      fr: 'Qu\'est-ce qui t\'a amené ici aujourd\'hui ?',
      en: 'What brought you here today?',
      es: '¿Qué te trajo aquí hoy?',
      pt: 'O que te trouxe aqui hoje?',
    },
    options: {
      fr: [
        'Je cherche du sens et une direction',
        'Je veux me structurer et progresser',
        'Je cherche une communauté qui me ressemble',
        'Je veux créer quelque chose de personnel',
        'Je suis curieux de voir ce que c\'est',
        'Autre chose',
      ],
      en: [
        'I\'m looking for meaning and direction',
        'I want to structure myself and progress',
        'I\'m looking for a community that resembles me',
        'I want to create something personal',
        'I\'m curious to see what this is',
        'Something else',
      ],
      es: [
        'Busco sentido y dirección',
        'Quiero estructurarme y progresar',
        'Busco una comunidad que se me parezca',
        'Quiero crear algo personal',
        'Tengo curiosidad por ver qué es esto',
        'Otra cosa',
      ],
      pt: [
        'Estou buscando sentido e direção',
        'Quero me estruturar e progredir',
        'Estou buscando uma comunidade que se pareça comigo',
        'Quero criar algo pessoal',
        'Estou curioso para ver o que é isso',
        'Outra coisa',
      ],
    },
    scoring: [
      { dimension: 'need_for_meaning', direction: 'positive', weight: 0.7 },
      { dimension: 'creation_desire', direction: 'positive', weight: 0.5 },
    ],
  },
  {
    key: 'missing_today',
    type: 'free_text',
    bloc: 1,
    required: true,
    labels: {
      fr: 'Qu\'est-ce qui manque aujourd\'hui dans ta vie intérieure ?',
      en: 'What is missing in your inner life today?',
      es: '¿Qué le falta hoy a tu vida interior?',
      pt: 'O que falta hoje na sua vida interior?',
    },
    placeholder: {
      fr: 'Prends le temps d\'y réfléchir. Tes mots comptent.',
      en: 'Take the time to think about it. Your words matter.',
      es: 'Tómate el tiempo para reflexionar. Tus palabras importan.',
      pt: 'Tome o tempo para refletir. Suas palavras importam.',
    },
    scoring: [
      { dimension: 'need_for_meaning', direction: 'positive', weight: 0.6 },
    ],
  },
  {
    key: 'intention_type',
    type: 'single_choice',
    bloc: 1,
    required: true,
    labels: {
      fr: 'Tu viens plutôt pour créer ou pour rejoindre ?',
      en: 'Are you here to create or to join?',
      es: '¿Vienes más para crear o para unirte?',
      pt: 'Você veio mais para criar ou para se juntar?',
    },
    options: {
      fr: [
        'Je veux créer ma propre Voie',
        'Je veux rejoindre une Voie existante',
        'Je ne sais pas encore',
      ],
      en: [
        'I want to create my own Path',
        'I want to join an existing Path',
        'I don\'t know yet',
      ],
      es: [
        'Quiero crear mi propio Camino',
        'Quiero unirme a un Camino existente',
        'Aún no lo sé',
      ],
      pt: [
        'Quero criar meu próprio Caminho',
        'Quero me juntar a um Caminho existente',
        'Ainda não sei',
      ],
    },
    scoring: [
      { dimension: 'creation_desire', direction: 'positive', weight: 0.9 },
    ],
  },
]

// ============================================================
// BLOC 2 — Profil intérieur
// ============================================================

export const BLOC_2: OnboardingQuestion[] = [
  {
    key: 'current_state',
    type: 'free_text',
    bloc: 2,
    required: true,
    labels: {
      fr: 'En quelques mots, où en es-tu dans ta vie en ce moment ?',
      en: 'In a few words, where are you in your life right now?',
      es: '¿En pocas palabras, cómo estás en tu vida ahora mismo?',
      pt: 'Em poucas palavras, onde você está na sua vida agora?',
    },
    placeholder: {
      fr: 'Sois honnête. Personne ne te juge ici.',
      en: 'Be honest. No one is judging you here.',
      es: 'Sé honesto. Nadie te juzga aquí.',
      pt: 'Seja honesto. Ninguém te julga aqui.',
    },
    scoring: [
      { dimension: 'emotional_stability', direction: 'positive', weight: 0.4 },
    ],
  },
  {
    key: 'main_struggle',
    type: 'free_text',
    bloc: 2,
    required: true,
    labels: {
      fr: 'Quelle est ta plus grande lutte intérieure en ce moment ?',
      en: 'What is your biggest inner struggle right now?',
      es: '¿Cuál es tu mayor lucha interior en este momento?',
      pt: 'Qual é a sua maior luta interior agora?',
    },
    placeholder: {
      fr: 'Ce qui te pèse vraiment, même si c\'est difficile à formuler.',
      en: 'What truly weighs on you, even if it\'s hard to put into words.',
      es: 'Lo que realmente te pesa, aunque sea difícil de formular.',
      pt: 'O que realmente te pesa, mesmo que seja difícil de formular.',
    },
    scoring: [
      { dimension: 'emotional_stability', direction: 'negative', weight: 0.5 },
      { dimension: 'need_for_meaning', direction: 'positive', weight: 0.4 },
    ],
  },
  {
    key: 'quality_to_strengthen',
    type: 'free_text',
    bloc: 2,
    required: true,
    labels: {
      fr: 'Quelle qualité veux-tu vraiment renforcer en toi ?',
      en: 'What quality do you truly want to strengthen in yourself?',
      es: '¿Qué cualidad quieres realmente reforzar en ti mismo?',
      pt: 'Que qualidade você realmente quer fortalecer em si mesmo?',
    },
    placeholder: {
      fr: 'Discipline, clarté, courage, présence, autre chose...',
      en: 'Discipline, clarity, courage, presence, something else...',
      es: 'Disciplina, claridad, coraje, presencia, otra cosa...',
      pt: 'Disciplina, clareza, coragem, presença, outra coisa...',
    },
    scoring: [
      { dimension: 'need_for_structure', direction: 'positive', weight: 0.4 },
      { dimension: 'commitment_level', direction: 'positive', weight: 0.5 },
    ],
  },
  {
    key: 'support_type',
    type: 'single_choice',
    bloc: 2,
    required: true,
    labels: {
      fr: 'De quel type de soutien as-tu le plus besoin ?',
      en: 'What type of support do you need most?',
      es: '¿Qué tipo de apoyo necesitas más?',
      pt: 'Que tipo de apoio você mais precisa?',
    },
    options: {
      fr: ['Être challengé et poussé', 'Être guidé avec douceur', 'Être écouté et compris', 'Être structuré et cadré', 'Être inspiré et élevé'],
      en: ['Being challenged and pushed', 'Being guided gently', 'Being heard and understood', 'Being structured and framed', 'Being inspired and elevated'],
      es: ['Ser desafiado y empujado', 'Ser guiado con suavidad', 'Ser escuchado y comprendido', 'Ser estructurado y enmarcado', 'Ser inspirado y elevado'],
      pt: ['Ser desafiado e empurrado', 'Ser guiado com suavidade', 'Ser ouvido e compreendido', 'Ser estruturado e enquadrado', 'Ser inspirado e elevado'],
    },
    scoring: [
      { dimension: 'confrontation_preference', direction: 'positive', weight: 0.8 },
      { dimension: 'softness_preference', direction: 'positive', weight: 0.6 },
    ],
  },
]

// ============================================================
// BLOC 3 — Rapport au sens et au sacré
// ============================================================

export const BLOC_3: OnboardingQuestion[] = [
  {
    key: 'spirituality_relation',
    type: 'single_choice',
    bloc: 3,
    required: true,
    labels: {
      fr: 'Quel est ton rapport à la spiritualité ?',
      en: 'What is your relationship with spirituality?',
      es: '¿Cuál es tu relación con la espiritualidad?',
      pt: 'Qual é a sua relação com a espiritualidade?',
    },
    options: {
      fr: [
        'Je suis ancré dans une tradition précise',
        'Je suis spirituel mais sans étiquette',
        'Je cherche quelque chose sans savoir quoi',
        'Je suis plutôt rationnel et agnostique',
        'La spiritualité m\'intéresse peu',
      ],
      en: [
        'I am rooted in a specific tradition',
        'I am spiritual but without a label',
        'I am searching for something without knowing what',
        'I am rather rational and agnostic',
        'Spirituality doesn\'t interest me much',
      ],
      es: [
        'Estoy arraigado en una tradición específica',
        'Soy espiritual pero sin etiqueta',
        'Busco algo sin saber qué',
        'Soy más bien racional y agnóstico',
        'La espiritualidad me interesa poco',
      ],
      pt: [
        'Estou enraizado em uma tradição específica',
        'Sou espiritual mas sem rótulo',
        'Estou buscando algo sem saber o quê',
        'Sou mais racional e agnóstico',
        'A espiritualidade me interessa pouco',
      ],
    },
    scoring: [
      { dimension: 'spiritual_affinity', direction: 'positive', weight: 0.9 },
      { dimension: 'rational_affinity', direction: 'negative', weight: 0.6 },
    ],
  },
  {
    key: 'truth_description',
    type: 'free_text',
    bloc: 3,
    required: true,
    labels: {
      fr: 'Si tu devais décrire la vérité que tu cherches, tu dirais quoi ?',
      en: 'If you had to describe the truth you are seeking, what would you say?',
      es: '¿Si tuvieras que describir la verdad que buscas, qué dirías?',
      pt: 'Se você tivesse que descrever a verdade que busca, o que diria?',
    },
    placeholder: {
      fr: 'Pas besoin que ce soit philosophique. Juste honnête.',
      en: 'No need for it to be philosophical. Just honest.',
      es: 'No es necesario que sea filosófico. Solo honesto.',
      pt: 'Não precisa ser filosófico. Apenas honesto.',
    },
    scoring: [
      { dimension: 'need_for_meaning', direction: 'positive', weight: 0.7 },
      { dimension: 'symbolic_affinity', direction: 'positive', weight: 0.5 },
    ],
  },
  {
    key: 'symbolic_affinities',
    type: 'multi_choice',
    bloc: 3,
    required: false,
    labels: {
      fr: 'Quels univers symboliques t\'attirent ? (plusieurs possibles)',
      en: 'Which symbolic universes attract you? (multiple possible)',
      es: '¿Qué universos simbólicos te atraen? (varios posibles)',
      pt: 'Quais universos simbólicos atraem você? (vários possíveis)',
    },
    options: {
      fr: [
        'Philosophies antiques (stoïcisme, épicurisme...)',
        'Spiritualités orientales (bouddhisme, hindouisme...)',
        'Traditions abrahamiques (islam, judaïsme, christianisme...)',
        'Ésotérisme et occultisme',
        'Traditions autochtones et chamanisme',
        'Franc-maçonnerie et ordres initiatiques',
        'Mythologies (grecque, nordique, égyptienne...)',
        'Philosophie moderne et contemporaine',
        'Rien de tout ça — je veux créer quelque chose de nouveau',
      ],
      en: [
        'Ancient philosophies (Stoicism, Epicureanism...)',
        'Eastern spiritualities (Buddhism, Hinduism...)',
        'Abrahamic traditions (Islam, Judaism, Christianity...)',
        'Esotericism and occultism',
        'Indigenous traditions and shamanism',
        'Freemasonry and initiatic orders',
        'Mythologies (Greek, Nordic, Egyptian...)',
        'Modern and contemporary philosophy',
        'None of these — I want to create something new',
      ],
      es: [
        'Filosofías antiguas (estoicismo, epicureísmo...)',
        'Espiritualidades orientales (budismo, hinduismo...)',
        'Tradiciones abrahámicas (islam, judaísmo, cristianismo...)',
        'Esoterismo y ocultismo',
        'Tradiciones indígenas y chamanismo',
        'Masonería y órdenes iniciáticas',
        'Mitologías (griega, nórdica, egipcia...)',
        'Filosofía moderna y contemporánea',
        'Nada de esto — quiero crear algo nuevo',
      ],
      pt: [
        'Filosofias antigas (estoicismo, epicurismo...)',
        'Espiritualidades orientais (budismo, hinduismo...)',
        'Tradições abraâmicas (islã, judaísmo, cristianismo...)',
        'Esoterismo e ocultismo',
        'Tradições indígenas e xamanismo',
        'Maçonaria e ordens iniciáticas',
        'Mitologias (grega, nórdica, egípcia...)',
        'Filosofia moderna e contemporânea',
        'Nada disso — quero criar algo novo',
      ],
    },
    scoring: [
      { dimension: 'symbolic_affinity', direction: 'positive', weight: 0.8 },
      { dimension: 'spiritual_affinity', direction: 'positive', weight: 0.6 },
    ],
  },
]

// ============================================================
// BLOC 4 — Rapport au cadre et à l'évolution
// ============================================================

export const BLOC_4: OnboardingQuestion[] = [
  {
    key: 'structure_need',
    type: 'single_choice',
    bloc: 4,
    required: true,
    labels: {
      fr: 'Quel type de cadre te correspond le mieux ?',
      en: 'Which type of framework suits you best?',
      es: '¿Qué tipo de marco te corresponde mejor?',
      pt: 'Que tipo de estrutura melhor se adapta a você?',
    },
    options: {
      fr: [
        'Un cadre strict avec des règles claires',
        'Un cadre souple avec des repères',
        'Peu de cadre — juste une direction',
        'Aucun cadre — liberté totale',
      ],
      en: [
        'A strict framework with clear rules',
        'A flexible framework with reference points',
        'Little structure — just a direction',
        'No structure — total freedom',
      ],
      es: [
        'Un marco estricto con reglas claras',
        'Un marco flexible con puntos de referencia',
        'Poca estructura — solo una dirección',
        'Sin estructura — libertad total',
      ],
      pt: [
        'Uma estrutura rígida com regras claras',
        'Uma estrutura flexível com pontos de referência',
        'Pouca estrutura — apenas uma direção',
        'Sem estrutura — total liberdade',
      ],
    },
    scoring: [
      { dimension: 'need_for_structure', direction: 'positive', weight: 0.9 },
    ],
  },
  {
    key: 'progression_appetite',
    type: 'scale',
    bloc: 4,
    required: true,
    min: 1,
    max: 5,
    labels: {
      fr: 'À quel point veux-tu être challengé et confronté à toi-même ? (1 = peu, 5 = beaucoup)',
      en: 'How much do you want to be challenged and confronted with yourself? (1 = little, 5 = a lot)',
      es: '¿Cuánto quieres ser desafiado y confrontado contigo mismo? (1 = poco, 5 = mucho)',
      pt: 'O quanto você quer ser desafiado e confrontado consigo mesmo? (1 = pouco, 5 = muito)',
    },
    scoring: [
      { dimension: 'confrontation_preference', direction: 'positive', weight: 1.0 },
      { dimension: 'commitment_level', direction: 'positive', weight: 0.7 },
    ],
  },
  {
    key: 'abandonment_fear',
    type: 'single_choice',
    bloc: 4,
    required: true,
    labels: {
      fr: 'Ton principal obstacle pour tenir dans la durée, c\'est quoi ?',
      en: 'What is your main obstacle to staying committed over time?',
      es: '¿Cuál es tu principal obstáculo para mantenerte comprometido a largo plazo?',
      pt: 'Qual é o seu principal obstáculo para se manter comprometido ao longo do tempo?',
    },
    options: {
      fr: [
        'Je perds motivation rapidement',
        'Je me disperse sur trop de choses',
        'Je manque de discipline',
        'J\'ai besoin de résultats visibles vite',
        'J\'ai peur d\'échouer',
        'Rien — je suis constant(e)',
      ],
      en: [
        'I lose motivation quickly',
        'I scatter myself on too many things',
        'I lack discipline',
        'I need visible results fast',
        'I\'m afraid of failing',
        'Nothing — I am consistent',
      ],
      es: [
        'Pierdo la motivación rápidamente',
        'Me disperso en demasiadas cosas',
        'Me falta disciplina',
        'Necesito resultados visibles rápido',
        'Tengo miedo de fracasar',
        'Nada — soy constante',
      ],
      pt: [
        'Perco a motivação rapidamente',
        'Me disperso em muitas coisas',
        'Me falta disciplina',
        'Preciso de resultados visíveis rapidamente',
        'Tenho medo de falhar',
        'Nada — sou constante',
      ],
    },
    scoring: [
      { dimension: 'commitment_level', direction: 'negative', weight: 0.6 },
      { dimension: 'emotional_stability', direction: 'positive', weight: 0.4 },
    ],
  },
]

// ============================================================
// BLOC 5 — Style de guide souhaité
// ============================================================

export const BLOC_5: OnboardingQuestion[] = [
  {
    key: 'guide_tone',
    type: 'single_choice',
    bloc: 5,
    required: true,
    labels: {
      fr: 'Comment veux-tu que ton Guide te parle ?',
      en: 'How do you want your Guide to speak to you?',
      es: '¿Cómo quieres que tu Guía te hable?',
      pt: 'Como você quer que seu Guia fale com você?',
    },
    options: {
      fr: [
        'Direct et sans filtre — la vérité même si ça pique',
        'Bienveillant mais honnête',
        'Philosophique et questionnant',
        'Sobre et stoïque',
        'Mystique et symbolique',
        'Fraternel et proche',
        'Solennel et inspirant',
      ],
      en: [
        'Direct and unfiltered — the truth even if it stings',
        'Kind but honest',
        'Philosophical and questioning',
        'Sober and stoic',
        'Mystical and symbolic',
        'Brotherly and close',
        'Solemn and inspiring',
      ],
      es: [
        'Directo y sin filtros — la verdad aunque duela',
        'Amable pero honesto',
        'Filosófico y cuestionador',
        'Sobrio y estoico',
        'Místico y simbólico',
        'Fraternal y cercano',
        'Solemne e inspirador',
      ],
      pt: [
        'Direto e sem filtros — a verdade mesmo que doa',
        'Gentil mas honesto',
        'Filosófico e questionador',
        'Sóbrio e estoico',
        'Místico e simbólico',
        'Fraternal e próximo',
        'Solene e inspirador',
      ],
    },
  },
  {
    key: 'guide_address_mode',
    type: 'single_choice',
    bloc: 5,
    required: true,
    labels: {
      fr: 'Tu préfères que ton Guide te tutoie ou te vouvoie ?',
      en: 'Do you prefer your Guide to address you formally or informally?',
      es: '¿Prefieres que tu Guía te trate de tú o de usted?',
      pt: 'Você prefere que seu Guia use "tu" ou "você" formal?',
    },
    options: {
      fr: ['Tutoiement (tu)', 'Vouvoiement (vous)'],
      en: ['Informal (you)', 'Formal (you)'],
      es: ['Tuteo (tú)', 'Usted'],
      pt: ['Informal (tu)', 'Formal (você)'],
    },
  },
  {
    key: 'guide_name',
    type: 'free_text',
    bloc: 5,
    required: false,
    labels: {
      fr: 'Veux-tu donner un nom à ton Guide ? (facultatif)',
      en: 'Do you want to give your Guide a name? (optional)',
      es: '¿Quieres darle un nombre a tu Guía? (opcional)',
      pt: 'Você quer dar um nome ao seu Guia? (opcional)',
    },
    placeholder: {
      fr: 'Laisse vide si tu n\'en as pas envie.',
      en: 'Leave empty if you don\'t want to.',
      es: 'Deja vacío si no quieres.',
      pt: 'Deixe vazio se não quiser.',
    },
  },
  {
    key: 'member_name',
    type: 'free_text',
    bloc: 5,
    required: false,
    labels: {
      fr: 'Comment veux-tu que ton Guide t\'appelle ?',
      en: 'What do you want your Guide to call you?',
      es: '¿Cómo quieres que te llame tu Guía?',
      pt: 'Como você quer que seu Guia te chame?',
    },
    placeholder: {
      fr: 'Ton prénom, un surnom, ou laisse vide.',
      en: 'Your first name, a nickname, or leave empty.',
      es: 'Tu nombre, un apodo, o deja vacío.',
      pt: 'Seu nome, um apelido, ou deixe vazio.',
    },
  },
]

// ============================================================
// BLOC 6 — Création de voie
// ============================================================

export const BLOC_6: OnboardingQuestion[] = [
  {
    key: 'path_type',
    type: 'single_choice',
    bloc: 6,
    required: true,
    labels: {
      fr: 'Quel mot représente le mieux ce que tu veux créer ou suivre ?',
      en: 'Which word best represents what you want to create or follow?',
      es: '¿Qué palabra representa mejor lo que quieres crear o seguir?',
      pt: 'Qual palavra melhor representa o que você quer criar ou seguir?',
    },
    options: {
      fr: ['Voie', 'Religion', 'Mouvement', 'Philosophie', 'Ordre', 'Tradition', 'Courant', 'École', 'Autre (je le définirai moi-même)'],
      en: ['Path', 'Religion', 'Movement', 'Philosophy', 'Order', 'Tradition', 'Current', 'School', 'Other (I will define it myself)'],
      es: ['Camino', 'Religión', 'Movimiento', 'Filosofía', 'Orden', 'Tradición', 'Corriente', 'Escuela', 'Otro (lo definiré yo mismo)'],
      pt: ['Caminho', 'Religião', 'Movimento', 'Filosofia', 'Ordem', 'Tradição', 'Corrente', 'Escola', 'Outro (vou definir eu mesmo)'],
    },
  },
  {
    key: 'path_name',
    type: 'free_text',
    bloc: 6,
    required: true,
    labels: {
      fr: 'Donne un nom à ta Voie',
      en: 'Give your Path a name',
      es: 'Dale un nombre a tu Camino',
      pt: 'Dê um nome ao seu Caminho',
    },
    placeholder: {
      fr: 'Ce nom peut changer plus tard. Pour l\'instant, ce qui te vient.',
      en: 'This name can change later. For now, whatever comes to you.',
      es: 'Este nombre puede cambiar más adelante. Por ahora, lo que te venga.',
      pt: 'Este nome pode mudar mais tarde. Por enquanto, o que vier a você.',
    },
  },
  {
    key: 'founding_sentence',
    type: 'free_text',
    bloc: 6,
    required: true,
    labels: {
      fr: 'Quelle phrase pourrait résumer l\'esprit de ta Voie ?',
      en: 'What sentence could summarize the spirit of your Path?',
      es: '¿Qué frase podría resumir el espíritu de tu Camino?',
      pt: 'Que frase poderia resumir o espírito do seu Caminho?',
    },
    placeholder: {
      fr: 'Une seule phrase. Ta voix.',
      en: 'Just one sentence. Your voice.',
      es: 'Solo una frase. Tu voz.',
      pt: 'Apenas uma frase. Sua voz.',
    },
  },
  {
    key: 'first_principles',
    type: 'free_text',
    bloc: 6,
    required: true,
    labels: {
      fr: 'Quels sont les 3 premiers principes de ta Voie ? (un par ligne)',
      en: 'What are the 3 first principles of your Path? (one per line)',
      es: '¿Cuáles son los 3 primeros principios de tu Camino? (uno por línea)',
      pt: 'Quais são os 3 primeiros princípios do seu Caminho? (um por linha)',
    },
    placeholder: {
      fr: 'Principe 1\nPrincipe 2\nPrincipe 3',
      en: 'Principle 1\nPrinciple 2\nPrinciple 3',
      es: 'Principio 1\nPrincipio 2\nPrincipio 3',
      pt: 'Princípio 1\nPrincípio 2\nPrincípio 3',
    },
  },
]

// ============================================================
// BLOC 7 — Projection et engagement
// ============================================================

export const BLOC_7: OnboardingQuestion[] = [
  {
    key: 'thirty_day_vision',
    type: 'free_text',
    bloc: 7,
    required: true,
    labels: {
      fr: 'À quoi ressemblerait une vraie évolution pour toi dans les 30 prochains jours ?',
      en: 'What would a real evolution look like for you in the next 30 days?',
      es: '¿Cómo sería una verdadera evolución para ti en los próximos 30 días?',
      pt: 'Como seria uma evolução real para você nos próximos 30 dias?',
    },
    placeholder: {
      fr: 'Concret. Réaliste. Vraiment toi.',
      en: 'Concrete. Realistic. Truly you.',
      es: 'Concreto. Realista. Verdaderamente tú.',
      pt: 'Concreto. Realista. Verdadeiramente você.',
    },
    scoring: [
      { dimension: 'commitment_level', direction: 'positive', weight: 0.6 },
    ],
  },
  {
    key: 'self_commitment',
    type: 'free_text',
    bloc: 7,
    required: true,
    labels: {
      fr: 'Quel engagement prends-tu envers toi-même aujourd\'hui ?',
      en: 'What commitment are you making to yourself today?',
      es: '¿Qué compromiso asumes contigo mismo hoy?',
      pt: 'Que compromisso você está assumindo consigo mesmo hoje?',
    },
    placeholder: {
      fr: 'Une phrase. Pas une promesse creuse — quelque chose de vrai.',
      en: 'One sentence. Not an empty promise — something real.',
      es: 'Una frase. No una promesa vacía — algo real.',
      pt: 'Uma frase. Não uma promessa vazia — algo real.',
    },
    scoring: [
      { dimension: 'commitment_level', direction: 'positive', weight: 0.8 },
    ],
  },
  {
    key: 'notification_frequency',
    type: 'single_choice',
    bloc: 7,
    required: true,
    labels: {
      fr: 'À quelle fréquence veux-tu être rappelé à ta Voie ?',
      en: 'How often do you want to be reminded of your Path?',
      es: '¿Con qué frecuencia quieres ser recordado de tu Camino?',
      pt: 'Com que frequência você quer ser lembrado do seu Caminho?',
    },
    options: {
      fr: ['Chaque jour', 'Plusieurs fois par semaine', 'Une fois par semaine', 'Rarement'],
      en: ['Every day', 'Several times a week', 'Once a week', 'Rarely'],
      es: ['Cada día', 'Varias veces a la semana', 'Una vez a la semana', 'Raramente'],
      pt: ['Todo dia', 'Várias vezes por semana', 'Uma vez por semana', 'Raramente'],
    },
  },
]

// ============================================================
// ASSEMBLAGE COMPLET
// ============================================================

export const ALL_QUESTIONS: OnboardingQuestion[] = [
  ...BLOC_1,
  ...BLOC_2,
  ...BLOC_3,
  ...BLOC_4,
  ...BLOC_5,
  ...BLOC_6,
  ...BLOC_7,
  // Bloc 8 = génération finale, pas de questions
]

export const QUESTIONS_BY_BLOC: Record<number, OnboardingQuestion[]> = {
  1: BLOC_1,
  2: BLOC_2,
  3: BLOC_3,
  4: BLOC_4,
  5: BLOC_5,
  6: BLOC_6,
  7: BLOC_7,
}

export const TOTAL_BLOCS = 8 // Le bloc 8 est la génération finale

export function getQuestionByKey(key: string): OnboardingQuestion | undefined {
  return ALL_QUESTIONS.find((q) => q.key === key)
}

export function getBlocQuestions(bloc: number): OnboardingQuestion[] {
  return QUESTIONS_BY_BLOC[bloc] ?? []
}

export function getBlocProgress(completedKeys: string[], bloc: number): number {
  const questions = getBlocQuestions(bloc)
  if (questions.length === 0) return 1
  const required = questions.filter((q) => q.required)
  if (required.length === 0) return 1
  const answered = required.filter((q) => completedKeys.includes(q.key))
  return answered.length / required.length
}

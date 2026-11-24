export const TOTAL_ROUNDS = 6;
export const TOTAL_TOKENS = 30;

export const PLAYER_COLORS = [
  "#00b386", // Vert / Sarcelle
  "#ec4899", // Rose
  "#f97316", // Orange
  "#3b82f6"  // Bleu
];

export const FLOORS = [
  { id: "notoriete",     name: "Notoriété",     color: "#CDEFF3" },
  { id: "interet",       name: "Intérêt",       color: "#8FDCE5" },
  { id: "consideration", name: "Considération", color: "#3FBCCB" },
  { id: "conversion",    name: "Conversion",    color: "#1A8291" },
  { id: "fidelisation",  name: "Fidélisation",  color: "#0E4F58" }
];

export const CARDS = [
  {
    id: "pub-instagram",
    name: "Pub Instagram",
    floor: "notoriete",
    cost: 3,
    level: 1,
    effect: "Ajoutez 4 prospects du Marché à l'étage Notoriété.",
    definition: "Publicité payante diffusée sur Instagram auprès d'une cible choisie (âge, intérêts, zone). Elle touche vite beaucoup de monde.",
    example: "Sponsoriser une Story auprès des 18-30 ans passionnés de sport pour faire connaître votre application."
  },
  {
    id: "article-seo",
    name: "Article SEO",
    floor: "notoriete",
    cost: 1,
    level: 1,
    effect: "Ajoutez 2 prospects du Marché à l'étage Notoriété.",
    definition: "Article de blog optimisé pour apparaître dans les résultats Google. Peu coûteux, mais le trafic arrive lentement.",
    example: "Publier un guide « Comment gérer son budget étudiant » ciblant les requêtes de recherche."
  },
  {
    id: "partenariat-influenceur",
    name: "Partenariat influenceur",
    floor: "notoriete",
    cost: 5,
    level: 1,
    effect: "Ajoutez 6 prospects du Marché à l'étage Notoriété.",
    definition: "Collaboration avec une personne suivie par une large communauté, qui présente la marque à son audience.",
    example: "Faire tester votre produit par un créateur de contenu de confiance dans une vidéo dédiée."
  },
  {
    id: "newsletter",
    name: "Newsletter",
    floor: "interet",
    cost: 2,
    level: 1,
    effect: "Faites descendre 3 prospects de Notoriété à Intérêt.",
    definition: "Email envoyé régulièrement aux abonnés pour garder le contact et entretenir leur intérêt.",
    example: "Envoyer un résumé hebdomadaire avec les nouveautés et conseils pratiques de la marque."
  },
  {
    id: "livre-blanc",
    name: "Livre blanc",
    floor: "interet",
    cost: 3,
    level: 1,
    effect: "Faites descendre 4 prospects de Notoriété à Intérêt.",
    definition: "Guide gratuit offert en échange d'une adresse email. C'est un « lead magnet » : il transforme un visiteur en contact.",
    example: "Proposer un PDF « 10 erreurs à éviter au lancement d'une startup » contre une inscription."
  },
  {
    id: "webinaire",
    name: "Webinaire",
    floor: "consideration",
    cost: 3,
    level: 1,
    effect: "Faites descendre 3 prospects d'Intérêt à Considération.",
    definition: "Conférence en ligne en direct où la marque montre son expertise et répond aux questions.",
    example: "Animer une démonstration en direct de 30 minutes suivie d'une session de questions-réponses."
  },
  {
    id: "avis-clients",
    name: "Avis clients",
    floor: "consideration",
    cost: 2,
    level: 1,
    effect: "Faites descendre 2 prospects à Considération. Posez ensuite la carte face visible devant vous (hors de votre main) : elle annule le prochain « Mauvais avis ».",
    definition: "Notes et témoignages de clients. Cette « preuve sociale » rassure ceux qui hésitent.",
    example: "Afficher une note de 4,8/5 et des retours clients vérifiés sur la page produit."
  },
  {
    id: "marketing-automation",
    name: "Marketing automation",
    floor: "consideration",
    cost: 4,
    level: 2,
    effect: "Faites descendre 2 prospects d'Intérêt à Considération ET 1 prospect de Notoriété à Intérêt.",
    definition: "Envoi automatique d'emails ou de messages déclenchés par le comportement du prospect (inscription, clic, visite), pour l'accompagner pas à pas sans effort manuel.",
    example: "Déclencher automatiquement une séquence d'emails de bienvenue après le téléchargement d'un guide."
  },
  {
    id: "essai-gratuit",
    name: "Essai gratuit",
    floor: "conversion",
    cost: 4,
    level: 1,
    effect: "Faites descendre 3 prospects de Considération à Conversion.",
    definition: "Période d'utilisation gratuite du produit avant l'achat, qui lève les derniers doutes.",
    example: "Offrir 14 jours d'accès complet avant le premier prélèvement d'un abonnement."
  },
  {
    id: "code-promo",
    name: "Code promo",
    floor: "conversion",
    cost: 2,
    level: 1,
    effect: "Faites descendre 2 prospects à Conversion. Vos revenus sont divisés par 2 cette manche.",
    definition: "Réduction qui pousse à acheter maintenant, au prix d'une marge plus faible.",
    example: "Proposer -20 % sur la première commande pendant 48 heures."
  },
  {
    id: "test-ab",
    name: "Test A/B",
    floor: "conversion",
    cost: 3,
    level: 2,
    effect: "Faites descendre 2 prospects à Conversion. Sur un dé de 2 ou 3, la carte marche quand même normalement.",
    definition: "On montre deux versions d'une page ou d'un email à deux groupes, puis on garde celle qui convertit le mieux.",
    example: "Tester deux formulations de bouton d'achat pour voir laquelle génère le plus de commandes."
  },
  {
    id: "programme-fidelite",
    name: "Programme de fidélité",
    floor: "fidelisation",
    cost: 3,
    level: 1,
    effect: "Faites descendre 2 clients de Conversion à Fidélisation.",
    definition: "Points, avantages ou statuts réservés aux clients pour les faire revenir.",
    example: "Cumuler des points à chaque commande échangeables contre des avantages exclusifs."
  },
  {
    id: "parrainage",
    name: "Parrainage",
    floor: "fidelisation",
    cost: 3,
    level: 1,
    effect: "Faites descendre 1 client à Fidélisation ET ajoutez 2 prospects à Notoriété.",
    definition: "Un client recommande la marque à ses proches, souvent contre une récompense.",
    example: "Offrir un bonus au parrain et au filleul après la première commande du filleul."
  },
  {
    id: "service-client",
    name: "Service client",
    floor: "fidelisation",
    cost: 2,
    level: 2,
    effect: "Faites descendre 1 client à Fidélisation. Pas de dé du churn pour vous cette manche.",
    definition: "Aide apportée aux clients après l'achat. Un client bien accompagné reste plus longtemps et recommande la marque.",
    example: "Mettre en place un support réactif et un suivi personnalisé après l'achat."
  },
  {
    id: "retargeting",
    name: "Retargeting",
    floor: "consideration",
    cost: 3,
    level: 1,
    effect: "Ramenez 2 prospects de Perdus à Considération.",
    definition: "Publicité montrée aux personnes qui ont déjà visité le site sans acheter, pour les faire revenir.",
    example: "Afficher une publicité de rappel aux visiteurs ayant abandonné leur panier."
  }
];

export const EVENTS = [
  {
    id: "mise-a-jour-google",
    name: "Mise à jour Google",
    level: 1,
    effect: "Les cartes Article SEO n'ajoutent qu'1 prospect cette manche."
  },
  {
    id: "mauvais-avis",
    name: "Mauvais avis",
    level: 1,
    effect: "Chaque joueur perd 2 prospects en Considération. La carte Avis clients vous protège."
  },
  {
    id: "post-viral",
    name: "Post viral",
    level: 1,
    effect: "Le joueur qui a le moins de prospects en Notoriété en ajoute 3."
  },
  {
    id: "lancement-concurrent",
    name: "Lancement concurrent",
    level: 1,
    effect: "Chaque joueur perd 1 prospect sur chaque étage qui en compte 3 ou plus."
  },
  {
    id: "black-friday",
    name: "Black Friday",
    level: 1,
    effect: "Essai gratuit, Code promo et Test A/B coûtent 1 pièce de moins cette manche."
  },
  {
    id: "bug-du-site",
    name: "Bug du site",
    level: 1,
    effect: "Personne ne peut jouer Essai gratuit, Code promo ou Test A/B cette manche."
  },
  {
    id: "hausse-prix-pubs",
    name: "Hausse du prix des pubs",
    level: 2,
    effect: "Pub Instagram et Partenariat influenceur coûtent 2 pièces de plus."
  },
  {
    id: "controle-rgpd",
    name: "Contrôle RGPD",
    level: 2,
    effect: "Chaque joueur paie 2 pièces à la banque pour se mettre en conformité."
  },
  {
    id: "crise-economique",
    name: "Crise économique",
    level: 2,
    effect: "Tous les revenus sont divisés par 2 (arrondi en dessous)."
  },
  {
    id: "pic-de-churn",
    name: "Pic de churn",
    level: 2,
    effect: "Le dé du churn fait partir un client sur 1, 2 ou 3."
  }
];
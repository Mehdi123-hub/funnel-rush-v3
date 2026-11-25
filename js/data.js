// Nombre total de manches par partie
export const TOTAL_ROUNDS = 6;

// Pièces de départ selon le niveau
export const LEVEL_CONFIG = {
  1: { startingCoins: 20 },
  2: { startingCoins: 15 },
};

// Couleurs des pions joueurs
export const PLAYER_COLORS = [
  { name: "Teal", hex: "#00B386" },
  { name: "Pink", hex: "#FF5FC8" },
  { name: "Orange", hex: "#F97316" },
  { name: "Blue", hex: "#2F7BFF" },
];

// Les 5 étapes du funnel (du froid vers le chaud)
export const FLOORS = [
  { id: "awareness", name: "AWARENESS", color: "#A3ACD6" },
  { id: "interest", name: "INTEREST", color: "#739BFF" },
  { id: "consideration", name: "CONSIDERATION", color: "#8673FF" },
  { id: "conversion", name: "CONVERSION", color: "#D25FFF" },
  { id: "loyalty", name: "LOYALTY", color: "#FF73D2" },
];

// Accès rapide aux étapes par identifiant
export const FUNNEL_FLOORS = Object.fromEntries(
  FLOORS.map((f) => [f.id, { label: f.name, color: f.color }])
);

// Catalogue complet des 15 cartes d'action
export const CARDS = [
  { id: "instagram-ad", name: "Instagram Ad", floor: "awareness", cost: 3, level: 1, effect: "Move 4 prospects from Market to Awareness.", definition: "Paid social ads targeting specific audiences.", example: "Sponsoring a Story for fitness fans." },
  { id: "seo-article", name: "SEO Article", floor: "awareness", cost: 1, level: 1, effect: "Move 2 prospects from Market to Awareness.", definition: "Search-optimized article building organic traffic.", example: "Publishing a student budget guide." },
  { id: "influencer-partnership", name: "Influencer Partnership", floor: "awareness", cost: 5, level: 1, effect: "Move 6 prospects from Market to Awareness.", definition: "Creator collaboration reaching an established audience.", example: "A creator testing your product on video." },
  { id: "newsletter", name: "Newsletter", floor: "interest", cost: 2, level: 1, effect: "Move 3 prospects from Awareness to Interest.", definition: "Regular email updates keeping subscribers engaged.", example: "Weekly tips and product digest." },
  { id: "white-paper", name: "White Paper", floor: "interest", cost: 3, level: 1, effect: "Move 4 prospects from Awareness to Interest.", definition: "Free detailed guide exchanged for contact info.", example: "PDF checklist offered on sign-up." },
  { id: "webinar", name: "Webinar", floor: "consideration", cost: 3, level: 1, effect: "Move 3 prospects from Interest to Consideration.", definition: "Live online session demonstrating value.", example: "30-minute live demo with Q&A." },
  { id: "customer-reviews", name: "Customer Reviews", floor: "consideration", cost: 2, level: 1, effect: "Move 2 prospects to Consideration. Cancels next Bad Review.", definition: "Ratings and testimonials building trust.", example: "Displaying verified buyer quotes." },
  { id: "marketing-automation", name: "Marketing Automation", floor: "consideration", cost: 4, level: 2, effect: "Move 2 Interest -> Consideration and 1 Awareness -> Interest.", definition: "Behavior-triggered automated messages.", example: "Welcome sequence after a download." },
  { id: "retargeting", name: "Retargeting", floor: "consideration", cost: 3, level: 1, effect: "Bring 2 from Lost back to Consideration.", definition: "Ads re-engaging past visitors.", example: "Cart reminder ads." },
  { id: "free-trial", name: "Free Trial", floor: "conversion", cost: 4, level: 1, effect: "Move 3 prospects from Consideration to Conversion.", definition: "Risk-free trial period before buying.", example: "14-day full access trial." },
  { id: "promo-code", name: "Promo Code", floor: "conversion", cost: 2, level: 1, effect: "Move 2 prospects to Conversion. Revenue halved this round.", definition: "Discount driving immediate purchase.", example: "20% off first order." },
  { id: "ab-test", name: "A/B Test", floor: "conversion", cost: 3, level: 2, effect: "Move 2 to Conversion. Succeeds on die roll 2 or 3.", definition: "Comparing two variants to keep the best.", example: "Testing two checkout buttons." },
  { id: "loyalty-program", name: "Loyalty Program", floor: "loyalty", cost: 3, level: 1, effect: "Move 2 customers from Conversion to Loyalty.", definition: "Points, perks, or tiers reserved for existing customers to bring them back.", example: "Earning reward points on every order that can be redeemed for perks." },
  { id: "referral-program", name: "Referral Program", floor: "loyalty", cost: 3, level: 1, effect: "Move 1 to Loyalty and add 2 to Awareness.", definition: "Customers inviting friends for a reward.", example: "Bonus credit for referrer and friend." },
  { id: "customer-support", name: "Customer Support", floor: "loyalty", cost: 2, level: 2, effect: "Move 1 to Loyalty. No churn roll for you this round.", definition: "Post-purchase help retaining buyers.", example: "Fast onboarding and support." },
];

// Événements tirés au sort à chaque manche
export const EVENTS = [
  { id: "google-algorithm-update", title: "Google Algorithm Update", floor: "awareness", level: 1, effect: "SEO Article adds only 1 prospect this round." },
  { id: "bad-review", title: "Bad Review", floor: "consideration", level: 1, effect: "Each player loses 2 in Consideration unless protected by Customer Reviews." },
  { id: "viral-post", title: "Viral Post", floor: "awareness", level: 1, effect: "Lowest Awareness player adds 3." },
  { id: "competitor-launch", title: "Competitor Launch", floor: "interest", level: 1, effect: "Lose 1 on every stage with 3 or more." },
  { id: "black-friday", title: "Black Friday", floor: "conversion", level: 1, effect: "Free Trial, Promo Code, and A/B Test cost 1 less." },
  { id: "website-bug", title: "Website Bug", floor: "conversion", level: 1, effect: "No Free Trial, Promo Code, or A/B Test this round." },
  { id: "ad-price-hike", title: "Ad Price Hike", floor: "awareness", level: 2, effect: "Instagram Ad and Influencer Partnership cost 2 more." },
  { id: "gdpr-audit", title: "GDPR Audit", floor: "interest", level: 2, effect: "Each player pays 2 coins." },
  { id: "economic-downturn", title: "Economic Downturn", floor: "conversion", level: 2, effect: "Revenues divided by 2 (rounded down)." },
  { id: "churn-spike", title: "Churn Spike", floor: "loyalty", level: 2, effect: "Churn die removes customer on 1, 2, or 3." },
];

// Calcule le score de base et le taux de conversion d'un joueur
export function computePlayerScore(sc, level = 2) {
  const interest = Math.max(0, Number(sc?.interest) || 0);
  const conversion = Math.max(0, Number(sc?.conversion) || 0);
  const coins = Math.max(0, Number(sc?.coins) || 0);
  const missionBonus = level === 2 && Boolean(sc?.mission) ? 5 : 0;
  const basePoints = interest * 2 + conversion * 4 + coins + missionBonus;
  const total = interest + conversion;
  return {
    conversionRate: total > 0 ? conversion / total : 0,
    hasConversionBonus: false,
    basePoints,
    totalPoints: basePoints,
  };
}

// Ajoute le bonus +3 au meilleur taux de conversion et trie le classement
export function rankPlayers(players) {
  const maxRate = Math.max(0, ...players.map((p) => p.conversionRate || 0));
  return players
    .map((p) => {
      const bonus = maxRate > 0 && Math.abs((p.conversionRate || 0) - maxRate) < 1e-9;
      return { ...p, hasConversionBonus: bonus, totalPoints: p.basePoints + (bonus ? 3 : 0) };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints || b.conversionRate - a.conversionRate);
}
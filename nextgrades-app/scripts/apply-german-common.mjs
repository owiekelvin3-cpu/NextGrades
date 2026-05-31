import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const path = join(__dirname, "../src/locales/de/common.json");
const c = JSON.parse(readFileSync(path, "utf8"));

Object.assign(c.common, { lightMode: "Heller Modus", darkMode: "Dunkler Modus" });

Object.assign(c.home, {
  heroEyebrow: "DIE ZUKUNFT DES LERNENS BEGINNT HIER.",
  heroTitle: "Smarter lernen.",
  heroTitleHighlight: "Bessere Ergebnisse.",
  freeConsultation: "Kostenloses Erstgespräch",
  explorePrograms: "Programme entdecken →",
  rating: "4,9/5",
  reviewsFrom: "aus 200+ Bewertungen",
  floatingCardTitle: "Individuelle Betreuung.",
  floatingCardDesc: "Echte Ergebnisse.",
  mostPopular: "Beliebtestes Programm",
  features: [
    { title: "Premium-Lehrer:innen", desc: "Sorgfältig ausgewählt, erfahren und erfolgsorientiert." },
    { title: "Kleine Lerngruppen", desc: "Max. 3–5 Schüler:innen pro Gruppe für intensives Lernen." },
    { title: "Moderne Lernplattform", desc: "Videos, Übungen, PDFs und mehr — alles an einem Ort." },
    { title: "Strukturierte Lernsysteme", desc: "Klarer Lernpfad, Fortschritt & systematische Vorbereitung." },
    { title: "Flexibel & online", desc: "Lerne wo und wann du willst — nach deinem Zeitplan." },
  ],
  programsSection: {
    title: "Unsere Programme",
    subtitle: "Wähle das Programm, das am besten zu dir passt.",
    items: [
      {
        title: "1:1 Premium-Nachhilfe",
        features: [
          "Individuell, persönlich, effizient.",
          "Persönliche 1:1 Betreuung",
          "Flexible Termine",
          "Maßgeschneiderter Lernplan",
        ],
      },
      {
        title: "Kleine Lerngruppen",
        features: [
          "Gemeinsam mit Freund:innen lernen.",
          "Max. 3–5 Schüler:innen",
          "Interaktiver Austausch",
          "Motivation durch die Gruppe",
        ],
      },
      {
        title: "Mathe Excellence Programm",
        features: [
          "Unser Flaggschiff für Mathematik.",
          "Wöchentliche Live-Sessions",
          "Premium-Lernmaterialien",
          "Abiturvorbereitung",
          "Dozent:innen aus der Uni & Sessions",
        ],
      },
    ],
  },
  stats: [
    { number: "200+", label: "glückliche Schüler:innen" },
    { number: "25+", label: "Top-Lehrer:innen" },
    { number: "1.000+", label: "Lernmaterialien" },
    { number: "4,9/5", label: "Bewertung von Eltern & Schüler:innen" },
  ],
  platform: {
    title: "Deine komplette Lernplattform",
    subtitle: "Unsere moderne Plattform unterstützt dich bei jedem Schritt deiner Lernreise.",
    discover: "Plattform entdecken",
    learnMore: "Mehr erfahren",
    trackProgress: "Fortschritt verfolgen",
    trackProgressDesc: "Verfolge deinen Fortschritt, schließe Lektionen ab und bleib motiviert!",
    weeks: "Wochen lang",
    materials: "Lernmaterialien",
  },
  testimonials: {
    title: "Das sagen Schüler:innen und Eltern",
    items: [
      {
        quote:
          "Dank NextGrades habe ich in Mathe von Note 3 auf 1 verbessert! Die Erklärungen sind super und man versteht sofort!",
        name: "Lena, Klasse 10",
      },
      {
        quote:
          "Die kleine Lerngruppe hat meinem Sohn wirklich geholfen! Er ist motivierter und versteht Mathe endlich.",
        name: "Peter M., Vater",
      },
      {
        quote: "Die Plattform ist super intuitiv und die Materialien perfekt für die Abiturvorbereitung!",
        name: "Julia, Klasse 12",
      },
    ],
  },
  cta: {
    title: "Bereit für den nächsten Schritt?",
    subtitle: "Buche jetzt dein kostenloses Erstgespräch und finde heraus, welches Programm zu dir passt.",
    button: "Kostenloses Erstgespräch buchen",
  },
});

Object.assign(c.contact, { submitting: "Wird gesendet..." });
Object.assign(c.resources, { freeButton: "Kostenlos" });

Object.assign(c.pricing, {
  badge: "Premium-Tarife",
  heroTitle: "Wähle deinen perfekten Tarif",
  heroSubtitle:
    "Ob du nur Ressourcen brauchst oder volle 1:1-Betreuung — wir haben den passenden Tarif für dich.",
  monthly: "Monatlich",
  yearly: "Jährlich",
  yearlyDiscount: "(2 Monate gratis)",
  perMonth: "Monat",
  perYear: "Jahr",
  mostPopular: "Am beliebtesten",
  getStarted: "Loslegen",
  faqTitle: "Häufig gestellte Fragen",
});

Object.assign(c.subjects, {
  eyebrow: "UNSERE FÄCHER",
  heroTitle: "Alle Fächer. Ein Ziel:",
  heroTitleHighlight: "Dein Erfolg.",
  heroSubtitle:
    "Wir bieten Nachhilfe in allen relevanten Schulfächern — individuell, strukturiert und mit echten Ergebnissen.",
});

c.help.faqs = [
  {
    question: "Wie funktioniert die Registrierung?",
    answer: "Du kannst dich einfach über unsere Anmeldeseite registrieren oder anmelden.",
  },
  {
    question: "Wie kann ich ein Programm buchen?",
    answer: "Kontaktiere uns oder buche ein kostenloses Erstgespräch für mehr Informationen.",
  },
  {
    question: "Welche Zahlungsmethoden gibt es?",
    answer: "Wir akzeptieren Kreditkarten, PayPal und Banküberweisung über Stripe.",
  },
];

Object.assign(c.consultation, {
  cardTitle: "Buche dein kostenloses Erstgespräch",
  cardSubtitle: "Nutze Calendly, um einen passenden Termin zu buchen.",
  bookNow: "Jetzt Termin buchen",
});

Object.assign(c.privacy, { body: "Hier findest du unsere Datenschutzerklärung." });
Object.assign(c.terms, { body: "Hier findest du unsere Allgemeinen Geschäftsbedingungen." });

Object.assign(c.careersPage, {
  title: "Karriere",
  subtitle: "Werde Teil unseres Teams!",
  applyNow: "Jetzt bewerben",
  jobs: [
    { title: "Mathe-Nachhilfelehrer:in", description: "Wir suchen engagierte Mathe-Nachhilfelehrer:innen." },
    { title: "Englisch-Nachhilfelehrer:in", description: "Wir suchen engagierte Englisch-Nachhilfelehrer:innen." },
  ],
});

writeFileSync(path, JSON.stringify(c, null, 2) + "\n", "utf8");
console.log("Applied German translations to de/common.json");

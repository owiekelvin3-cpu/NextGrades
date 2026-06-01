import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const commonPath = join(__dirname, "../src/locales/de/common.json");
const sitePath = join(__dirname, "../src/locales/de/site.json");
const c = JSON.parse(readFileSync(commonPath, "utf8"));
const site = JSON.parse(readFileSync(sitePath, "utf8"));

Object.assign(c.common, {
  login: "Anmelden",
  dashboard: "Übersicht",
});

Object.assign(c.navbar, {
  login: "Anmelden",
});

Object.assign(c.home.platform, {
  availability: "Verfügbarkeit",
});

Object.assign(c.contact, {
  enterPhone: "Telefonnummer eingeben",
});

Object.assign(c.login, {
  apple: "Mit Apple fortfahren",
  google: "Mit Google fortfahren",
  smartLearning: "Smartes Lernen",
});

Object.assign(c.resources.filters, {
  semester: "Semester",
});

Object.assign(c.admin, {
  title: "Admin-Bereich",
});

Object.assign(c.consultation, {
  breadcrumb: "Startseite > Beratung",
  titleHighlight: "Dein Lernplan beginnt hier.",
  heroDesc:
    "Unverbindlich. Ohne Druck. Klare Orientierung von Expert:innen, die das deutsche Schulsystem und die Studienvorbereitung kennen.",
  viewPrograms: "Programme entdecken",
  processTitle: "So läuft deine Beratung ab",
  processSubtitle:
    "Ein einfacher, strukturierter Ablauf — für Klarheit, nicht für Verkaufsgespräche.",
  steps: [
    {
      title: "Deine Situation schildern",
      description:
        "Erzähl uns von Klassenstufe, Fächern, anstehenden Prüfungen und deinen Zielen.",
    },
    {
      title: "Deine Berater:in kennenlernen",
      description:
        "In einem entspannten 30-minütigen Gespräch hören wir zu und stellen die richtigen Fragen.",
    },
    {
      title: "Lernplan erhalten",
      description:
        "Wir empfehlen das passende Format — 1:1, Gruppe oder Prüfungsvorbereitung — mit klaren nächsten Schritten.",
    },
    {
      title: "Starten, wenn du bereit bist",
      description:
        "Du meldest dich nur an, wenn es sich richtig anfühlt. Materialien und Programme kannst du vorher erkunden.",
    },
  ],
  benefitsTitle: "Das nimmst du aus dem Gespräch mit",
  benefitsSubtitle: "Jede Beratung zielt auf Ergebnisse — nicht auf allgemeine Ratschläge.",
  benefits: [
    {
      title: "Individuelle Einschätzung",
      description: "Wir erkennen Stärken, Lücken und den schnellsten Weg zu besseren Noten.",
    },
    {
      title: "Programm-Empfehlung",
      description: "Vergleiche 1:1-Nachhilfe, Kleingruppen und Fachprogramme nebeneinander.",
    },
    {
      title: "Transparente Preisübersicht",
      description: "Verstehe Tarife, Einheiten und Mehrwert, bevor du dich entscheidest.",
    },
    {
      title: "Prüfungs- & Studienberatung",
      description: "Abitur, Studienvorbereitung und MINT-Pfade verständlich erklärt.",
    },
    {
      title: "Flexible Terminoptionen",
      description: "Finde Zeiten, die zu Schule, Arbeit und Familie passen.",
    },
    {
      title: "Qualifizierte deutsche Lehrkräfte",
      description: "Betreuung durch Tutor:innen, die lokale Lehrpläne und Anforderungen kennen.",
    },
  ],
  audienceTitle: "Für wen ist das gedacht?",
  audiences: [
    {
      title: "Schüler:innen",
      description: "Von der Mittelstufe bis zur Studienvorbereitung — Selbstvertrauen und stabile Ergebnisse.",
    },
    {
      title: "Eltern",
      description: "Transparenz zu Fortschritt, Terminen und dem richtigen Unterstützungsniveau.",
    },
    {
      title: "Quereinsteiger:innen",
      description: "Mathe, Sprachen oder Wirtschaft auffrischen für Studium und Bewerbungen.",
    },
  ],
  formTitle: "Kostenlose Beratung anfragen",
  formSubtitle: "Fülle das Formular aus — unser Team meldet sich zur Terminvereinbarung.",
  firstName: "Vorname",
  lastName: "Nachname",
  email: "E-Mail-Adresse",
  phone: "Telefonnummer",
  gradeLevel: "Klasse / Niveau",
  gradePlaceholder: "Niveau wählen",
  grades: ["Klasse 5–7", "Klasse 8–10", "Abitur / Oberstufe", "Studium / Erwachsene"],
  subject: "Interessensfach",
  subjectPlaceholder: "Fach wählen",
  subjects: [
    "Mathematik",
    "Englisch",
    "Deutsch",
    "Physik",
    "Chemie",
    "Wirtschaft",
    "Informatik",
    "Sonstiges",
  ],
  preferredTime: "Bevorzugte Kontaktzeit",
  timePlaceholder: "Präferenz wählen",
  times: ["Vormittag (8–12)", "Nachmittag (12–17)", "Abend (17–20)", "Wochenende", "Flexibel"],
  goals: "Deine Ziele (optional)",
  goalsPlaceholder: "z. B. Mathenote vor Prüfungen verbessern, Abitur vorbereiten, Lernroutine aufbauen…",
  privacyNote:
    "Mit dem Absenden erlaubst du uns, dich wegen deiner Beratungsanfrage zu kontaktieren. Wir geben deine Daten nicht an Dritte weiter.",
  submit: "Beratung anfragen",
  submitting: "Wird gesendet…",
  successTitle: "Anfrage erhalten!",
  successMessage: "Danke — wir melden uns in Kürze zur Terminvereinbarung.",
  faqTitle: "Häufig gestellte Fragen",
  faqs: [
    {
      question: "Ist die Beratung wirklich kostenlos?",
      answer: "Ja. Das Erstgespräch ist komplett kostenlos und unverbindlich.",
    },
    {
      question: "Wie lange dauert das Gespräch?",
      answer: "In der Regel etwa 30 Minuten — genug, um deine Ziele zu verstehen und einen Weg zu empfehlen.",
    },
    {
      question: "Online oder vor Ort?",
      answer: "Primär online per Videocall — flexibel von überall. Vor-Ort-Termine je nach Standort möglich.",
    },
    {
      question: "Müssen Eltern dabei sein?",
      answer: "Unter 16 Jahren empfehlen wir die Anwesenheit eines Erziehungsberechtigten. Ältere Schüler:innen können allein teilnehmen.",
    },
    {
      question: "Was soll ich vorbereiten?",
      answer: "Aktuelle Noten, Prüfungstermine und eine kurze Zielliste helfen uns, sofort passende Empfehlungen zu geben.",
    },
  ],
  ctaTitle: "Bereit für den nächsten Schritt?",
  ctaDesc: "Entdecke Programme und Preise — oder sprich zuerst mit uns, ganz wie es dir passt.",
  ctaPrograms: "Programme ansehen",
  ctaPricing: "Preise ansehen",
  trustBadges: ["100 % kostenlos", "Unverbindlich", "30 Minuten"],
  stats: [
    { value: "< 24h", label: "Antwortzeit" },
    { value: "30 Min.", label: "Beratungsdauer" },
    { value: "1:1", label: "Persönliche Berater:in" },
    { value: "DE", label: "Deutschland-Expertise" },
  ],
});

Object.assign(c.resources, {
  membersOnly: "Nur für Mitglieder",
  freeLabel: "Kostenlos",
  materialsCount: "{{count}} Materialien",
  exploreSubject: "Entdecken",
  all: "Alle",
  free: "Kostenlos",
  premium: "Premium",
  filters: "Filter",
  applyFilters: "Ergebnisse anzeigen",
  noResults: "Keine Ressourcen entsprechen deinen Filtern.",
  premiumRequired: "Premium-Mitgliedschaft oder Einschreibung erforderlich.",
  downloadStarted: "„{{title}}“ wird geöffnet…",
  saved: "Gespeichert",
  premiumCta: "Freischalten",
});

Object.assign(site.mobileNav ?? {}, {
  liveClasses: "Live-Unterricht",
});

Object.assign(site.aboutPage ?? {}, {
  heroQuoteAuthor: "William Butler Yeats",
});

Object.assign(site.dashboardCommon ?? {}, {
  premium: "Premium",
});

Object.assign(site.studentDashboard ?? {}, {
  motivationQuote: "Jeder Tag ist eine neue Chance, besser zu werden.",
  videos: "Videos",
});

Object.assign(site.teacherDashboard ?? {}, {
  nextJumpLevel: "NextJump Level",
  colStatus: "Status",
  messagesTitle: "Nachrichten",
  bonusProgram: "Bonusprogramm",
  level: "Level",
});

Object.assign(site.teacherDashboard?.nav ?? {}, {
  nextJumpBonus: "NextJump Bonus",
  messages: "Nachrichten",
});

Object.assign(site.zoom?.types ?? {}, {
  webinar: "Webinar",
});

Object.assign(site.notifications?.sounds ?? {}, {
  ping: "Ping",
  pop: "Pop",
  digital: "Digital",
});

Object.assign(site.settings ?? {}, {
  subscriptionStatus: "Abo-Status",
});

if (!site.nav) site.nav = {};
site.nav.home = "Startseite";

writeFileSync(commonPath, JSON.stringify(c, null, 2) + "\n", "utf8");
writeFileSync(sitePath, JSON.stringify(site, null, 2) + "\n", "utf8");
console.log("Applied German translations for consultation, nav, and misc keys.");

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const deSitePath = join(__dirname, "../src/locales/de/site.json");
const site = JSON.parse(readFileSync(deSitePath, "utf8"));

Object.assign(site.images, {
  logo: "NextGrades Logo",
  studentStudying: "Schüler:in beim Lernen",
  modernLearning: "Moderne Lernumgebung",
  nextGradesLearning: "NextGrades Lernplattform",
  teamMember: "Teammitglied Foto",
  studentsCollaborating: "Schüler:innen arbeiten zusammen",
  germanBuilding: "Modernes Gebäude in Deutschland",
  germanyFlag: "Deutschland Flagge",
});

Object.assign(site.aboutPage, {
  introEyebrow: "NextGrades Challenge",
  introTitle: "Entdecke NextGrades – Wo Innovation auf Bildung trifft",
  introDesc:
    "NextGrades transformiert Bildung mit innovativen Konzepten. Entdecke unsere Geschichte und erstklassige Nachhilfe, die modernes Lernen inspiriert.",
  journeyTitle: "Die NextGrades Reise",
  journeySubtitle: "Von bescheidenen Anfängen zu Bildungsexzellenz.",
  story: [
    {
      title: "Bescheidene Anfänge",
      desc: "Unsere Reise begann 2021 als Leidenschaftsprojekt aus Frustration mit traditioneller Nachhilfe. Was als Hilfe für ein paar Freund:innen begann, ist heute eine Plattform, der Tausende vertrauen.",
    },
    {
      title: "Innovation und Wachstum",
      desc: "Innovation stand immer im Mittelpunkt. 2023 führten wir unsere digitale Lernplattform ein – Live-Nachhilfe kombiniert mit strukturierten, ergebnisorientierten Inhalten.",
    },
    {
      title: "Unsere Reichweite",
      desc: "Heute betreut NextGrades Schüler:innen in Deutschland und darüber hinaus. Über 10.000 Schüler:innen haben ihre Noten verbessert und Selbstvertrauen aufgebaut.",
    },
    {
      title: "Blick nach vorn",
      desc: "Unser Ziel ist es, Bildung weiter zu revolutionieren – mit KI-gestützten Lernpfaden und erweiterten Fachangeboten.",
    },
  ],
  teamTitle: "Unser großartiges Team",
  team: [
    { name: "Adrian H.", role: "Gründer & CEO", bio: "Lernwissenschaft & Bildung" },
    { name: "Lea Maria", role: "Leitung Pädagogik", bio: "Expertin für Lernmethoden" },
    { name: "David K.", role: "Leitung Online-Nachhilfe", bio: "Digitales Lernen & EdTech" },
  ],
  communityTitle: "Werde Teil der NextGrades Community",
  communityDesc:
    "Starte mit deinen Zielen, Lernerfahrungen und deinem Wachstum – gemeinsam schaffen wir etwas Besonderes.",
  communityCta: "Kostenloses Erstgespräch buchen",
  communityTags: ["Unverbindlich", "Kostenlos", "Individuelle Beratung"],
});

Object.assign(site.programsPage, {
  breadcrumb: "Startseite > Programme",
  heroFeatures: [
    { title: "Premium-Betreuung", desc: "Persönlich, engagiert, ergebnisorientiert." },
    { title: "Moderne Lernmethoden", desc: "Effizient und systematisch." },
    { title: "Flexibel & online", desc: "Lerne wo und wann du willst." },
  ],
  freeConsultation: "Kostenloses Erstgespräch",
  stats: [
    { number: "200+", label: "glückliche Schüler:innen" },
    { number: "25+", label: "Top-Lehrer:innen" },
    { number: "4.9/5", label: "Bewertung von Eltern & Schüler:innen" },
  ],
  sectionEyebrow: "UNSERE PROGRAMME",
  sectionTitle: "Finde das perfekte Programm für dich.",
  sectionDesc:
    "Ob Einzelnachhilfe, Lernen in kleinen Gruppen oder unser Signature-Programm – wir haben die passende Lösung.",
  mostPopular: "Beliebtestes Programm",
  learnMore: "Mehr erfahren",
  items: [
    {
      type: "1:1",
      title: "1:1 Premium-Nachhilfe",
      description: "Individuelle Nachhilfe, 100 % auf dich zugeschnitten.",
      features: [
        "Individuelle 1:1 Betreuung",
        "Persönliche Lernpläne",
        "Prüfungsvorbereitung",
        "Flexible Termine",
        "Erfahrene Fokus-Betreuung",
      ],
      price: "ab 45 € / Stunde",
    },
    {
      type: "Gruppe",
      title: "Kleine Lerngruppen",
      description: "Lernen in kleinen Gruppen mit maximal 3–5 Schüler:innen.",
      features: [
        "Max. 3–5 Schüler:innen",
        "Motivierende Atmosphäre",
        "Austausch & Zusammenarbeit",
        "Günstiger als 1:1",
        "Gemeinsamer Fortschritt",
      ],
      price: "ab 30 € / Schüler:in",
    },
    {
      type: "Signature",
      title: "Mathe Excellence Programm",
      description: "Unser Premium-Programm für Mathematik und Abiturvorbereitung.",
      features: [
        "Wöchentliche Live-Sessions",
        "Premium-Materialien",
        "Übungen, Videos & PDFs",
        "Prüfungsvorbereitung & Strategien",
        "Betreuung zwischen den Sessions",
      ],
      price: "ab 99 € / Monat",
    },
  ],
  compareTitle: "Programmvergleich",
  compareHeaders: {
    features: "Merkmale",
    oneOnOne: "1:1 Premium-Nachhilfe",
    group: "Kleine Lerngruppen",
    math: "Mathe Excellence Programm",
  },
  compareRows: [
    { label: "Betreuung", c1: "Individuell 1:1", c2: "Max. 3–5 Schüler:innen", c3: "Gruppe + Einzelbetreuung" },
    { label: "Lernpläne", c1: true, c2: true, c3: true },
    { label: "Flexible Termine", c1: true, c2: true, c3: "Feste Zeiten (wöchentlich)" },
    { label: "Lernmaterialien", c1: true, c2: true, c3: true },
    { label: "Abiturvorbereitung", c1: true, c2: true, c3: true },
    { label: "Preis", c1: "ab 45 € / Stunde", c2: "ab 30 € / Schüler:in", c3: "ab 99 € / Monat" },
  ],
  ctaTitle: "Unsicher, welches Programm passt?",
  ctaDesc: "Buche ein kostenloses Erstgespräch – wir beraten dich und finden gemeinsam den besten Weg.",
  ctaTags: ["Unverbindlich & kostenlos", "Individuelle Beratung", "Die besten Optionen für dich"],
  ctaButton: "Kostenloses Erstgespräch buchen",
});

Object.assign(site.subjectsPage, {
  learnMore: "Mehr erfahren",
  whyEyebrow: "WARUM NEXTGRADES",
  whyTitle: "Dein Vorteil bei uns",
  benefits: [
    { title: "Persönliche Betreuung", desc: "Individuell und auf deinen Lernfortschritt abgestimmt." },
    { title: "Hochwertige Materialien", desc: "Exklusive Lerninhalte, Videos und Arbeitsblätter." },
    { title: "Flexibel & online", desc: "Lerne wann und wo du willst – 100 % online." },
    { title: "Bessere Ergebnisse", desc: "Mehr Verständnis, bessere Noten, mehr Selbstvertrauen." },
  ],
  stats: [
    { value: "200+", label: "glückliche Schüler:innen" },
    { value: "25+", label: "erfahrene Lehrer:innen" },
    { value: "4.9/5", label: "Bewertung von Eltern & Schüler:innen" },
    { value: "100%", label: "online & flexibel" },
  ],
  ctaTitle: "Bereit, deine Noten zu verbessern?",
  ctaDesc: "Buche jetzt dein kostenloses Erstgespräch und leg los!",
  ctaButton: "Kostenloses Erstgespräch buchen",
  items: [
    {
      id: "math",
      title: "Mathematik",
      description: "Von Grundlagen bis Abitur – wir machen Mathe verständlich und spannend!",
      features: ["Alle Klassenstufen", "Prüfungsvorbereitung", "Arbeitsblätter", "Schritt-für-Schritt Erklärungen"],
    },
    {
      id: "english",
      title: "Englisch",
      description: "Verbessere Verständnis, Konversation und Skills in allen Bereichen.",
      features: ["Grammatik & Wortschatz", "Konversation", "Business English", "Aufsätze schreiben"],
    },
    {
      id: "german",
      title: "Deutsch",
      description: "Texte verstehen, richtig schreiben und Aufsätze verfassen – wir helfen dir!",
      features: ["Grammatik & Rechtschreibung", "Textanalyse", "Aufsätze & Interpretation", "Prüfungsvorbereitung"],
    },
    {
      id: "physics",
      title: "Physik",
      description: "Physik verstehst du, wenn du sie anwendest – wir zeigen dir wie!",
      features: ["Mechanik", "Elektrizität", "Optik & Thermodynamik", "Prüfungsvorbereitung"],
    },
    {
      id: "chemistry",
      title: "Chemie",
      description: "Chemie verstehen und aufbauen – wir zeigen dir, wie es funktioniert!",
      features: ["Stoffe & Reaktionen", "Organische Chemie", "Grundlagen & Übungen", "Prüfungsvorbereitung"],
    },
  ],
});

Object.assign(site.resourcesPage, {
  rating: "4,9/5 Sterne",
  ratingDesc: "Bewertet von Eltern & Schüler:innen",
  tabs: [
    "Alle Ressourcen",
    "Lernmaterialien",
    "Arbeitsblätter",
    "Erklärvideos",
    "Guides & E-Books",
    "Prüfungsvorbereitung",
    "Mini-Kurse",
    "Formelsammlungen",
  ],
  materialTypes: ["Arbeitsblätter & Übungen", "Zusammenfassungen", "Guides & Lernpläne", "Erklärvideos", "Formelsammlungen"],
  resultsCount: "428 Ergebnisse",
  sortNewest: "Sortieren: Neueste zuerst",
  freeResources: [
    {
      title: "Mathe-Formelsammlung",
      subtitle: "Klassen 1–5",
      description: "Alle wichtigen Formeln und Regeln übersichtlich zusammengefasst.",
      type: "PDF",
    },
    {
      title: "Deutsch-Rechtschreibguide",
      subtitle: "Kostenlos",
      description: "Die wichtigsten Rechtschreibregeln einfach erklärt.",
      type: "PDF",
    },
    {
      title: "Lernplan-Vorlage",
      subtitle: "Kostenlos",
      description: "Plane dein Lernen Schritt für Schritt und bleib am Ball.",
      type: "PDF",
    },
    {
      title: "5 Tipps gegen Prüfungsstress",
      subtitle: "Kostenlos",
      description: "So bereitest du dich stressfrei auf Prüfungen vor.",
      type: "Video",
    },
  ],
  premiumResources: [
    {
      title: "Mathematik",
      subtitle: "Klasse 2, Semester 2",
      description: "Komplette Lernmaterialien, Videos, Arbeitsblätter und mehr.",
      type: "PREMIUM",
    },
    {
      title: "Deutsch",
      subtitle: "Klasse 3, Semester 1",
      description: "Deutsch-Lernmaterialien, Videos und Arbeitsblätter.",
      type: "PREMIUM",
    },
    {
      title: "Englisch",
      subtitle: "Klasse 4, Semester 2",
      description: "Grammatik, Wortschatz, Materialien und mehr.",
      type: "PREMIUM",
    },
    {
      title: "Physik",
      subtitle: "Klasse 5, Semester 1",
      description: "Alle Themen, Formeln, Beispiele und Übungen.",
      type: "PREMIUM",
    },
  ],
  subjectsWithCounts: [
    { name: "Alle Fächer", count: 428 },
    { name: "Mathematik", count: 98 },
    { name: "Deutsch", count: 82 },
    { name: "Englisch", count: 76 },
    { name: "Physik", count: 54 },
    { name: "Chemie", count: 48 },
    { name: "Biologie", count: 38 },
    { name: "Wirtschaft", count: 32 },
  ],
  subjectsFilter: ["Alle Fächer", "Mathematik", "Englisch", "Deutsch", "Physik", "Chemie"],
  gradesFilter: [
    "Alle Klassen",
    "Klasse 5",
    "Klasse 6",
    "Klasse 7",
    "Klasse 8",
    "Klasse 9",
    "Klasse 10",
    "Klasse 11",
    "Klasse 12",
  ],
  semestersFilter: ["Alle Semester", "Semester 1", "Semester 2"],
});

Object.assign(site.pricingPage, {
  trustedTitle: "Vertraut von 200+ Schüler:innen",
  trustedDesc: "Durchschnittlich 4,9/5 von echten Schüler:innen und Eltern",
  loading: "Laden...",
  finalCtaTitle: "Unsicher, welches Paket das Richtige ist?",
  finalCtaDesc: "Buche ein kostenloses Erstgespräch – wir finden gemeinsam die perfekte Lösung!",
  finalCtaButton: "Kostenloses Erstgespräch buchen",
  plans: [
    {
      id: "resource",
      name: "Ressourcen-Mitgliedschaft",
      description: "Zugang zu allen Premium-Lernmaterialien",
      monthlyPrice: 29,
      yearlyPrice: 249,
      highlighted: false,
      features: ["Alle Premium-Ressourcen", "Lernvideos", "Übungsblätter", "Zusammenfassungen", "Crashkurse"],
    },
    {
      id: "group",
      name: "Gruppen-Nachhilfe",
      description: "Lerne in kleinen Gruppen mit anderen Schüler:innen",
      monthlyPrice: 99,
      yearlyPrice: 949,
      highlighted: true,
      features: [
        "Alles aus Ressourcen-Mitgliedschaft",
        "Wöchentliche Gruppenstunden",
        "Max. 5 Schüler:innen pro Gruppe",
        "Hausaufgabenbetreuung",
        "Fortschrittsverfolgung",
      ],
    },
    {
      id: "premium",
      name: "1:1 Premium-Nachhilfe",
      description: "Individuelle Betreuung für maximale Erfolge",
      monthlyPrice: 249,
      yearlyPrice: 2399,
      highlighted: false,
      features: [
        "Alles aus Gruppen-Nachhilfe",
        "Individuelle 1:1 Stunden",
        "Persönlicher Lernplan",
        "Flexible Terminvereinbarung",
        "Priority Support",
        "Eltern-Reports",
      ],
    },
  ],
  faqs: [
    {
      question: "Kann ich jederzeit den Tarif wechseln?",
      answer: "Ja! Du kannst deinen Tarif jederzeit upgraden oder downgraden.",
    },
    {
      question: "Gibt es eine kostenlose Testphase?",
      answer: "Ja! Kontaktiere uns für ein kostenloses Erstgespräch.",
    },
    {
      question: "Welche Zahlungsmethoden akzeptiert ihr?",
      answer: "Wir akzeptieren Kreditkarten, PayPal und Banküberweisung.",
    },
  ],
});

site.dashboardNav = {
  student: [
    { label: "Dashboard" },
    { label: "Meine Kurse" },
    { label: "Termine" },
    { label: "Materialien" },
    { label: "KI-Quizze" },
    { label: "Fortschritt" },
    { label: "Einstellungen" },
  ],
  teacher: [
    { label: "Dashboard" },
    { label: "Schüler:innen" },
    { label: "Stundenplan" },
    { label: "Ressourcen" },
    { label: "KI-Generator" },
    { label: "Einnahmen" },
    { label: "Einstellungen" },
  ],
  admin: [
    { label: "Dashboard" },
    { label: "Website-Inhalte" },
    { label: "Schüler:innen" },
    { label: "Lehrer:innen" },
    { label: "Mitgliedschaften" },
    { label: "Zahlungen" },
    { label: "Ressourcen" },
    { label: "Analysen" },
  ],
  logout: "Abmelden",
  backToSite: "Zur Website",
};

Object.assign(site.forgotPassword, {
  title: "Passwort vergessen?",
  subtitle: "Gib deine E-Mail ein – wir senden dir einen Link zum Zurücksetzen.",
  successTitle: "E-Mail prüfen",
  successSubtitle: "Wir haben dir einen Link zum Zurücksetzen deines Passworts gesendet!",
  spamHint: "Wenn du die E-Mail nicht siehst, prüfe deinen Spam-Ordner!",
  email: "E-Mail-Adresse",
  emailPlaceholder: "du@beispiel.de",
  submit: "Link senden",
  sending: "Wird gesendet...",
  backToLogin: "Zurück zur Anmeldung",
  rememberPassword: "Passwort wieder eingefallen? Jetzt anmelden",
  success: "Prüfe deine E-Mails für den Reset-Link.",
});

Object.assign(site.resetPassword, {
  title: "Neues Passwort setzen",
  subtitle: "Gib dein neues Passwort unten ein.",
  successTitle: "Passwort erfolgreich zurückgesetzt!",
  successSubtitle: "Dein Passwort wurde zurückgesetzt! Du wirst weitergeleitet...",
  password: "Neues Passwort",
  confirmPassword: "Passwort bestätigen",
  submit: "Passwort zurücksetzen",
  resetting: "Passwort wird zurückgesetzt...",
  passwordMismatch: "Passwörter stimmen nicht überein!",
  passwordTooShort: "Passwort muss mindestens 6 Zeichen lang sein!",
  success: "Passwort aktualisiert! Weiterleitung zur Anmeldung...",
});

Object.assign(site.loginPage, {
  emailConfirm: "Prüfe deine E-Mails zur Bestätigung!",
  continueGmail: "Mit Gmail fortfahren",
  studentAvatar: "Schüler:innen-Profil",
});

Object.assign(site.aiGeneratorPage, {
  title: "KI-Quiz-Generator",
  subtitle: "Erstelle smarte Quizze, MCQs und Karteikarten mit KI",
  step1: "1. Material hochladen",
  uploadTitle: "PDFs, Notizen oder Zusammenfassungen hochladen",
  uploadHint: "Drag & Drop oder klicken zum Auswählen",
  selectFile: "Datei auswählen",
  step2: "2. Einstellungen",
  subject: "Fach",
  grade: "Klasse",
  questionCount: "Anzahl Fragen",
  difficulty: "Schwierigkeit",
  easy: "Leicht",
  medium: "Mittel",
  hard: "Schwer",
  step3: "3. Generieren",
  generateQuiz: "Quiz generieren",
  generating: "Wird generiert...",
  generatedTitle: "Generiertes Quiz",
  preview: "Vorschau",
  edit: "Bearbeiten",
  delete: "Löschen",
  addQuestion: "Frage hinzufügen",
  promptLabel: "Beschreibe, was du erstellen möchtest",
  promptPlaceholder: "z. B. 10 Mathe-Übungen zu quadratischen Gleichungen für Klasse 9...",
  generate: "Generieren",
  quickAccess: "Schnellzugriff",
  flashcards: "Karteikarten generieren",
  summary: "Zusammenfassung erstellen",
  exercises: "Übungen generieren",
  tipsTitle: "Tipps",
  tip1: "Lade klare, strukturierte PDFs hoch",
  tip2: "Wähle das passende Schwierigkeitsniveau",
  tip3: "Prüfe das generierte Quiz vor dem Einsatz",
  subjects: ["Mathematik", "Englisch", "Deutsch", "Physik"],
  grades: ["Klasse 1", "Klasse 2", "Klasse 3", "Klasse 4"],
});

Object.assign(site.dashboardCommon, {
  comingSoon: "Demnächst verfügbar!",
  comingSoonDesc: "Diese Seite wird gerade entwickelt und ist bald verfügbar!",
  today: "Heute",
  available: "Verfügbar",
  showAll: "Alle anzeigen",
  with: "mit",
  minutes: "Min",
  joinZoom: "Zoom beitreten",
  download: "Herunterladen",
  premium: "Premium",
});

site.dashboardPages = {
  student: {
    courses: { title: "Meine Kurse", description: "Übersicht aller aktuellen und vergangenen Kurse" },
    appointments: { title: "Termine", description: "Verwalte deine Nachhilfetermine" },
    resources: { title: "Materialien", description: "Zugriff auf deine Lernmaterialien" },
    quizzes: { title: "KI-Quizze", description: "Übe mit KI-generierten Quizzen" },
    progress: { title: "Fortschritt", description: "Verfolge deinen Lernfortschritt" },
    settings: { title: "Einstellungen", description: "Verwalte deine Kontoeinstellungen" },
  },
  teacher: {
    students: { title: "Schüler:innen", description: "Verwalte deine zugewiesenen Schüler:innen" },
    schedule: { title: "Stundenplan", description: "Plane und verwalte deine Termine" },
    resources: { title: "Ressourcen", description: "Lernmaterialien hochladen und verwalten" },
    aiGenerator: { title: "KI-Generator", description: "Erstelle Quizze und Lerninhalte mit KI" },
    earnings: { title: "Einnahmen", description: "Übersicht deiner Einnahmen und Auszahlungen" },
    settings: { title: "Einstellungen", description: "Verwalte dein Lehrer:innen-Profil" },
  },
  admin: {
    websiteContent: { title: "Website-Inhalte", description: "Öffentliche Website-Inhalte bearbeiten" },
    students: { title: "Schüler:innen", description: "Alle Schüler:innen auf der Plattform verwalten" },
    teachers: { title: "Lehrer:innen", description: "Alle Lehrer:innen auf der Plattform verwalten" },
    memberships: { title: "Mitgliedschaften", description: "Abonnements und Mitgliedschaften verwalten" },
    payments: { title: "Zahlungen", description: "Zahlungen anzeigen und verwalten" },
    resources: { title: "Ressourcen", description: "Plattform-Lernressourcen verwalten" },
    analytics: { title: "Analysen", description: "Plattform-Statistiken und Einblicke" },
  },
};

Object.assign(site.studentDashboard, {
  welcome: "Willkommen zurück! 👋",
  subtitle: "Hier ist deine Lernübersicht für heute",
  startQuiz: "KI-Quiz starten",
  upcomingAppointments: "Nächste Termine",
  unitsLeft: "Verbleibende Einheiten",
  learningProgress: "Lernfortschritt",
  newMaterials: "Neue Materialien",
  noAppointments: "Keine Termine geplant",
  bookWithTeacher: "Du kannst Termine bei deiner Lehrkraft buchen",
  quickAccess: "Schnellzugriff",
  learningMaterials: "Lernmaterialien",
  videos: "Videos",
  myCourses: "Meine Kurse",
  recentMaterials: "Neueste Materialien",
  allMaterials: "Alle Materialien",
});

Object.assign(site.teacherDashboard, {
  welcome: "Willkommen zurück! 👋",
  subtitle: "Hier ist deine Übersicht für heute",
  newAppointment: "Neuer Termin",
  lessonsToday: "Stunden heute",
  assignedStudents: "Zugewiesene Schüler:innen",
  hoursThisWeek: "Stunden diese Woche",
  earningsMonth: "Monatliche Einnahmen",
  nextJumpLevel: "NextJump Level {{level}}",
  hoursToNext: "{{hours}} Stunden bis zum nächsten Level",
  upcomingAppointments: "Nächste Termine",
  noAppointments: "Keine Termine geplant",
  planWithStudents: "Du kannst Termine mit deinen Schüler:innen planen",
  myStudents: "Meine Schüler:innen",
  allStudents: "Alle Schüler:innen",
  nextLesson: "Nächste Stunde",
  uploadMaterial: "Material hochladen",
});

Object.assign(site.adminDashboard, {
  title: "Admin-Bereich",
  subtitle: "Übersicht über die gesamte Plattform",
  newUser: "Neuer Benutzer",
  students: "Schüler:innen",
  totalStudents: "Schüler:innen gesamt",
  teachers: "Lehrer:innen",
  totalTeachers: "Lehrer:innen gesamt",
  activeCourses: "Aktive Kurse",
  totalRevenue: "Gesamtumsatz",
  recentActivity: "Letzte Aktivität",
  viewAll: "Alle anzeigen",
  quickActions: "Schnellaktionen",
  manageUsers: "Benutzer verwalten",
  managePayments: "Zahlungen verwalten",
  websiteContent: "Website-Inhalte",
  activeStudents: "Aktive Schüler:innen",
  activeTeachers: "Aktive Lehrer:innen",
  platformRevenue: "Plattformumsatz",
  manageStudents: "Schüler:innen verwalten",
  manageTeachers: "Lehrer:innen verwalten",
  viewPayments: "Zahlungen anzeigen",
  manageResources: "Ressourcen verwalten",
  totalRevenueMonthly: "Monatlicher Gesamtumsatz",
  courses: "Kurse",
  revenue: "Umsatz",
});

Object.assign(site.misc, {
  loading: "Laden...",
  errorGeneric: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
});

writeFileSync(deSitePath, JSON.stringify(site, null, 2) + "\n", "utf8");
console.log("Applied German translations to de/site.json");

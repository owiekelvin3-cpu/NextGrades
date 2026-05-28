"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";
import {
  FileText,
  BookOpen,
  Calendar,
  Video,
  GraduationCap,
  Book,
  Users,
  Layers,
  Layout,
  Settings,
  Search,
  Filter,
  ChevronRight,
  ArrowRight,
  Lock,
  File,
  Star,
  CheckCircle2,
  Hexagon,
  Check,
} from "lucide-react";

const tabs = [
  { icon: Layout, label: "Alle Ressourcen" },
  { icon: Book, label: "Lernmaterialien" },
  { icon: Calendar, label: "Übungsblätter" },
  { icon: Video, label: "Erklärvideos" },
  { icon: BookOpen, label: "Guides & E-Books" },
  { icon: GraduationCap, label: "Prüfungsvorbereitung" },
  { icon: Layers, label: "Mini-Kurse" },
  { icon: FileText, label: "Formelsammlungen" },
];

const freeResources = [
  {
    title: "Mathe Formelsammlung",
    subtitle: "1.-5. Klasse",
    description: "Alle wichtigen Formeln und Regeln übersichtlich zusammengefasst.",
    type: "PDF",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop",
  },
  {
    title: "Deutsch Rechtschreibung Guide",
    subtitle: "Kostenlos",
    description: "Die wichtigsten Rechtschreibregeln einfach erklärt.",
    type: "PDF",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=250&fit=crop",
  },
  {
    title: "Lernplan Vorlage",
    subtitle: "Kostenlos",
    description: "Plane dein Lernen Zeit für Zeit und behalte den Überblick im Blick.",
    type: "PDF",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=250&fit=crop",
  },
  {
    title: "5 Tipps gegen Prüfungsstress",
    subtitle: "Kostenlos",
    description: "Entdecke Tipps, wie du dich vor Prüfungen stressfrei vorbereitest.",
    type: "Video",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop",
  },
];

const premiumResources = [
  {
    title: "Mathematik",
    subtitle: "2. Klasse, 2. Semester",
    description: "Komplette Lernmaterialien, Lernvideos, Übungsblätter und vieles mehr.",
    type: "PREMIUM",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
  },
  {
    title: "Deutsch",
    subtitle: "3. Klasse, 1. Semester",
    description: "Deutschsprachige Lernmaterialien, Lernvideos und Übungsblätter.",
    type: "PREMIUM",
    image: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=250&fit=crop",
  },
  {
    title: "Englisch",
    subtitle: "4. Klasse, 2. Semester",
    description: "Grammatik, Vokabeln, Lernmaterialien und vieles mehr.",
    type: "PREMIUM",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
  },
  {
    title: "Physik",
    subtitle: "5. Klasse, 1. Semester",
    description: "Alle Themen, Formeln, Beispiele und Übungen.",
    type: "PREMIUM",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop",
  },
];

const subjects = [
  { name: "Alle Fächer", count: 428 },
  { name: "Mathematik", count: 98 },
  { name: "Deutsch", count: 82 },
  { name: "Englisch", count: 76 },
  { name: "Physik", count: 54 },
  { name: "Chemie", count: 48 },
  { name: "Biologie", count: 38 },
  { name: "Wirtschaft", count: 32 },
];

const grades = ["Alle Klassen", "1. Klasse", "2. Klasse", "3. Klasse", "4. Klasse", "5. Klasse"];
const semesters = ["Alle Semester", "1. Semester", "2. Semester"];

export default function ResourcesPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState(0);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-28 pb-12 bg-[#0D1B2A] text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <div className="text-sm text-[#D4AF37] font-semibold mb-3">RESSOURCEN</div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Wissen, das dich weiterbringt.
                </h1>
                <p className="text-lg text-gray-300 mb-10">
                  Entdecke kostenlose Materialien, nützliche Guides und wertvolle Tipps, die dich beim Lernen unterstützen.
                </p>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div className="text-sm font-semibold">Hochwertige Inhalte</div>
                    <div className="text-xs text-gray-400">Von erfahrenen Lehrer:innen erstellt.</div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div className="text-sm font-semibold">Kostenlos & hilfreich</div>
                    <div className="text-xs text-gray-400">Fürs Lernen entwickelt.</div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Book className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div className="text-sm font-semibold">Für alle Fächer</div>
                    <div className="text-xs text-gray-400">Materialien für alle wichtigen Schulfächer.</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=600&fit=crop"
                    alt="Student studying"
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute bottom-4 right-4 bg-white text-[#0D1B2A] px-5 py-4 rounded-xl shadow-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-5 h-5 text-[#D4AF37] fill-current" />
                    <span className="text-sm font-semibold">4.9/5 Sterne</span>
                  </div>
                  <div className="text-xs text-gray-600">Von Eltern & Schüler:innen bewertet</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-4 border-b border-gray-200 dark:border-white/10 bg-[var(--background)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 sm:gap-2 justify-between">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg transition-all flex-1 min-w-0 ${
                    activeTab === index
                      ? "bg-[#D4AF37] text-[#0D1B2A] font-semibold"
                      : theme === "dark"
                      ? "text-gray-400 hover:text-white hover:bg-white/10"
                      : "text-gray-600 hover:text-[#0D1B2A] hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Filters & Content */}
        <section className="py-10 bg-[var(--background)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar Filters */}
              <div className="lg:col-span-1">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">Filter</h3>
                    <Filter className="w-4 h-4 text-gray-500" />
                  </div>

                  {/* Subject Filter */}
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">Fach</h4>
                    <div className="space-y-2">
                      {subjects.map((subject, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSubject(index)}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all ${
                            selectedSubject === index
                              ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30"
                              : theme === "dark"
                              ? "text-gray-400 hover:text-white hover:bg-white/5"
                              : "text-gray-600 hover:text-[#0D1B2A] hover:bg-gray-50"
                          }`}
                        >
                          <span>{subject.name}</span>
                          {selectedSubject === index && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grade Filter */}
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">Klasse</h4>
                    <div className="space-y-2">
                      {grades.map((grade, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedGrade(index)}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all ${
                            selectedGrade === index
                              ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30"
                              : theme === "dark"
                              ? "text-gray-400 hover:text-white hover:bg-white/5"
                              : "text-gray-600 hover:text-[#0D1B2A] hover:bg-gray-50"
                          }`}
                        >
                          <span>{grade}</span>
                          {selectedGrade === index && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Semester Filter */}
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">Semester</h4>
                    <div className="space-y-2">
                      {semesters.map((semester, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSemester(index)}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all ${
                            selectedSemester === index
                              ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30"
                              : theme === "dark"
                              ? "text-gray-400 hover:text-white hover:bg-white/5"
                              : "text-gray-600 hover:text-[#0D1B2A] hover:bg-gray-50"
                          }`}
                        >
                          <span>{semester}</span>
                          {selectedSemester === index && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">Material-Typ</h4>
                    <div className="space-y-2">
                      {[
                        "Übungsblätter & Aufgaben",
                        "Zusammenfassungen",
                        "Guides & Studienpläne",
                        "Erklärvideos",
                        "Formelsammlungen",
                      ].map((type, index) => (
                        <label key={index} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 accent-[#D4AF37]" defaultChecked={index === 0} />
                          <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            {type}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Access Filter */}
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">Zugriff</h4>
                    <div className="space-y-2">
                      {[
                        { label: "Alle Inhalte" },
                        { label: "Kostenlose Inhalte" },
                        { label: "Premium-Inhalte" },
                      ].map((item, index) => (
                        <label key={index} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="access"
                            defaultChecked={index === 0}
                            className="w-4 h-4 accent-[#D4AF37]"
                          />
                          <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button className="w-full mt-8 flex items-center justify-center gap-2 py-3 border border-gray-300 dark:border-white/20 rounded-xl text-sm font-medium text-[var(--foreground)] hover:bg-gray-100 dark:hover:bg-white/10 transition">
                    <Filter className="w-4 h-4" />
                    Filter zurücksetzen
                  </button>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Top Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    428 Ergebnisse
                  </div>
                  <div className="flex items-center gap-4 flex-1 md:flex-none">
                    <div className="flex-1 md:w-64 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Materialien durchsuchen..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-[var(--input-background)] text-[var(--input-foreground)] placeholder-gray-400"
                      />
                    </div>
                    <select className="px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-[var(--input-background)] text-[var(--input-foreground)] text-sm">
                      <option>Sortieren nach: Neuste zuerst</option>
                      <option>Alteste zuerst</option>
                      <option>Beliebteste</option>
                    </select>
                  </div>
                </div>

                {/* Free Resources */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                        <File className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--foreground)]">Kostenlose Inhalte</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Für alle verfügbar</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 text-sm font-semibold text-[#D4AF37]">
                      Alle anzeigen
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {freeResources.map((resource, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="p-0 h-full overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="h-32 overflow-hidden relative">
                            <img
                              src={resource.image}
                              alt={resource.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3">
                              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                resource.type === "PDF"
                                  ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                                  : "bg-[#4DA3FF]/10 text-[#4DA3FF]"
                              }`}>
                                {resource.type}
                              </span>
                            </div>
                          </div>
                          <div className="p-5">
                            <h4 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                              {resource.title}
                            </h4>
                            <p className="text-xs text-[#D4AF37] font-medium mb-2">
                              {resource.subtitle}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                              {resource.description}
                            </p>
                            <Button variant="dark" size="sm" className="w-full text-xs">
                              Kostenlos
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Premium Resources */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFA500]/10 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-[#FFA500]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--foreground)]">PREMIUM Inhalte</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Nur für Mitglieder</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 text-sm font-semibold text-[#D4AF37]">
                      Alle anzeigen
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {premiumResources.map((resource, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="p-0 h-full overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="h-32 overflow-hidden relative">
                            <img
                              src={resource.image}
                              alt={resource.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] to-transparent" />
                            <div className="absolute top-3 left-3">
                              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#FFA500]/10 text-[#FFA500]">
                                {resource.type}
                              </span>
                            </div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                              <Lock className="w-10 h-10 text-[#D4AF37]" />
                            </div>
                          </div>
                          <div className="p-5">
                            <h4 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                              {resource.title}
                            </h4>
                            <p className="text-xs text-[#D4AF37] font-medium mb-2">
                              {resource.subtitle}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                              {resource.description}
                            </p>
                            <Button variant="gold" size="sm" className="w-full text-xs">
                              Nur für Mitglieder
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Resources by Subject */}
                <div className="mb-10">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">
                    Ressourcen nach Fach
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {subjects.slice(1, 6).map((subject, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="p-6 text-center border-l-4 border-l-[#D4AF37]">
                          <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-6 h-6 text-[#D4AF37]" />
                          </div>
                          <h4 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                            {subject.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            {subject.count} Materialien
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
                            <div 
                              className="h-2 bg-[#D4AF37] rounded-full"
                              style={{ width: `${(subject.count / 100) * 100}%` }}
                            ></div>
                          </div>
                          <button className="mt-4 text-sm font-semibold text-[#D4AF37] flex items-center justify-center gap-1">
                            Entdecken →
                          </button>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* CTA Section */}
                <Card className="p-8 bg-gradient-to-r from-[#0D1B2A] to-[#112240] text-white rounded-2xl">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-8 h-8 text-[#D4AF37]" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">Noch mehr exklusive Inhalte freischalten</h3>
                          <p className="text-gray-300 text-sm mt-1">
                            Entdecke Zugriff auf alle Premium-Materialien, Lernvideos, Dutzende Mini-Kurse und vieles mehr.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button variant="gold" size="xl">
                        Jetzt Mitglied werden
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                      <div className="flex items-center justify-end gap-6 mt-4 text-xs text-gray-400">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                          Unverbindlich
                        </span>
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                          Kostenlos
                        </span>
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                          Individuelle Beratung
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Features */}
                <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: BookOpen, title: "Strukturiert nach Lehrplan", desc: "Lerninhalte passend zum Lehrplan." },
                    { icon: Settings, title: "Regelmäßig aktualisiert", desc: "Stets aktuelle Inhalte." },
                    { icon: Star, title: "Von Experten erstellt", desc: "Von Pädagogen und Lehrkräften erstellt." },
                    { icon: Hexagon, title: "Sicher & gut", desc: "Für Schüler:innen optimal aufbereitet." },
                  ].map((feature, index) => (
                    <div key={index} className="text-center p-6">
                      <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="w-6 h-6 text-[#D4AF37]" />
                      </div>
                      <h4 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

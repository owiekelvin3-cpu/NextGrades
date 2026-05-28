"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  PenTool,
  CheckCircle2,
  ArrowRight,
  Users,
  TrendingUp,
  Calendar,
  GraduationCap,
  Star,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const subjects = [
  {
    id: "math",
    title: "Mathematik",
    description: "Von Grundrechenarten bis zur Matura – wir machen Mathe verständlich und Spaß!",
    icon: Calculator,
    image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=600&h=400&fit=crop",
    features: ["Alle Schulstufen", "Matura-Vorbereitung", "Übungsblätter", "Schritt-für-Schritt-Erklärungen"],
  },
  {
    id: "english",
    title: "Englisch",
    description: "Verbessere dein Verständnis, Konversation und Wissen in allen Bereichen.",
    icon: PenTool,
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop",
    features: ["Grammatik & Vokabeln", "Konversation", "Business Englisch", "Essay-Writing"],
  },
  {
    id: "german",
    title: "Deutsch",
    description: "Texte verstehen, richtig formulieren und Aufsätze schreiben – wir helfen dir!",
    icon: PenTool,
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop",
    features: ["Grammatik & Rechtschreibung", "Textanalyse", "Aufsatz & Interpretation", "Matura-Vorbereitung"],
  },
  {
    id: "physics",
    title: "Physik",
    description: "Physik verstehst du erst dann, wenn du es selbst anwendest – wir zeigen dir wie!",
    icon: Atom,
    image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&h=400&fit=crop",
    features: ["Mechanik", "Elektrizität", "Optik & Wärmelehre", "Matura-Vorbereitung"],
  },
  {
    id: "chemistry",
    title: "Chemie",
    description: "Chemie verstehen und aufbauen – wir zeigen dir, wie es funktioniert!",
    icon: FlaskConical,
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop",
    features: ["Stoffe & Reaktionen", "Organische Chemie", "Grundlagen & Übungen", "Prüfungsvorbereitung"],
  },
];

const benefits = [
  { 
    icon: Users, 
    title: "Persönliche Betreuung", 
    desc: "Individuell und abgestimmt auf deinen Lernfortschritt." 
  },
  { 
    icon: BookOpen, 
    title: "Hochwertige Materialien", 
    desc: "Exklusive Lerninhalte, Videos und Übungsblätter." 
  },
  { 
    icon: Calendar, 
    title: "Flexibel & Online", 
    desc: "Lerne wann und wo du willst – 100% online und flexibel." 
  },
  { 
    icon: TrendingUp, 
    title: "Bessere Ergebnisse", 
    desc: "Mehr Verständnis, bessere Noten und mehr Selbstvertrauen." 
  },
];

const stats = [
  { 
    value: "200+", 
    label: "glückliche Schüler:innen", 
    icon: Users 
  },
  { 
    value: "25+", 
    label: "erfahrene Lehrer:innen", 
    icon: GraduationCap 
  },
  { 
    value: "4,9/5", 
    label: "Bewertung von Eltern & Schüler:innen", 
    icon: Star 
  },
  { 
    value: "100%", 
    label: "online & flexibel", 
    icon: TrendingUp 
  },
];

export default function SubjectsPage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-20 bg-gradient-to-b from-[#0D1B2A] to-[#112240] text-white relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <p className="text-[#D4AF37] uppercase tracking-[0.2em] text-sm font-semibold mb-4">
                UNSERE FÄCHER
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Alle Fächer. Ein Ziel:
                <br />
                <span className="text-[#D4AF37]">Dein Erfolg.</span>
              </h1>
              <p className="text-xl text-gray-300 mb-10">
                Wir bieten Nachhilfe in allen relevanten Schulfächern – individuell, strukturiert und mit echten Erfolgen.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Subjects Grid */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subjects.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-0 h-full overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                    <div className="h-48 relative overflow-hidden">
                      <img
                        src={subject.image}
                        alt={subject.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/80 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#D4AF37] flex items-center justify-center shadow-lg">
                          <subject.icon className="w-7 h-7 text-[#0D1B2A]" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-7" style={{ backgroundColor: theme === "dark" ? "#112240" : "white" }}>
                      <h3 className="text-xl font-bold mb-3" style={{ color: theme === "dark" ? "white" : "#0D1B2A" }}>
                        {subject.title}
                      </h3>
                      <p className="mb-6 text-sm leading-relaxed" style={{ color: theme === "dark" ? "#9CA3AF" : "#6B7280" }}>
                        {subject.description}
                      </p>
                      
                      <ul className="space-y-2 mb-7">
                        {subject.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                            <span className="text-sm" style={{ color: theme === "dark" ? "#D1D5DB" : "#4B5563" }}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button variant="gold" size="md" className="w-full">
                        Mehr erfahren <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16" style={{ backgroundColor: theme === "dark" ? "#112240" : "white" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <p className="text-[#D4AF37] uppercase tracking-[0.2em] text-sm font-semibold mb-4">
                WARUM NEXTGRADES
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: theme === "dark" ? "white" : "#0D1B2A" }}>
                Dein Vorteil mit uns
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-6">
              {benefits.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 text-center border border-gray-100 dark:border-white/10 bg-transparent">
                    <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-5">
                      <item.icon className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: theme === "dark" ? "white" : "#0D1B2A" }}>
                      {item.title}
                    </h3>
                    <p className="text-sm" style={{ color: theme === "dark" ? "#9CA3AF" : "#6B7280" }}>
                      {item.desc}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-[#D4AF37] text-[#0D1B2A]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-[#0D1B2A]" />
                  </div>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <p className="text-[#0D1B2A]/80">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-b from-[#0D1B2A] to-[#112240] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-5">
                Bereit, deine Noten zu verbessern?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Buche jetzt dein kostenloses Erstgespräch und los geht's!
              </p>
              <Button variant="gold" size="xl">
                Kostenloses Erstgespräch buchen <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

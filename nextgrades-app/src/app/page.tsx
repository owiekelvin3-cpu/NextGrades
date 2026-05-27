
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowRight,
  Users,
  BookOpen,
  Layers,
  TrendingUp,
  Clock,
  Star,
  CheckCircle2,
  PlayCircle,
  Shield,
  Award,
  Calendar,
  Book,
  Zap,
  GraduationCap,
  Video,
  Target,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-28 pb-16 bg-[#0D1B2A] text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-[#D4AF37] uppercase tracking-[0.2em] text-sm font-semibold mb-4">
                  DIE ZUKUNFT DES LERNENS BEGINNT HIER.
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Smarter lernen. <span className="text-[#D4AF37]">Bessere Ergebnisse.</span>
                </h1>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  Premium Online-Nachhilfe, moderne Lernsysteme und strukturierte Lernbegleitung für ambitionierte Schüler:innen.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <Button variant="gold" size="md" className="px-8">
                    Kostenloses Erstgespräch
                  </Button>
                  <Button variant="outline" size="md" className="border-white text-white hover:bg-white hover:text-[#0D1B2A]">
                    Programme entdecken →
                  </Button>
                </div>
                
                {/* Social Proof */}
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F5A623] border-2 border-[#0D1B2A] flex items-center justify-center text-white font-bold text-sm"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                      ))}
                      <span className="text-white font-semibold ml-1">4,9/5</span>
                    </div>
                    <p className="text-sm text-gray-400">aus 200+ Bewertungen</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                {/* Hero student image */}
                <div className="rounded-2xl h-[450px] relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop"
                    alt="Student studying"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/70 to-transparent" />
                </div>
                
                {/* Floating Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-6 -left-6"
                >
                  <Card className="p-5 bg-[#0D1B2A] border border-[#D4AF37]/30">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-[#D4AF37]" />
                      </div>
                      <div>
                        <p className="text-white font-semibold mb-1">Individuelle Betreuung.</p>
                        <p className="text-sm text-gray-400">Echte Ergebnisse.</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Strip */}
        <section className="py-12 bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-5 gap-8">
              {[
                { icon: Users, title: "Premium Lehrer:innen", desc: "Sorgfältig ausgewählte, erfahrene Pädagogen mit Fokus auf Erfolg." },
                { icon: Users, title: "Kleine Lerngruppen", desc: "Max. 3-5 Schüler:innen pro Gruppe für intensives Lernen." },
                { icon: Video, title: "Moderne Lernplattform", desc: "Videos, Übungen, PDFs und mehr - alles an einem Ort." },
                { icon: Target, title: "Strukturierte Lernsysteme", desc: "Klarer Lernpfad, Fortschrittstracking & systematische Vorbereitung." },
                { icon: Clock, title: "Flexibel & Online", desc: "Lerne wo du willst, wann du willst, zu deinen Zeiten." },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-base font-semibold text-[#0D1B2A] mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-[#0D1B2A] mb-3">
                Unsere Programme
              </h2>
              <p className="text-gray-600">
                Wähle das Programm, das am besten zu dir passt.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "1:1 Premium Tutoring",
                  features: ["Individuell, Persönlich, Effizient.", "Persönliche 1:1 Betreuung", "Flexible Termine", "Maßgeschneidertes Lernkonzept"],
                  featured: false
                },
                {
                  title: "Small Group Learning",
                  features: ["Gemeinsam lernen, mit Freunden.", "Max. 3-5 Schüler:innen", "Interaktiver Austausch", "Motivation durch die Gruppe"],
                  featured: false
                },
                {
                  title: "Math Excellence Program",
                  features: ["Unser Flagship-Programm für Mathe.", "Wöchentliche Live Sessions", "Premium Lernmaterialien", "Matura-/Abitur-Vorbereitung", "Dozent:innen aus Uni & Sessions"],
                  featured: true
                }
              ].map((program, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`p-0 h-full flex flex-col relative overflow-hidden ${
                    program.featured ? "border-2 border-[#D4AF37] shadow-xl" : "border border-gray-100"
                  }`}>
                    {program.featured && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-[#D4AF37] text-[#0D1B2A] px-3 py-1 text-xs font-semibold uppercase">
                          Beliebtestes Programm
                        </Badge>
                      </div>
                    )}
                    
                    {/* Program images */}
                    <div className="h-44 relative overflow-hidden">
                      <img
                        src={program.featured 
                          ? "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&h=400&fit=crop"
                          : index === 0 
                            ? "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                            : "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop"
                        }
                        alt={program.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-[#0D1B2A] mb-4">
                        {program.title}
                      </h3>
                      
                      <ul className="flex-1 space-y-3 mb-6">
                        {program.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Link href="/programs" className={`font-semibold flex items-center gap-2 ${
                        program.featured ? "text-[#D4AF37]" : "text-[#0D1B2A]"
                      }`}>
                        Mehr erfahren →
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-14 bg-[#0D1B2A] text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { icon: GraduationCap, number: "200+", label: "glückliche Schüler:innen" },
                { icon: Users, number: "25+", label: "Top Lehrer:innen" },
                { icon: FileText, number: "1,000+", label: "Lernmaterialien" },
                { icon: Star, number: "4,9/5", label: "Bewertung von Eltern & Schüler:innen" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">{stat.number}</p>
                  <p className="text-sm text-gray-300">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Preview Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-[#D4AF37] uppercase tracking-[0.2em] text-sm font-semibold mb-4">
                  ALLES AN EINEM ORT
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A] mb-6">
                  Deine komplette Lernplattform
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Unsere moderne Plattform unterstützt dich bei jedem Schritt deines Lernwegs.
                </p>
                
                <ul className="space-y-4 mb-10">
                  {[
                    "Fortschrittsverfolgung im Blick",
                    "Lernbibliothek",
                    "Zugriff auf alle Materialien & Videos",
                    "Termine",
                    "Erinnerungen für deine Ziele",
                    "Aufgaben & Übungen",
                    "Interaktive Übungen mit Lösungen"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <Button variant="gold" size="md">
                  Plattform entdecken
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Laptop mockup placeholder */}
                <div className="bg-[#0D1B2A] rounded-3xl p-4 shadow-2xl">
                  <div className="bg-[#1F2937] rounded-2xl p-6">
                    <div className="h-80 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="text-6xl mb-4">📊</div>
                        <p className="text-lg">Dashboard Preview</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-[#FAFAFA]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-[#0D1B2A]">
                Das sagen Schüler:innen & Eltern
              </h2>
            </motion.div>

            <div className="relative">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    quote: "Dank NextGrades habe ich meine Mathe-Note von 3 auf 1 verbessert! Die Erklärungen sind einfach super und man versteht sofort!",
                    name: "Lena, 10. Klasse"
                  },
                  {
                    quote: "Die kleine Lerngruppe hat meinem Sohn sehr gut getan! Er ist motivierter geworden und versteht endlich Mathe.",
                    name: "Peter M., Vater"
                  },
                  {
                    quote: "Die Plattform ist super intuitiv und die Materialien stehen hierfür perfekt für die Matura-Vorbereitung!",
                    name: "Julia, 12. Klasse"
                  }
                ].map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-8 h-full border border-gray-100">
                      <div className="flex items-center gap-1 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37]" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-6 leading-relaxed">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                          <span className="text-[#D4AF37] font-bold text-sm">
                            {testimonial.name.charAt(0)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{testimonial.name}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-[#0D1B2A] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center justify-between gap-8"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Bereit für den nächsten Schritt?
                  </h3>
                  <p className="text-gray-300">
                    Buche jetzt dein kostenloses Erstgespräch und finde heraus, welches Programm am besten zu dir passt.
                  </p>
                </div>
              </div>
              <Button variant="gold" size="lg">
                Kostenloses Erstgespräch buchen
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

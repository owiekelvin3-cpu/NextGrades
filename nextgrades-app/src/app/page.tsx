
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/context/ThemeContext";
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
  const { theme } = useTheme();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className={`pt-28 pb-16 ${theme === "dark" ? "bg-[#0D1B2A] text-white" : "bg-[#FAFAFA] text-[#0D1B2A]"} relative overflow-hidden`}>
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
                <p className={`text-lg mb-8 leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Premium Online-Nachhilfe, moderne Lernsysteme und strukturierte Lernbegleitung für ambitionierte Schüler:innen.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <Button variant="gold" size="md" className="px-8">
                    Kostenloses Erstgespräch
                  </Button>
                  <Button 
                    variant="outline" 
                    size="md" 
                    className={`${theme === "dark" 
                      ? "border-white text-white hover:bg-white hover:text-[#0D1B2A]" 
                      : "border-[#0D1B2A] text-[#0D1B2A] hover:bg-[#0D1B2A] hover:text-white"}`}
                  >
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
        <section className={`py-12 ${theme === "dark" ? "bg-[#112240]" : "bg-[#FAFAFA]"}`}>
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
                  <h3 className={`text-base font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>{feature.title}</h3>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className={`py-20 ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-white"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className={`text-3xl font-bold mb-3 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                Unsere Programme
              </h2>
              <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
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
                      <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                        {program.title}
                      </h3>
                      
                      <ul className="flex-1 space-y-3 mb-6">
                        {program.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                            <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Link href="/programs" className={`font-semibold flex items-center gap-2 ${
                        program.featured ? "text-[#D4AF37]" : (theme === "dark" ? "text-white" : "text-[#0D1B2A]")
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
        <section className={`py-14 ${theme === "dark" ? "bg-[#112240] text-white" : "bg-[#FAFAFA] text-[#0D1B2A]"}`}>
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
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${theme === "dark" ? "bg-white/10" : "bg-[#D4AF37]/20"}`}>
                    <stat.icon className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <p className={`text-3xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>{stat.number}</p>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Preview Section */}
        <section className={`py-12 ${theme === "dark" ? "bg-[#112240]" : "bg-[#FAFAFA]"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              {/* Hero Image Background */}
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=600&fit=crop"
                  alt="Modern learning"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A]/80 via-[#0D1B2A]/40 to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                      <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                      >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                          Deine komplette Lernplattform
                        </h1>
                        <p className="text-gray-200 text-lg mb-8">
                          Unsere moderne Plattform unterstützt dich bei jedem Schritt deines Lernwegs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button variant="gold" size="md">
                            Plattform entdecken
                          </Button>
                          <Button variant="outline" size="md" className="border-white text-white hover:bg-white hover:text-[#0D1B2A]">
                            Mehr erfahren
                          </Button>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                      >
                        <div className="space-y-4">
                          {/* Info Cards */}
                          <div className="bg-white rounded-2xl p-6 shadow-xl">
                            <h3 className="text-[#0D1B2A] font-semibold text-sm mb-2">
                              Fortschritt verfolgen
                            </h3>
                            <div className="flex gap-4">
                              <img
                                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=100&h=100&fit=crop"
                                alt="Learning"
                                className="w-16 h-16 rounded-xl object-cover"
                              />
                              <div className="flex-1">
                                <p className="text-gray-600 text-sm">
                                  Track your progress, complete lessons, and stay motivated!
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl p-4 shadow-xl">
                              <div className="text-3xl font-bold text-[#0D1B2A]">27/4</div>
                              <div className="text-sm text-gray-500">Wochen lang</div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-xl">
                              <div className="text-3xl font-bold text-[#0D1B2A]">120K+</div>
                              <div className="text-sm text-gray-500">Lernmaterialien</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 relative overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/germany-uni.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A]/90 via-[#0D1B2A]/70 to-[#0D1B2A]/90" />
          </div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white">
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
                    <Card className="p-8 h-full bg-white/10 backdrop-blur-xl border border-white/20">
                      <div className="flex items-center gap-1 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37]" />
                        ))}
                      </div>
                      <p className="mb-6 leading-relaxed text-white">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/30 flex items-center justify-center">
                          <span className="text-[#D4AF37] font-bold text-sm">
                            {testimonial.name.charAt(0)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-200">{testimonial.name}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`py-16 ${theme === "dark" ? "bg-[#112240] text-white" : "bg-[#FAFAFA] text-[#0D1B2A]"}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center justify-between gap-8"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === "dark" ? "bg-white/10" : "bg-[#D4AF37]/20"}`}>
                  <Calendar className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Bereit für den nächsten Schritt?
                  </h3>
                  <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
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

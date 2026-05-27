
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Users, 
  User, 
  Zap, 
  Calendar, 
  Award, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  BookOpen, 
  Video, 
  TrendingUp, 
  GraduationCap 
} from "lucide-react";

export default function ProgramsPage() {
  const programs = [
    {
      type: "1:1",
      title: "1:1 Premium Tutoring",
      description: "Individuelle Nachhilfe, die sich 100% nach dir richtet.",
      features: [
        "Individuelle 1:1 Betreuung",
        "Persönliche Lernpläne",
        "Gesetzte Prüfungsvorbereitung",
        "Flexible Termine!",
        "Maßnahme erfahren & Fokus"
      ],
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
      featured: false,
      price: "ab 45€ / Stunde"
    },
    {
      type: "Gruppe",
      title: "Small Group Learning",
      description: "Lernen in kleinen Gruppen mit maximal 3-5 Schüler:innen.",
      features: [
        "Max. 3-5 Schüler:innen",
        "Motivierende Lernatmosphäre",
        "Austausch & Vorbeiflug",
        "Günstiger als 1:1 Nachhilfe",
        "Gemeinsame Fortschritte"
      ],
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop",
      featured: false,
      price: "ab 30€ / Schüler:in"
    },
    {
      type: "Signature",
      title: "Math Excellence Program",
      description: "Unser Premium-Programm für Mathematik und Matura-Vorbereitung.",
      features: [
        "Wöchentliche Live Sessions",
        "Premium-Lernmaterialien",
        "Übungen, Videos & PDFs",
        "Matura-Vorbereitung & Strategien",
        "Support zwischen den Sessions"
      ],
      image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&h=400&fit=crop",
      featured: true,
      price: "ab 99€ / Monat"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-12 bg-[#0D1B2A] text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="text-gray-400 uppercase tracking-[0.2em] text-sm font-semibold mb-4">
                  Startseite &nbsp; &gt; &nbsp; Programme
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Unsere Programme.
                  <br />
                  <span className="text-[#D4AF37]">Für jedes Lernziel.</span>
                </h1>
                
                <p className="text-gray-300 text-lg mb-8">
                  Wähle das Programm, das am besten zu dir passt – 
                  und erreiche deine Ziele mit Struktur, Motivation 
                  und der richtigen Unterstützung.
                </p>

                <div className="flex flex-wrap gap-6 mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37]/50 flex items-center justify-center">
                      <Award className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="font-semibold">Premium Betreuung</p>
                      <p className="text-xs text-gray-400">Persönlich, engagiert, ergebnisorientiert.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37]/50 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="font-semibold">Moderne Lernmethoden</p>
                      <p className="text-xs text-gray-400">Effizient und systematisch.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37]/50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="font-semibold">Flexibel & Online</p>
                      <p className="text-xs text-gray-400">Lerne, wo du willst – wann du willst.</p>
                    </div>
                  </div>
                </div>

                <Button variant="gold" size="lg">
                  Kostenloses Erstgespräch <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="rounded-2xl h-[450px] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop"
                    alt="Student studying"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/60 to-transparent" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="py-6 -mt-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-6 bg-white shadow-xl border-0">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: GraduationCap, number: "200+", label: "glückliche Schüler:innen" },
                  { icon: Users, number: "25+", label: "Top Lehrer:innen" },
                  { icon: Star, number: "4,9/5", label: "Bewertung von Eltern & Schüler:innen" }
                ].map((stat, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0D1B2A]/10 flex items-center justify-center flex-shrink-0">
                      <stat.icon className="w-6 h-6 text-[#0D1B2A]" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-[#0D1B2A]">{stat.number}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Programs Section */}
        <section className="py-20 bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="text-[#D4AF37] uppercase tracking-[0.2em] text-sm font-semibold mb-4">
                UNSERE PROGRAMME
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A] mb-3">
                Finde das perfekte Programm für dich.
              </h2>
              <p className="text-gray-600">
                Ob individuelle Nachhilfe, gemeinsames Lernen in kleinen Gruppen oder unser 
                Signature-Programm – wir haben die passende Lösung für dich.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {programs.map((program, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className={`p-0 h-full flex flex-col overflow-hidden transition-all duration-300 ${
                    program.featured 
                      ? "border-2 border-[#D4AF37] shadow-2xl scale-[1.02]" 
                      : "border border-gray-200"
                  }`}>
                    {program.featured && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-[#D4AF37] text-[#0D1B2A] px-3 py-1 text-xs font-bold uppercase">
                          Beliebtestes Programm
                        </Badge>
                      </div>
                    )}
                    
                    <div className="h-48 relative overflow-hidden">
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-[#0D1B2A] text-white px-3 py-1 text-xs font-semibold">
                          {program.type}
                        </Badge>
                      </div>
                      <img
                        src={program.image}
                        alt={program.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-[#0D1B2A] mb-3">
                        {program.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-6">
                        {program.description}
                      </p>
                      
                      <div className="flex-1 mb-8">
                        <ul className="space-y-3">
                          {program.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button 
                        variant={program.featured ? "gold" : "dark"} 
                        size="lg" 
                        className="w-full"
                      >
                        Mehr erfahren <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-[#0D1B2A] mb-3">
                Programme im Vergleich
              </h2>
            </motion.div>

            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D1B2A]">Leistungen</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#0D1B2A]">1:1 Premium Tutoring</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#0D1B2A]">Small Group Learning</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#D4AF37] bg-[#D4AF37]/10">Math Excellence Program</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {[
                    { label: "Betreuung", c1: "Individuell 1:1", c2: "Max. 3-5 Schüler:innen", c3: "Gruppe + Individueller Support" },
                    { label: "Lernpläne", c1: true, c2: true, c3: true },
                    { label: "Flexible Termine", c1: true, c2: true, c3: "Feste Zeiten (wöchentlich)" },
                    { label: "Lernmaterialien", c1: true, c2: true, c3: true },
                    { label: "Matura Vorbereitung", c1: true, c2: true, c3: true },
                    { label: "Preis", c1: "ab 45€ / Stunde", c2: "ab 30€ / Schüler:in", c3: "ab 99€ / Monat" }
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700 flex items-center gap-2">
                        {["Betreuung", "Preis"].includes(row.label) ? (
                          <span>{row.label}</span>
                        ) : (
                          <span>{row.label}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.c1 === true ? (
                          <CheckCircle2 className="w-5 h-5 text-[#D4AF37] mx-auto" />
                        ) : (
                          <span className="text-sm text-gray-600">{row.c1}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.c2 === true ? (
                          <CheckCircle2 className="w-5 h-5 text-[#D4AF37] mx-auto" />
                        ) : (
                          <span className="text-sm text-gray-600">{row.c2}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center bg-[#D4AF37]/5">
                        {row.c3 === true ? (
                          <CheckCircle2 className="w-5 h-5 text-[#D4AF37] mx-auto" />
                        ) : (
                          <span className="text-sm text-[#0D1B2A] font-medium">{row.c3}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-12 bg-[#0D1B2A] text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-8 bg-[#0D1B2A] border border-white/10 shadow-xl">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Nicht sicher, welches Programm passt?
                    </h3>
                    <p className="text-gray-300">
                      Buche ein kostenloses Erstgespräch – wir beraten dich gerne 
                      und finden gemeinsam den besten Weg für dich.
                    </p>
                    <div className="flex flex-wrap gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-xs text-gray-300">Unverbindlich & kostenlos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-xs text-gray-300">Individuelle Beratung</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-xs text-gray-300">Die besten Optionen für dich</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <Button variant="gold" size="xl">
                    Kostenloses Erstgespräch buchen <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

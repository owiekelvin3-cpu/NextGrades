
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  BookOpen,
  Calculator,
  Globe,
  Atom,
  FlasksConical,
  PenTool,
  CheckCircle2,
  ArrowRight,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";

const subjects = [
  {
    id: "math",
    title: "Mathematik",
    description: "Grundrechenarten bis zur Analysis – wir machen Mathe verständlich.",
    icon: Calculator,
    image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&h=400&fit=crop",
    color: "from-blue-500 to-indigo-600",
    features: ["1:1 Betreuung", "Übungsblätter", "Matura-Vorbereitung"],
  },
  {
    id: "english",
    title: "Englisch",
    description: "Grammatik, Vokabeln & Konversation für bessere Englischkenntnisse.",
    icon: Globe,
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop",
    color: "from-red-500 to-pink-600",
    features: ["Konversation", "Business Englisch", "Prüfungsvorbereitung"],
  },
  {
    id: "german",
    title: "Deutsch",
    description: "Grammatik, Aufsatz & Analyse für bessere Deutschkenntnisse.",
    icon: PenTool,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop",
    color: "from-purple-500 to-pink-600",
    features: ["Aufsatzübungen", "Textanalyse", "Vokabeltraining"],
  },
  {
    id: "physics",
    title: "Physik",
    description: "Mechanik, Elektrodynamik & Quanten – Physik made easy.",
    icon: Atom,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    color: "from-amber-500 to-orange-600",
    features: ["Experimente", "Formeln", "Praxisbeispiele"],
  },
  {
    id: "chemistry",
    title: "Chemie",
    description: "Periodensystem, Reaktionen & Organik für deinen Lernerfolg.",
    icon: FlasksConical,
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop",
    color: "from-emerald-500 to-teal-600",
    features: ["Organik", "Anorganik", "Prüfungsvorbereitung"],
  },
  {
    id: "biology",
    title: "Biologie",
    description: "Zellen, Genetik & Ökologie – entdecke die Naturwissenschaften.",
    icon: BookOpen,
    image: "https://images.unsplash.com/photo-1559757148-5c350707e15d?w=600&h=400&fit=crop",
    color: "from-green-500 to-emerald-600",
    features: ["Evolution", "Genetik", "Ökologie"],
  },
];

export default function SubjectsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-16 bg-[#0D1B2A] text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Wir bieten Nachhilfe in allen relevanten Schulfächern – individuell, strukturisiert und mit echten Erfolgen.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Subjects Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subjects.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-0 h-full overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    {/* Image */}
                    <div className="h-48 relative overflow-hidden">
                      <img
                        src={subject.image}
                        alt={subject.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/80 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-lg`}>
                          <subject.icon className="w-7 h-7 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-7">
                      <h3 className="text-2xl font-bold text-[#0D1B2A] mb-3">{subject.title}</h3>
                      <p className="text-gray-600 mb-6">{subject.description}</p>
                      
                      <ul className="space-y-2 mb-8">
                        {subject.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button variant="dark" size="md" className="w-full">
                        Mehr erfahren <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-white">
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
              <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A] mb-4">
                Dein Vorteil mit uns
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: BookOpen, title: "Premium Materialien", desc: "Zugang zu exklusiven Lernressourcen" },
                { icon: Users, title: "Top Dozenten", desc: "Erfahrene und motivierte Lehrer" },
                { icon: TrendingUp, title: "Erfolgsgarantie", desc: "Messbare Fortschritte im Lernprozess" },
                { icon: Clock, title: "Flexible Zeiten", desc: "Lernen wann und wo du willst" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 text-center hover:border-[#D4AF37]/30">
                    <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-5">
                      <item.icon className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                    <h3 className="font-bold text-[#0D1B2A] text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-14 bg-[#0D1B2A] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-5">
                Bereit, deine Noten zu verbessern?
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Buche jetzt dein kostenloses Erstgespräch und los geht's!
              </p>
              <Button variant="gold" size="xl">
                Kostenloses Erstgespräch buchen <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

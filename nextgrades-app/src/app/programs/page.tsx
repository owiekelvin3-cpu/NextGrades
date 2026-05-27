
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Users, User, Zap, TrendingUp, Clock, Calendar, BookOpen, CheckCircle2, ArrowRight, Video } from "lucide-react";

export default function ProgramsPage() {
  const programs = [
    {
      icon: User,
      title: "1:1 Premium-Nachhilfe",
      description: "Individuelle Betreuung für maximale Erfolge",
      features: [
        "Persönlicher Tutor",
        "Flexible Terminvereinbarung",
        "Maßgeschneiderte Lernpläne",
        "Direkter Feedback-Loop",
        "Eltern-Reports",
      ],
      color: "blue",
    },
    {
      icon: Users,
      title: "Kleine Lerngruppen",
      description: "Gemeinsam lernen und motivieren",
      features: [
        "Max 5 Schüler:innen pro Gruppe",
        "Interaktiver Unterricht",
        "Teamspirit & Motivation",
        "Kostengünstiger als 1:1",
        "Wöchentliche Sessions",
      ],
      color: "green",
    },
    {
      icon: Zap,
      title: "Matura Excellence Program",
      description: "Intensive Vorbereitung für die Matura",
      features: [
        "Vollständiger Stoffüberblick",
        "Prüfungstechniken-Training",
        "Matura-Simulationen",
        "Zusammenfassungen & Übungen",
        "Crashkurse vor Prüfungen",
      ],
      color: "orange",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24">
        {/* Hero Section */}
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Badge variant="gold" className="mb-4">
                📚 Unsere Programme
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-deep-navy mb-6">
                Wähle das Programm, das zu dir passt
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Von individueller 1:1-Nachhilfe bis zu intensiven Matura-Vorbereitungskursen -
                wir haben das passende Programm für deinen Lernerfolg.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Programs Grid */}
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {programs.map((program, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-8 h-full flex flex-col hover:border-soft-gold/30 group">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${
                      program.color === "blue" ? "bg-blue-100" :
                      program.color === "green" ? "bg-green-100" : "bg-orange-100"
                    }`}>
                      <program.icon className={`w-8 h-8 ${
                        program.color === "blue" ? "text-blue-600" :
                        program.color === "green" ? "text-green-600" : "text-orange-600"
                      }`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-deep-navy mb-3">
                      {program.title}
                    </h3>
                    <p className="text-gray-600 mb-8">
                      {program.description}
                    </p>
                    
                    <div className="flex-1 mb-8">
                      <ul className="space-y-3">
                        {program.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-soft-gold flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Link href="/consultation">
                      <Button variant="gold" size="xl" className="w-full">
                        Mehr erfahren <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-deep-navy mb-4">
                Was alle Programme beinhalten
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Video, title: "Zoom-Unterricht", desc: "Live-Unterricht mit deinem Tutor" },
                { icon: BookOpen, title: "Premium-Materialien", desc: "Zugang zu allen Lernressourcen" },
                { icon: TrendingUp, title: "Fortschrittsverfolgung", desc: "Detaillierte Analysen deines Lernens" },
                { icon: Calendar, title: "Flexible Termine", desc: "Termine, die zu dir passen" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-soft-gold/20 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-6 h-6 text-soft-gold" />
                    </div>
                    <h3 className="font-semibold text-deep-navy mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 gradient-navy text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Bereit, mit deinem Lernprogramm zu starten?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Buche ein kostenloses Erstgespräch und wir finden das perfekte Programm für dich!
              </p>
              <Link href="/consultation">
                <Button variant="gold" size="xl">
                  Kostenloses Erstgespräch buchen <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

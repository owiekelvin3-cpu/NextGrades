"use client";

import { motion } from "framer-motion";
import { Target, BookOpen, Star, Users, GraduationCap, TrendingUp, Heart, Calendar, ChevronRight, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  const principles = [
    {
      icon: Users,
      title: "Individuelle Betreuung",
      description: "Wir nehmen uns Zeit für jeden einzelnen und geben Feedback, das wirklich weiterhilft."
    },
    {
      icon: GraduationCap,
      title: "Hochqualifizierte Lehrer:innen",
      description: "Unser Team besteht aus engagierten und erfahrenen Pädagogen und echten Lernbegeisterten."
    },
    {
      icon: BookOpen,
      title: "Moderne Lernmethoden",
      description: "Wir kombinieren bewährte Methoden mit modernen Tools für das beste Lernerlebnis."
    },
    {
      icon: TrendingUp,
      title: "Ergebnisse, die zählen",
      description: "Unser Fokus liegt auf echten Fortschritten und besseren Noten."
    },
    {
      icon: Heart,
      title: "Motivation & Vertrauen",
      description: "Wir schaffen eine positive Lernatmosphäre, in der du dich wohlfühlst."
    }
  ];

  const team = [
    { name: "Adrian H.", role: "Gründer & CEO", bio: "Lernwissenschaft & Bildung", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face" },
    { name: "Lea Maria", role: "Lernin Pädagogik", bio: "Expertin für Lernmethoden", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face" },
    { name: "David K.", role: "Leitung Online-Nachhilfe", bio: "Digitales Lernen & EdTech", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face" },
    { name: "Julia W.", role: "Lernmaterial & Inhalte", bio: "Wissenschaftliche Fachbereiche", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face" },
    { name: "Michael T.", role: "Technology & Platform", bio: "Sorgt für die beste digitale Erfahrung", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face" }
  ];

  const milestones = [
    { year: "2021", title: "Die Idee", description: "Die Vision von NextGrades wird geboren." },
    { year: "2022", title: "Erste Schritte", description: "Erste Schüler:innen und erste Erfolge." },
    { year: "2023", title: "Erste Schülersonnen", description: "Die Community wächst." },
    { year: "2024", title: "Wachstum", description: "Meine Schüler:innen, mehr Programme, mehr Möglichkeiten." },
    { year: "2025", title: "Unsere Vision", description: "Die Zukunft des Lernens wird Realität." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[var(--background)] via-gray-50/50 dark:via-[#112240]/30 to-[var(--background)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 rounded-full text-[#D4AF37] text-sm font-semibold">
                  <span>ÜBER NEXTGRADES</span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--foreground)] leading-[1.1] tracking-tight">
                  Mehr als Nachhilfe.
                  <br />
                  <span className="text-[#D4AF37]">Eine neue Vision</span> für Bildung.
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                  Wir haben uns die Aufgabe gemacht, um Schüler:innen eine moderne, strukturierte und motivierende Lernumgebung zu bieten – online, flexibel und auf höchstem Niveau.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                  <div className="p-6 rounded-2xl bg-[var(--card-background)] border border-[var(--card-border)] shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="w-12 h-12 bg-[#0D1B2A] dark:bg-[#112240] rounded-full flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div className="text-base font-semibold text-[var(--foreground)] mb-1">Unsere Mission</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Schüler:innen helfen, ihr volles Potenzial zu entfalten.</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-[var(--card-background)] border border-[var(--card-border)] shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="w-12 h-12 bg-[#0D1B2A] dark:bg-[#112240] rounded-full flex items-center justify-center mb-4">
                      <BookOpen className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div className="text-base font-semibold text-[var(--foreground)] mb-1">Unsere Vision</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Die Bildung von morgen, in deutschsprachigen Räumen.</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-[var(--card-background)] border border-[var(--card-border)] shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="w-12 h-12 bg-[#0D1B2A] dark:bg-[#112240] rounded-full flex items-center justify-center mb-4">
                      <Star className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div className="text-base font-semibold text-[var(--foreground)] mb-1">Unsere Werte</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Qualität, Vertrauen, Motivation und kontinuierliche Weiterentwicklung.</div>
                  </div>
                </div>

                <div className="pt-6 flex flex-wrap gap-4">
                  <Link href="/programs" className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0D1B2A] px-8 py-4 rounded-xl font-semibold hover:bg-[#e6c048] transition-all duration-300 shadow-lg hover:shadow-[#D4AF37]/30">
                    Unsere Programme entdecken
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-[var(--foreground)] text-[var(--foreground)] px-8 py-4 rounded-xl font-semibold hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all duration-300">
                    Kontakt aufnehmen
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <div className="aspect-[4/5] relative">
                    <Image
                      src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=1000&fit=crop"
                      alt="Students studying together"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/80 via-transparent to-transparent" />
                  </div>
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <div className="text-3xl font-bold mb-2">„Lernen sollte nicht stressig sein, sondern klar, strukturiert und motivierend.“</div>
                    <div className="text-[#D4AF37] font-semibold">– Das ist NextGrades.</div>
                  </div>
                </div>
                
                {/* Floating card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="absolute -bottom-8 -left-8 bg-[var(--card-background)] p-6 rounded-2xl border border-[var(--card-border)] shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#D4AF37] rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-[#0D1B2A]" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[var(--foreground)]">500+</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">zufriedene Schüler:innen</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Unsere Geschichte Section */}
        <section className="py-24 bg-[var(--background)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="order-2 lg:order-1"
              >
                <div className="relative">
                  <div className="rounded-3xl overflow-hidden shadow-2xl">
                    <div className="aspect-[4/3] relative">
                      <Image
                        src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop"
                        alt="NextGrades story"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-[#D4AF37] text-[#0D1B2A] p-8 rounded-2xl shadow-2xl">
                    <div className="text-4xl font-bold">5+</div>
                    <div className="text-sm font-semibold">Jahre Erfahrung</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="order-1 lg:order-2 space-y-6"
              >
                <div className="text-sm text-[#D4AF37] font-semibold uppercase tracking-wider">Unsere Geschichte</div>
                <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] leading-tight">Wie alles begann</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  NextGrades wurde aus der eigenen Erfahrung heraus gegründet. Wir haben gesehen, wie viele Schüler:innen trotz schulischer Noten nicht wirklich intelligent sind, studieren und Stress haben. Wie wichtig es ist, mit der richtigen Unterstützung geholfen hat.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Unsere Lösung: Eine moderne Lernplattform, die Nachhilfe, gezieltes Lernmaterialien und private Lerntutoren kombiniert – für echte Ergebnisse.
                </p>
                <div className="pt-4">
                  <Link href="/programs" className="inline-flex items-center gap-2 text-[var(--foreground)] font-semibold hover:text-[#D4AF37] transition-colors">
                    Mehr über unsere Geschichte
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Prinzipien Section */}
        <section className="py-24 bg-gray-50 dark:bg-[#112240]/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="text-sm text-[#D4AF37] font-semibold uppercase tracking-wider mb-4">Warum NextGrades?</div>
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-4">Unsere Prinzipien für deinen Erfolg</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Fünf Kernwerte, die alles, was wir tun, leiten.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {principles.map((principle, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-[var(--card-background)] border border-[var(--card-border)] rounded-3xl p-8 text-center hover:shadow-xl hover:border-[#D4AF37]/30 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <principle.icon className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--card-foreground)] mb-3">{principle.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{principle.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24 bg-[var(--background)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="text-sm text-[#D4AF37] font-semibold uppercase tracking-wider mb-4">Unser Team</div>
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-4">Die Menschen hinter NextGrades</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Ein Team aus leidenschaftlichen Lehrer:innen, Lernexpert:innen und Visionär:innen.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="text-center group"
                >
                  <div className="relative mb-6">
                    <div className="w-48 h-48 mx-auto rounded-3xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 border-4 border-transparent group-hover:border-[#D4AF37]">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">{member.name}</h3>
                  <p className="text-sm text-[#D4AF37] font-semibold mb-2">{member.role}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-24 bg-gray-50 dark:bg-[#112240]/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="text-sm text-[#D4AF37] font-semibold uppercase tracking-wider mb-4">Unser Weg</div>
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-4">Meilensteine</h2>
            </div>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#D4AF37] to-[#0D1B2A] rounded-full"></div>
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  className={`flex items-center mb-16 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-12' : 'text-left pl-12'}`}>
                    <div className="bg-[var(--card-background)] p-8 rounded-3xl border border-[var(--card-border)] shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="text-3xl font-bold text-[#D4AF37] mb-3">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">{milestone.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="w-2/12 flex justify-center z-10">
                    <div className="w-16 h-16 bg-[#0D1B2A] dark:bg-[#D4AF37] rounded-full flex items-center justify-center shadow-lg border-4 border-[var(--background)]">
                      <Calendar className="w-8 h-8 text-[#D4AF37] dark:text-[#0D1B2A]" />
                    </div>
                  </div>
                  <div className="w-5/12"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-[#0D1B2A]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center">
                    <GraduationCap className="w-10 h-10 text-[#D4AF37]" />
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Werde Teil der NextGrades Community</h2>
                <p className="text-xl text-gray-300 mb-8">Egal, ob du Schüler:in, Elternteil oder Lehrer:in bist – gemeinsam gestalten wir die Zukunft des Lernens.</p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/contact" className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0D1B2A] px-10 py-5 rounded-xl font-bold text-lg hover:bg-[#e6c048] transition-all duration-300 shadow-lg hover:shadow-[#D4AF37]/30">
                    Kostenloses Erstgespräch buchen
                    <ArrowRight className="w-6 h-6" />
                  </Link>
                </div>
              </div>
              <div className="lg:text-right">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                    <CheckCircle2 className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
                    <div className="text-white font-semibold">Unverbindlich</div>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                    <CheckCircle2 className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
                    <div className="text-white font-semibold">Kostenlos</div>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                    <CheckCircle2 className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
                    <div className="text-white font-semibold">Individuelle Beratung</div>
                  </div>
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

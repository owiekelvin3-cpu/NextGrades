
"use client";

import { motion } from "framer-motion";
import { Target, BookOpen, Star, Users, GraduationCap, TrendingUp, Heart, Calendar, ChevronRight, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 bg-[var(--background)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Startseite <ChevronRight className="inline w-4 h-4 mx-1" /> Über uns
            </div>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="text-sm text-[#D4AF37] font-semibold mb-3">ÜBER NEXTGRADES</div>
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6 leading-tight">
                  Mehr als Nachhilfe.
                  <br />
                  Eine neue Vision für Bildung.
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
                  Wir haben uns die Aufgabe gemacht, um Schüler:innen eine moderne, strukturierte und motivierende Lernumgebung zu bieten – online, flexibel und auf höchstem Niveau.
                </p>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#0D1B2A] dark:bg-[#112240] rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div className="text-sm font-semibold text-[var(--foreground)]">Unsere Mission</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Schüler:innen helfen, ihr volles Potenzial zu entfalten.</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#0D1B2A] dark:bg-[#112240] rounded-full flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div className="text-sm font-semibold text-[var(--foreground)]">Unsere Vision</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Die Bildung von morgen, in deutschsprachigen Räumen.</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#0D1B2A] dark:bg-[#112240] rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div className="text-sm font-semibold text-[var(--foreground)]">Unsere Werte</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Qualität, Vertrauen, Motivation und kontinuierliche Weiterentwicklung.</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
                    alt="Students studying together"
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute bottom-6 left-6 bg-[#0D1B2A] text-white p-5 rounded-xl max-w-xs">
                  <p className="text-sm italic">„Lernen sollte nicht stressig sein, sondern klar, strukturiert und motivierend.“</p>
                  <p className="text-xs mt-2 text-[#D4AF37]">– Das ist NextGrades.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Unsere Geschichte Section */}
        <section className="py-20 bg-gray-50 dark:bg-[#112240]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="text-sm text-[#D4AF37] font-semibold mb-3">UNSERE GESCHICHTE</div>
                <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6">Wie alles begann</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  NextGrades wurde aus der eigenen Erfahrung heraus gegründet.
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Wir haben gesehen, wie viele Schüler:innen trotz schulischer Noten nicht wirklich intelligent sind, studieren und Stress haben. Wie wichtig es ist, mit der richtigen Unterstützung geholfen hat.
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Unsere Lösung: Eine moderne Lernplattform, die Nachhilfe, gezieltes Lernmaterialen und private Lerntutoren kombiniert – für echte Ergebnisse.
                </p>
                <button className="flex items-center gap-2 bg-[#0D1B2A] dark:bg-[#112240] text-white px-6 py-3 rounded-lg hover:bg-[#1a2d42] transition">
                  Mehr über unsere Geschichte
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=600&fit=crop"
                    alt="NextGrades story"
                    className="w-full h-auto"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Prinzipien Section */}
        <section className="py-20 bg-[var(--background)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="text-sm text-[#D4AF37] font-semibold mb-3">WARUM NEXTGRADES?</div>
              <h2 className="text-3xl font-bold text-[var(--foreground)]">Unsere Prinzipien für deinen Erfolg</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {principles.map((principle, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[var(--card-background)] border border-[var(--card-border)] rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 bg-[#FFF8E7] dark:bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                    <principle.icon className="w-7 h-7 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-3">{principle.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{principle.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-gray-50 dark:bg-[#112240]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="text-sm text-[#D4AF37] font-semibold mb-3">UNSER TEAM</div>
              <h2 className="text-3xl font-bold text-[var(--foreground)]">Die Menschen hinter NextGrades</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-3">Ein Team aus leidenschaftlichen Lehrer:innen, Lernexpert:innen und Visionär:innen.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">{member.name}</h3>
                  <p className="text-sm text-[#D4AF37] font-medium">{member.role}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{member.bio}</p>
                  <div className="flex justify-center gap-3 mt-4">
                    <a href="#" className="text-gray-400 hover:text-[#D4AF37]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-[#D4AF37]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-[var(--background)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="text-sm text-[#D4AF37] font-semibold mb-3">UNSER WEG</div>
              <h2 className="text-3xl font-bold text-[var(--foreground)]">Meilensteine</h2>
            </div>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-12' : 'text-left pl-12'}`}>
                    <div className="text-2xl font-bold text-[#D4AF37] mb-2">{milestone.year}</div>
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{milestone.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{milestone.description}</p>
                  </div>
                  <div className="w-2/12 flex justify-center">
                    <div className="w-12 h-12 bg-[#0D1B2A] dark:bg-[#112240] rounded-full flex items-center justify-center z-10">
                      <Calendar className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                  </div>
                  <div className="w-5/12"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-[#0D1B2A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Werde Teil der NextGrades Community</h2>
                    <p className="text-gray-300 text-sm mt-1">Egal, ob du Schüler:in, Elternteil oder Lehrer:in bist – gemeinsam gestalten wir die Zukunft des Lernens.</p>
                  </div>
                </div>
              </div>
              <div className="lg:text-right">
                <button className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0D1B2A] px-8 py-4 rounded-lg font-semibold hover:bg-[#e6c048] transition">
                  Kostenloses Erstgespräch buchen
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex items-center justify-end gap-6 mt-4 text-xs text-gray-400">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Unverbindlich
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Kostenlos
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Individuelle Beratung
                  </span>
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

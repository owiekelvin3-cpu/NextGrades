"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Target, BookOpen, Star, Users, GraduationCap, TrendingUp, Heart, Calendar, ChevronRight, ArrowRight, CheckCircle2, Lightbulb, Rocket, Globe, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function AboutPage() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videos = [
    "/about-videos/268230_tiny.mp4",
    "/about-videos/91744-636709154_small.mp4",
    "/about-videos/27091-361827476_medium.mp4",
    "/about-videos/137186-765701394_medium.mp4"
  ];

  const handleVideoEnd = () => {
    const nextIndex = (currentVideoIndex + 1) % videos.length;
    setCurrentVideoIndex(nextIndex);
  };

  const team = [
    { name: "Adrian H.", role: "Gründer & CEO", bio: "Lernwissenschaft & Bildung", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face" },
    { name: "Lea Maria", role: "Lernin Pädagogik", bio: "Expertin für Lernmethoden", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face" },
    { name: "David K.", role: "Leitung Online-Nachhilfe", bio: "Digitales Lernen & EdTech", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face" },
    { name: "Julia W.", role: "Lernmaterial & Inhalte", bio: "Wissenschaftliche Fachbereiche", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face" },
    { name: "Michael T.", role: "Technology & Platform", bio: "Sorgt für die beste digitale Erfahrung", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face" }
  ];

  const storySections = [
    {
      year: "2021",
      title: "Die Idee",
      description: "Die Vision von NextGrades wird geboren. Wir haben gesehen, wie viele Schüler:innen trotz schulischer Noten nicht wirklich intelligent sind, studieren und Stress haben.",
      icon: Lightbulb,
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop",
      align: "left"
    },
    {
      year: "2022",
      title: "Erste Schritte",
      description: "Erste Schüler:innen und erste Erfolge. Wir kombinieren bewährte Methoden mit modernen Tools für das beste Lernerlebnis.",
      icon: Zap,
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop",
      align: "right"
    },
    {
      year: "2023",
      title: "Erste Schülersonnen",
      description: "Die Community wächst. Wir schaffen eine positive Lernatmosphäre, in der du dich wohlfühlst und dein volles Potenzial entfalten kannst.",
      icon: Rocket,
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop",
      align: "left"
    },
    {
      year: "2024",
      title: "Wachstum",
      description: "Meine Schüler:innen, mehr Programme, mehr Möglichkeiten. Unser Fokus liegt auf echten Fortschritten und besseren Noten.",
      icon: Globe,
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop",
      align: "right"
    },
    {
      year: "2025",
      title: "Unsere Vision",
      description: "Die Zukunft des Lernens wird Realität. Wir bieten eine moderne, strukturierte und motivierende Lernumgebung – online, flexibel und auf höchstem Niveau.",
      icon: Star,
      image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&h=400&fit=crop",
      align: "left"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0D1B2A] to-[#1a2f42] text-white">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
            <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="var(--background)"/>
            </svg>
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-32">
            <div className="text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-[#D4AF37] text-sm font-semibold mb-8">
                  <span>ÜBER NEXTGRADES</span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                  About Us
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Discover NextGrades - <span className="text-[#D4AF37] font-semibold">Where Innovation Meets Education</span>
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-12"
              >
                <div className="rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto border-4 border-white/10 relative">
                  <div className="aspect-[16/9] relative bg-black">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentVideoIndex}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0"
                      >
                        <video
                          src={videos[currentVideoIndex]}
                          autoPlay
                          muted
                          playsInline
                          loop={false}
                          onEnded={handleVideoEnd}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-20 bg-[var(--background)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-sm text-[#D4AF37] font-semibold uppercase tracking-wider mb-4">NextGrades Story</div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-6">
                The NextGrades Journey Story
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
                Transforming spaces with innovative designs. Explore our story of craftsmanship and dedication, creating education that inspires and enhances modern learning.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story Journey Timeline */}
        <section className="py-16 bg-[var(--background)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {storySections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: section.align === "left" ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`mb-16 flex items-center gap-8 ${section.align === "right" ? "flex-row-reverse" : ""}`}
              >
                {/* Image Side */}
                <div className="flex-1">
                  <div className="relative">
                    {/* Oval frame */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] to-[#1a405a] rounded-[60%] p-2">
                        <div className="w-full h-full bg-[var(--background)] rounded-[58%] overflow-hidden">
                          <div className="aspect-[4/3] relative">
                            <Image
                              src={section.image}
                              alt={section.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="relative bg-gradient-to-br from-[#0D1B2A] to-[#1a405a] rounded-[60%] p-1.5">
                        <div className="w-full h-full bg-[var(--background)] rounded-[58%] overflow-hidden">
                          <div className="aspect-[4/3] relative">
                            <Image
                              src={section.image}
                              alt={section.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-1">
                  <div className={`space-y-4 ${section.align === "right" ? "text-right" : ""}`}>
                    <div className={`flex items-center gap-3 ${section.align === "right" ? "justify-end" : "justify-start"}`}>
                      <div className="w-12 h-12 bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center">
                        <section.icon className="w-6 h-6 text-[#D4AF37]" />
                      </div>
                    </div>
                    <div className="text-sm text-[#D4AF37] font-semibold">{section.year}</div>
                    <h3 className="text-2xl font-bold text-[var(--foreground)]">{section.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{section.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-full"></div>
        </div>

        {/* Team Section */}
        <section className="py-20 bg-[var(--background)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">Our Awesome Team</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
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
                    <div className="rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 border-2 border-transparent group-hover:border-[#D4AF37] bg-gray-100 dark:bg-[#112240]">
                      <div className="aspect-[3/4] relative">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0D1B2A] text-white py-3 px-4 rounded-b-xl -mt-2 relative z-10">
                    <h3 className="font-bold text-lg">{member.name}</h3>
                  </div>
                  <p className="text-sm text-[#D4AF37] font-semibold mt-2">{member.role}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#0D1B2A]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Werde Teil der NextGrades Community
              </h2>
              <p className="text-xl text-gray-300 mb-10">
                Egal, ob du Schüler:in, Elternteil oder Lehrer:in bist – gemeinsam gestalten wir die Zukunft des Lernens.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0D1B2A] px-10 py-5 rounded-xl font-bold text-lg hover:bg-[#e6c048] transition-all duration-300 shadow-lg hover:shadow-[#D4AF37]/30">
                  Kostenloses Erstgespräch buchen
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-8 mt-10">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-6 h-6 text-[#D4AF37]" />
                  <span className="font-semibold">Unverbindlich</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-6 h-6 text-[#D4AF37]" />
                  <span className="font-semibold">Kostenlos</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-6 h-6 text-[#D4AF37]" />
                  <span className="font-semibold">Individuelle Beratung</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

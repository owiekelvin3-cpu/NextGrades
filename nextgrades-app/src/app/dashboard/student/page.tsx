
"use client";

import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Calendar,
  Clock,
  BookOpen,
  Video,
  FileText,
  TrendingUp,
  Zap,
  ArrowRight
} from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar role="student" />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#0D1B2A]">Willkommen zurück! 👋</h1>
              <p className="text-gray-600 mt-1">Hier ist dein Lern-Überblick für heute</p>
            </div>
            <Button variant="gold" size="md">
              <Zap className="w-5 h-5 mr-2" />
              KI-Quiz starten
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#4DA3FF]/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#4DA3FF]" />
                  </div>
                  <Badge variant="gold">Heute</Badge>
                </div>
                <p className="text-3xl font-bold text-[#0D1B2A] mb-1">—</p>
                <p className="text-gray-600">Kommende Termine</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#22C55E]" />
                  </div>
                  <Badge variant="success">Verfügbar</Badge>
                </div>
                <p className="text-3xl font-bold text-[#0D1B2A] mb-1">—</p>
                <p className="text-gray-600">Einheiten übrig</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#0D1B2A] mb-1">—</p>
                <p className="text-gray-600">Lernfortschritt</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-[#F97316]" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#0D1B2A] mb-1">—</p>
                <p className="text-gray-600">Aufgaben offen</p>
              </Card>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upcoming Lessons */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#0D1B2A]">Kommende Termine</h2>
                  <Button variant="secondary" size="sm">
                    Alle anzeigen <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-gray-100 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold">
                          —
                        </div>
                        <div>
                          <p className="font-semibold text-[#0D1B2A]">Keine Termine geplant</p>
                          <p className="text-sm text-gray-500">Du kannst Termine bei deinem:e Lehrer:in buchen</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card className="p-6">
                <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">Schnellzugriff</h2>

                <div className="space-y-4">
                  <Button variant="outline" size="md" className="w-full justify-start">
                    <FileText className="w-5 h-5 mr-3" />
                    Lernmaterialien
                  </Button>
                  <Button variant="outline" size="md" className="w-full justify-start">
                    <Video className="w-5 h-5 mr-3" />
                    Videos
                  </Button>
                  <Button variant="outline" size="md" className="w-full justify-start">
                    <BookOpen className="w-5 h-5 mr-3" />
                    Meine Kurse
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Courses */}
          <div className="mt-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#0D1B2A]">Meine Kurse</h2>
                <Button variant="secondary" size="sm">
                  Alle Kurse <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl border border-gray-100 bg-white">
                  <h3 className="font-semibold text-[#0D1B2A] mb-3">Keine Kurse freigeschaltet</h3>
                  <p className="text-sm text-gray-500 mb-4">Wähle ein Programm und buche deine ersten Stunden</p>
                  <Button variant="gold" size="md">
                    Programme ansehen
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}


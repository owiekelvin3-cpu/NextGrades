
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
  Flame,
  ArrowRight,
  CheckCircle2,
  Lock,
  Brain
} from "lucide-react";

export default function StudentDashboard() {
  const upcomingLessons = [
    { subject: "Mathematik", time: "Heute, 16:00 - 17:00", teacher: "Herr Müller" },
    { subject: "Englisch", time: "Morgen, 15:00 - 16:00", teacher: "Frau Schmidt" },
    { subject: "Physik", time: "Mittwoch, 14:00 - 15:00", teacher: "Herr Weber" },
  ];

  const courses = [
    { name: "Mathematik - 1. Klasse", progress: 85, status: "Aktiv", unlocked: true },
    { name: "Englisch - 1. Klasse", progress: 72, status: "Aktiv", unlocked: true },
    { name: "Physik - 1. Klasse", progress: 0, status: "Gesperrt", unlocked: false },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-deep-navy">Willkommen zurück, Lisa! 👋</h1>
              <p className="text-gray-600 mt-1">Hier ist dein Lern-Überblick für heute</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="gold" size="md">
                <Zap className="w-5 h-5 mr-2" />
                KI-Quiz starten
              </Button>
              <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center text-deep-navy font-bold text-xl">
                LM
              </div>
            </div>
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
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <Badge variant="gold">Heute</Badge>
                </div>
                <p className="text-3xl font-bold text-deep-navy mb-1">3</p>
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
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <Badge variant="success">Verfügbar</Badge>
                </div>
                <p className="text-3xl font-bold text-deep-navy mb-1">12</p>
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
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-600" />
                  </div>
                  <Badge variant="warning">Streak</Badge>
                </div>
                <p className="text-3xl font-bold text-deep-navy mb-1">15</p>
                <p className="text-gray-600">Tage in Folge</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <Badge variant="success">Top</Badge>
                </div>
                <p className="text-3xl font-bold text-deep-navy mb-1">85%</p>
                <p className="text-gray-600">Durchschnittsfortschritt</p>
              </Card>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Lessons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-deep-navy">Kommende Termine</h2>
                    <Button variant="secondary" size="sm">
                      Alle anzeigen <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {upcomingLessons.map((lesson, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center flex-shrink-0">
                          <Video className="w-6 h-6 text-deep-navy" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-deep-navy">{lesson.subject}</p>
                          <p className="text-sm text-gray-500">{lesson.time} · {lesson.teacher}</p>
                        </div>
                        <Button variant="gold" size="sm">
                          Beitreten
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* My Courses */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-deep-navy">Meine Kurse</h2>
                    <Button variant="secondary" size="sm">
                      Alle Kurse <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {courses.map((course, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-deep-navy">{course.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant={course.unlocked ? "success" : "warning"}>
                                  {course.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {!course.unlocked && <Lock className="w-5 h-5 text-gray-400" />}
                        </div>
                        {course.unlocked && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Fortschritt</span>
                              <span className="text-sm font-semibold text-deep-navy">{course.progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full gradient-gold rounded-full transition-all duration-500"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>

            <div className="space-y-8">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-deep-navy mb-6">Schnellzugriff</h2>
                  <div className="space-y-3">
                    <Button variant="secondary" className="w-full justify-start" size="md">
                      <FileText className="w-5 h-5 mr-3" />
                      Materialien herunterladen
                    </Button>
                    <Button variant="secondary" className="w-full justify-start" size="md">
                      <Brain className="w-5 h-5 mr-3" />
                      KI-Quiz generieren
                    </Button>
                    <Button variant="secondary" className="w-full justify-start" size="md">
                      <Calendar className="w-5 h-5 mr-3" />
                      Termin buchen
                    </Button>
                  </div>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-deep-navy mb-6">Letzte Aktivitäten</h2>
                  <div className="space-y-4">
                    {[
                      { text: "Quiz abgeschlossen: Mathematik Kapitel 3", time: "Vor 2 Stunden", icon: CheckCircle2 },
                      { text: "Neues Material verfügbar: Englisch", time: "Vor 5 Stunden", icon: FileText },
                      { text: "Unterricht beendet: Physik", time: "Gestern", icon: Video },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <activity.icon className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-deep-navy">{activity.text}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

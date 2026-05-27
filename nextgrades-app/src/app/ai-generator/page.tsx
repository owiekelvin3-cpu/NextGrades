
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  FileUp,
  PlayCircle,
  Edit,
  Trash2,
  Plus
} from "lucide-react";

export default function AIGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerationComplete(true);
    }, 3000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0D1B2A]">KI-Quiz-Generator</h1>
            <p className="text-gray-600 mt-1">Generiere intelligente Quizze, MCQs und Flashcards mit KI</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Upload Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-8">
                  <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">1. Lade dein Material hoch</h2>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition-all cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4">
                      <UploadCloud className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                    <p className="font-semibold text-[#0D1B2A] mb-1">PDF, Notizen oder Zusammenfassungen hochladen</p>
                    <p className="text-gray-500 text-sm">Drag & Drop oder klicke zum Auswählen</p>
                    <Button variant="gold" className="mt-6">
                      <FileUp className="w-5 h-5 mr-2" /> Datei auswählen
                    </Button>
                  </div>
                </Card>
              </motion.div>

              {/* Settings Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="p-8">
                  <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">2. Einstellungen</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fach</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#0D1B2A] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]">
                        <option>Mathematik</option>
                        <option>Englisch</option>
                        <option>Deutsch</option>
                        <option>Physik</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Klasse</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#0D1B2A] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]">
                        <option>1. Klasse</option>
                        <option>2. Klasse</option>
                        <option>3. Klasse</option>
                        <option>4. Klasse</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-8">
                    <Button variant="gold" size="xl" className="w-full" onClick={handleGenerate} disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-[#0D1B2A] border-t-transparent rounded-full animate-spin mr-2" />
                          Quiz wird generiert...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" /> Quiz generieren
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="p-6">
                  <h3 className="font-semibold text-[#0D1B2A] mb-4">Schnellzugriff</h3>
                  <div className="space-y-3">
                    <Button variant="secondary" className="w-full justify-start" size="md">
                      <FileText className="w-5 h-5 mr-3" /> Flashcards generieren
                    </Button>
                    <Button variant="secondary" className="w-full justify-start" size="md">
                      <Sparkles className="w-5 h-5 mr-3" /> Zusammenfassung erstellen
                    </Button>
                    <Button variant="secondary" className="w-full justify-start" size="md">
                      <Sparkles className="w-5 h-5 mr-3" /> Übungen generieren
                    </Button>
                  </div>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="p-6 bg-blue-50 border border-blue-200">
                  <h3 className="font-semibold text-[#0D1B2A] mb-3">💡 Tipps</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      Lade klare, strukturierte PDFs hoch
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      Wähle den passenden Schwierigkeitsgrad
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      Überprüfe das generierte Quiz vor der Nutzung
                    </li>
                  </ul>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

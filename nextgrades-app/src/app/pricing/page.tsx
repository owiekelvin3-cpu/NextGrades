
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, X, ArrowRight } from "lucide-react";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Ressourcen-Mitgliedschaft",
      description: "Zugang zu allen Premium-Lernmaterialien",
      monthlyPrice: 29,
      yearlyPrice: 249,
      features: [
        "Alle Premium-Ressourcen",
        "Lernvideos",
        "Übungsblätter",
        "Zusammenfassungen",
        "Crashkurse",
      ],
      highlighted: false,
    },
    {
      name: "Gruppen-Nachhilfe",
      description: "Lerne in kleinen Gruppen mit anderen Schüler:innen",
      monthlyPrice: 99,
      yearlyPrice: 949,
      features: [
        "Alles aus Ressourcen-Mitgliedschaft",
        "Wöchentliche Gruppenstunden",
        "Max 5 Schüler:innen pro Gruppe",
        "Hausaufgabenbetreuung",
        "Fortschrittsverfolgung",
      ],
      highlighted: true,
    },
    {
      name: "1:1 Premium-Nachhilfe",
      description: "Individuelle Betreuung für maximale Erfolge",
      monthlyPrice: 249,
      yearlyPrice: 2399,
      features: [
        "Alles aus Gruppen-Nachhilfe",
        "Individuelle 1:1 Stunden",
        "Persönlicher Lernplan",
        "Flexible Terminvereinbarung",
        "Priority Support",
        "Eltern-Reports",
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge variant="gold" className="mb-4">
              💎 Premium-Pläne
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-deep-navy mb-6">
              Wähle deinen perfekten Plan
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Egal, ob du nur Ressourcen brauchst oder volle 1:1 Betreuung -
              wir haben den passenden Plan für dich.
            </p>
            
            <div className="inline-flex items-center gap-4 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  !isYearly ? "bg-deep-navy text-white" : "text-gray-600"
                }`}
              >
                Monatlich
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  isYearly ? "bg-soft-gold text-deep-navy" : "text-gray-600"
                }`}
              >
                Jährlich <span className="text-sm ml-2">(2 Monate kostenlos)</span>
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`p-8 h-full flex flex-col relative overflow-hidden ${
                    plan.highlighted ? "border-2 border-soft-gold shadow-xl scale-105 z-10" : ""
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 right-0">
                      <Badge variant="gold" className="rounded-tl-none rounded-tr-xl rounded-bl-xl">
                        Beliebt
                      </Badge>
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-deep-navy mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-deep-navy">
                        €{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-gray-500">
                        /{isYearly ? "Jahr" : "Monat"}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 mb-8">
                    <ul className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-soft-gold flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href="/consultation">
                    <Button
                      variant={plan.highlighted ? "gold" : "primary"}
                      size="xl"
                      className="w-full"
                    >
                      Jetzt starten <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center"
          >
            <Card className="p-8 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-deep-navy mb-4">
                Nicht sicher, welcher Plan der richtige ist?
              </h2>
              <p className="text-gray-600 mb-6">
                Buche ein kostenloses Erstgespräch und wir finden gemeinsam die perfekte Lösung für dich!
              </p>
              <Link href="/consultation">
                <Button variant="gold" size="xl">
                  Kostenloses Erstgespräch buchen <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

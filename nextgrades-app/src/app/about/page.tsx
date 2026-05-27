
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4 text-deep-navy">Über Uns</h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Wir glauben, dass Bildung moderner, smarter und motivierender sein sollte
          </p>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-deep-navy mb-4">Unsere Vision</h2>
            <p className="text-gray-700 mb-6">
              NextGrades soll Schüler:innen dabei helfen, bessere Ergebnisse zu erreichen, selbstbewusster zu lernen,
              strukturierter zu arbeiten, effizienter zu lernen und ihr volles Potenzial auszuschöpfen.
            </p>
            
            <h2 className="text-2xl font-bold text-deep-navy mb-4">Was uns ausmacht</h2>
            <ul className="space-y-2 mb-6">
              <li>✅ Mehr als klassische Nachhilfe</li>
              <li>✅ Moderne Lernplattform</li>
              <li>✅ Premium Betreuung</li>
              <li>✅ Kleine Lerngruppen</li>
              <li>✅ Strukturierte Lernsysteme</li>
              <li>✅ Hochwertige Materialien</li>
              <li>✅ Fokus auf echte Ergebnisse</li>
              <li>✅ Zukunftsorientiertes Lernen</li>
              <li>✅ Online & flexibel</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-deep-navy mb-4">Unser Ziel</h2>
            <p className="text-gray-700">
              Es ist uns ein Anliegen, die neue Generation des Lernens aufzubauen.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

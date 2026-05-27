
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CareersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4 text-deep-navy">Karriere</h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Werde Teil unseres Teams!
          </p>
          
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-2 text-deep-navy">Tutor:in Mathematik</h2>
              <p className="text-gray-600 mb-4">Wir suchen engagierte Tutor:innen für Mathematik.</p>
              <button className="px-4 py-2 bg-soft-gold text-deep-navy rounded-lg hover:bg-yellow-500 transition-colors font-medium">
                Jetzt bewerben
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-2 text-deep-navy">Tutor:in Englisch</h2>
              <p className="text-gray-600 mb-4">Wir suchen engagierte Tutor:innen für Englisch.</p>
              <button className="px-4 py-2 bg-soft-gold text-deep-navy rounded-lg hover:bg-yellow-500 transition-colors font-medium">
                Jetzt bewerben
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

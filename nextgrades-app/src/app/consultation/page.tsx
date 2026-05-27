
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ConsultationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4 text-deep-navy">Kostenloses Erstgespräch</h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Lerne uns kennen und finde heraus, wie wir dir helfen können!
          </p>
          
          <div className="bg-deep-navy text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Buche dein kostenloses Erstgespräch</h2>
            <p className="text-gray-300 mb-8">
              Nutze Calendly, um einen Termin zu buchen, der zu dir passt.
            </p>
            <button className="px-8 py-4 bg-soft-gold text-deep-navy rounded-lg hover:bg-yellow-500 transition-colors font-bold text-lg">
              Jetzt Termin buchen
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

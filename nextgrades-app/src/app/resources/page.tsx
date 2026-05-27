
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4 text-deep-navy">Lernressourcen</h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Kostenlose und Premium-Materialien für deinen Lernerfolg
          </p>
          
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-deep-navy">Kostenlose Ressourcen</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["Übungsblätter", "Zusammenfassungen", "Mini-Kurse"].map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6 hover:border-soft-gold hover:shadow-lg transition-all">
                  <h3 className="text-xl font-bold mb-2 text-deep-navy">{item}</h3>
                  <p className="text-gray-600">Kostenlos verfügbar für alle</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-8 text-deep-navy">Premium Ressourcen</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["Lernvideos", "Matura-Kurse", "Crashkurse", "Study Guides"].map((item, index) => (
                <div key={index} className="border border-soft-gold rounded-xl p-6 bg-yellow-50 hover:shadow-lg transition-all">
                  <h3 className="text-xl font-bold mb-2 text-deep-navy">{item}</h3>
                  <p className="text-gray-600">Nur für Premium-Mitglieder verfügbar</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

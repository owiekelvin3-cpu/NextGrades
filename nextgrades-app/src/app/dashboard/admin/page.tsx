
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8 text-deep-navy">Admin Panel</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { title: "Schüler:innen", value: "45" },
              { title: "Lehrer:innen", value: "12" },
              { title: "Aktive Kurse", value: "32" },
              { title: "Gesamt-Einnahmen", value: "€12,450" }
            ].map((stat, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-gray-600 mb-2">{stat.title}</h3>
                <p className="text-3xl font-bold text-deep-navy">{stat.value}</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-deep-navy">Schnellzugriff</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="py-3 border border-gray-300 rounded-lg hover:border-soft-gold transition-colors">
                  Schüler:innen verwalten
                </button>
                <button className="py-3 border border-gray-300 rounded-lg hover:border-soft-gold transition-colors">
                  Lehrer:innen verwalten
                </button>
                <button className="py-3 border border-gray-300 rounded-lg hover:border-soft-gold transition-colors">
                  Zahlungen verwalten
                </button>
                <button className="py-3 border border-gray-300 rounded-lg hover:border-soft-gold transition-colors">
                  Ressourcen verwalten
                </button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-deep-navy">Letzte Aktivitäten</h2>
              <ul className="space-y-3">
                <li className="py-2 border-b border-gray-100">
                  <p className="font-medium text-deep-navy">Neue Anmeldung: Lisa M.</p>
                  <p className="text-sm text-gray-600">Vor 2 Stunden</p>
                </li>
                <li className="py-2 border-b border-gray-100">
                  <p className="font-medium text-deep-navy">Zahlung erhalten: €180</p>
                  <p className="text-sm text-gray-600">Vor 5 Stunden</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8 text-deep-navy">Lehrer:innen Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { title: "Zugewiesene Schüler:innen", value: "8" },
              { title: "Kommende Termine", value: "15" },
              { title: "Abgeschlossene Stunden", value: "120" },
              { title: "Einnahmen", value: "€2,160" }
            ].map((stat, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-gray-600 mb-2">{stat.title}</h3>
                <p className="text-3xl font-bold text-deep-navy">{stat.value}</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-deep-navy">Meine Schüler:innen</h2>
              <ul className="space-y-3">
                <li className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span>Max Mustermann</span>
                  <span className="text-gray-600">Mathematik</span>
                </li>
                <li className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span>Anna Schmidt</span>
                  <span className="text-gray-600">Englisch</span>
                </li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-deep-navy">Kommende Termine</h2>
              <ul className="space-y-3">
                <li className="py-2 border-b border-gray-100">
                  <p className="font-medium text-deep-navy">Max Mustermann - Mathematik</p>
                  <p className="text-sm text-gray-600">Morgen, 16:00 - 17:00</p>
                </li>
                <li className="py-2 border-b border-gray-100">
                  <p className="font-medium text-deep-navy">Anna Schmidt - Englisch</p>
                  <p className="text-sm text-gray-600">Mittwoch, 15:00 - 16:00</p>
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

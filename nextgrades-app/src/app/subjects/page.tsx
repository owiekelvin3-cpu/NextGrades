
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const subjects = [
  "Mathematik",
  "Englisch",
  "Deutsch",
  "Physik",
  "Chemie",
  "Wirtschaft & BWL",
  "Informatik",
  "Technisches Zeichnen"
];

export default function SubjectsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4 text-deep-navy">Unsere Fächer</h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Professionelle Unterstützung in allen wichtigen Fächern
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {subjects.map((subject, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 text-center hover:border-soft-gold hover:shadow-lg transition-all">
                <h2 className="text-xl font-bold text-deep-navy">{subject}</h2>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4 text-deep-navy">Datenschutz</h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Informationen zum Datenschutz
          </p>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p>Hier finden Sie unsere Datenschutzbestimmungen.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

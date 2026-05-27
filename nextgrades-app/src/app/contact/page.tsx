
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4 text-deep-navy">Kontakt</h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Wir freuen uns auf deine Nachricht!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-deep-navy">Kontaktinformationen</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-deep-navy">E-Mail</h3>
                  <p className="text-gray-600">support@nextgrades.at</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-6 text-deep-navy">Kontaktformular</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                  <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nachricht</label>
                  <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2"></textarea>
                </div>
                <button type="submit" className="w-full py-3 bg-soft-gold text-deep-navy rounded-lg hover:bg-yellow-500 transition-colors font-bold">
                  Nachricht senden
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

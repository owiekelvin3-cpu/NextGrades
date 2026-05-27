
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4 text-deep-navy">Hilfe-Center</h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Hier findest du Antworten auf häufig gestellte Fragen
          </p>
          
          <div className="space-y-6">
            {[
              { question: "Wie funktioniert die Anmeldung?", answer: "Du kannst dich einfach über unsere Login-Seite anmelden oder registrieren." },
              { question: "Wie kann ich ein Programm buchen?", answer: "Kontaktiere uns oder buche ein kostenloses Erstgespräch, um mehr zu erfahren." },
              { question: "Welche Zahlungsmethoden gibt es?", answer: "Wir akzeptieren Kreditkarten, PayPal und Überweisungen über Stripe." }
            ].map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-2 text-deep-navy">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

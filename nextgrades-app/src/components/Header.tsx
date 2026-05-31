
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-deep-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-soft-gold">
            NextGrades
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/programs" className="hover:text-soft-gold transition-colors">
              Programme
            </Link>
            <Link href="/subjects" className="hover:text-soft-gold transition-colors">
              Fächer
            </Link>
            <Link href="/resources" className="hover:text-soft-gold transition-colors">
              Ressourcen
            </Link>
            <Link href="/about" className="hover:text-soft-gold transition-colors">
              Über Uns
            </Link>
            <Link href="/contact" className="hover:text-soft-gold transition-colors">
              Kontakt
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 border border-soft-gold text-soft-gold rounded-lg hover:bg-soft-gold hover:text-deep-navy transition-colors"
            >
              Login
            </Link>
            <Link
              href="/consultation"
              className="px-4 py-2 bg-soft-gold text-deep-navy rounded-lg hover:bg-yellow-500 transition-colors font-medium"
            >
              Kostenloses Erstgespräch
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

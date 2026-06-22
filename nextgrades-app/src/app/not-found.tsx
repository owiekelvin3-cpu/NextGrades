import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-var(--site-nav-height))] flex-col items-center justify-center bg-[#0D1B2A] px-4 py-16 text-center text-white">
      <BrandLogo size="lg" linked={false} onDarkBackground />
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">404</p>
      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">Seite nicht gefunden</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-on-navy-subtle">
        Die angeforderte Seite existiert nicht oder wurde verschoben. Kehre zur Startseite zurück oder
        nutze die Navigation.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="gold" size="md" href="/">
          Zur Startseite
        </Button>
        <Button variant="onDark" size="md" href="/contact">
          Kontakt
        </Button>
      </div>
    </main>
  );
}

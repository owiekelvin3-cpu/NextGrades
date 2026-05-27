
import Link from "next/link";
import { Button } from "./ui/Button";

export default function Footer() {
  return (
    <footer className="bg-[#0D1B2A] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logo.png"
                alt="NextGrades Logo"
                className="h-12 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Smarter Learning. Better Results.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-5 text-white">Programs</h4>
            <ul className="space-y-3">
              <FooterLink href="/programs">1:1 Tutoring</FooterLink>
              <FooterLink href="/programs">Small Group Learning</FooterLink>
              <FooterLink href="/programs">Math Excellence Program</FooterLink>
              <FooterLink href="/programs">Exam Preparation</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-5 text-white">Resources</h4>
            <ul className="space-y-3">
              <FooterLink href="/resources">Study Materials</FooterLink>
              <FooterLink href="/resources">Worksheets</FooterLink>
              <FooterLink href="/resources">Explainer Videos</FooterLink>
              <FooterLink href="/resources">Exam Prep</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-5 text-white">Company</h4>
            <ul className="space-y-3">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/help">Help Center</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-5 text-white">Legal</h4>
            <ul className="space-y-3">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/contact">Imprint</FooterLink>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <p className="text-gray-500 text-sm text-center">
            &copy; 2026 NextGrades. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm">
      {children}
    </Link>
  );
}

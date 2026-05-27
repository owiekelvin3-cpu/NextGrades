
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-deep-navy">Login</h1>
          
          <div className="space-y-4">
            <Link href="/dashboard/student" className="block w-full text-center py-4 bg-deep-navy text-white rounded-lg hover:bg-opacity-90 transition-colors font-bold">
              Schüler:innen Login
            </Link>
            <Link href="/dashboard/teacher" className="block w-full text-center py-4 bg-deep-navy text-white rounded-lg hover:bg-opacity-90 transition-colors font-bold">
              Lehrer:innen Login
            </Link>
            <Link href="/dashboard/admin" className="block w-full text-center py-4 border-2 border-deep-navy text-deep-navy rounded-lg hover:bg-deep-navy hover:text-white transition-colors font-bold">
              Admin Login
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

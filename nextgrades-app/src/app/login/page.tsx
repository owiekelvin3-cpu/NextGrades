
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-16 bg-[#FAFAFA]">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-[#0D1B2A]">Login</h1>
          
          <div className="space-y-4">
            <Link href="/dashboard/student" className="block w-full">
              <Button variant="dark" size="lg" className="w-full">
                Schüler:innen Login
              </Button>
            </Link>
            <Link href="/dashboard/teacher" className="block w-full">
              <Button variant="gold" size="lg" className="w-full">
                Lehrer:innen Login
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


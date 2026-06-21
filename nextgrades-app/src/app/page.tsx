"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HomePagePremium } from "@/components/home/HomePagePremium";

export default function Home() {
  return (
    <div className="marketing-page-root flex min-h-screen flex-col bg-background">
      <Navbar />
      <HomePagePremium />
      <Footer />
    </div>
  );
}

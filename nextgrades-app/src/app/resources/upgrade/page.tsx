"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ResourcesUpgradeExperience } from "@/components/resources/ResourcesUpgradeExperience";
import { appShell } from "@/lib/theme/shell";

export default function ResourcesUpgradePage() {
  return (
    <div className={appShell.marketingPageMuted}>
      <Navbar />
      <main className="flex-1">
        <ResourcesUpgradeExperience />
      </main>
      <Footer />
    </div>
  );
}

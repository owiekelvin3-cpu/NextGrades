"use client";

import { AdminPortalShell } from "@/components/admin/AdminPortalShell";

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return <AdminPortalShell>{children}</AdminPortalShell>;
}

/** Legacy admin UI under `/dashboard/admin` is redirected via next.config.ts. */
export default function LegacyAdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

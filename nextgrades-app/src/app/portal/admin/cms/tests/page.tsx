import Link from "next/link";
import { ADMIN_PORTAL_PREFIX } from "@/lib/admin/portal-paths";
import { CMSSectionHeader } from "@/components/cms/CMSSectionHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ListChecks, ExternalLink } from "lucide-react";

export default function CmsTestsHubPage() {
  return (
    <div className="flex h-full flex-col overflow-auto bg-surface-muted p-4 md:p-6">
      <CMSSectionHeader
        title="Tests & quizzes"
        description="Student assessments are managed in the quiz system. Create materials, generate AI quizzes, and monitor attempts from the admin portal."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <ListChecks className="mb-3 h-8 w-8 text-[var(--brand-gold)]" />
          <h2 className="text-lg font-bold text-foreground">Quiz monitor</h2>
          <p className="mt-2 text-sm text-text-muted">
            View quiz activity, attempts, and performance across students.
          </p>
          <Button variant="gold" className="mt-4" href={`${ADMIN_PORTAL_PREFIX}/quiz-monitor`}>
            Open quiz monitor
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-bold text-foreground">Teacher quiz tools</h2>
          <p className="mt-2 text-sm text-text-muted">
            Teachers create quizzes from uploaded materials in their dashboard. Admins can review generated
            content in Quiz Monitor.
          </p>
          <p className="mt-4 text-xs text-text-muted">
            Database tables: <code className="rounded bg-surface-subtle px-1">quizzes</code>,{" "}
            <code className="rounded bg-surface-subtle px-1">quiz_questions</code>,{" "}
            <code className="rounded bg-surface-subtle px-1">quiz_attempts</code>
          </p>
        </Card>
      </div>
    </div>
  );
}

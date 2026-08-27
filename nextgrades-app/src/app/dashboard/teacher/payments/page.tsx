"use client";

import { TeacherEarningsExperience } from "@/components/dashboard/teacher/TeacherEarningsExperience";

/** Earnings overview — replaces legacy TeacherPaymentsExperience (Stripe/customer data). */
export default function TeacherPaymentsPage() {
  return <TeacherEarningsExperience />;
}

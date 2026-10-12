import { db } from "@/db";
import { diagnosticAttempts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { SectionHeading } from "@/components/ui";
import { DiagnosticBoard } from "./DiagnosticBoard";
import { DIAGNOSTIC_QUESTIONS } from "@/lib/seedData";

export const dynamic = "force-dynamic";

export default async function DiagnosticPage() {
  const attempts = await db.select().from(diagnosticAttempts).orderBy(desc(diagnosticAttempts.createdAt));

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Diagnostic Test"
        title="Find your real starting point"
        description="4 quick quizzes (Grammar, Vocabulary, Reading strategy, Listening strategy) to estimate your current band per area — like IELTSly's diagnostic, fully free."
      />
      <DiagnosticBoard questions={DIAGNOSTIC_QUESTIONS} attempts={attempts} />
    </div>
  );
}

import { db } from "@/db";
import { mistakes } from "@/db/schema";
import { desc } from "drizzle-orm";
import { SectionHeading } from "@/components/ui";
import { MistakeBoard } from "./MistakeBoard";

export const dynamic = "force-dynamic";

export default async function MistakesPage() {
  const rows = await db.select().from(mistakes).orderBy(desc(mistakes.createdAt));

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Mistake Log"
        title="Never repeat the same mistake twice"
        description="Log every slip from Cambridge/Engnovate tests — grammar, question-type traps, vocabulary mix-ups — and track when you've fixed them."
      />
      <MistakeBoard rows={rows} />
    </div>
  );
}

import { db } from "@/db";
import { writingSubmissions } from "@/db/schema";
import { desc } from "drizzle-orm";
import { SectionHeading } from "@/components/ui";
import { WritingLab } from "./WritingLab";
import { aiEnabled } from "@/lib/ai";

export const dynamic = "force-dynamic";

export default async function WritingPage() {
  const submissions = await db.select().from(writingSubmissions).orderBy(desc(writingSubmissions.createdAt));

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Writing Lab"
        title="Task 1 & Task 2 Examiner"
        description="Paste your essay, get instant band scores across all 4 Cambridge criteria, and a Band-9 rewrite — Original vs Better, side by side."
      />
      <WritingLab submissions={submissions} aiMode={aiEnabled()} />
    </div>
  );
}

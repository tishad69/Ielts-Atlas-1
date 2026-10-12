import { db } from "@/db";
import { mockTests } from "@/db/schema";
import { desc } from "drizzle-orm";
import { SectionHeading } from "@/components/ui";
import { MockTestBoard } from "./MockTestBoard";

export const dynamic = "force-dynamic";

export default async function MockTestsPage() {
  const rows = await db.select().from(mockTests).orderBy(desc(mockTests.dateTaken), desc(mockTests.createdAt));

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Mock Tests"
        title="Band Calculator & Test History"
        description="Log Engnovate / Cambridge 1-21 results, auto-convert raw Listening & Reading scores to band, and attach a screenshot or screen-recording as proof + notes."
      />
      <MockTestBoard rows={rows} />
    </div>
  );
}

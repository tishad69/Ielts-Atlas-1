import { db } from "@/db";
import { dailyLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { SectionHeading } from "@/components/ui";
import { DailyBoard } from "./DailyBoard";

export const dynamic = "force-dynamic";

export default async function DailyPage() {
  const logs = await db.select().from(dailyLogs).orderBy(desc(dailyLogs.logDate), desc(dailyLogs.createdAt));

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Daily Tracker"
        title="Study Log & Streak"
        description="Log every study session — minutes, skill, and quick notes. Auto-saved and used to calculate your streak."
      />
      <DailyBoard logs={logs} />
    </div>
  );
}

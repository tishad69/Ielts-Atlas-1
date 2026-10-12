import { db } from "@/db";
import { roadmapPhases, roadmapTasks } from "@/db/schema";
import { ensureSeeded } from "@/lib/ensureSeed";
import { SectionHeading } from "@/components/ui";
import { RoadmapBoard } from "./RoadmapBoard";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  await ensureSeeded();
  const phases = await db.select().from(roadmapPhases).orderBy(roadmapPhases.orderIndex);
  const tasks = await db.select().from(roadmapTasks).orderBy(roadmapTasks.orderIndex);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="A-Z Plan"
        title="Study Roadmap"
        description="Your complete path: Munzareen's book → Diagnostic → Engnovate Cambridge 1-21 → Vocabulary mastery → Full mocks → Band 9."
      />
      <RoadmapBoard phases={phases} tasks={tasks} />
    </div>
  );
}

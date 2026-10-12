import { db } from "@/db";
import { speakingSessions } from "@/db/schema";
import { desc } from "drizzle-orm";
import { SectionHeading } from "@/components/ui";
import { SpeakingLab } from "./SpeakingLab";
import { aiEnabled } from "@/lib/ai";

export const dynamic = "force-dynamic";

export default async function SpeakingPage() {
  const sessions = await db.select().from(speakingSessions).orderBy(desc(speakingSessions.createdAt));

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Speaking Lab"
        title="Live Transcript Practice & AI Conversation Partner"
        description="Record real answers with a transcript that never drops on pauses, get an instant band estimate, or practice a free-flowing voice conversation."
      />
      <SpeakingLab sessions={sessions} aiMode={aiEnabled()} />
    </div>
  );
}

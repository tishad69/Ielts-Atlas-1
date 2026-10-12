import { db } from "@/db";
import { resources } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ensureSeeded } from "@/lib/ensureSeed";
import { SectionHeading } from "@/components/ui";
import { ResourceBoard } from "./ResourceBoard";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  await ensureSeeded();
  const rows = await db.select().from(resources).orderBy(desc(resources.isFavorite), desc(resources.createdAt));

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Resource Library"
        title="Every link, video & tip in one place"
        description="Engnovate, IELTS Liz, your saved Facebook tip videos, and anything else — organised and searchable."
      />
      <ResourceBoard rows={rows} />
    </div>
  );
}

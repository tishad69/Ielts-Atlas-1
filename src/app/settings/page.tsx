import { db } from "@/db";
import { examProfile } from "@/db/schema";
import { ensureSeeded } from "@/lib/ensureSeed";
import { SectionHeading, Card, Badge } from "@/components/ui";
import { SettingsForm } from "./SettingsForm";
import { aiEnabled } from "@/lib/ai";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await ensureSeeded();
  const [profile] = await db.select().from(examProfile).limit(1);

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Settings" title="Your profile & exam config" description="Set your exam date, target band, and current estimated bands — these power the countdown and dashboard." />

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-[var(--font-display)] text-lg font-bold text-white">AI Engine Status</h3>
          <Badge tone={aiEnabled() ? "emerald" : "slate"}>{aiEnabled() ? "Live GPT examiner enabled" : "Free heuristic engine (no API key set)"}</Badge>
        </div>
        <p className="text-sm text-slate-400">
          Band9 HQ works 100% free using local heuristic scoring engines for Writing & Speaking. If you ever add an
          <code className="mx-1 rounded bg-black/30 px-1.5 py-0.5 text-xs text-violet-300">OPENAI_API_KEY</code>
          environment variable, every examiner automatically upgrades to real GPT-grade feedback with zero code changes.
        </p>
      </Card>

      {profile && <SettingsForm profile={profile} />}
    </div>
  );
}

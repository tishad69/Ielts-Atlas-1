"use client";

import { useTransition } from "react";
import { Card, Button } from "@/components/ui";
import { updateProfile } from "@/app/actions/profile";
import { Save } from "lucide-react";

type Profile = {
  id: number;
  fullName: string | null;
  examDate: string | null;
  targetBand: number | null;
  currentListening: number | null;
  currentReading: number | null;
  currentWriting: number | null;
  currentSpeaking: number | null;
};

export function SettingsForm({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <form action={(fd) => startTransition(() => updateProfile(fd))} className="space-y-5">
        <input type="hidden" name="id" value={profile.id} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-slate-400">Your name</label>
            <input name="fullName" defaultValue={profile.fullName ?? ""} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400">Exam date</label>
            <input type="date" name="examDate" defaultValue={profile.examDate ?? ""} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400">Target band</label>
            <input type="number" step="0.5" min={1} max={9} name="targetBand" defaultValue={profile.targetBand ?? 9} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none" />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Current estimated bands (used on the dashboard)</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { key: "currentListening", label: "Listening", value: profile.currentListening },
              { key: "currentReading", label: "Reading", value: profile.currentReading },
              { key: "currentWriting", label: "Writing", value: profile.currentWriting },
              { key: "currentSpeaking", label: "Speaking", value: profile.currentSpeaking },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs font-medium text-slate-400">{f.label}</label>
                <input type="number" step="0.5" min={0} max={9} name={f.key} defaultValue={f.value ?? 0} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none" />
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={isPending}>
          <Save className="h-4 w-4" /> Save settings
        </Button>
      </form>
    </Card>
  );
}

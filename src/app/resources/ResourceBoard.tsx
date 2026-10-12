"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, Button, Badge, EmptyState } from "@/components/ui";
import { SKILL_LABELS, cn } from "@/lib/utils";
import { addResource, toggleFavorite, deleteResource } from "@/app/actions/resources";
import { Plus, Trash2, Star, ExternalLink } from "lucide-react";

type Resource = {
  id: number;
  title: string;
  url: string | null;
  category: string | null;
  notes: string | null;
  skill: string | null;
  isFavorite: boolean | null;
};

const CATEGORY_ICON: Record<string, string> = { video: "🎬", article: "📄", tool: "🛠️", tip: "💡", link: "🔗" };

export function ResourceBoard({ rows }: { rows: Resource[] }) {
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => Array.from(new Set(rows.map((r) => r.category || "link"))), [rows]);
  const filtered = category === "all" ? rows : rows.filter((r) => (r.category || "link") === category);

  function fav(r: Resource) {
    const fd = new FormData();
    fd.set("id", String(r.id));
    fd.set("isFavorite", String(Boolean(r.isFavorite)));
    startTransition(() => toggleFavorite(fd));
  }
  function remove(id: number) {
    const fd = new FormData();
    fd.set("id", String(id));
    startTransition(() => deleteResource(fd));
  }

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="mb-3 font-[var(--font-display)] text-lg font-bold text-white">Save a new resource</h3>
        <form action={(fd) => startTransition(() => addResource(fd))} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input name="title" required placeholder="Title *" className="sm:col-span-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
          <input name="url" placeholder="URL (optional)" className="sm:col-span-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
          <select name="category" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none">
            <option value="link">Link</option>
            <option value="video">Video</option>
            <option value="article">Article</option>
            <option value="tool">Tool</option>
            <option value="tip">Tip</option>
          </select>
          <select name="skill" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none">
            {Object.entries(SKILL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input name="notes" placeholder="Notes" className="sm:col-span-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
          <Button type="submit"><Plus className="h-4 w-4" /> Save</Button>
        </form>
      </Card>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCategory("all")} className={cn("rounded-full border px-3 py-1 text-xs font-medium", category === "all" ? "border-violet-400 bg-violet-500/15 text-violet-200" : "border-white/10 text-slate-400")}>All</button>
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={cn("rounded-full border px-3 py-1 text-xs font-medium capitalize", category === c ? "border-violet-400 bg-violet-500/15 text-violet-200" : "border-white/10 text-slate-400")}>
            {CATEGORY_ICON[c] || "🔗"} {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <EmptyState title="No resources yet" description="Save Engnovate links, Liz videos, or your own notes." />
        ) : (
          filtered.map((r) => (
            <Card key={r.id} hover>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-200">{CATEGORY_ICON[r.category || "link"]} {r.title}</p>
                <button onClick={() => fav(r)}>
                  <Star className={cn("h-4 w-4", r.isFavorite ? "fill-amber-400 text-amber-400" : "text-slate-600")} />
                </button>
              </div>
              {r.notes && <p className="mt-2 text-xs text-slate-500">{r.notes}</p>}
              <div className="mt-3 flex items-center justify-between">
                <Badge tone="slate">{SKILL_LABELS[r.skill || "general"]}</Badge>
                <div className="flex items-center gap-2">
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-violet-200">
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <button onClick={() => remove(r.id)} className="text-slate-600 hover:text-rose-300"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

import { leadsForHub } from "@/leadgen/lib/db";
import { KanbanBoard, type BoardLead } from "@/leadgen/components/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  let board: BoardLead[] = [];
  let dbError: string | null = null;
  try {
    const leads = await leadsForHub();
    board = leads.map((l) => ({
      id: l.id,
      business_name: l.business_name,
      city: l.city,
      priority: l.priority,
      status: l.status,
    }));
  } catch (e) {
    dbError = (e as Error).message;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Trascina i lead tra le colonne per cambiarne lo stato.
        </p>
      </div>
      {dbError ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">{dbError}</div>
      ) : (
        <KanbanBoard initial={board} />
      )}
    </div>
  );
}

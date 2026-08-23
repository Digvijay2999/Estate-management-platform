export default function AgentLeadsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Leads Pipeline</h2>
      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-900">New Inquiry - 2 bed flat</p>
          <p className="mt-1 text-sm text-slate-600">Status: CONTACTED</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-900">Site visit request</p>
          <p className="mt-1 text-sm text-slate-600">Status: VISIT_SCHEDULED</p>
        </div>
      </div>
    </div>
  );
}

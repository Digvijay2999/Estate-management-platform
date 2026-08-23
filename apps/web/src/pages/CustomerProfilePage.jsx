export default function CustomerProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Profile</h2>
        <p className="mt-2 text-slate-600">Manage personal details, preferences, and saved market settings.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Full Name</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Aisha Sharma</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Country</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">India</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Preferred Currency</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">INR</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Language</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">English</p>
        </div>
      </div>
    </div>
  );
}

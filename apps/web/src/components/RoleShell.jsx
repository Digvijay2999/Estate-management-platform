import { Link, NavLink } from 'react-router-dom';

const navigationMap = {
  customer: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Favorites', to: '/dashboard/favorites' },
    { label: 'Inquiries', to: '/dashboard/inquiries' },
    { label: 'Appointments', to: '/dashboard/appointments' },
    { label: 'Profile', to: '/dashboard/profile' },
  ],
  agent: [
    { label: 'Dashboard', to: '/agent/dashboard' },
    { label: 'Properties', to: '/agent/properties' },
    { label: 'New Listing', to: '/agent/properties/new' },
    { label: 'Leads', to: '/agent/leads' },
    { label: 'Appointments', to: '/agent/appointments' },
    { label: 'Analytics', to: '/agent/analytics' },
    { label: 'Profile', to: '/agent/profile' },
  ],
  seller: [
    { label: 'Dashboard', to: '/seller/dashboard' },
    { label: 'My Properties', to: '/seller/properties' },
    { label: 'New Listing', to: '/seller/properties/new' },
    { label: 'Assigned Agent', to: '/seller/agent' },
    { label: 'Inquiries', to: '/seller/inquiries' },
    { label: 'Documents', to: '/seller/documents' },
  ],
  admin: [
    { label: 'Overview', to: '/admin/dashboard' },
    { label: 'Users', to: '/admin/users' },
    { label: 'Properties', to: '/admin/properties' },
    { label: 'Reports', to: '/admin/reports' },
    { label: 'Settings', to: '/admin/settings' },
  ],
};

export default function RoleShell({ role = 'customer', title = 'Dashboard', children }) {
  const items = navigationMap[role] ?? navigationMap.customer;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">{role}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1>
        </div>
        <Link to="/" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300">
          Back to home
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <nav className="space-y-2">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  ['block rounded-xl px-4 py-3 text-sm font-medium transition', isActive ? 'bg-emerald-100 text-emerald-800' : 'text-slate-700 hover:bg-slate-100'].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">{children}</section>
      </div>
    </div>
  );
}

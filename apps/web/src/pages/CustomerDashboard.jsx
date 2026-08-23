import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function fetchJson(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
}

export default function CustomerDashboard() {
  const [summary, setSummary] = useState({ favoritesCount: 0, inquiriesCount: 0, appointmentsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        const payload = await fetchJson('/customer/summary');
        setSummary(payload.summary || { favoritesCount: 0, inquiriesCount: 0, appointmentsCount: 0 });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Customer</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">Customer Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Saved Properties</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{loading ? '…' : summary.favoritesCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Inquiries</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{loading ? '…' : summary.inquiriesCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Appointments</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{loading ? '…' : summary.appointmentsCount}</p>
        </div>
      </div>
    </div>
  );
}

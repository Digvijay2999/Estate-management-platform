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

export default function AgentDashboard() {
  const [summary, setSummary] = useState({ totalListings: 0, activeListings: 0, leadsCount: 0, visitsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        const payload = await fetchJson('/agent/summary');
        setSummary(payload.summary || { totalListings: 0, activeListings: 0, leadsCount: 0, visitsCount: 0 });
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
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Agent</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">Agent Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Total Listings</p><p className="mt-3 text-3xl font-bold">{loading ? '…' : summary.totalListings}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Active Listings</p><p className="mt-3 text-3xl font-bold">{loading ? '…' : summary.activeListings}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Leads</p><p className="mt-3 text-3xl font-bold">{loading ? '…' : summary.leadsCount}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Visits</p><p className="mt-3 text-3xl font-bold">{loading ? '…' : summary.visitsCount}</p></div>
      </div>
    </div>
  );
}

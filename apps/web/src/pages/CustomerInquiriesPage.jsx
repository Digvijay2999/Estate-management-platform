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

export default function CustomerInquiriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInquiries() {
      try {
        const payload = await fetchJson('/customer/inquiries');
        setItems(payload.items || []);
      } catch (error) {
        console.error(error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadInquiries();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Inquiries</h2>

      {loading ? (
        <p className="text-slate-500">Loading your inquiries…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
          You have not sent any property inquiries yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((inquiry) => {
            const property = inquiry.property || {};
            return (
              <div key={inquiry._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{property.title || 'Property inquiry'}</p>
                <p className="mt-1 text-sm text-slate-600">Status: {inquiry.status || 'NEW'}</p>
                <p className="mt-2 text-sm text-slate-500">{inquiry.message}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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

export default function CustomerFavoritesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const payload = await fetchJson('/customer/favorites');
        setItems(payload.items || []);
      } catch (error) {
        console.error(error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Favorites</h2>

      {loading ? (
        <p className="text-slate-500">Loading saved properties…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
          You have no saved properties yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((favorite) => {
            const property = favorite.property || {};
            const location = property.location || {};

            return (
              <div key={favorite._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-lg font-semibold text-slate-900">{property.title || 'Untitled property'}</p>
                <p className="mt-2 text-slate-600">{property.price ? `₹ ${property.price.toLocaleString('en-IN')}` : 'Price available on request'}</p>
                <p className="mt-2 text-sm text-slate-500">{location.publicLocation || location.address || 'Location not specified'}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

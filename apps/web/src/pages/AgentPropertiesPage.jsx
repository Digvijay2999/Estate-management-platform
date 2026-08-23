import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default function AgentPropertiesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadProperties() {
    try {
      const payload = await fetchJson('/agent/properties');
      setItems(payload.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await fetchJson(`/properties/${propertyId}`, { method: 'DELETE' });
      setItems((current) => current.filter((property) => property._id !== propertyId));
    } catch (error) {
      console.error(error);
      window.alert(error.message || 'Unable to delete listing');
    }
  };

  const handleSubmitForApproval = async (propertyId) => {
    try {
      await fetchJson(`/properties/${propertyId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'PENDING_APPROVAL' }),
      });
      setItems((current) => current.map((property) => property._id === propertyId ? { ...property, status: 'PENDING_APPROVAL' } : property));
    } catch (error) {
      console.error(error);
      window.alert(error.message || 'Unable to update listing status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">My Listings</h2>
        <button
          type="button"
          onClick={() => navigate('/agent/properties/new')}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Add listing
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading listings…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
          No listings yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((property) => (
            <div key={property._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-slate-900">{property.title}</p>
                <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">{property.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{property.listingType} • ₹ {Number(property.price).toLocaleString('en-IN')}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => navigate(`/agent/properties/${property._id}/edit`)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-slate-300">Edit</button>
                {property.status === 'DRAFT' ? (
                  <button type="button" onClick={() => handleSubmitForApproval(property._id)} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:border-emerald-300">Submit for approval</button>
                ) : null}
                <button type="button" onClick={() => handleDelete(property._id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:border-red-300">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

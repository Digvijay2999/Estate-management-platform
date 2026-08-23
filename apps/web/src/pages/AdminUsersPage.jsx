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

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [reviewNotes, setReviewNotes] = useState({});

  async function loadUsers() {
    try {
      const [usersPayload, propertiesPayload] = await Promise.all([
        fetchJson('/admin/users'),
        fetchJson('/admin/properties/pending'),
      ]);
      setUsers(usersPayload.items || []);
      setPendingProperties(propertiesPayload.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleStatusUpdate = async (userId, nextStatus) => {
    try {
      const payload = await fetchJson(`/admin/users/${userId}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      setMessage(payload.message || 'User status updated');
      await loadUsers();
    } catch (error) {
      setMessage(error.message || 'Unable to update user');
    }
  };

  const handlePropertyReview = async (propertyId, nextStatus) => {
    try {
      const notes = (reviewNotes[propertyId] || '').trim();
      const payload = await fetchJson(`/admin/properties/${propertyId}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: nextStatus,
          notes,
          rejectionReason: nextStatus === 'REJECTED' ? notes || 'Needs additional documentation' : '',
        }),
      });

      setMessage(payload.message || (nextStatus === 'APPROVED' ? 'Property approved' : 'Property rejected'));
      setReviewNotes((current) => ({ ...current, [propertyId]: '' }));
      await loadUsers();
    } catch (error) {
      setMessage(error.message || 'Unable to review property');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-600">Role</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr><td className="px-4 py-3 text-slate-500" colSpan={4}>Loading users…</td></tr>
              ) : users.length === 0 ? (
                <tr><td className="px-4 py-3 text-slate-500" colSpan={4}>No users found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{user.fullName}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : user.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleStatusUpdate(user._id, 'ACTIVE')} className="rounded-lg bg-slate-900 px-2 py-1 text-xs text-white">Approve</button>
                        <button type="button" onClick={() => handleStatusUpdate(user._id, 'SUSPENDED')} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700">Suspend</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-xl font-bold text-slate-900">Pending Listing Approvals</h3>
          <div className="mt-4 space-y-3">
            {pendingProperties.length === 0 ? (
              <p className="text-slate-600">No pending listings.</p>
            ) : (
              pendingProperties.map((property) => (
                <div key={property._id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-slate-900">{property.title}</p>
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-amber-700">{property.status}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {property.listingType} • {property.propertyType?.name || 'Property'} • ₹ {Number(property.price).toLocaleString('en-IN')}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">By {property.seller?.fullName || 'Unassigned seller'} • {property.location?.publicLocation || property.location?.address || 'Location unavailable'}</p>
                      {property.documents?.length ? (
                        <p className="mt-2 text-xs text-slate-500">Documents: {property.documents.slice(0, 3).join(', ')}{property.documents.length > 3 ? ' + more' : ''}</p>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handlePropertyReview(property._id, 'APPROVED')} className="rounded-lg bg-emerald-600 px-2 py-1 text-xs text-white">Approve</button>
                      <button type="button" onClick={() => handlePropertyReview(property._id, 'REJECTED')} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700">Reject</button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Review notes</label>
                    <textarea
                      value={reviewNotes[property._id] || ''}
                      onChange={(event) => setReviewNotes((current) => ({ ...current, [property._id]: event.target.value }))}
                      rows={3}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white"
                      placeholder="Record pricing, documentation, location, or compliance issues before approving or rejecting."
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

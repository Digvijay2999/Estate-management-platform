import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

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

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadProperty() {
      try {
        const payload = await fetchJson(`/properties/${id}`);
        setProperty(payload.property || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProperty();
    }
  }, [id]);

  const handleSaveFavorite = async () => {
    if (!id) return;

    setIsSubmitting(true);
    setFeedback('');

    try {
      const payload = await fetchJson(`/customer/favorites/${id}`, { method: 'POST' });
      setFeedback(payload.message || 'Property saved to favorites');
    } catch (error) {
      setFeedback(error.message || 'Unable to save property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendInquiry = async () => {
    if (!id) return;

    setIsSubmitting(true);
    setFeedback('');

    try {
      const payload = await fetchJson('/customer/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: id,
          message: `I am interested in ${property?.title || 'this property'} and would like more information.`,
        }),
      });
      setFeedback(payload.message || 'Inquiry sent successfully');
    } catch (error) {
      setFeedback(error.message || 'Unable to send inquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleVisit = async () => {
    if (!id) return;

    setIsSubmitting(true);
    setFeedback('');

    try {
      const payload = await fetchJson('/customer/appointments', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: id,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          durationMinutes: 60,
          notes: 'Interested in a property visit.',
        }),
      });
      setFeedback(payload.message || 'Visit request scheduled');
    } catch (error) {
      setFeedback(error.message || 'Unable to schedule visit');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-6xl px-6 py-16 text-slate-600">Loading property details…</div>;
  }

  const propertyLocation = property?.location || {};
  const featuredMedia = property?.media?.find((item) => item.isCover) || property?.media?.[0];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          {featuredMedia?.url ? (
            <img src={featuredMedia.url} alt={property?.title || 'Property'} className="h-96 w-full rounded-3xl object-cover shadow-sm" />
          ) : (
            <div className="h-96 rounded-3xl bg-gradient-to-br from-slate-200 via-slate-100 to-emerald-100" />
          )}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {(property?.media || []).slice(0, 3).map((item) => (
              <img key={item.url || item.fileName || item._id} src={item.url} alt={item.fileName || 'Property preview'} className="h-28 w-full rounded-2xl object-cover" />
            ))}
            {(!property?.media || property.media.length === 0) && (
              <>
                <div className="h-28 rounded-2xl bg-slate-100" />
                <div className="h-28 rounded-2xl bg-slate-100" />
                <div className="h-28 rounded-2xl bg-slate-100" />
              </>
            )}
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Featured</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">{property?.title || 'Property Details'}</h1>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {property?.price ? `₹ ${Number(property.price).toLocaleString('en-IN')}` : 'Price on request'}
          </p>
          <p className="mt-3 text-slate-600">{propertyLocation.publicLocation || propertyLocation.address || 'Location not specified'}</p>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 p-3">Bedrooms: {property?.bedrooms ?? 0}</div>
            <div className="rounded-xl bg-slate-50 p-3">Bathrooms: {property?.bathrooms ?? 0}</div>
            <div className="rounded-xl bg-slate-50 p-3">Area: {property?.area || 0} {property?.areaUnit || 'sqft'}</div>
            <div className="rounded-xl bg-slate-50 p-3">Parking: {property?.parking ?? 0}</div>
          </div>

          <button
            type="button"
            onClick={handleSaveFavorite}
            disabled={isSubmitting}
            className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Save Property
          </button>
          <button
            type="button"
            onClick={handleSendInquiry}
            disabled={isSubmitting}
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Send Inquiry
          </button>
          <button
            type="button"
            onClick={handleScheduleVisit}
            disabled={isSubmitting}
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Schedule Visit
          </button>

          {feedback ? <p className="mt-4 text-sm text-emerald-700">{feedback}</p> : null}
        </aside>
      </div>

      <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Description</h2>
        <p className="mt-4 text-slate-600">
          {property?.description ||
            'This premium property offers bright interiors, spacious rooms, modern amenities, and a well-connected location ideal for families and professionals.'}
        </p>
      </div>
    </div>
  );
}

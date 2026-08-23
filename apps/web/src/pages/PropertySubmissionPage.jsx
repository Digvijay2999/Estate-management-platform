import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function uploadPropertyFiles(propertyId, files) {
  const groupedFiles = {
    media: [],
    documents: [],
  };

  for (const file of files) {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      groupedFiles.media.push(file);
    } else {
      groupedFiles.documents.push(file);
    }
  }

  for (const [key, bucket] of Object.entries(groupedFiles)) {
    if (!bucket.length) continue;

    const formData = new FormData();
    bucket.forEach((file) => formData.append('files', file));

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/files`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      throw new Error(payload.message || `Unable to upload ${key}.`);
    }
  }
}

const defaultForm = {
  title: '',
  description: '',
  propertyType: '',
  listingType: 'SALE',
  price: '',
  bedrooms: '2',
  bathrooms: '2',
  area: '',
  publicLocation: '',
  address: '',
  postalCode: '',
  draft: false,
  documents: '',
};

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

export default function PropertySubmissionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const role = (localStorage.getItem('userRole') || 'seller').toLowerCase();
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [error, setError] = useState('');
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    async function loadPageData() {
      try {
        const categoryPayload = await fetchJson('/properties/categories');
        const nextCategories = categoryPayload.items || [];
        setCategories(nextCategories);

        if (isEditing) {
          const propertyPayload = await fetchJson(`/properties/${id}`);
          const property = propertyPayload.property || {};
          setForm({
            title: property.title || '',
            description: property.description || '',
            propertyType: property.propertyType?._id || property.propertyType || nextCategories[0]?._id || '',
            listingType: property.listingType || 'SALE',
            price: property.price ?? '',
            bedrooms: String(property.bedrooms ?? 0),
            bathrooms: String(property.bathrooms ?? 0),
            area: property.area ?? '',
            publicLocation: property.location?.publicLocation || '',
            address: property.location?.address || '',
            postalCode: property.location?.postalCode || '',
            draft: property.status === 'DRAFT',
            documents: Array.isArray(property.documents) ? property.documents.join(', ') : '',
          });
        } else if (nextCategories[0]?._id) {
          setForm((current) => ({ ...current, propertyType: current.propertyType || nextCategories[0]._id }));
        }
      } catch (loadError) {
        setError(loadError.message || 'Unable to load listing data.');
      } finally {
        setIsLoading(false);
      }
    }

    loadPageData();
  }, [id, isEditing]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDelete = async () => {
    if (!isEditing || !id) return;
    if (!window.confirm('Delete this listing? This action cannot be undone.')) return;

    try {
      setIsSaving(true);
      await fetchJson(`/properties/${id}`, { method: 'DELETE' });
      navigate(role === 'agent' ? '/agent/properties' : '/seller/properties');
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete listing.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        propertyType: form.propertyType || categories[0]?._id,
        listingType: form.listingType,
        price: Number(form.price),
        bedrooms: Number(form.bedrooms || 0),
        bathrooms: Number(form.bathrooms || 0),
        area: Number(form.area || 0),
        status: form.draft ? 'DRAFT' : 'PENDING_APPROVAL',
        draft: form.draft,
        location: {
          publicLocation: form.publicLocation.trim(),
          address: form.address.trim(),
          postalCode: form.postalCode.trim(),
          exactAddress: form.address.trim(),
        },
        documents: form.documents
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      };

      if (!payload.title || !payload.description || !payload.price || !payload.propertyType) {
        throw new Error('Please fill in the required fields before submitting.');
      }

      const result = isEditing
        ? await fetchJson(`/properties/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          })
        : await fetchJson('/properties', {
            method: 'POST',
            body: JSON.stringify(payload),
          });

      const savedPropertyId = result.property?._id || id;
      if (selectedFiles.length && savedPropertyId) {
        await uploadPropertyFiles(savedPropertyId, selectedFiles);
      }

      navigate(role === 'agent' ? '/agent/properties' : '/seller/properties');
    } catch (submissionError) {
      setError(submissionError.message || 'Unable to save the listing.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-6 py-16 text-slate-600">Loading listing form…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Marketplace</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{isEditing ? 'Edit listing' : 'Submit a new listing'}</h1>
        </div>
        <button
          type="button"
          onClick={() => navigate(role === 'agent' ? '/agent/properties' : '/seller/properties')}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
        >
          Back to listings
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Listing title</span>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white"
              placeholder="Luxury 3BR apartment in Downtown"
              required
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white"
              placeholder="Describe the property, its features, nearby amenities, and expectations."
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Property type</span>
            <select
              name="propertyType"
              value={form.propertyType}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white"
              required
            >
              {categories.length === 0 ? (
                <option value="">Loading categories...</option>
              ) : (
                categories.map((category) => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))
              )}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Listing type</span>
            <select
              name="listingType"
              value={form.listingType}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white"
            >
              <option value="SALE">Sale</option>
              <option value="RENT">Rent</option>
              <option value="LEASE">Lease</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Price</span>
            <input
              name="price"
              type="number"
              min="0"
              value={form.price}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white"
              placeholder="2500000"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Area (sqft)</span>
            <input
              name="area"
              type="number"
              min="0"
              value={form.area}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white"
              placeholder="1850"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Bedrooms</span>
            <input
              name="bedrooms"
              type="number"
              min="0"
              value={form.bedrooms}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Bathrooms</span>
            <input
              name="bathrooms"
              type="number"
              min="0"
              value={form.bathrooms}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Location / neighborhood</span>
            <input
              name="publicLocation"
              value={form.publicLocation}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white"
              placeholder="Downtown, Bengaluru"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Street address</span>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white"
              placeholder="12 Residency Road, MG Layout"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Postal code</span>
            <input
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white"
              placeholder="560001"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Supporting documents</span>
            <input
              name="documents"
              value={form.documents}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white"
              placeholder="title deed, plan.pdf, brochure.pdf"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Photos and documents</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
              className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-emerald-500 focus:bg-white"
            />
            <span className="mt-2 block text-xs text-slate-500">{selectedFiles.length ? `${selectedFiles.length} file(s) selected` : 'No files selected'}</span>
          </label>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="font-medium text-slate-800">Save as draft</p>
            <p className="text-sm text-slate-500">Keep this listing private until you are ready to submit it for review.</p>
          </div>
          <input
            type="checkbox"
            name="draft"
            checked={form.draft}
            onChange={handleChange}
            className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {isEditing ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
              className="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-700 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Delete
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => navigate(role === 'agent' ? '/agent/properties' : '/seller/properties')}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:border-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {isSaving ? 'Saving...' : isEditing ? 'Save changes' : form.draft ? 'Save draft' : 'Submit listing'}
          </button>
        </div>
      </form>
    </div>
  );
}

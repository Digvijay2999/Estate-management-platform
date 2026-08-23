import { formatPrice, getPreferredCurrency } from '../utils/currency.js';

const sampleProperties = [
  {
    id: 1,
    title: '3 BHK Apartment in Noida Sector 62',
    location: 'Noida, India',
    price: 8900000,
    type: 'Apartment',
    status: 'Available',
  },
  {
    id: 2,
    title: 'Luxury Villa in Gurgaon',
    location: 'Gurgaon, India',
    price: 24000000,
    type: 'Villa',
    status: 'Featured',
  },
  {
    id: 3,
    title: 'Commercial Office Space',
    location: 'Bengaluru, India',
    price: 11000000,
    type: 'Office',
    status: 'Verified',
  },
];

export default function PropertiesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Marketplace</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">Properties</h1>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {sampleProperties.map((property) => (
          <article key={property.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-52 bg-gradient-to-br from-slate-200 to-emerald-100" />
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{property.status}</span>
                <span className="text-sm text-slate-500">{property.type}</span>
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">{property.title}</h2>
              <p className="mt-2 text-slate-600">{property.location}</p>
              <p className="mt-4 text-2xl font-bold text-slate-900">{formatPrice(property.price, getPreferredCurrency(), 'en-IN')}</p>
              <button type="button" className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">
                View details
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

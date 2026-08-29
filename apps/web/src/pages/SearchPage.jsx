const filters = [
  'Buy',
  'Rent',
  'Lease',
  'Country',
  'City',
  'Price Range',
  'Bedrooms',
  'Amenities',
];

const propertyResults = [
  { title: 'Family Apartment', location: 'Noida', price: '₹ 62,00,000' },
  { title: 'Office Space', location: 'Bengaluru', price: '₹ 95,00,000' },
  { title: 'Luxury Villa', location: 'Pune', price: '₹ 1,80,00,000' },
];

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Search Properties</h1>
        <div className="mt-5 flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button key={filter} type="button" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 hover:border-slate-300">
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {propertyResults.map((property) => (
          <article key={property.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-44 rounded-2xl bg-linear-to-br from-slate-200 to-emerald-100" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">{property.title}</h2>
            <p className="mt-2 text-slate-600">{property.location}</p>
            <p className="mt-4 text-2xl font-bold text-slate-900">{property.price}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

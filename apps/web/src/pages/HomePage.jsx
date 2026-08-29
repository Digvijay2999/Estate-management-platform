import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatPrice, getPreferredCurrency } from '../utils/currency.js';
import HeroImg from '../assets/hero.png';

const stats = [
  { key: 'home.stats.listings', value: '18.5K+' },
  { key: 'home.stats.agents', value: '2.4K' },
  { key: 'home.stats.countries', value: '32' },
  { key: 'home.stats.sellers', value: '7.8K' },
];

const featured = [
  {
    id: 'p1',
    title: 'Luxury Villa in Gurugram',
    location: 'Gurugram, India',
    price: 7800000,
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=60',
    tag: 'Featured',
  },
  {
    id: 'p2',
    title: '3 BHK Apartment in Noida',
    location: 'Noida, India',
    price: 9800000,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=60',
    tag: 'Verified',
  },
  {
    id: 'p3',
    title: 'Cozy Studio in Downtown',
    location: 'Mumbai, India',
    price: 4200000,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=60',
    tag: 'New',
  },
];

export default function HomePage() {
  const { t } = useTranslation();
  const currency = getPreferredCurrency();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <section className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-slate-800 p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-20 blur-3xl" style={{ backgroundImage: `url(${HeroImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative z-10 grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">{t('home.stats.countries')} markets</span>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">{t('home.hero.title')}</h1>
            <p className="max-w-xl text-lg text-white/90">{t('home.hero.subtitle')}</p>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/properties" className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow hover:opacity-95">
                {t('home.cta.primary')}
              </Link>

              <Link to="/register" className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-medium text-white hover:bg-white/20">
                {t('home.cta.secondary')}
              </Link>
            </div>

            <div className="mt-6 w-full max-w-lg rounded-xl bg-white p-3 text-slate-900 shadow-md">
              <form className="flex gap-2">
                <input aria-label="Search location or property" placeholder="Search city, neighbourhood or address" className="flex-1 rounded-lg border-none px-3 py-2 outline-none" />
                <select aria-label="Listing type" className="rounded-lg border-none bg-transparent px-3 py-2 text-sm">
                  <option value="SALE">Sale</option>
                  <option value="RENT">Rent</option>
                </select>
                <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Search</button>
              </form>
            </div>
          </div>

          <div className="hidden md:block">
            <img src={HeroImg} alt="hero" className="mx-auto w-full max-w-md rounded-2xl shadow-2xl" />
          </div>
        </div>
      </section>

      <section className="mb-10 grid gap-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.key} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="mt-2 text-sm text-slate-600">{t(s.key)}</p>
          </div>
        ))}
      </section>

      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Featured Listings</h2>
          <Link to="/properties" className="text-sm font-medium text-emerald-600">View all properties →</Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((p) => (
            <article key={p.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative h-48 w-full overflow-hidden">
                <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">{p.tag}</span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{p.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{p.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900">{formatPrice(p.price, currency)}</p>
                    <p className="text-xs text-slate-500">{p.price ? 'Approx' : ''}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Link to={`/properties`} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700">View</Link>
                  <button type="button" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Enquire</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}

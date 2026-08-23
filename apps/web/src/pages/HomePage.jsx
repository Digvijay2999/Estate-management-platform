import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatPrice, getPreferredCurrency } from '../utils/currency.js';

const stats = [
  { key: 'home.stats.listings', value: '18.5K+' },
  { key: 'home.stats.agents', value: '2.4K' },
  { key: 'home.stats.countries', value: '32' },
  { key: 'home.stats.sellers', value: '7.8K' },
];

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <section className="grid items-center gap-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-2 md:p-16">
        <div>
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Multi-country marketplace
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            {t('home.hero.title')}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">{t('home.hero.subtitle')}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/properties" className="rounded-full bg-emerald-600 px-6 py-3 font-medium text-white shadow-sm hover:bg-emerald-700">
              {t('home.cta.primary')}
            </Link>
            <Link to="/register" className="rounded-full border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900">
              {t('home.cta.secondary')}
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-700 p-8 text-white shadow-xl">
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Featured market</p>
            <h2 className="mt-4 text-3xl font-bold">Premium urban living</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs uppercase text-slate-200">Location</p>
                <p className="mt-2 text-xl font-semibold">Noida</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs uppercase text-slate-200">Price</p>
                <p className="mt-2 text-xl font-semibold">{formatPrice(8900000, getPreferredCurrency(), 'en-IN')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.key} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-600">{t(stat.key)}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

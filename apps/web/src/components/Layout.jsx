import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPreferredCurrency, SUPPORTED_CURRENCIES } from '../utils/currency.js';

const navItems = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/properties', labelKey: 'nav.properties' },
  { to: '/login', labelKey: 'nav.login' },
  { to: '/register', labelKey: 'nav.register' },
];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function Layout({ children }) {
  const { t, i18n } = useTranslation();
  const [preferredCurrency, setPreferredCurrency] = useState(getPreferredCurrency());

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return;
    }

    fetch(`${API_BASE_URL}/auth/preferences`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }
        const payload = await response.json();
        const nextLanguage = payload?.preferences?.language || localStorage.getItem('preferred-language') || 'en';
        const nextCurrency = payload?.preferences?.currency || getPreferredCurrency();
        i18n.changeLanguage(nextLanguage);
        localStorage.setItem('preferred-language', nextLanguage);
        localStorage.setItem('preferred-currency', nextCurrency);
        setPreferredCurrency(nextCurrency);
      })
      .catch(() => undefined);
  }, [i18n]);

  const persistPreference = async (nextLanguage, nextCurrency) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/auth/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          language: nextLanguage,
          currency: nextCurrency,
        }),
      });
    } catch (error) {
      console.warn('Unable to persist user preference', error);
    }
  };

  const changeLanguage = async (event) => {
    const nextLanguage = event.target.value;
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem('preferred-language', nextLanguage);
    await persistPreference(nextLanguage, preferredCurrency);
  };

  const changeCurrency = async (event) => {
    const nextCurrency = event.target.value;
    setPreferredCurrency(nextCurrency);
    localStorage.setItem('preferred-currency', nextCurrency);
    await persistPreference(i18n.language, nextCurrency);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-slate-900">
            {t('app.title')}
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  ['text-sm font-medium transition', isActive ? 'text-emerald-700' : 'text-slate-600 hover:text-slate-900'].join(' ')
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700">
              <span>{t('common.language')}</span>
              <select value={i18n.language || 'en'} onChange={changeLanguage} className="bg-transparent outline-none">
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700">
              <span>{t('common.currency')}</span>
              <select value={preferredCurrency} onChange={changeCurrency} className="bg-transparent outline-none">
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

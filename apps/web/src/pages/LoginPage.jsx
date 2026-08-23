import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('customer');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { id: 'customer', label: t('auth.customer') },
    { id: 'agent', label: t('auth.agent') },
    { id: 'seller', label: t('auth.seller') },
    { id: 'admin', label: t('auth.admin') },
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Login failed');
      }

      localStorage.setItem('accessToken', payload.tokens?.accessToken || '');
      localStorage.setItem('refreshToken', payload.tokens?.refreshToken || '');
      localStorage.setItem('userRole', payload.user?.role || selectedRole);
      if (payload.user?.preferredLanguage) {
        localStorage.setItem('preferred-language', payload.user.preferredLanguage);
      }
      if (payload.user?.preferredCurrency) {
        localStorage.setItem('preferred-currency', payload.user.preferredCurrency);
      }
      navigate(payload.redirectPath || '/dashboard');
    } catch (submitError) {
      setError(submitError.message || 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Access</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900">{t('login.title')}</h1>
          <p className="mt-3 text-slate-600">{t('login.subtitle')}</p>

          <div className="mt-8 space-y-3">
            {roles.map((role) => (
              <button
                type="button"
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={[
                  'flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition',
                  selectedRole === role.id
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300',
                ].join(' ')}
              >
                <span className="font-medium">{role.label}</span>
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </div>

        <form className="rounded-2xl border border-slate-200 bg-slate-50 p-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none ring-0 transition focus:border-emerald-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none ring-0 transition focus:border-emerald-500"
                placeholder="••••••••"
                required
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? t('common.loading') : t('common.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

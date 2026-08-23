import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const roles = [
  { id: 'customer', labelKey: 'auth.customer' },
  { id: 'agent', labelKey: 'auth.agent' },
  { id: 'seller', labelKey: 'auth.seller' },
];

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('customer');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    preferredLanguage: localStorage.getItem('preferred-language') || 'en',
    preferredCurrency: localStorage.getItem('preferred-currency') || 'INR',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: selectedRole.toUpperCase(),
          preferredLanguage: formData.preferredLanguage || localStorage.getItem('preferred-language') || 'en',
          preferredCurrency: formData.preferredCurrency || localStorage.getItem('preferred-currency') || 'INR',
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Registration failed');
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
      setError(submitError.message || 'Unable to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-slate-900">{t('register.title')}</h1>
        <p className="mt-3 text-slate-600">{t('register.subtitle')}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRole(role.id)}
              className={[
                'rounded-2xl border px-5 py-6 text-left transition',
                selectedRole === role.id
                  ? 'border-emerald-500 bg-emerald-50 hover:bg-emerald-100'
                  : 'border-slate-200 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50',
              ].join(' ')}
            >
              <p className="text-lg font-semibold text-slate-900">{t(role.labelKey)}</p>
              <p className="mt-2 text-sm text-slate-600">Role-based registration workflow</p>
            </button>
          ))}
        </div>

        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
            <input name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Country</label>
            <input name="country" value={formData.country} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500" placeholder="India" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Preferred Language</label>
            <select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500">
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Preferred Currency</label>
            <select name="preferredCurrency" value={formData.preferredCurrency} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500">
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="AED">AED</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500" />
          </div>
          <div className="md:col-span-2 flex items-center justify-between gap-4 pt-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-600" required />
              I accept the terms and conditions
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? t('common.loading') : t('common.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

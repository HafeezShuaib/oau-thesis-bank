import React, { useState } from 'react';
import { useAppRouter, Button, Input, AuthContainer } from '../components/shared';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';

const Screen02Login = () => {
  const { navigate } = useAppRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) { setError('Enter your email and password.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const user = await signIn(normalized, password);
      navigate(user.role === 'admin' ? 'admin-dashboard' : 'discover');
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.detail : 'Unable to sign in. Check your connection and credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthContainer title="Sign in to your account" subtitle="Use your OAU institutional email">
      <form className="space-y-6" onSubmit={submit}>
        <Input label="OAU Email address" type="email" placeholder="student@student.oauife.edu.ng" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
        <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm text-slate-700"><input type="checkbox" className="h-4 w-4 text-[#00502F] focus:ring-[#00502F] border-slate-300 rounded" /> <span className="ml-2">Remember me</span></label>
          <button type="button" onClick={() => navigate('password-reset')} className="text-sm font-medium text-[#00502F] hover:text-[#003d24]">Forgot password?</button>
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</Button>
      </form>
      <div className="mt-6 text-center text-sm"><span className="text-slate-600">Don't have an account? </span><button onClick={() => navigate('signup')} className="font-medium text-[#00502F] hover:text-[#003d24]">Sign up</button></div>
      <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">Sign in uses the connected Django account service. No demo credentials are provisioned by the frontend.</div>
    </AuthContainer>
  );
};
export default Screen02Login;

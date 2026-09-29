import React, { useState } from 'react';
import { useAppRouter, Button, Input, AuthContainer } from '../components/shared';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import type { UserRole } from '../types/api';

const Screen03SignUp = () => {
  const { navigate } = useAppRouter();
  const { signUp } = useAuth();
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !password) { setError('Complete your name, email, and password.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await signUp({ name: name.trim(), email: email.trim().toLowerCase(), password, role, department: department.trim() });
      navigate('profile-setup');
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.detail : 'Unable to create your account. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthContainer title="Create an account" subtitle="Join the OAU research network">
      <form className="space-y-4" onSubmit={submit}>
        <Input label="Full Name" placeholder="John Doe" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
        <Input label="OAU Email" type="email" placeholder="student@student.oauife.edu.ng" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#00502F] focus:border-[#00502F] sm:text-sm bg-white">
            <option value="student">Student</option>
            <option value="researcher">Researcher / Alumni</option>
            <option value="faculty">Supervisor / Faculty</option>
          </select>
        </div>
        <Input label="Department" placeholder="Computer Science" value={department} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepartment(e.target.value)} />
        <Input label="Password" type="password" placeholder="At least 8 characters" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <Button type="submit" className="w-full mt-6" disabled={submitting}>{submitting ? 'Creating account…' : 'Create Account'}</Button>
      </form>
      <div className="mt-6 text-center text-sm"><span className="text-slate-600">Already have an account? </span><button onClick={() => navigate('login')} className="font-medium text-[#00502F] hover:text-[#003d24]">Sign in</button></div>
    </AuthContainer>
  );
};

export default Screen03SignUp;

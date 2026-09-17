import React, { useState } from 'react';
import { CheckCircle2, Link as LinkIcon, Loader2, Shield } from 'lucide-react';
import { useAppRouter, Button, Card, AuthenticatedLayout, Input } from '../components/shared';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { ApiError, changePassword, getMyProfile, getProviderLink, updateMyProfile } from '../lib/api';
import { ErrorState, LoadingState } from '../components/AsyncState';
import { normalizeResearchInterests } from '../lib/formatters';
import ResearcherProfileForm, { ResearcherProfileFormValues } from '../components/ResearcherProfileForm';
import type { ProviderName, ProviderStatus } from '../types/api';

const providerLabels: Record<ProviderName, string> = { github: 'GitHub', orcid: 'ORCID' };

const Screen41AccountSettings = () => {
  const { navigate } = useAppRouter();
  const { user, updateUser } = useAuth();
  const { data: profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useApi(getMyProfile, [], true);
  const [passwords, setPasswords] = useState({ old: '', next: '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState<'researcher' | 'password' | null>(null);
  const [providerState, setProviderState] = useState<Partial<Record<ProviderName, ProviderStatus>>>({});
  const [providerLoading, setProviderLoading] = useState<ProviderName | null>(null);


  const initialValues: ResearcherProfileFormValues = {
    avatar: user?.avatar || '',
    department: user?.department || '',
    faculty: user?.faculty || '',
    bio: profile?.bio || '',
    orcid: profile?.orcid || '',
    github: profile?.github || '',
    website: profile?.website || '',
    research_interests: normalizeResearchInterests(profile?.research_interests, user?.email),
    is_available_for_mentoring: profile?.is_available_for_mentoring || false,
  };

  const saveResearcherProfile = async (values: ResearcherProfileFormValues) => {
    if (!user) return;
    setSaving('researcher');
    try {
      await updateUser({ avatar: values.avatar, department: values.department, faculty: values.faculty });
      await updateMyProfile({ bio: values.bio, orcid: values.orcid, github: values.github, website: values.website, research_interests: normalizeResearchInterests(values.research_interests, user.email), is_available_for_mentoring: values.is_available_for_mentoring });
      await refetchProfile();
      setMessage('Researcher profile updated.');
    } catch (error) {
      setMessage(error instanceof ApiError ? error.detail : 'Unable to update researcher profile.');
    } finally {
      setSaving(null);
    }
  };

  const savePassword = async () => {
    setSaving('password'); setMessage('');
    try {
      await changePassword(passwords.old, passwords.next);
      setPasswords({ old: '', next: '' });
      setMessage('Password updated.');
    } catch (error) {
      setMessage(error instanceof ApiError ? error.detail : 'Unable to update password.');
    } finally {
      setSaving(null);
    }
  };

  const linkProvider = async (provider: ProviderName) => {
    setProviderLoading(provider); setMessage('');
    try {
      const status = await getProviderLink(provider);
      setProviderState((current) => ({ ...current, [provider]: status }));
      if (status.authorization_url) window.location.assign(status.authorization_url);
    } catch (error) {
      const detail = error instanceof ApiError ? error.detail : `Unable to connect ${providerLabels[provider]}.`;
      setProviderState((current) => ({ ...current, [provider]: { provider, configured: false, detail } }));
    } finally {
      setProviderLoading(null);
    }
  };

  if (profileLoading) return <AuthenticatedLayout title="Account Settings"><LoadingState label="Loading account settings…" /></AuthenticatedLayout>;
  if (profileError || !profile || !user) return <AuthenticatedLayout title="Account Settings"><ErrorState message="Unable to load your researcher profile." onRetry={() => void refetchProfile()} /></AuthenticatedLayout>;

  return (
    <AuthenticatedLayout title="Account Settings">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 md:flex-row">
        <div className="w-full shrink-0 md:w-64"><nav className="space-y-1"><button className="flex w-full items-center rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-[#00502F]"><span className="mr-3 h-4 w-4 rounded-full bg-[#00502F]" /> Profile info</button><button className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50" onClick={() => navigate('privacy-settings')}><Shield className="mr-3 h-4 w-4" /> Privacy & access</button></nav></div>
        <div className="min-w-0 flex-1 space-y-6">
          {message && <p className="text-sm text-[#00502F]" role="status">{message}</p>}
          <ResearcherProfileForm user={user} initialValues={initialValues} onSubmit={saveResearcherProfile} submitting={saving === 'researcher'} submitLabel="Save researcher profile" title="Account and researcher profile" description="Keep your account details and public researcher profile up to date." showAccountSummary />
          <Card className="p-6"><h3 className="mb-4 text-lg font-bold text-slate-900">Change password</h3><div className="max-w-lg space-y-4"><Input label="Current password" type="password" value={passwords.old} onChange={(event) => setPasswords({ ...passwords, old: event.target.value })} /><Input label="New password" type="password" value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} /><Button variant="secondary" disabled={saving === 'password' || !passwords.old || !passwords.next} onClick={() => void savePassword()}>{saving === 'password' ? 'Updating…' : 'Update password'}</Button></div></Card>
          <Card className="p-6"><h3 className="mb-2 text-lg font-bold text-slate-900">Connected accounts</h3><p className="mb-4 text-sm text-slate-500">OAuth linking is controlled by backend environment configuration.</p><div className="space-y-3">{(['github', 'orcid'] as ProviderName[]).map((provider) => { const linked = provider === 'github' ? profile.github : profile.orcid; const state = providerState[provider]; return <div key={provider} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><LinkIcon className="h-4 w-4 text-slate-400" /><div><p className="text-sm font-medium text-slate-900">{providerLabels[provider]}</p><p className="text-xs text-slate-500">{linked ? `Linked: ${linked}` : state?.detail || 'Not linked'}</p></div></div>{linked ? <span className="inline-flex items-center text-xs font-semibold text-emerald-700"><CheckCircle2 className="mr-1 h-4 w-4" /> Connected</span> : <Button variant="secondary" size="sm" disabled={providerLoading === provider} onClick={() => void linkProvider(provider)}>{providerLoading === provider ? <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Checking…</> : `Connect ${providerLabels[provider]}`}</Button>}</div>; })}</div></Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Screen41AccountSettings;

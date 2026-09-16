import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAppRouter, AuthenticatedLayout, Button } from '../components/shared';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { ApiError, apiErrorMessage, getMyProfile, updateMyProfile } from '../lib/api';
import { ErrorState, LoadingState } from '../components/AsyncState';
import ResearcherProfileForm, { ResearcherProfileFormValues } from '../components/ResearcherProfileForm';
import { normalizeResearchInterests } from '../lib/formatters';

const Screen47ProfileSetup = () => {
  const { navigate } = useAppRouter();
  const { user, updateUser } = useAuth();
  const { data: profile, loading, error, refetch } = useApi(getMyProfile, [], true);
  const [formError, setFormError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  if (!user) return null;
  if (loading) return <AuthenticatedLayout title="Set up your profile"><LoadingState label="Preparing your profile setup…" /></AuthenticatedLayout>;
  if (error || !profile) return <AuthenticatedLayout title="Set up your profile"><ErrorState message={error instanceof ApiError ? error.detail : 'Unable to load your profile setup.'} onRetry={() => void refetch()} /></AuthenticatedLayout>;

  const initialValues: ResearcherProfileFormValues = {
    avatar: user.avatar || '',
    department: user.department || '',
    faculty: user.faculty || '',
    bio: profile.bio || '',
    orcid: profile.orcid || '',
    github: profile.github || '',
    website: profile.website || '',
    research_interests: normalizeResearchInterests(profile.research_interests, user.email),
    is_available_for_mentoring: profile.is_available_for_mentoring || false,
  };

  const save = async (values: ResearcherProfileFormValues) => {
    setSaving(true);
    setFormError('');
    try {
      await updateUser({ avatar: values.avatar, department: values.department, faculty: values.faculty });
      await updateMyProfile({ bio: values.bio, orcid: values.orcid, github: values.github, website: values.website, research_interests: normalizeResearchInterests(values.research_interests, user.email), is_available_for_mentoring: values.is_available_for_mentoring });
      navigate('discover');
    } catch (nextError) {
      setFormError(apiErrorMessage(nextError, 'Unable to save your profile. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthenticatedLayout title="Set up your profile">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-xl bg-gradient-to-r from-[#00502F] to-[#003d24] p-6 text-white shadow-sm sm:p-8">
          <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" /><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-100">Welcome to the research network</p><h2 className="mt-2 text-2xl font-bold">Set up your researcher profile</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50">Make your profile useful to the OAU research community. You can update these details later from Account Settings.</p></div></div>
        </div>
        <ResearcherProfileForm user={user} initialValues={initialValues} onSubmit={save} submitting={saving} errorMessage={formError} submitLabel="Save profile" title="Your profile details" description="Add the details other researchers will use to understand your work and find common interests." />
        <div className="flex flex-col items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row"><p className="text-sm text-slate-500">Not ready to complete this yet? You can finish setup later.</p><Button variant="ghost" onClick={() => navigate('discover')}>Skip for now <ArrowRight className="ml-2 h-4 w-4" /></Button></div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Screen47ProfileSetup;

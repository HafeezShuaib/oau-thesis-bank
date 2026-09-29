import React from 'react';
import { ExternalLink, Link as LinkIcon, MessageSquare, Pencil } from 'lucide-react';
import { useAppRouter, Button, Card, Badge, AuthenticatedLayout } from '../components/shared';
import { useApi } from '../hooks/useApi';
import { ApiError, getMyProfile, getProfile } from '../lib/api';
import { EmptyState, ErrorState, LoadingState, UnavailableState } from '../components/AsyncState';
import { initials, parseResearchInterests, publicDisplayName } from '../lib/formatters';

const Screen30ResearcherProfile = () => {
  const { navigate, currentScreen, user } = useAppRouter();
  const userId = Number(currentScreen.params?.userId || currentScreen.params?.id || user?.id);
  const isOwnProfile = Boolean(user?.id && user.id === userId);
  const { data: profile, loading, error, refetch } = useApi(() => userId ? (isOwnProfile ? getMyProfile() : getProfile(userId)) : Promise.resolve(null), [userId, isOwnProfile], true);

  if (!userId) return <AuthenticatedLayout title="Researcher Profile"><EmptyState title="No researcher selected" description="Open a profile from the researcher directory." /></AuthenticatedLayout>;
  if (loading) return <AuthenticatedLayout title="Researcher Profile"><LoadingState label="Loading researcher profile…" /></AuthenticatedLayout>;
  if (error || !profile) {
    const message = error instanceof ApiError && error.status === 404 ? 'This user has not created a researcher profile yet.' : error instanceof ApiError ? error.detail : 'Unable to reach the backend.';
    return <AuthenticatedLayout title="Researcher Profile"><ErrorState message={message} onRetry={() => void refetch()} /></AuthenticatedLayout>;
  }

  const name = publicDisplayName(profile.user.name, profile.user.display_name);
  const interests = parseResearchInterests(profile.research_interests, profile.user.email);
  return (
    <AuthenticatedLayout title="Researcher Profile">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="h-32 bg-gradient-to-r from-[#00502F] to-[#003d24]" />
          <div className="relative px-6 pb-8 sm:px-8">
            <div className="absolute -top-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white text-3xl font-bold text-[#00502F] shadow-md">{profile.user.avatar || initials(name)}</div>
            <div className="mt-16 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div className="min-w-0 pl-0 md:pl-28">
                <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold text-slate-900">{name}</h1><Badge variant="green">{profile.user.role}</Badge></div>
                <p className="mt-1 text-slate-600">{profile.user.department || 'Department not provided'}{profile.user.faculty ? ` · ${profile.user.faculty}` : ''}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">{profile.github && <a href={`https://github.com/${profile.github}`} target="_blank" rel="noreferrer" className="flex items-center hover:text-[#00502F]"><LinkIcon className="mr-1 h-4 w-4" /> GitHub</a>}{profile.orcid && <a href={profile.orcid} target="_blank" rel="noreferrer" className="flex items-center hover:text-[#00502F]"><LinkIcon className="mr-1 h-4 w-4" /> ORCID</a>}{profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center hover:text-[#00502F]"><ExternalLink className="mr-1 h-4 w-4" /> Website</a>}</div>
              </div>
              <div className="flex flex-wrap gap-3 md:mt-0">{isOwnProfile && <Button variant="secondary" onClick={() => navigate('account-settings', { section: 'researcher' })}><Pencil className="mr-2 h-4 w-4" /> Edit profile</Button>}<Button onClick={() => navigate('messages', { userId })}><MessageSquare className="mr-2 h-4 w-4" /> Message</Button>{!isOwnProfile && profile.is_available_for_mentoring && <Button variant="secondary" onClick={() => navigate('mentorship-request', { userId })}>Request mentorship</Button>}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-8"><Card className="p-6"><h3 className="mb-3 text-lg font-bold text-slate-900">About</h3><p className="text-sm leading-relaxed text-slate-600">{profile.bio || 'This researcher has not added a biography yet.'}</p></Card><UnavailableState title="Published research is not linked to profiles yet" description="The connected backend exposes profiles, but it does not expose a researcher-owned thesis listing endpoint." /></div>
          <div className="w-full space-y-6 lg:w-80"><Card className="p-6"><h3 className="mb-4 font-bold text-slate-900">Research interests</h3><div className="flex flex-wrap gap-2">{interests.length > 0 ? interests.map((tag) => <Badge key={tag} variant="gray">{tag}</Badge>) : <span className="text-sm text-slate-500">No interests added yet.</span>}</div></Card><Card className="p-6"><h3 className="mb-3 font-bold text-slate-900">Mentorship</h3><p className="text-sm text-slate-600">{profile.is_available_for_mentoring ? 'Available for mentorship requests.' : 'Not currently accepting mentorship requests.'}</p></Card></div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Screen30ResearcherProfile;

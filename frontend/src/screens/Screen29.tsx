import React, { useMemo, useState } from 'react';
import { MessageSquare, Search as SearchIcon } from 'lucide-react';
import { useAppRouter, Button, Card, Badge, AuthenticatedLayout } from '../components/shared';
import { useApi } from '../hooks/useApi';
import { listProfiles, toArray } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import { initials, parseResearchInterests, publicDisplayName } from '../lib/formatters';

const Screen29Researchers = () => {
  const { navigate, user } = useAppRouter();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const { data, loading, error, refetch } = useApi(() => listProfiles({ role: role || undefined }), [role], true);
  const profiles = useMemo(() => toArray(data || [])
    .filter((profile) => profile.user.id !== user?.id)
    .filter((profile) => {
      const name = publicDisplayName(profile.user.name, profile.user.display_name);
      const interests = parseResearchInterests(profile.research_interests, profile.user.email).join(' ');
      return `${name} ${profile.user.department} ${interests}`.toLowerCase().includes(query.toLowerCase());
    }), [data, query, user?.id]);

  return (
    <AuthenticatedLayout title="Researcher Directory">
      <div className="mb-8 flex flex-col gap-6 md:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} type="text" placeholder="Search by name, department, or research interest…" aria-label="Search researchers" className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-4 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#00502F]" />
        </div>
        <select value={role} onChange={(event) => setRole(event.target.value)} aria-label="Filter by role" className="rounded-md border border-slate-300 bg-white p-2 text-sm">
          <option value="">All Roles</option>
          <option value="researcher">Researcher</option>
          <option value="faculty">Faculty</option>
        </select>
      </div>
      {loading && <LoadingState label="Loading researcher profiles…" />}
      {error && <ErrorState onRetry={() => void refetch()} />}
      {!loading && !error && profiles.length === 0 && <EmptyState title="No researcher profiles found" description="Profiles will appear when researchers create a public profile." />}
      {!loading && !error && profiles.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => {
            const name = publicDisplayName(profile.user.name, profile.user.display_name);
            const interests = parseResearchInterests(profile.research_interests, profile.user.email).slice(0, 4);
            return (
              <Card key={profile.user.id} hover className="p-6 text-center" onClick={() => navigate('researcher-profile', { userId: profile.user.id })}>
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#00502F] text-2xl font-bold text-white">{profile.user.avatar || initials(name)}</div>
                <h3 className="text-lg font-bold text-slate-900">{name}</h3>
                <p className="mb-1 text-sm font-medium text-[#D4AF37]">{profile.user.role}</p>
                <p className="mb-4 text-xs text-slate-500">{profile.user.department || 'Department not provided'}</p>
                <div className="mb-6 flex flex-wrap justify-center gap-1">
                  {interests.map((interest) => <Badge key={interest} variant="gray" className="px-2 py-1 text-xs">{interest}</Badge>)}
                </div>
                <Button variant="secondary" className="w-full text-sm" onClick={(event) => { event.stopPropagation(); navigate('messages', { userId: profile.user.id }); }}><MessageSquare className="mr-2 h-4 w-4" /> Message</Button>
              </Card>
            );
          })}
        </div>
      )}
    </AuthenticatedLayout>
  );
};

export default Screen29Researchers;

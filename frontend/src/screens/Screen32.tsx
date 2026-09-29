import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Inbox, Search, Send, Users, X } from 'lucide-react';
import { useAppRouter, Button, Card, Badge, AuthenticatedLayout } from '../components/shared';
import { useApi } from '../hooks/useApi';
import { apiErrorMessage, listMentorshipRequests, listOpportunities, listProfiles, reviewMentorshipRequest, toArray } from '../lib/api';
import { EmptyState, ErrorState, LoadingState, SuccessState } from '../components/AsyncState';
import { formatDate, formatStatus, initials, publicDisplayName } from '../lib/formatters';
import type { MentorshipRequest } from '../types/api';

type CollaborationTab = 'open' | 'mentors' | 'inbox' | 'sent';

const tabs: Array<{ value: CollaborationTab; label: string; icon: React.ElementType }> = [
  { value: 'open', label: 'Open opportunities', icon: Search },
  { value: 'mentors', label: 'Find mentors', icon: Users },
  { value: 'inbox', label: 'Incoming requests', icon: Inbox },
  { value: 'sent', label: 'My requests', icon: Send },
];

const tabFromParams = (value: unknown): CollaborationTab => (
  tabs.some((tab) => tab.value === value) ? value as CollaborationTab : 'open'
);

const RequestCard = ({ request, tab, user, workingId, onReview }: {
  request: MentorshipRequest;
  tab: 'inbox' | 'sent';
  user: { id: number } | null;
  workingId: number | null;
  onReview: (id: number, status: 'approved' | 'denied') => void;
}) => {
  const person = tab === 'inbox' ? request.mentee : request.mentor;
  const name = publicDisplayName(person?.name, person?.display_name);
  const canReview = tab === 'inbox' && request.status === 'pending' && request.mentor?.id === user?.id;
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00502F] text-sm font-bold text-white">{person?.avatar || initials(name)}</div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{name}</h3><Badge variant={request.status === 'approved' ? 'green' : request.status === 'denied' ? 'gray' : 'gold'}>{formatStatus(request.status)}</Badge></div>
            <p className="mt-1 text-xs text-slate-500">{tab === 'inbox' ? 'Requested your mentorship' : 'Mentorship request sent'} · {formatDate(request.created_at)}</p>
            <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">{request.message || 'No message supplied.'}</p>
          </div>
        </div>
        {canReview && <div className="flex shrink-0 gap-2 md:pt-1"><Button variant="secondary" disabled={workingId === request.id} onClick={() => onReview(request.id, 'denied')}><X className="mr-1 h-4 w-4" /> Deny</Button><Button disabled={workingId === request.id} onClick={() => onReview(request.id, 'approved')}><Check className="mr-1 h-4 w-4" /> Approve</Button></div>}
      </div>
    </Card>
  );
};

const Screen32CollaborationHub = () => {
  const { navigate, currentScreen, user } = useAppRouter();
  const [tab, setTab] = useState<CollaborationTab>(() => tabFromParams(currentScreen.params?.tab));
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackKind, setFeedbackKind] = useState<'success' | 'error'>('success');
  const tabRefs = useRef<Record<CollaborationTab, HTMLButtonElement | null>>({ open: null, mentors: null, inbox: null, sent: null });

  useEffect(() => {
    const nextTab = tabFromParams(currentScreen.params?.tab);
    if (nextTab !== tab) setTab(nextTab);
  }, [currentScreen.params?.tab, tab]);

  const opportunitiesApi = useApi(() => listOpportunities('open'), [], tab === 'open');
  const mentorsApi = useApi(() => listProfiles({ mentoring: true }), [], tab === 'mentors');
  const inboxApi = useApi(() => listMentorshipRequests('inbox'), [], tab === 'inbox');
  const sentApi = useApi(() => listMentorshipRequests('sent'), [], tab === 'sent');
  const activeApi = tab === 'open' ? opportunitiesApi : tab === 'mentors' ? mentorsApi : tab === 'inbox' ? inboxApi : sentApi;
  const opportunities = useMemo(() => toArray(opportunitiesApi.data || []), [opportunitiesApi.data]);
  const mentors = useMemo(() => toArray(mentorsApi.data || []).filter((profile) => profile.user.id !== user?.id), [mentorsApi.data, user?.id]);
  const requests = useMemo(() => toArray((tab === 'inbox' ? inboxApi.data : sentApi.data) || []), [tab, inboxApi.data, sentApi.data]);

  const selectTab = (nextTab: CollaborationTab, focus = false) => {
    setTab(nextTab);
    setFeedback('');
    navigate('collaboration-hub', { tab: nextTab });
    if (focus) window.requestAnimationFrame(() => tabRefs.current[nextTab]?.focus());
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex !== currentIndex) {
      event.preventDefault();
      selectTab(tabs[nextIndex].value, true);
    }
  };

  const review = async (id: number, status: 'approved' | 'denied') => {
    setWorkingId(id); setFeedback('');
    try {
      await reviewMentorshipRequest(id, status);
      setFeedbackKind('success');
      setFeedback(`Request ${status}.`);
      await inboxApi.refetch();
    } catch (error) {
      setFeedbackKind('error');
      setFeedback(apiErrorMessage(error, 'Unable to update this mentorship request. Please try again.'));
    } finally {
      setWorkingId(null);
    }
  };

  const panelId = 'collaboration-panel';
  return (
    <AuthenticatedLayout title="Collaboration Hub">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col items-start justify-between gap-5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-lg md:flex-row md:items-center"><div><h2 className="mb-2 text-2xl font-bold">Connect and create impact</h2><p className="text-slate-300">Find co-authors, request datasets, or seek mentorship from OAU researchers.</p></div><Button variant="secondary" onClick={() => navigate('collab-opportunity', { create: true })}>Post opportunity</Button></div>
        <div role="tablist" aria-label="Collaboration views" className="flex flex-wrap gap-6 border-b border-slate-200">
          {tabs.map(({ value, label, icon: Icon }, index) => <button key={value} ref={(element) => { tabRefs.current[value] = element; }} id={`collaboration-tab-${value}`} role="tab" aria-selected={tab === value} aria-controls="collaboration-panel" tabIndex={tab === value ? 0 : -1} onClick={() => selectTab(value)} onKeyDown={(event) => handleTabKeyDown(event, index)} className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#00502F] focus-visible:ring-offset-2 ${tab === value ? 'border-[#00502F] text-[#00502F]' : 'border-transparent text-slate-400 hover:text-slate-700'}`}><Icon className="h-4 w-4" /> {label}</button>)}
        </div>
        <div id={panelId} role="tabpanel" aria-labelledby={`collaboration-tab-${tab}`} tabIndex={0}>
          {activeApi.loading && <LoadingState label={tab === 'open' ? 'Loading opportunities…' : tab === 'mentors' ? 'Loading available mentors…' : tab === 'inbox' ? 'Loading incoming requests…' : 'Loading your requests…'} />}
          {activeApi.error && <ErrorState onRetry={() => void activeApi.refetch()} />}
          {feedback && (feedbackKind === 'success' ? <SuccessState title={feedback} /> : <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{feedback}</p>)}
          {!activeApi.loading && !activeApi.error && tab === 'open' && opportunities.length === 0 && <EmptyState title="No open opportunities" description="Create an opportunity to invite other researchers to collaborate." />}
          {!activeApi.loading && !activeApi.error && tab === 'open' && opportunities.length > 0 && <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{opportunities.map((opportunity) => <Card key={opportunity.id} hover className="p-6" onClick={() => navigate('collab-opportunity', { opportunityId: opportunity.id })}><div className="mb-3 flex items-start justify-between gap-3"><Badge variant="gold">Open opportunity</Badge><span className="text-xs text-slate-400">{formatDate(opportunity.created_at)}</span></div><h3 className="mb-2 text-lg font-bold text-slate-900">{opportunity.title}</h3><p className="mb-4 text-sm text-slate-500">Posted by {publicDisplayName(opportunity.owner.name, opportunity.owner.display_name)}</p><p className="mb-4 line-clamp-3 text-sm text-slate-600">{opportunity.description}</p><div className="flex flex-wrap gap-2">{opportunity.skills.map((skill) => <Badge key={skill} variant="gray">{skill}</Badge>)}</div></Card>)}</div>}
          {!activeApi.loading && !activeApi.error && tab === 'mentors' && mentors.length === 0 && <EmptyState title="No mentors available" description="Researchers and faculty who accept mentorship requests will appear here." />}
          {!activeApi.loading && !activeApi.error && tab === 'mentors' && mentors.length > 0 && <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{mentors.map((profile) => { const name = publicDisplayName(profile.user.name, profile.user.display_name); return <Card key={profile.user.id} className="p-6"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00502F] text-sm font-bold text-white">{profile.user.avatar || initials(name)}</div><div className="min-w-0"><h3 className="truncate font-semibold text-slate-900">{name}</h3><p className="text-xs text-slate-500">{profile.user.role} · {profile.user.department || 'Department not provided'}</p></div></div><p className="mt-4 line-clamp-3 text-sm text-slate-600">{profile.bio || 'This mentor has not added a biography yet.'}</p><Button variant="secondary" className="mt-5 w-full" onClick={() => navigate('mentorship-request', { userId: profile.user.id })}>Request mentorship</Button></Card>; })}</div>}
          {!activeApi.loading && !activeApi.error && (tab === 'inbox' || tab === 'sent') && requests.length === 0 && <EmptyState title={tab === 'inbox' ? 'No incoming requests' : 'No sent requests'} description={tab === 'inbox' ? 'Mentorship requests sent to you will appear here.' : 'Requests you send from a researcher profile will appear here.'} icon={tab === 'inbox' ? Inbox : Send} />}
          {!activeApi.loading && !activeApi.error && (tab === 'inbox' || tab === 'sent') && requests.length > 0 && <div className="space-y-4">{requests.map((request) => <RequestCard key={request.id} request={request} tab={tab} user={user} workingId={workingId} onReview={(id, status) => void review(id, status)} />)}</div>}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Screen32CollaborationHub;

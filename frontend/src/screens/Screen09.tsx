import React, { useState } from 'react';
import { BarChart2, Bookmark, BookOpen, Cpu, FileText, GitBranch } from 'lucide-react';
import { useAppRouter, Button, PublicOrAuthenticatedLayout, Card, Badge } from '../components/shared';
import { useApi } from '../hooks/useApi';
import { apiErrorMessage, createAccessRequest, getThesis, saveThesis, unsaveThesis } from '../lib/api';
import { ApiError } from '../lib/api';
import { EmptyState, ErrorState, LoadingState, SuccessState } from '../components/AsyncState';
import { formatDate, formatStatus } from '../lib/formatters';

const Screen09ThesisDetail = () => {
  const { navigate, currentScreen, user } = useAppRouter();
  const thesisId = Number(currentScreen.params?.thesisId || currentScreen.params?.id);
  const { data: thesis, loading, error, refetch } = useApi(() => thesisId ? getThesis(thesisId) : Promise.resolve(null), [thesisId], true);
  const [saving, setSaving] = useState(false);
  const [accessMessage, setAccessMessage] = useState('');
  const [accessFeedback, setAccessFeedback] = useState('');
  const [requestingAccess, setRequestingAccess] = useState(false);

  const save = async () => {
    if (!thesis || !user) return;
    setSaving(true);
    try { thesis.saved ? await unsaveThesis(thesis.id) : await saveThesis(thesis.id); await refetch(); } finally { setSaving(false); }
  };

  const requestAccess = async () => {
    if (!thesis) return;
    if (!user) { navigate('login'); return; }
    setRequestingAccess(true);
    setAccessFeedback('');
    try {
      await createAccessRequest({ thesis: thesis.id, message: accessMessage.trim() });
      setAccessFeedback('Access request sent. The thesis owner will review it.');
      setAccessMessage('');
    } catch (nextError) {
      setAccessFeedback(apiErrorMessage(nextError, 'Unable to request access right now.'));
    } finally {
      setRequestingAccess(false);
    }
  };

  if (!thesisId) return <PublicOrAuthenticatedLayout title="Thesis Details"><EmptyState title="No thesis selected" description="Open a thesis from the repository to see its full details." /></PublicOrAuthenticatedLayout>;
  if (loading) return <PublicOrAuthenticatedLayout title="Thesis Details"><LoadingState label="Loading thesis details…" /></PublicOrAuthenticatedLayout>;
  if (error || !thesis) {
    const forbidden = error instanceof ApiError && error.status === 403;
    return <PublicOrAuthenticatedLayout title="Thesis Details"><div className="mx-auto max-w-2xl space-y-6"><ErrorState message={forbidden ? 'This thesis is restricted. You can sign in to request access from its owner.' : apiErrorMessage(error, 'Unable to load this thesis.')} onRetry={() => void refetch()} />{forbidden && <Card className="p-6"><h2 className="text-lg font-bold text-slate-900">Request access</h2><p className="mt-1 text-sm text-slate-500">Tell the owner why you need to read this research.</p><textarea value={accessMessage} onChange={(event) => setAccessMessage(event.target.value)} className="mt-4 h-28 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#00502F] focus:outline-none focus:ring-1 focus:ring-[#00502F]" placeholder="Optional message" />{accessFeedback && (accessFeedback.startsWith('Access request') ? <SuccessState title={accessFeedback} /> : <p className="mt-3 text-sm text-red-600" role="status">{accessFeedback}</p>)}<Button className="mt-4" disabled={requestingAccess} onClick={() => void requestAccess()}>{user ? (requestingAccess ? 'Sending…' : 'Request access') : 'Sign in to request access'}</Button></Card>}</div></PublicOrAuthenticatedLayout>;
  }

  return <PublicOrAuthenticatedLayout title="Thesis Details"><div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row"><div className="min-w-0 flex-1 space-y-8"><div><div className="mb-4 flex flex-wrap items-center gap-3"><Badge variant={thesis.status === 'published' ? 'green' : 'gray'}>{formatStatus(thesis.status)} {thesis.year || ''}</Badge><span className="flex items-center text-sm text-slate-500"><FileText className="mr-1 h-4 w-4" /> PDF document</span></div><h1 className="mb-4 text-3xl font-bold leading-tight text-slate-900">{thesis.title}</h1><p className="text-lg text-slate-700">by <button className="font-medium text-[#00502F] hover:underline" onClick={() => thesis.owner && navigate('researcher-profile', { userId: thesis.owner })}>{thesis.author}</button></p></div><div className="flex flex-wrap gap-3"><Button onClick={() => navigate('pdf-reader', { thesisId: thesis.id })}><BookOpen className="mr-2 h-4 w-4" /> Read Document</Button><Button variant="secondary" onClick={() => navigate('thesis-ai', { thesisId: thesis.id })}><Cpu className="mr-2 h-4 w-4" /> AI Summary</Button><Button variant="ghost" disabled={saving || thesis.owner === user?.id} onClick={() => user ? void save() : navigate('login')}><Bookmark className="mr-2 h-4 w-4" /> {user ? (thesis.saved ? 'Remove saved' : 'Save') : 'Sign in to save'}</Button></div><div><h3 className="border-b border-slate-200 pb-2 text-xl font-semibold">Abstract</h3><p className="mt-4 leading-relaxed text-slate-600">{thesis.abstract || 'No abstract provided.'}</p></div></div><div className="w-full space-y-6 lg:w-80"><Card className="border-none bg-slate-50 p-6"><h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Metadata</h4><div className="space-y-4 text-sm"><div><span className="mb-1 block text-slate-500">Department</span><span className="font-medium text-slate-900">{thesis.department || '—'}</span></div><div><span className="mb-1 block text-slate-500">Faculty</span><span className="font-medium text-slate-900">{thesis.faculty || '—'}</span></div><div><span className="mb-1 block text-slate-500">Supervisor</span><span className="font-medium text-[#00502F]">{thesis.supervisor || '—'}</span></div><div><span className="mb-1 block text-slate-500">Published</span><span className="font-medium text-slate-900">{formatDate(thesis.created_at)}</span></div><div><span className="mb-1 block text-slate-500">Access</span><span className="font-medium text-slate-900">{formatStatus(thesis.access_policy)}</span></div></div></Card><Card className="p-6"><h4 className="mb-4 flex items-center text-sm font-bold text-slate-900"><GitBranch className="mr-2 h-4 w-4 text-[#D4AF37]" /> Impact Network</h4><div className="space-y-3"><button onClick={() => navigate('thesis-discussion', { thesisId: thesis.id })} className="flex w-full items-center justify-between rounded p-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-[#00502F]">Discussions <span className="text-xs text-slate-400">Not connected</span></button><button onClick={() => navigate('research-lineage', { thesisId: thesis.id })} className="flex w-full items-center justify-between rounded p-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-[#00502F]">View Lineage <GitBranch className="h-4 w-4" /></button><button onClick={() => navigate('thesis-analytics', { thesisId: thesis.id })} className="flex w-full items-center justify-between rounded p-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-[#00502F]">Analytics <BarChart2 className="h-4 w-4" /></button></div></Card></div></div></PublicOrAuthenticatedLayout>;
};

export default Screen09ThesisDetail;

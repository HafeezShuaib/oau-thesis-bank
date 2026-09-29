import React, { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Share2, Trash2 } from 'lucide-react';
import { useAppRouter, Button, Input, Card, Badge, AuthenticatedLayout } from '../components/shared';
import { useApi } from '../hooks/useApi';
import { apiErrorMessage, createOpportunity, deleteOpportunity, getOpportunity, updateOpportunity } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import { formatDate } from '../lib/formatters';

const Screen33CollabOpportunity = () => {
  const { navigate, currentScreen, user } = useAppRouter();
  const opportunityId = Number(currentScreen.params?.opportunityId || currentScreen.params?.id);
  const creating = currentScreen.params?.create === 'true' || currentScreen.params?.create === true;
  const editing = currentScreen.params?.edit === 'true' || currentScreen.params?.edit === true;
  const { data: opportunity, loading, error, refetch } = useApi(() => opportunityId ? getOpportunity(opportunityId) : Promise.resolve(null), [opportunityId], !creating);
  const [form, setForm] = useState({ title: '', description: '', skills: '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (opportunity) setForm({ title: opportunity.title, description: opportunity.description, skills: opportunity.skills.join(', ') });
  }, [opportunity]);

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) { setMessage('Add a title and description before publishing.'); return; }
    setSaving(true);
    setMessage('');
    try {
      const payload = { title: form.title.trim(), description: form.description.trim(), skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean) };
      const result = editing && opportunity ? await updateOpportunity(opportunity.id, payload) : await createOpportunity(payload);
      navigate('collab-opportunity', { opportunityId: result.id });
    } catch (nextError) {
      setMessage(apiErrorMessage(nextError, editing ? 'Unable to save opportunity.' : 'Unable to create opportunity.'));
    } finally {
      setSaving(false);
    }
  };

  const close = async () => {
    if (!opportunity || !window.confirm('Close this opportunity to new collaborators?')) return;
    setSaving(true);
    setMessage('');
    try { await updateOpportunity(opportunity.id, { status: 'closed' }); await refetch(); }
    catch (nextError) { setMessage(apiErrorMessage(nextError, 'Unable to close this opportunity.')); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!opportunity || !window.confirm('Delete this opportunity? This cannot be undone.')) return;
    setSaving(true);
    try { await deleteOpportunity(opportunity.id); navigate('collaboration-hub'); }
    catch (nextError) { setMessage(apiErrorMessage(nextError, 'Unable to delete this opportunity.')); setSaving(false); }
  };

  if (creating || (editing && opportunity)) {
    return <AuthenticatedLayout title={editing ? 'Edit Opportunity' : 'Post Opportunity'}>
      <div className="mx-auto max-w-3xl">
        <button className="mb-6 flex items-center text-sm text-slate-500 hover:text-slate-800" onClick={() => navigate('collaboration-hub')}><ArrowLeft className="mr-2 h-4 w-4" /> Back to hub</button>
        <Card className="p-8">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">{editing ? 'Edit collaboration opportunity' : 'Post a collaboration opportunity'}</h2>
          <div className="space-y-5">
            <Input label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="What do you want to work on?" />
            <div className="flex flex-col space-y-1.5"><label htmlFor="opportunity-description" className="text-sm font-medium text-slate-700">Description</label><textarea id="opportunity-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="h-36 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#00502F] focus:outline-none focus:ring-1 focus:ring-[#00502F]" placeholder="Describe the collaboration and expectations." /></div>
            <Input label="Skills (comma separated)" value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} placeholder="NLP, datasets, annotation" />
            {message && <p className="text-sm text-red-600" role="alert">{message}</p>}
            <div className="flex justify-end"><Button disabled={saving} onClick={() => void submit()}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Publish opportunity'}</Button></div>
          </div>
        </Card>
      </div>
    </AuthenticatedLayout>;
  }

  if (!opportunityId) return <AuthenticatedLayout title="Opportunity Details"><EmptyState title="No opportunity selected" description="Open an opportunity from the collaboration hub or create a new one." /></AuthenticatedLayout>;
  if (loading) return <AuthenticatedLayout title="Opportunity Details"><LoadingState label="Loading opportunity…" /></AuthenticatedLayout>;
  if (error || !opportunity) return <AuthenticatedLayout title="Opportunity Details"><ErrorState message={apiErrorMessage(error, 'Unable to load this opportunity.')} onRetry={() => void refetch()} /></AuthenticatedLayout>;

  const isOwner = opportunity.owner.id === user?.id || user?.role === 'admin';
  const share = () => { if (navigator.clipboard) void navigator.clipboard.writeText(window.location.href); };

  return <AuthenticatedLayout title="Opportunity Details">
    <div className="mx-auto max-w-3xl">
      <button className="mb-6 flex items-center text-sm text-slate-500 hover:text-slate-800" onClick={() => navigate('collaboration-hub')}><ArrowLeft className="mr-2 h-4 w-4" /> Back to hub</button>
      <Card className="p-8">
        <div className="mb-4 flex items-center gap-3"><Badge variant={opportunity.status === 'open' ? 'gold' : 'gray'}>{opportunity.status}</Badge><span className="text-sm text-slate-500">Posted {formatDate(opportunity.created_at)}</span></div>
        <h1 className="mb-4 text-2xl font-bold text-slate-900">{opportunity.title}</h1>
        <button className="mb-8 flex w-full items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-left hover:border-emerald-200" onClick={() => navigate('researcher-profile', { userId: opportunity.owner.id })}><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00502F] font-bold text-white">{opportunity.owner.avatar}</div><div><p className="text-sm font-semibold text-slate-900">{opportunity.owner.name || opportunity.owner.display_name || opportunity.owner.email}</p><p className="text-xs text-slate-500">{opportunity.owner.role} · {opportunity.owner.department}</p></div></button>
        <p className="mb-8 whitespace-pre-wrap text-sm leading-7 text-slate-700">{opportunity.description}</p>
        <div className="mb-8 flex flex-wrap gap-2">{opportunity.skills.map((skill) => <Badge key={skill} variant="gray">{skill}</Badge>)}</div>
        {message && <p className="mb-4 text-sm text-red-600" role="alert">{message}</p>}
        <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
          {isOwner ? <>
            <Button variant="secondary" onClick={() => navigate('collab-opportunity', { opportunityId: opportunity.id, edit: true })}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
            {opportunity.status === 'open' && <Button variant="ghost" disabled={saving} onClick={() => void close()}>Close opportunity</Button>}
            <Button variant="danger" disabled={saving} onClick={() => void remove()}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
          </> : <Button onClick={() => navigate('messages', { userId: opportunity.owner.id })}>Apply / message</Button>}
          <Button variant="ghost" onClick={share}><Share2 className="mr-2 h-4 w-4" /> Share</Button>
        </div>
      </Card>
    </div>
  </AuthenticatedLayout>;
};

export default Screen33CollabOpportunity;

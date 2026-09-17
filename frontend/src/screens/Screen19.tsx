import React, { useState } from 'react';
import { Lock, PlusCircle, Trash2, Unlock } from 'lucide-react';
import { useAppRouter, Button, Card, Badge, AuthenticatedLayout } from '../components/shared';
import { useApi } from '../hooks/useApi';
import { apiErrorMessage, deleteThesis, listMine } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import { formatDate, formatStatus } from '../lib/formatters';

const Screen19MyProjects = () => {
  const { navigate } = useAppRouter();
  const { data, loading, error, refetch } = useApi(listMine, [], true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');

  const remove = async (id: number, title: string) => {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setDeletingId(id);
    setActionError('');
    try { await deleteThesis(id); await refetch(); } catch (nextError) { setActionError(apiErrorMessage(nextError, 'Unable to delete this project.')); } finally { setDeletingId(null); }
  };

  return <AuthenticatedLayout title="My Research Projects"><div className="mb-6 flex justify-end"><Button onClick={() => navigate('upload')}><PlusCircle className="mr-2 h-4 w-4" /> Upload new</Button></div>{actionError && <p className="mb-4 text-sm text-red-600" role="alert">{actionError}</p>}{loading && <LoadingState label="Loading your projects…" />}{error && <ErrorState onRetry={() => void refetch()} />}{!loading && !error && (!data || data.length === 0) && <EmptyState title="No projects yet" description="Upload a thesis to start building your research workspace." />}{!loading && !error && data && data.length > 0 && <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr>{['Project title', 'Status', 'Access', 'Date', 'Actions'].map((heading) => <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-200 bg-white">{data.map((thesis) => <tr key={thesis.id} className="hover:bg-slate-50"><td className="px-6 py-4"><button onClick={() => navigate('thesis-detail', { thesisId: thesis.id })} className="line-clamp-1 text-left text-sm font-medium text-slate-900 hover:text-[#00502F]">{thesis.title}</button><div className="text-xs text-slate-500">{thesis.department || 'Department not provided'}</div></td><td className="whitespace-nowrap px-6 py-4"><Badge variant={thesis.status === 'published' ? 'green' : 'gray'}>{formatStatus(thesis.status)}</Badge><div className="mt-1 text-xs text-slate-400">{formatStatus(thesis.processing_status)}</div></td><td className="flex items-center whitespace-nowrap px-6 py-4 text-sm text-slate-500">{thesis.access_policy === 'public' ? <Unlock className="mr-1 h-3 w-3" /> : <Lock className="mr-1 h-3 w-3" />}{formatStatus(thesis.access_policy)}</td><td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{formatDate(thesis.created_at)}</td><td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium"><button onClick={() => navigate('edit-thesis', { thesisId: thesis.id })} className="mr-4 text-[#00502F] hover:text-[#003d24]">Edit</button><button disabled={deletingId === thesis.id} onClick={() => void remove(thesis.id, thesis.title)} className="inline-flex items-center text-red-600 hover:text-red-700 disabled:opacity-50"><Trash2 className="mr-1 h-3.5 w-3.5" /> {deletingId === thesis.id ? 'Deleting…' : 'Delete'}</button></td></tr>)}</tbody></table></div></Card>}</AuthenticatedLayout>;
};

export default Screen19MyProjects;

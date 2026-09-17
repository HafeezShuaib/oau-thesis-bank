import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useAppRouter, AuthenticatedLayout, ThesisCard, Button } from '../components/shared';
import { useApi } from '../hooks/useApi';
import { listSaved, unsaveThesis } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';

const Screen08Saved = () => {
  const { navigate } = useAppRouter();
  const { data, loading, error, refetch } = useApi(listSaved, [], true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const theses = data || [];
  const remove = async (id: number) => { setRemovingId(id); try { await unsaveThesis(id); await refetch(); } finally { setRemovingId(null); } };
  return <AuthenticatedLayout title="Saved Research"><div className="mb-6 flex space-x-4 border-b border-slate-200"><button className="pb-3 border-b-2 border-[#00502F] text-[#00502F] font-medium text-sm">All Saved</button><button className="pb-3 border-b-2 border-transparent text-slate-400 font-medium text-sm" disabled>Reading List</button><button className="pb-3 border-b-2 border-transparent text-slate-400 font-medium text-sm" disabled>Literature Review</button></div>{loading && <LoadingState label="Loading saved research…" />}{error && <ErrorState onRetry={() => void refetch()} />}{!loading && !error && theses.length === 0 && <EmptyState title="No saved research yet" description="Save a public thesis from search results or its detail page to build your reading list." icon={Bookmark} />}{!loading && !error && theses.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{theses.map((thesis) => <div key={thesis.id} className="relative group"><ThesisCard thesis={thesis} onClick={() => navigate('thesis-detail', { thesisId: thesis.id })} /><Button variant="ghost" disabled={removingId === thesis.id} className="absolute top-4 right-4 p-1.5 bg-white rounded-full shadow-sm text-red-500 opacity-0 group-hover:opacity-100" onClick={() => void remove(thesis.id)}><Bookmark className="w-4 h-4 fill-current" /></Button></div>)}</div>}</AuthenticatedLayout>;
};
export default Screen08Saved;

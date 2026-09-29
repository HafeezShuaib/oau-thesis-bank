import React, { useState } from 'react';
import { useAppRouter, Button, Card, Badge, AuthenticatedLayout } from '../components/shared';
import { useApi } from '../hooks/useApi';
import { apiErrorMessage, listAccessRequests, reviewAccessRequest, toArray } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import { formatDate, formatStatus } from '../lib/formatters';

const Screen21AccessRequests = () => {
  const { data, loading, error, refetch } = useApi(listAccessRequests, [], true);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');
  const requests = toArray(data || []);
  const review = async (id: number, status: 'approved' | 'denied') => { setWorkingId(id); setActionError(''); try { await reviewAccessRequest(id, status); await refetch(); } catch (nextError) { setActionError(apiErrorMessage(nextError, 'Unable to update this access request.')); } finally { setWorkingId(null); } };
  return <AuthenticatedLayout title="Access Requests"><div className="mb-6 max-w-4xl"><p className="text-slate-600">Manage requests from users asking to view restricted or private research.</p></div>{actionError && <p className="mb-4 max-w-4xl text-sm text-red-600" role="alert">{actionError}</p>}{loading && <LoadingState label="Loading access requests…" />}{error && <ErrorState onRetry={() => void refetch()} />}{!loading && !error && requests.length === 0 && <EmptyState title="No access requests" description="Requests for your restricted research will appear here." />}{!loading && !error && requests.length > 0 && <div className="max-w-4xl space-y-4">{requests.map((request) => <Card key={request.id} className="flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center"><div><div className="mb-1 flex items-center space-x-2"><h4 className="font-semibold text-slate-900">{request.requester}</h4><Badge variant={request.status === 'approved' ? 'green' : request.status === 'denied' ? 'gray' : 'gold'}>{formatStatus(request.status)}</Badge></div><p className="mb-2 text-sm font-medium text-[#00502F]">Requesting: {request.thesis_title}</p><p className="rounded border border-slate-100 bg-slate-50 p-2 text-sm italic text-slate-600">{request.message || 'No message supplied.'}</p><p className="mt-2 text-xs text-slate-400">{formatDate(request.created_at)}</p></div>{request.status === 'pending' && <div className="flex w-full space-x-2 md:w-auto"><Button variant="ghost" disabled={workingId === request.id} className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 md:flex-none" onClick={() => void review(request.id, 'denied')}>Reject</Button><Button disabled={workingId === request.id} className="flex-1 md:flex-none" onClick={() => void review(request.id, 'approved')}>Approve access</Button></div>}</Card>)}</div>}</AuthenticatedLayout>;
};

export default Screen21AccessRequests;

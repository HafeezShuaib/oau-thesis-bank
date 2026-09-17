import React, { useEffect, useRef } from 'react';
import { CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { useAppRouter, Button, Card, AuthenticatedLayout, UploadWizardNav, Badge } from '../components/shared';
import { useUpload } from '../context/UploadContext';
import { useApi } from '../hooks/useApi';
import { apiErrorMessage, getThesis } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import { formatStatus } from '../lib/formatters';

const ACTIVE_PROCESSING_STATES = new Set(['queued', 'processing']);
const MAX_POLLS = 20;

const Screen18PublishConfirmation = () => {
  const { navigate, currentScreen } = useAppRouter();
  const { submittedThesisId } = useUpload();
  const id = Number(currentScreen.params?.thesisId || submittedThesisId);
  const { data: thesis, loading, error, refetch } = useApi(() => id ? getThesis(id) : Promise.resolve(null), [id], true);
  const polls = useRef(0);

  useEffect(() => { polls.current = 0; }, [id]);
  useEffect(() => {
    if (!thesis || loading || !ACTIVE_PROCESSING_STATES.has(thesis.processing_status) || polls.current >= MAX_POLLS) return undefined;
    const timer = window.setTimeout(() => { polls.current += 1; void refetch(); }, 3000);
    return () => window.clearTimeout(timer);
  }, [thesis?.processing_status, loading, refetch]);

  if (!id) return <AuthenticatedLayout title="Ready to Publish"><EmptyState title="No submitted thesis" description="Submit a thesis through the upload flow before opening this screen." /></AuthenticatedLayout>;
  if (loading && !thesis) return <AuthenticatedLayout title="Ready to Publish"><LoadingState label="Confirming your submission…" /></AuthenticatedLayout>;
  if (error || !thesis) return <AuthenticatedLayout title="Ready to Publish"><ErrorState message={apiErrorMessage(error, 'Unable to confirm your submission.')} onRetry={() => void refetch()} /></AuthenticatedLayout>;
  const processing = ACTIVE_PROCESSING_STATES.has(thesis.processing_status);
  return <AuthenticatedLayout title="Ready to Publish"><div className="mx-auto mt-10 max-w-2xl text-center"><UploadWizardNav step={5} /><div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${processing ? 'bg-amber-100' : 'bg-emerald-100'}`}>{processing ? <Loader2 className="h-10 w-10 animate-spin text-amber-600" /> : <CheckCircle className="h-10 w-10 text-emerald-600" />}</div><Badge variant={thesis.status === 'published' ? 'green' : 'gray'}>{formatStatus(thesis.status)}</Badge><h2 className="mb-4 mt-4 text-3xl font-bold text-slate-900">{processing ? 'Your research is processing' : 'Your research was submitted'}</h2><p className="mb-8 text-lg text-slate-600">{thesis.title}</p><Card className="mb-8 bg-slate-50 p-6 text-left"><div className="flex items-center justify-between gap-4"><h4 className="font-medium text-slate-900">Backend status</h4><button onClick={() => void refetch()} className="inline-flex items-center text-xs font-semibold text-[#00502F] hover:text-[#003d24]"><RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh</button></div><p className="mt-2 text-sm text-slate-600">Processing status: <strong>{formatStatus(thesis.processing_status)}</strong>. The repository controls when this record becomes publicly searchable.</p>{polls.current >= MAX_POLLS && processing && <p className="mt-3 text-xs text-amber-700">Automatic checks paused. Refresh when you want to check again.</p>}</Card><div className="flex flex-col justify-center gap-3 sm:flex-row"><Button variant="secondary" onClick={() => navigate('my-projects')}>View my projects</Button><Button onClick={() => navigate('thesis-detail', { thesisId: thesis.id })}>Go to thesis page</Button></div></div></AuthenticatedLayout>;
};

export default Screen18PublishConfirmation;

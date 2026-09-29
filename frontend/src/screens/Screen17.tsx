import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useAppRouter, AuthenticatedLayout, Card, Button, UploadWizardNav } from '../components/shared';
import { useUpload } from '../context/UploadContext';
import { apiErrorMessage, createThesis } from '../lib/api';

const Screen17AIProcessing = () => {
  const { navigate } = useAppRouter();
  const { file, draft, setSubmittedThesisId } = useUpload();
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!file || submitted) return;
    const form = new FormData();
    if (draft.title) form.append('title', draft.title);
    if (draft.author) form.append('author', draft.author);
    if (draft.department) form.append('department', draft.department);
    if (draft.faculty) form.append('faculty', draft.faculty);
    if (draft.supervisor) form.append('supervisor', draft.supervisor);
    if (draft.abstract) form.append('abstract', draft.abstract);
    if (draft.year) form.append('year', String(draft.year));
    form.append('access_policy', draft.access_policy || 'public');
    (draft.tags || []).forEach((tag) => form.append('tags', tag));
    form.append('file', file);
    setError('');
    createThesis(form).then((thesis) => { setSubmittedThesisId(thesis.id); setSubmitted(true); navigate('publish-confirmation', { thesisId: thesis.id }); }).catch((nextError) => setError(apiErrorMessage(nextError, 'Unable to submit this thesis.')));
  }, [draft, file, navigate, setSubmittedThesisId, submitted]);

  return <AuthenticatedLayout title="Processing Document"><div className="mx-auto mt-20 max-w-3xl text-center"><UploadWizardNav step={4} />{error ? <Card className="p-8"><AlertTriangle className="mx-auto h-10 w-10 text-red-500" /><h2 className="mt-4 text-2xl font-bold text-slate-900">Submission failed</h2><p className="mt-2 text-sm text-slate-500">{error}</p><Button className="mt-6" onClick={() => navigate('access-privacy')}>Review and try again</Button></Card> : <><div className="mb-8"><Loader2 className="mx-auto h-20 w-20 animate-spin text-[#00502F]" /></div><h2 className="mb-2 text-2xl font-bold text-slate-900">Submitting your thesis…</h2><p className="mb-8 text-slate-500">The connected backend is storing the PDF and starting its processing workflow.</p><div className="mx-auto max-w-md space-y-3 rounded-lg border border-slate-200 bg-white p-6 text-left text-sm shadow-sm"><div className="flex items-center text-emerald-700"><CheckCircle className="mr-2 h-4 w-4" /> Metadata prepared</div><div className="flex items-center text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending PDF to Django</div><div className="flex items-center text-slate-400"><span className="ml-1 mr-4 h-2 w-2 rounded-full bg-slate-300" /> Waiting for backend processing status</div></div></>}</div></AuthenticatedLayout>;
};

export default Screen17AIProcessing;

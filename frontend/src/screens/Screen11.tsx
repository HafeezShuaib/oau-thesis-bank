import React, { useState } from 'react';
import { ArrowLeft, Cpu, Download, FileText } from 'lucide-react';
import { useAppRouter, PublicOrAuthenticatedLayout, Button, Card } from '../components/shared';
import { useApi } from '../hooks/useApi';
import { apiErrorMessage, downloadThesis, getThesis } from '../lib/api';
import { EmptyState, ErrorState, LoadingState, UnavailableState } from '../components/AsyncState';

const Screen11PdfReader = () => {
  const { navigate, currentScreen } = useAppRouter();
  const thesisId = Number(currentScreen.params?.thesisId || currentScreen.params?.id);
  const { data: thesis, loading, error, refetch } = useApi(() => thesisId ? getThesis(thesisId) : Promise.resolve(null), [thesisId], true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const download = async () => {
    if (!thesis) return;
    setDownloading(true);
    setDownloadError('');
    try {
      const blob = await downloadThesis(thesis.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${thesis.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (nextError) {
      setDownloadError(apiErrorMessage(nextError, 'Unable to download this document.'));
    } finally {
      setDownloading(false);
    }
  };

  if (!thesisId) return <PublicOrAuthenticatedLayout title="PDF Reader"><EmptyState title="No document selected" description="Open a thesis from the repository before starting the reader." /></PublicOrAuthenticatedLayout>;
  if (loading) return <PublicOrAuthenticatedLayout title="PDF Reader"><LoadingState label="Loading document…" /></PublicOrAuthenticatedLayout>;
  if (error || !thesis) return <PublicOrAuthenticatedLayout title="PDF Reader"><ErrorState message={apiErrorMessage(error, 'Unable to load this document.')} onRetry={() => void refetch()} /></PublicOrAuthenticatedLayout>;
  if (!thesis.file) return <PublicOrAuthenticatedLayout title="PDF Reader"><UnavailableState title="No PDF file is attached" description="This thesis record does not currently contain a downloadable PDF." /></PublicOrAuthenticatedLayout>;

  return <div className="flex h-screen flex-col bg-[#F3F4F6]"><header className="z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm"><div className="flex min-w-0 items-center space-x-4"><button aria-label="Back to thesis details" onClick={() => navigate('thesis-detail', { thesisId: thesis.id })} className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></button><span className="max-w-xs truncate text-sm font-medium text-slate-800">{thesis.title}</span></div><div className="flex items-center space-x-2"><Button variant="secondary" size="sm" onClick={() => void download()} disabled={downloading}><Download className="mr-1 h-4 w-4" /> {downloading ? 'Preparing…' : 'Download'}</Button><button className={`flex items-center rounded-md p-2 ${sidebarOpen ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-100'}`} onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle document assistant"><Cpu className="mr-1 h-4 w-4" /><span className="text-xs font-medium">AI Assistant</span></button></div></header>{downloadError && <p role="alert" className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-700">{downloadError}</p>}<div className="flex flex-1 overflow-hidden"><div className="flex flex-1 justify-center overflow-y-auto bg-slate-200 p-8"><div className="min-h-[80vh] w-full max-w-3xl border border-slate-300 bg-white p-10 shadow-xl"><div className="mx-auto max-w-2xl"><FileText className="h-10 w-10 text-[#00502F]" /><h1 className="mt-6 text-2xl font-bold text-slate-900">{thesis.title}</h1><p className="mt-2 text-sm text-slate-500">{thesis.author} · {thesis.year || 'Year not provided'}</p><h2 className="mt-10 border-b border-slate-200 pb-2 text-xl font-semibold">Abstract</h2><p className="mt-5 text-justify leading-8 text-slate-800">{thesis.abstract || 'No abstract provided.'}</p><p className="mt-8 text-sm text-slate-500">The connected backend provides the original PDF through the Download action. Inline PDF rendering is not enabled in this screen.</p></div></div></div>{sidebarOpen && <div className="flex h-full w-80 flex-col border-l border-slate-200 bg-white shadow-lg"><div className="border-b border-slate-200 bg-emerald-50 p-4"><h3 className="flex items-center font-semibold text-emerald-900"><Cpu className="mr-2 h-4 w-4" /> Document Assistant</h3><p className="mt-1 text-xs text-emerald-700">No AI endpoint is exposed by the connected backend.</p></div><div className="flex-1 p-4"><Card className="p-4"><p className="text-sm text-slate-600">Ask-the-document features will appear here when an AI service is connected.</p></Card></div></div>}</div></div>;
};

export default Screen11PdfReader;

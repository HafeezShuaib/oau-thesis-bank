import React, { useState } from 'react';
import { Cpu } from 'lucide-react';
import { useAppRouter, Button, Input, Card, AuthenticatedLayout, UploadWizardNav } from '../components/shared';
import { useUpload } from '../context/UploadContext';

const Screen15ThesisMetadata = () => {
  const { navigate } = useAppRouter();
  const { file, draft, updateDraft } = useUpload();
  const [tagsInput, setTagsInput] = useState((draft.tags || []).join(', '));
  const [error, setError] = useState('');
  if (!file) return <AuthenticatedLayout title="Thesis Details"><Card className="mx-auto max-w-3xl p-8"><p className="text-sm text-slate-600">Choose a PDF before entering its metadata.</p><Button className="mt-5" onClick={() => navigate('upload')}>Back to upload</Button></Card></AuthenticatedLayout>;
  const next = () => {
    if (!draft.title?.trim()) { setError('Add a research title before continuing.'); return; }
    if (draft.year && (draft.year < 1900 || draft.year > new Date().getFullYear() + 1)) { setError('Enter a valid research year.'); return; }
    setError('');
    updateDraft({ title: draft.title.trim(), tags: tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean) });
    navigate('access-privacy');
  };
  return <AuthenticatedLayout title="Thesis Details"><div className="mx-auto max-w-3xl"><UploadWizardNav step={2} /><Card className="p-8"><h2 className="mb-6 text-xl font-bold text-slate-900">Confirm metadata</h2><p className="mb-6 flex items-center text-sm text-slate-500"><Cpu className="mr-2 h-4 w-4 text-emerald-600" /> Add the metadata that the repository will store with your PDF.</p><form className="space-y-6" onSubmit={(event) => { event.preventDefault(); next(); }}><Input label="Research Title" value={draft.title || ''} placeholder="Your thesis title" onChange={(event) => updateDraft({ title: event.target.value })} /><div className="grid grid-cols-1 gap-6 md:grid-cols-2"><Input label="Author" value={draft.author || ''} placeholder="Author name" onChange={(event) => updateDraft({ author: event.target.value })} /><Input label="Year" type="number" value={draft.year ? String(draft.year) : ''} placeholder="2025" onChange={(event) => updateDraft({ year: event.target.value ? Number(event.target.value) : null })} /><Input label="Department" value={draft.department || ''} placeholder="Department" onChange={(event) => updateDraft({ department: event.target.value })} /><Input label="Faculty" value={draft.faculty || ''} placeholder="Faculty" onChange={(event) => updateDraft({ faculty: event.target.value })} /><Input label="Supervisor" value={draft.supervisor || ''} placeholder="Supervisor name" onChange={(event) => updateDraft({ supervisor: event.target.value })} /></div><div className="flex flex-col space-y-1.5"><label htmlFor="thesis-abstract" className="text-sm font-medium text-slate-700">Abstract</label><textarea id="thesis-abstract" className="h-32 resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#00502F] focus:outline-none focus:ring-1 focus:ring-[#00502F]" value={draft.abstract || ''} placeholder="Abstract" onChange={(event) => updateDraft({ abstract: event.target.value })} /></div><Input label="Keywords (comma separated)" value={tagsInput} placeholder="Machine Learning, Agriculture" onChange={(event) => setTagsInput(event.target.value)} />{error && <p className="text-sm text-red-600" role="alert">{error}</p>}<div className="flex justify-between border-t border-slate-200 pt-6"><Button variant="ghost" type="button" onClick={() => navigate('upload')}>Back</Button><Button type="submit">Continue to privacy</Button></div></form></Card></div></AuthenticatedLayout>;
};

export default Screen15ThesisMetadata;

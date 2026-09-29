import React, { useState } from 'react';
import { Lock, ShieldAlert, Unlock } from 'lucide-react';
import { useAppRouter, Button, Card, AuthenticatedLayout, UploadWizardNav } from '../components/shared';
import { useUpload } from '../context/UploadContext';

const Screen16AccessPrivacy = () => {
  const { navigate } = useAppRouter();
  const { draft, updateDraft } = useUpload();
  const [policy, setPolicy] = useState(draft.access_policy || 'public');
  const options = [{ id: 'public', title: 'Public Access', desc: 'Anyone can view and download the full document.', icon: Unlock }, { id: 'restricted', title: 'Request Access', desc: 'Metadata is public. Users must request permission to read the full text.', icon: ShieldAlert }, { id: 'private', title: 'Private (Embargo)', desc: 'Only you and administrators can view it.', icon: Lock }];
  return <AuthenticatedLayout title="Access Settings"><div className="max-w-3xl mx-auto"><UploadWizardNav step={3} /><Card className="p-8"><h2 className="text-xl font-bold text-slate-900 mb-6">Who can view your research?</h2><div className="space-y-4">{options.map((option) => <label key={option.id} className={`p-4 border-2 rounded-lg cursor-pointer flex items-start space-x-4 transition-colors ${policy === option.id ? 'border-[#00502F] bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}><input type="radio" name="access" value={option.id} checked={policy === option.id} onChange={() => setPolicy(option.id as typeof policy)} className="mt-1 text-[#00502F] focus:ring-[#00502F]" /><div><h4 className="font-semibold text-slate-900 flex items-center"><option.icon className="w-4 h-4 mr-2 text-slate-500" /> {option.title}</h4><p className="text-sm text-slate-600 mt-1">{option.desc}</p></div></label>)}</div><div className="pt-8 mt-8 border-t border-slate-200 flex justify-between"><Button variant="ghost" onClick={() => navigate('thesis-metadata')}>Back</Button><Button onClick={() => { updateDraft({ access_policy: policy }); navigate('ai-processing'); }}>Submit to Repository</Button></div></Card></div></AuthenticatedLayout>;
};

export default Screen16AccessPrivacy;

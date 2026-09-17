import React, { useRef, useState } from 'react';
import { FileUp } from 'lucide-react';
import { useAppRouter, Button, Card, AuthenticatedLayout, UploadWizardNav } from '../components/shared';
import { useUpload } from '../context/UploadContext';
import { formatFileSize } from '../lib/formatters';

const MAX_PDF_SIZE = 10 * 1024 * 1024;

const Screen14Upload = () => {
  const { navigate } = useAppRouter();
  const { file, setFile } = useUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const chooseFile = (nextFile: File | undefined) => {
    if (!nextFile) return;
    const isPdf = nextFile.type === 'application/pdf' || nextFile.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) { setError('Only PDF files are allowed.'); return; }
    if (nextFile.size > MAX_PDF_SIZE) { setError('PDF must be 10 MB or smaller.'); return; }
    setError('');
    setFile(nextFile);
    navigate('thesis-metadata');
  };

  return <AuthenticatedLayout title="Upload Research"><div className="mx-auto max-w-3xl"><UploadWizardNav step={1} /><Card className={`border-2 border-dashed p-8 text-center transition-colors sm:p-12 ${dragging ? 'border-[#00502F] bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:border-[#00502F]'}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files?.[0]); }}><FileUp className="mx-auto mb-4 h-16 w-16 text-slate-400" /><h3 className="mb-2 text-xl font-semibold text-slate-900">Upload your thesis document</h3><p className="mb-6 text-slate-500">PDF only, up to 10 MB. Drop a file here or browse your device.</p><input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(event) => chooseFile(event.target.files?.[0])} /><Button onClick={() => inputRef.current?.click()}>Browse files</Button>{file && <p className="mt-5 text-sm font-medium text-[#00502F]">Selected: {file.name} · {formatFileSize(file.size)}</p>}{error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}</Card></div></AuthenticatedLayout>;
};

export default Screen14Upload;

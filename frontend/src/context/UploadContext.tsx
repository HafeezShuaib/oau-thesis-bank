import React, { createContext, useContext, useMemo, useState } from 'react';
import type { ThesisDraft } from '../types/api';

interface UploadContextValue {
  file: File | null;
  draft: ThesisDraft;
  submittedThesisId: number | null;
  setFile: (file: File | null) => void;
  updateDraft: (draft: Partial<ThesisDraft>) => void;
  resetDraft: () => void;
  setSubmittedThesisId: (id: number | null) => void;
}

const UploadContext = createContext<UploadContextValue | null>(null);

export const UploadProvider = ({ children }: { children: React.ReactNode }) => {
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<ThesisDraft>({ tags: [], access_policy: 'public' });
  const [submittedThesisId, setSubmittedThesisId] = useState<number | null>(null);

  const updateDraft = (nextDraft: Partial<ThesisDraft>) => setDraft((current) => ({ ...current, ...nextDraft }));
  const resetDraft = () => {
    setFile(null);
    setDraft({ tags: [], access_policy: 'public' });
    setSubmittedThesisId(null);
  };

  const value = useMemo(() => ({ file, draft, submittedThesisId, setFile, updateDraft, resetDraft, setSubmittedThesisId }), [
    file, draft, submittedThesisId,
  ]);

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>;
};

export const useUpload = () => {
  const value = useContext(UploadContext);
  if (!value) throw new Error('useUpload must be used inside UploadProvider');
  return value;
};

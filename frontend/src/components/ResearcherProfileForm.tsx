import React, { useEffect, useState } from 'react';
import { Button, Card, Input } from './shared';
import { initials, normalizeResearchInterests } from '../lib/formatters';
import type { User } from '../types/api';

export interface ResearcherProfileFormValues {
  avatar: string;
  department: string;
  faculty: string;
  bio: string;
  orcid: string;
  github: string;
  website: string;
  research_interests: string;
  is_available_for_mentoring: boolean;
}

interface ResearcherProfileFormProps {
  user: User;
  initialValues: ResearcherProfileFormValues;
  onSubmit: (values: ResearcherProfileFormValues) => Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
  title?: string;
  description?: string;
  showAccountSummary?: boolean;
  errorMessage?: string;
}

const ResearcherProfileForm = ({
  user,
  initialValues,
  onSubmit,
  submitting = false,
  submitLabel = 'Save profile',
  title = 'Researcher profile',
  description = 'These details are shown on your public researcher profile.',
  showAccountSummary = false,
  errorMessage = '',
}: ResearcherProfileFormProps) => {
  const [values, setValues] = useState<ResearcherProfileFormValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [
    initialValues.avatar,
    initialValues.department,
    initialValues.faculty,
    initialValues.bio,
    initialValues.orcid,
    initialValues.github,
    initialValues.website,
    initialValues.research_interests,
    initialValues.is_available_for_mentoring,
  ]);

  const update = <K extends keyof ResearcherProfileFormValues>(key: K, value: ResearcherProfileFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({
      ...values,
      avatar: values.avatar.trim().slice(0, 10).toUpperCase(),
      department: values.department.trim(),
      faculty: values.faculty.trim(),
      bio: values.bio.trim(),
      orcid: values.orcid.trim(),
      github: values.github.trim(),
      website: values.website.trim(),
      research_interests: normalizeResearchInterests(values.research_interests, user.email),
    });
  };

  return (
    <Card className="p-6">
      {showAccountSummary && (
        <div className="mb-6 border-b border-slate-200 pb-5">
          <p className="text-sm font-semibold text-slate-900">{user.name || user.display_name || 'Your account'}</p>
          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          <p className="mt-2 text-xs text-slate-400">Name and role are managed by the account service.</p>
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mb-5 mt-2 text-sm text-slate-500">{description}</p>
      {errorMessage && <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{errorMessage}</p>}
      <form className="space-y-5" onSubmit={submit}>
        <div className="flex flex-col gap-4 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#00502F] text-xl font-bold text-white" aria-hidden="true">{values.avatar || initials(user.name)}</div>
          <div className="min-w-0 flex-1"><Input label="Avatar initials" value={values.avatar} maxLength={10} placeholder={initials(user.name)} onChange={(event) => update('avatar', event.target.value.toUpperCase())} ariaDescribedBy="avatar-help" /><p id="avatar-help" className="mt-1 text-xs text-slate-400">Use up to 10 characters. These initials appear on your profile and in messages.</p></div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Department" value={values.department} onChange={(event) => update('department', event.target.value)} />
          <Input label="Faculty" value={values.faculty} onChange={(event) => update('faculty', event.target.value)} />
        </div>
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="profile-bio" className="text-sm font-medium text-slate-700">Biography</label>
          <textarea id="profile-bio" value={values.bio} onChange={(event) => update('bio', event.target.value)} className="h-28 resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#00502F] focus:outline-none focus:ring-1 focus:ring-[#00502F]" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="GitHub username" value={values.github} onChange={(event) => update('github', event.target.value)} />
          <Input label="ORCID URL" value={values.orcid} onChange={(event) => update('orcid', event.target.value)} />
          <Input label="Website" value={values.website} onChange={(event) => update('website', event.target.value)} />
          <div className="flex flex-col space-y-1.5">
            <Input label="Research interests" value={values.research_interests} onChange={(event) => update('research_interests', event.target.value)} ariaDescribedBy="research-interests-help" />
            <p id="research-interests-help" className="text-xs text-slate-400">Separate interests with commas. Email-like values are ignored.</p>
          </div>
        </div>
        <label className="flex items-center gap-3 text-sm text-slate-700">
          <input type="checkbox" checked={values.is_available_for_mentoring} onChange={(event) => update('is_available_for_mentoring', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#00502F] focus:ring-[#00502F]" />
          Available for mentorship requests
        </label>
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : submitLabel}</Button>
      </form>
    </Card>
  );
};

export default ResearcherProfileForm;

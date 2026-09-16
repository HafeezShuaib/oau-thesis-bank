import React, { useEffect, useState } from 'react';
import { Bookmark, Search as SearchIcon } from 'lucide-react';
import { useAppRouter, Button, Card, PublicOrAuthenticatedLayout } from '../components/shared';
import { useApi } from '../hooks/useApi';
import { apiErrorMessage, saveThesis, searchTheses, unsaveThesis } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';

const fieldClassName = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#00502F] focus:outline-none focus:ring-1 focus:ring-[#00502F]';

const Screen06SearchResults = () => {
  const { navigate, currentScreen, user } = useAppRouter();
  const routeQuery = String(currentScreen.params?.q || '');
  const routeDepartment = String(currentScreen.params?.department || '');
  const routeFaculty = String(currentScreen.params?.faculty || '');
  const routeYear = String(currentScreen.params?.year || '');
  const routeTag = String(currentScreen.params?.tag || '');
  const [draftQuery, setDraftQuery] = useState(routeQuery);
  const [department, setDepartment] = useState(routeDepartment);
  const [faculty, setFaculty] = useState(routeFaculty);
  const [year, setYear] = useState(routeYear);
  const [tag, setTag] = useState(routeTag);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [actionError, setActionError] = useState('');
  const { data, loading, error, refetch } = useApi(
    () => searchTheses({ q: routeQuery, department: routeDepartment, faculty: routeFaculty, year: routeYear, tag: routeTag }),
    [routeQuery, routeDepartment, routeFaculty, routeYear, routeTag],
    true,
  );
  const results = data?.results || [];

  useEffect(() => {
    setDraftQuery(routeQuery);
    setDepartment(routeDepartment);
    setFaculty(routeFaculty);
    setYear(routeYear);
    setTag(routeTag);
  }, [routeQuery, routeDepartment, routeFaculty, routeYear, routeTag]);

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    navigate('search-results', { q: draftQuery.trim(), department: department.trim(), faculty: faculty.trim(), year: year.trim(), tag: tag.trim() });
  };

  const toggleSave = async (event: React.MouseEvent, id: number, currentlySaved: boolean) => {
    event.stopPropagation();
    if (!user) { navigate('login'); return; }
    setSavingId(id);
    setActionError('');
    try {
      if (currentlySaved || savedIds.includes(id)) {
        await unsaveThesis(id);
        setSavedIds((ids) => ids.filter((savedId) => savedId !== id));
      } else {
        await saveThesis(id);
        setSavedIds((ids) => [...ids, id]);
      }
    } catch (nextError) {
      setActionError(apiErrorMessage(nextError, 'Unable to update your saved research.'));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <PublicOrAuthenticatedLayout title="Search Results">
      <div className="flex flex-col gap-8 md:flex-row">
        <form className="w-full shrink-0 space-y-5 md:w-72" onSubmit={applyFilters}>
          <div>
            <h4 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-900">Search repository</h4>
            <div className="relative"><SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input aria-label="Search keywords" value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder="Keywords" className={`${fieldClassName} pl-9`} /></div>
          </div>
          <label className="block text-sm font-medium text-slate-700">Department<input value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="Any department" className={`${fieldClassName} mt-1.5`} /></label>
          <label className="block text-sm font-medium text-slate-700">Faculty<input value={faculty} onChange={(event) => setFaculty(event.target.value)} placeholder="Any faculty" className={`${fieldClassName} mt-1.5`} /></label>
          <label className="block text-sm font-medium text-slate-700">Year<input value={year} onChange={(event) => setYear(event.target.value)} inputMode="numeric" placeholder="Any year" className={`${fieldClassName} mt-1.5`} /></label>
          <label className="block text-sm font-medium text-slate-700">Tag<input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="e.g. machine learning" className={`${fieldClassName} mt-1.5`} /></label>
          <div className="flex gap-2"><Button type="submit" className="flex-1">Apply filters</Button><Button type="button" variant="ghost" onClick={() => { setDraftQuery(''); setDepartment(''); setFaculty(''); setYear(''); setTag(''); navigate('search-results'); }}>Clear</Button></div>
        </form>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4"><p className="text-sm text-slate-600">Showing <strong>{data?.count ?? 0}</strong> results{routeQuery && <> for <span className="font-medium text-slate-900">“{routeQuery}”</span></>}</p><button className="text-sm font-medium text-[#00502F] hover:text-[#003d24]" onClick={() => navigate('advanced-search')}>Advanced search</button></div>
          {actionError && <p className="mb-4 text-sm text-red-600" role="alert">{actionError}</p>}
          {loading && <LoadingState label="Searching the repository…" />}
          {error && <ErrorState onRetry={() => void refetch()} />}
          {!loading && !error && results.length === 0 && <EmptyState title="No matching research" description="Try a broader phrase or clear one of the filters." />}
          {!loading && !error && results.length > 0 && <div className="space-y-4">{results.map(({ thesis, relevance_score, matched_concepts }) => {
            const currentlySaved = Boolean(thesis.saved || savedIds.includes(thesis.id));
            return <Card key={thesis.id} hover className="flex flex-col items-start gap-6 p-6 md:flex-row" onClick={() => navigate('thesis-detail', { thesisId: thesis.id })}>
              <div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2">{relevance_score !== null && <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-[#00502F]">{Math.round(relevance_score * 100)}% Match</span>}<span className="text-xs text-slate-400">{thesis.year || 'Year not provided'}</span></div><h3 className="mb-1 text-lg font-bold text-slate-900">{thesis.title}</h3><p className="mb-3 text-sm text-[#D4AF37]">{thesis.author} · {thesis.department || 'Department not provided'}</p><p className="mb-4 text-sm text-slate-600">{thesis.abstract || 'No abstract provided.'}</p><div className="flex flex-wrap items-center gap-2">{(matched_concepts.length ? matched_concepts : thesis.tags).map((tagValue) => <span key={tagValue} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">{tagValue}</span>)}</div></div>
              <div className="flex w-full shrink-0 flex-col gap-2 md:w-32"><Button variant="secondary" className="w-full text-xs" onClick={(event) => { event.stopPropagation(); navigate('pdf-reader', { thesisId: thesis.id }); }}>Read PDF</Button><Button variant="ghost" disabled={savingId === thesis.id} className="w-full text-xs" onClick={(event) => void toggleSave(event, thesis.id, currentlySaved)}><Bookmark className={`mr-1 h-3.5 w-3.5 ${currentlySaved ? 'fill-current' : ''}`} /> {currentlySaved ? 'Saved' : 'Save'}</Button></div>
            </Card>;
          })}</div>}
        </div>
      </div>
    </PublicOrAuthenticatedLayout>
  );
};

export default Screen06SearchResults;

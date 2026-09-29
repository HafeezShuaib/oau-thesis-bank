import React, { useState } from 'react';
import { useAppRouter, Button, Input, PublicOrAuthenticatedLayout } from '../components/shared';

const Screen07AdvancedSearch = () => {
  const { navigate } = useAppRouter();
  const [phrase, setPhrase] = useState('');
  const [words, setWords] = useState('');
  const [department, setDepartment] = useState('');
  const [faculty, setFaculty] = useState('');
  const [year, setYear] = useState('');
  const [tag, setTag] = useState('');
  const [author, setAuthor] = useState('');

  return (
    <PublicOrAuthenticatedLayout title="Advanced Search">
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">Build a repository query</h2>
        <p className="mb-6 text-sm leading-6 text-slate-500">Combine the fields below into a full-text search with backend-supported metadata filters.</p>
        <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); navigate('search-results', { q: [phrase, words, author].filter(Boolean).join(' '), department, faculty, year, tag }); }}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input label="Exact phrase" placeholder='e.g. "neural networks"' value={phrase} onChange={(event) => setPhrase(event.target.value)} />
            <Input label="All these words" placeholder="e.g. crop yield nigeria" value={words} onChange={(event) => setWords(event.target.value)} />
            <Input label="Department" placeholder="e.g. Computer Science" value={department} onChange={(event) => setDepartment(event.target.value)} />
            <Input label="Faculty" placeholder="e.g. Sciences" value={faculty} onChange={(event) => setFaculty(event.target.value)} />
            <Input label="Year" type="number" placeholder="2025" value={year} onChange={(event) => setYear(event.target.value)} />
            <Input label="Tag" placeholder="e.g. agriculture" value={tag} onChange={(event) => setTag(event.target.value)} />
            <Input label="Author or supervisor" placeholder="Name" value={author} onChange={(event) => setAuthor(event.target.value)} />
          </div>
          <div className="flex justify-end gap-4 border-t border-slate-200 pt-6"><Button variant="ghost" type="button" onClick={() => { setPhrase(''); setWords(''); setDepartment(''); setFaculty(''); setYear(''); setTag(''); setAuthor(''); }}>Clear fields</Button><Button type="submit">Search repository</Button></div>
        </form>
      </div>
    </PublicOrAuthenticatedLayout>
  );
};

export default Screen07AdvancedSearch;

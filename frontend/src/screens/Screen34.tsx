import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppRouter, Button, Card, Badge, AuthenticatedLayout } from '../components/shared';
import { useApi } from '../hooks/useApi';
import { createMentorshipRequest, getProfile } from '../lib/api';
import { ApiError } from '../lib/api';
import { EmptyState, ErrorState, LoadingState, SuccessState } from '../components/AsyncState';
import { initials } from '../lib/formatters';

const Screen34MentorshipRequest = () => {
  const { navigate, currentScreen } = useAppRouter();
  const mentorId = Number(currentScreen.params?.userId || currentScreen.params?.mentorId);
  const { data: profile, loading, error, refetch } = useApi(() => mentorId ? getProfile(mentorId) : Promise.resolve(null), [mentorId], true);
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState('');
  const [sending, setSending] = useState(false);
  if (!mentorId) return <AuthenticatedLayout title="Request Mentorship"><EmptyState title="No mentor selected" description="Open a mentor profile before sending a request." /></AuthenticatedLayout>;
  if (loading) return <AuthenticatedLayout title="Request Mentorship"><LoadingState label="Loading mentor profile…" /></AuthenticatedLayout>;
  if (error || !profile) return <AuthenticatedLayout title="Request Mentorship"><ErrorState onRetry={() => void refetch()} /></AuthenticatedLayout>;
  const name = profile.user.name || profile.user.display_name || profile.user.email;
  const submit = async () => { setSending(true); setFeedback(''); try { await createMentorshipRequest({ mentor_id: mentorId, message }); setFeedback('Your request was sent.'); } catch (nextError) { setFeedback(nextError instanceof ApiError ? nextError.detail : 'Unable to send request.'); } finally { setSending(false); } };
  return <AuthenticatedLayout title="Request Mentorship"><div className="max-w-2xl mx-auto"><div className="mb-6 flex items-center cursor-pointer text-slate-500 hover:text-slate-800" onClick={() => navigate('researcher-profile', { userId: mentorId })}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile</div><Card className="p-8"><div className="text-center mb-8"><div className="w-16 h-16 rounded-full bg-[#00502F] text-white flex items-center justify-center font-bold text-xl mx-auto mb-3">{profile.user.avatar || initials(name)}</div><h2 className="text-xl font-bold text-slate-900">Requesting mentorship from {name}</h2><p className="text-sm text-slate-500 mt-1">{profile.user.role} · {profile.user.department}</p></div><div className="space-y-6"><div className="flex flex-col space-y-1.5"><label className="text-sm font-medium text-slate-700">Introduction & Goals</label><textarea value={message} onChange={(event) => setMessage(event.target.value)} className="px-3 py-2 border border-slate-300 rounded-md h-32 text-sm resize-none focus:ring-[#00502F] focus:border-[#00502F]" placeholder="Introduce yourself, your project, and what guidance you need…" /></div><p className="text-xs text-slate-500 bg-slate-50 p-3 rounded">Mentorship requests are stored by the Django collaboration service.</p>{feedback && (feedback === 'Your request was sent.' ? <SuccessState title={feedback} /> : <p className="text-sm text-red-600">{feedback}</p>)}<Button className="w-full" disabled={sending || !message.trim()} onClick={() => void submit()}>{sending ? 'Sending…' : 'Send Request'}</Button></div></Card></div></AuthenticatedLayout>;
};

export default Screen34MentorshipRequest;

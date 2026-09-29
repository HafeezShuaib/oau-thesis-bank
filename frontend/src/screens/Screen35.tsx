import React, { useMemo, useState } from 'react';
import { MessageSquare, Plus, RefreshCw } from 'lucide-react';
import { useAppRouter, AuthenticatedLayout, Button, UnreadBadge } from '../components/shared';
import { useApi } from '../hooks/useApi';
import { apiErrorMessage, createConversation, listConversations, toArray } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import { formatDateTime, initials } from '../lib/formatters';

const Screen35Messages = () => {
  const { navigate, currentScreen } = useAppRouter();
  const [query, setQuery] = useState('');
  const [actionError, setActionError] = useState('');
  const [starting, setStarting] = useState(false);
  const { data, loading, error, refetch } = useApi(listConversations, [], true);
  const conversations = useMemo(() => toArray(data || []).filter((conversation) => `${conversation.participants.map((participant) => participant.name || participant.display_name || participant.email).join(' ')} ${conversation.last_message?.body || ''}`.toLowerCase().includes(query.toLowerCase())), [data, query]);
  const targetUserId = Number(currentScreen.params?.userId);
  const startConversation = async () => {
    if (!targetUserId) return;
    setStarting(true); setActionError('');
    try { const conversation = await createConversation([targetUserId]); navigate('conversation', { conversationId: conversation.id }); } catch (nextError) { setActionError(apiErrorMessage(nextError, 'Unable to start this conversation.')); } finally { setStarting(false); }
  };

  return <AuthenticatedLayout title="Messages"><div className="flex h-[75vh] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex w-full flex-col border-r border-slate-200 md:w-1/3"><div className="flex items-center gap-2 border-b border-slate-200 p-4"><input value={query} onChange={(event) => setQuery(event.target.value)} type="text" placeholder="Search messages…" aria-label="Search messages" className="min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#00502F] focus:ring-1 focus:ring-[#00502F]" /><button aria-label="Refresh conversations" className="rounded-md p-2 text-slate-400 hover:bg-slate-50 hover:text-[#00502F]" onClick={() => void refetch()}><RefreshCw className="h-4 w-4" /></button></div>{actionError && <p className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{actionError}</p>}<div className="flex-1 overflow-y-auto">{loading && <LoadingState label="Loading conversations…" />}{error && <ErrorState onRetry={() => void refetch()} />}{!loading && !error && conversations.length === 0 && <div className="p-5"><EmptyState title="No conversations yet" description="Start a conversation from a researcher profile." /></div>}{conversations.map((conversation) => { const other = conversation.participants[0]; const name = other?.name || other?.display_name || other?.email || 'Conversation'; const unread = conversation.unread_count || 0; return <button key={conversation.id} aria-label={`Open conversation with ${name}`} className="w-full border-b border-slate-100 p-4 text-left hover:bg-slate-50" onClick={() => navigate('conversation', { conversationId: conversation.id })}><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00502F] text-xs font-bold text-white">{other?.avatar || initials(name)}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h4 className={`truncate text-sm ${unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-900'}`}>{name}</h4><div className="flex shrink-0 items-center gap-2"><span className="text-xs text-slate-500">{formatDateTime(conversation.updated_at)}</span><UnreadBadge count={unread} /></div></div><p className={`truncate text-sm ${unread ? 'font-medium text-slate-700' : 'text-slate-500'}`}>{conversation.last_message?.body || 'No messages yet.'}</p></div></div></button>; })}</div></div><div className="hidden flex-1 flex-col items-center justify-center bg-slate-50 text-slate-400 md:flex">{targetUserId ? <><MessageSquare className="mb-4 h-12 w-12 opacity-50" /><p>Start a conversation with this researcher.</p><Button className="mt-5" disabled={starting} onClick={() => void startConversation()}><Plus className="mr-2 h-4 w-4" /> {starting ? 'Starting…' : 'Start conversation'}</Button></> : <><MessageSquare className="mb-4 h-12 w-12 opacity-50" /><p>Select a conversation to start messaging</p></>}</div></div></AuthenticatedLayout>;
};

export default Screen35Messages;

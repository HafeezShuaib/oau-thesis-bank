import React, { useEffect, useState } from 'react';
import { ArrowLeft, MoreVertical, RefreshCw, Send } from 'lucide-react';
import { useAppRouter, Button, AuthenticatedLayout, UnreadBadge } from '../components/shared';
import { useApi } from '../hooks/useApi';
import { apiErrorMessage, getConversation, listConversations, replyToConversation, toArray } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import { formatDateTime, initials } from '../lib/formatters';
import { useAuth } from '../context/AuthContext';

const Screen36Conversation = () => {
  const { navigate, currentScreen } = useAppRouter();
  const { user } = useAuth();
  const conversationId = Number(currentScreen.params?.conversationId || currentScreen.params?.id);
  const { data: conversationList, refetch: refetchConversationList } = useApi(listConversations, [], true);
  const { data: conversation, loading, error, refetch } = useApi(() => conversationId ? getConversation(conversationId) : Promise.resolve(null), [conversationId], true);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!conversationId) return undefined;
    const timer = window.setInterval(() => { void Promise.all([refetch(), refetchConversationList()]); }, 10000);
    return () => window.clearInterval(timer);
  }, [conversationId, refetch, refetchConversationList]);

  const send = async () => {
    if (!body.trim() || !conversation) return;
    setSending(true); setActionError('');
    try { await replyToConversation(conversation.id, body.trim()); setBody(''); await Promise.all([refetch(), refetchConversationList()]); } catch (nextError) { setActionError(apiErrorMessage(nextError, 'Unable to send this message.')); } finally { setSending(false); }
  };

  if (!conversationId) return <AuthenticatedLayout title="Messages"><EmptyState title="No conversation selected" description="Choose a conversation from your inbox." /></AuthenticatedLayout>;
  if (loading && !conversation) return <AuthenticatedLayout title="Messages"><LoadingState label="Loading conversation…" /></AuthenticatedLayout>;
  if (error || !conversation) return <AuthenticatedLayout title="Messages"><ErrorState message={apiErrorMessage(error, 'Unable to load this conversation.')} onRetry={() => void refetch()} /></AuthenticatedLayout>;
  const other = conversation.participants.find((participant) => participant.id !== user?.id) || conversation.participants[0];
  return <AuthenticatedLayout title="Messages"><div className="flex h-[75vh] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="hidden w-1/3 flex-col border-r border-slate-200 lg:flex">{toArray(conversationList || []).map((item) => { const participant = item.participants.find((candidate) => candidate.id !== user?.id) || item.participants[0]; const name = participant?.name || participant?.display_name || participant?.email || 'Conversation'; const unread = item.id === conversation.id ? 0 : (item.unread_count || 0); return <button key={item.id} aria-label={`Open conversation with ${name}`} className={`cursor-pointer border-b border-slate-100 p-4 text-left ${item.id === conversation.id ? 'border-l-4 border-l-[#00502F] bg-emerald-50/50' : 'hover:bg-slate-50'}`} onClick={() => navigate('conversation', { conversationId: item.id })}><div className="flex items-center justify-between gap-2"><h4 className={`truncate text-sm ${unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-900'}`}>{name}</h4><UnreadBadge count={unread} /></div><p className={`truncate text-sm ${unread ? 'font-medium text-slate-700' : 'text-slate-500'}`}>{item.last_message?.body || 'No messages yet.'}</p></button>; })}</div><div className="flex w-full flex-1 flex-col"><div className="flex items-center border-b border-slate-200 bg-white p-4"><button aria-label="Back to messages" className="mr-3 text-slate-500 lg:hidden" onClick={() => navigate('messages')}><ArrowLeft className="h-5 w-5" /></button><div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#00502F] text-xs font-bold text-white">{other?.avatar || initials(other?.name || other?.display_name || other?.email)}</div><div><h3 className="text-sm font-semibold text-slate-900">{other?.name || other?.display_name || other?.email}</h3><p className="text-xs text-slate-500">{other?.role || 'Researcher'}</p></div><div className="ml-auto flex items-center gap-1"><button aria-label="Refresh conversation" className="rounded-md p-2 text-slate-400 hover:bg-slate-50 hover:text-[#00502F]" onClick={() => void Promise.all([refetch(), refetchConversationList()])}><RefreshCw className="h-4 w-4" /></button><button aria-label="Conversation options" className="rounded-md p-2 text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></button></div></div>{actionError && <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">{actionError}</p>}<div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">{(conversation.messages || []).length === 0 && <p className="py-12 text-center text-sm text-slate-400">No messages yet. Start the conversation below.</p>}{(conversation.messages || []).map((message) => { const mine = message.sender.id === user?.id; return <div key={message.id} className={`flex items-start ${mine ? 'justify-end' : 'max-w-[80%]'}`}><div className={`${mine ? 'rounded-tr-sm bg-[#00502F] text-white' : 'rounded-tl-sm border border-slate-200 bg-white text-slate-800'} max-w-[80%] rounded-2xl p-3 text-sm shadow-sm`}>{message.body}<span className={`mt-1 block text-right text-[10px] ${mine ? 'text-emerald-200' : 'text-slate-400'}`}>{formatDateTime(message.created_at)}</span></div></div>; })}</div><div className="border-t border-slate-200 bg-white p-4"><div className="flex items-center space-x-2"><input value={body} onChange={(event) => setBody(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); } }} type="text" placeholder="Type a message…" aria-label="Type a message" className="flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-[#00502F]" /><Button disabled={sending || !body.trim()} onClick={() => void send()} aria-label="Send message" className="rounded-full p-2"><Send className="h-4 w-4" /></Button></div></div></div></div></AuthenticatedLayout>;
};

export default Screen36Conversation;

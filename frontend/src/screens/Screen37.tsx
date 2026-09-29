import React, { useMemo, useState } from 'react';
import { Bell, CheckCircle, MessageSquare, ShieldAlert, Users } from 'lucide-react';
import { useAppRouter, AuthenticatedLayout, Card, Badge } from '../components/shared';
import { useApi } from '../hooks/useApi';
import { apiErrorMessage, getNotificationSummary, listConversations, listNotifications, markAllNotificationsRead, markNotificationRead, toArray } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import { formatDateTime } from '../lib/formatters';
import type { Notification, NotificationType } from '../types/api';

const iconFor = (type: string) => type === 'access_request' ? ShieldAlert : type === 'message' ? MessageSquare : type === 'mentorship' ? Users : CheckCircle;
const summaryLabels: Array<[NotificationType, string]> = [['message', 'Messages'], ['access_request', 'Access'], ['mentorship', 'Mentorship'], ['collaboration', 'Collaboration'], ['system', 'System']];

const Screen37Notifications = () => {
  const { navigate } = useAppRouter();
  const { data, loading, error, refetch } = useApi(listNotifications, [], true);
  const { data: summary, refetch: refetchSummary } = useApi(getNotificationSummary, [], true);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');
  const notifications = useMemo(() => toArray(data || []), [data]);

  const destinationFor = (notification: Notification) => {
    if (notification.notification_type === 'access_request') return ['access-requests', {}] as const;
    if (notification.notification_type === 'mentorship') return ['collaboration-requests', { tab: 'inbox' }] as const;
    if (notification.notification_type === 'collaboration') return ['collaboration-hub', {}] as const;
    return ['notifications', {}] as const;
  };

  const openNotification = async (notification: Notification) => {
    setWorkingId(notification.id); setActionError('');
    try {
      if (!notification.is_read) await markNotificationRead(notification.id);
      if (notification.notification_type === 'message' && notification.actor) {
        const conversations = toArray(await listConversations());
        const conversation = conversations.find((candidate) => candidate.participants.some((participant) => participant.id === notification.actor));
        navigate(conversation ? 'conversation' : 'messages', conversation ? { conversationId: conversation.id } : {});
      } else {
        const [screen, params] = destinationFor(notification);
        navigate(screen, params);
      }
      await Promise.all([refetch(), refetchSummary()]);
    } catch (nextError) { setActionError(apiErrorMessage(nextError, 'Unable to open this notification right now. Please try again.')); } finally { setWorkingId(null); }
  };

  const markAll = async () => { setActionError(''); try { await markAllNotificationsRead(); await Promise.all([refetch(), refetchSummary()]); } catch (nextError) { setActionError(apiErrorMessage(nextError, 'Unable to mark notifications as read right now. Please try again.')); } };

  return <AuthenticatedLayout title="Notifications"><div className="mx-auto max-w-3xl space-y-4"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-2 text-sm font-semibold text-[#00502F]"><Bell className="h-4 w-4" /> All notifications</div><button onClick={() => void markAll()} className="text-sm text-slate-400 hover:text-slate-600">Mark all as read</button></div>{summary && <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{summaryLabels.map(([type, label]) => <Card key={type} className="p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{summary[type] || 0}</p></Card>)}</div>}{actionError && <p className="text-sm text-red-600" role="alert">{actionError}</p>}{loading && <LoadingState label="Loading notifications…" />}{error && <ErrorState onRetry={() => void refetch()} />}{!loading && !error && notifications.length === 0 && <EmptyState title="No notifications yet" description="Updates about access, messages, mentorship, and system events will appear here." icon={Bell} />}{!loading && !error && notifications.map((notification) => { const Icon = iconFor(notification.notification_type); const isWorking = workingId === notification.id; return <Card key={notification.id} role="button" tabIndex={0} ariaLabel={notification.notification_type === 'message' ? `Open message notification: ${notification.title}` : notification.title} className={`flex cursor-pointer items-start space-x-4 p-4 transition-colors ${!notification.is_read ? 'border-l-4 border-l-[#00502F] bg-slate-50' : 'hover:bg-slate-50'}`} onClick={() => void openNotification(notification)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); void openNotification(notification); } }}><div className={`rounded-full p-2 ${notification.notification_type === 'access_request' ? 'bg-amber-50 text-amber-500' : notification.notification_type === 'message' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className={`text-sm ${!notification.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>{notification.title}</h4>{!notification.is_read && <Badge variant="green">New</Badge>}</div><p className="mt-0.5 text-sm text-slate-600">{notification.message}</p><span className="mt-2 block text-xs text-slate-400">{formatDateTime(notification.created_at)}{isWorking ? ' · Opening…' : ''}</span></div></Card>; })}</div></AuthenticatedLayout>;
};

export default Screen37Notifications;

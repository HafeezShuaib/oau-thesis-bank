import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './auth';
import type {
  AccessRequest, AnalyticsBreakdownRow, AnalyticsDimension, AnalyticsMetric, AnalyticsOverview,
  AnalyticsTrendRow, CollaborationOpportunity, Conversation, MentorshipRequest, Notification,
  NotificationSummary, Paginated, ProviderName, ProviderStatus, ResearcherProfile, SearchResponse,
  Thesis, TokenResponse, TopThesis, User, ThesisDraft,
} from '../types/api';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');
export const NOTIFICATIONS_UPDATED_EVENT = 'oau:notifications-updated';

export class ApiError extends Error {
  status: number;
  detail: string;
  fieldErrors: Record<string, unknown>;

  constructor(status: number, detail: string, fieldErrors: Record<string, unknown> = {}) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.fieldErrors = fieldErrors;
  }
}

const endpoint = (path: string) => `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;

const detailFromPayload = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') return 'The request could not be completed.';
  const record = payload as Record<string, unknown>;
  if (typeof record.detail === 'string') return record.detail;
  if (typeof record.error === 'string') return record.error;
  const firstError = Object.values(record).find((value) => Array.isArray(value) && value.length > 0);
  if (Array.isArray(firstError)) return String(firstError[0]);
  return 'The request could not be completed.';
};

export const apiErrorMessage = (error: unknown, fallback: string) => (
  error instanceof ApiError && error.detail ? error.detail : fallback
);

const parseResponse = async (response: Response) => {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  return response.text();
};

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  if (!refreshPromise) {
    refreshPromise = fetch(endpoint('auth/refresh/'), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
      .then(async (response) => {
        const payload = await parseResponse(response);
        if (!response.ok || !payload || typeof payload !== 'object' || typeof (payload as TokenResponse).access !== 'string') {
          clearTokens();
          return null;
        }
        const nextAccess = (payload as TokenResponse).access;
        setTokens(nextAccess);
        return nextAccess;
      })
      .catch(() => {
        clearTokens();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

interface ApiRequestInit extends RequestInit {
  json?: unknown;
  retry?: boolean;
}

export const request = async <T,>(path: string, init: ApiRequestInit = {}): Promise<T> => {
  const { json, retry = true, headers: providedHeaders, ...requestInit } = init;
  const headers = new Headers(providedHeaders || {});
  headers.set('Accept', 'application/json');
  if (json !== undefined) {
    headers.set('Content-Type', 'application/json');
    requestInit.body = JSON.stringify(json);
  }
  const accessToken = getAccessToken();
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(endpoint(path), { ...requestInit, headers });
  if (response.status === 401 && retry && getRefreshToken() && !path.startsWith('auth/login') && !path.startsWith('auth/register') && !path.startsWith('auth/refresh')) {
    const nextAccess = await refreshAccessToken();
    if (nextAccess) return request<T>(path, { ...init, retry: false });
  }

  const payload = await parseResponse(response);
  if (!response.ok) {
    const record = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
    throw new ApiError(response.status, detailFromPayload(payload), record);
  }
  return payload as T;
};

export const requestBlob = async (path: string) => {
  const headers = new Headers();
  const accessToken = getAccessToken();
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const response = await fetch(endpoint(path), { headers });
  if (response.status === 401 && getRefreshToken()) {
    const nextAccess = await refreshAccessToken();
    if (nextAccess) return requestBlob(path);
  }
  if (!response.ok) {
    const payload = await parseResponse(response);
    throw new ApiError(response.status, detailFromPayload(payload));
  }
  return response.blob();
};

const collection = <T,>(payload: T[] | Paginated<T> | null | undefined): T[] => {
  if (Array.isArray(payload)) return payload;
  return payload?.results || [];
};

const queryPath = (path: string, params: Record<string, string | number | boolean | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  return `${path}${query.toString() ? `?${query}` : ''}`;
};

export const authLogin = (email: string, password: string) => request<TokenResponse>('auth/login/', { method: 'POST', json: { email, password }, retry: false });
export const authRegister = (payload: { name: string; email: string; password: string; role: User['role']; department?: string; faculty?: string }) => request<{ user: User } & TokenResponse>('auth/register/', { method: 'POST', json: payload, retry: false });
export const authMe = () => request<User>('auth/me/');
export const patchMe = (payload: Partial<Pick<User, 'department' | 'faculty' | 'avatar'>>) => request<User>('auth/me/', { method: 'PATCH', json: payload });
export const changePassword = (old_password: string, new_password: string) => request<{ detail: string }>('auth/change-password/', { method: 'POST', json: { old_password, new_password } });

export const listTheses = (params: Record<string, string | number | undefined> = {}) => request<Paginated<Thesis> | Thesis[]>(queryPath('theses/', params));
export const listMine = () => request<Thesis[]>('theses/mine/');
export const listSaved = () => request<Thesis[]>('theses/saved/');
export const getThesis = (id: number | string) => request<Thesis>(`theses/${id}/`);
export const createThesis = (form: FormData) => request<Thesis>('theses/', { method: 'POST', body: form });
export const updateThesis = (id: number | string, payload: Partial<ThesisDraft> & { status?: Thesis['status']; access_policy?: Thesis['access_policy'] }) => request<Thesis>(`theses/${id}/`, { method: 'PATCH', json: payload });
export const deleteThesis = (id: number | string) => request<void>(`theses/${id}/`, { method: 'DELETE' });
export const saveThesis = (id: number | string) => request<{ saved: boolean }>(`theses/${id}/save/`, { method: 'POST' });
export const unsaveThesis = (id: number | string) => request<{ saved: boolean }>(`theses/${id}/unsave/`, { method: 'POST' });
export const downloadThesis = (id: number | string) => requestBlob(`theses/${id}/download/`);

export const searchTheses = (params: Record<string, string | number | undefined> = {}) => request<SearchResponse>(queryPath('search/', params));
export const listAccessRequests = () => request<Paginated<AccessRequest> | AccessRequest[]>('theses/access-requests/');
export const createAccessRequest = (payload: { thesis: number; message?: string }) => request<AccessRequest>('theses/access-requests/', { method: 'POST', json: payload });
export const reviewAccessRequest = (id: number | string, status: 'approved' | 'denied') => request<AccessRequest>(`theses/access-requests/${id}/review/`, { method: 'PATCH', json: { status } });

export const listProfiles = (params: { role?: string; mentoring?: boolean } = {}) => request<Paginated<ResearcherProfile> | ResearcherProfile[]>(queryPath('researchers/profiles/', params));
export const getProfile = (userId: number | string) => request<ResearcherProfile>(`researchers/profiles/${userId}/`);
export const getMyProfile = () => request<ResearcherProfile>('researchers/profiles/me/');
export const updateProfile = (userId: number | string, payload: Partial<Pick<ResearcherProfile, 'bio' | 'orcid' | 'github' | 'website' | 'research_interests' | 'is_available_for_mentoring'>>) => request<ResearcherProfile>(`researchers/profiles/${userId}/`, { method: 'PATCH', json: payload });
export const updateMyProfile = (payload: Partial<Pick<ResearcherProfile, 'bio' | 'orcid' | 'github' | 'website' | 'research_interests' | 'is_available_for_mentoring'>>) => request<ResearcherProfile>('researchers/profiles/me/', { method: 'PATCH', json: payload });

export const listOpportunities = (status?: 'open' | 'closed') => request<Paginated<CollaborationOpportunity> | CollaborationOpportunity[]>(queryPath('collaboration/opportunities/', { status }));
export const getOpportunity = (id: number | string) => request<CollaborationOpportunity>(`collaboration/opportunities/${id}/`);
export const createOpportunity = (payload: { title: string; description: string; skills: string[] }) => request<CollaborationOpportunity>('collaboration/opportunities/', { method: 'POST', json: payload });
export const updateOpportunity = (id: number | string, payload: Partial<{ title: string; description: string; skills: string[]; status: 'open' | 'closed' }>) => request<CollaborationOpportunity>(`collaboration/opportunities/${id}/`, { method: 'PATCH', json: payload });
export const deleteOpportunity = (id: number | string) => request<void>(`collaboration/opportunities/${id}/`, { method: 'DELETE' });
export const listMentorshipRequests = (scope: 'inbox' | 'sent' = 'inbox') => request<Paginated<MentorshipRequest> | MentorshipRequest[]>(queryPath('collaboration/mentorship/', { scope }));
export const createMentorshipRequest = (payload: { mentor_id: number; message: string }) => request<MentorshipRequest>('collaboration/mentorship/', { method: 'POST', json: payload });
export const reviewMentorshipRequest = (id: number | string, status: 'approved' | 'denied') => request<MentorshipRequest>(`collaboration/mentorship/${id}/review/`, { method: 'POST', json: { status } });

export const listConversations = () => request<Paginated<Conversation> | Conversation[]>('messages/conversations/');
export const getUnreadMessageCount = async () => {
  const conversations = await listConversations();
  return { count: collection(conversations).reduce((total, conversation) => total + (conversation.unread_count || 0), 0) };
};
export const createConversation = (participant_ids: number[]) => request<Conversation>('messages/conversations/', { method: 'POST', json: { participant_ids } });
export const getConversation = (id: number | string) => request<Conversation>(`messages/conversations/${id}/`);
export const replyToConversation = (id: number | string, body: string) => request<NonNullable<Conversation['messages']>[number]>(`messages/conversations/${id}/reply/`, { method: 'POST', json: { body } });

export const listNotifications = () => request<Paginated<Notification> | Notification[]>('notifications/');
export const getUnreadNotificationCount = () => request<{ count: number }>('notifications/unread_count/');
export const getNotificationSummary = () => request<NotificationSummary>('notifications/summary/');

const publishNotificationsUpdated = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
};

export const markNotificationRead = async (id: number | string) => {
  const notification = await request<Notification>(`notifications/${id}/read/`, { method: 'POST' });
  publishNotificationsUpdated();
  return notification;
};

export const markAllNotificationsRead = async () => {
  const result = await request<{ status: string }>('notifications/read_all/', { method: 'POST' });
  publishNotificationsUpdated();
  return result;
};

export const getProviderLink = (provider: ProviderName) => request<ProviderStatus>(`integrations/${provider}/link/`);

export const getAnalyticsOverview = () => request<AnalyticsOverview>('analytics/overview/');
export const getTopTheses = (metric: AnalyticsMetric = 'views') => request<TopThesis[]>(queryPath('analytics/top-theses/', { metric }));
export const getAnalyticsBreakdown = (dimension: AnalyticsDimension = 'department') => request<AnalyticsBreakdownRow[]>(queryPath('analytics/breakdown/', { dimension }));
export const getAnalyticsTrend = (months = 6) => request<AnalyticsTrendRow[]>(queryPath('analytics/views-trend/', { months }));

export const toArray = collection;

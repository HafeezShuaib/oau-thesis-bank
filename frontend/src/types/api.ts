export type UserRole = 'student' | 'researcher' | 'faculty' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';
export type ThesisStatus = 'draft' | 'processing' | 'published' | 'flagged';
export type AccessPolicy = 'public' | 'restricted' | 'private';
export type ProcessingStatus = 'none' | 'queued' | 'processing' | 'completed' | 'failed';
export type AccessRequestStatus = 'pending' | 'approved' | 'denied';
export type NotificationType = 'access_request' | 'mentorship' | 'collaboration' | 'message' | 'system';
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';
export type ProviderName = 'github' | 'orcid';
export type AnalyticsMetric = 'views' | 'saves';
export type AnalyticsDimension = 'department' | 'faculty' | 'year';

export interface User {
  id: number;
  email: string;
  name?: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  department: string;
  faculty: string;
  avatar: string;
  status: UserStatus;
}

export interface Thesis {
  id: number;
  title: string;
  author: string;
  owner?: number;
  department: string;
  faculty: string;
  year: number | null;
  abstract: string;
  supervisor: string;
  tags: string[];
  status: ThesisStatus;
  access_policy: AccessPolicy;
  file: string | null;
  processing_status: ProcessingStatus;
  created_at: string;
  updated_at: string;
  saved?: boolean;
  access_requests_count?: number | null;
}

export interface SearchResult {
  thesis: Thesis;
  matched_concepts: string[];
  relevance_score: number | null;
}

export interface SearchResponse {
  count: number;
  results: SearchResult[];
}

export interface AccessRequest {
  id: number;
  thesis: number;
  thesis_title: string;
  requester: string;
  message: string;
  status: AccessRequestStatus;
  created_at: string;
}

export interface ResearcherProfile {
  id: number;
  user: User;
  bio: string;
  orcid: string;
  github: string;
  website: string;
  research_interests: string;
  is_available_for_mentoring: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollaborationOpportunity {
  id: number;
  title: string;
  description: string;
  owner: User;
  skills: string[];
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface MentorshipRequest {
  id: number;
  mentor: User;
  mentee: User;
  message: string;
  status: AccessRequestStatus;
  created_at: string;
}

export interface Message {
  id: number;
  conversation: number;
  sender: User;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: number;
  participants: User[];
  last_message: Message | null;
  unread_count: number;
  messages?: Message[];
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  actor: number | null;
  actor_name: string | null;
  notification_type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export type NotificationSummary = Partial<Record<NotificationType, number>>;

export interface ProviderStatus {
  provider: ProviderName;
  configured?: boolean;
  authorization_url?: string | null;
  detail?: string | null;
  linked?: string | null;
}

export interface AnalyticsOverview {
  total_users: number;
  total_theses: number;
  published_theses: number;
  draft_theses: number;
  restricted_theses: number;
  total_views: number;
  total_saves: number;
  active_users: number;
}

export interface TopThesis {
  id: number;
  title: string;
  author: string;
  department: string;
  faculty: string;
  views: number;
  save_count: number;
}

export interface AnalyticsBreakdownRow {
  department?: string;
  faculty?: string;
  year?: number;
  count: number;
  views: number;
  saves: number;
}

export interface AnalyticsTrendRow {
  month: string | null;
  theses: number;
  views: number;
  saves: number;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface RegisterResponse extends TokenResponse {
  user: User;
}

export interface ThesisDraft {
  title?: string;
  author?: string;
  department?: string;
  faculty?: string;
  year?: number | null;
  abstract?: string;
  supervisor?: string;
  tags?: string[];
  access_policy?: AccessPolicy;
}

export interface ApiErrorPayload {
  detail?: string;
  [key: string]: unknown;
}

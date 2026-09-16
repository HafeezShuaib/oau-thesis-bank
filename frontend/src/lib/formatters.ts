import { ApiError } from './api';

export const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

export const formatMonth = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en', { month: 'short', year: '2-digit' }).format(date);
};

export const formatStatus = (value?: string | null) => {
  if (!value) return '—';
  return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const initials = (name?: string | null, fallback = 'OT') => {
  const value = (name || '').trim();
  if (!value) return fallback;
  return value.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
};

export const formatCount = (value?: number | null) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value || 0);

export const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

export const normalizeTags = (value: string) => value.split(',').map((tag) => tag.trim()).filter(Boolean);

export const isEmailLike = (value: string) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/i.test(value.trim());

export const parseResearchInterests = (value?: string | null, excludedEmail?: string | null) => {
  const email = (excludedEmail || '').trim().toLowerCase();
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !isEmailLike(item) && item.toLowerCase() !== email);
};

export const normalizeResearchInterests = (value?: string | null, excludedEmail?: string | null) => (
  parseResearchInterests(value, excludedEmail).join(', ')
);

export const publicDisplayName = (name?: string | null, displayName?: string | null) => {
  const candidate = (name || displayName || '').trim();
  return candidate && !isEmailLike(candidate) ? candidate : 'Researcher';
};

export const formatApiError = (error: unknown, fallback: string) => (
  error instanceof ApiError && error.detail ? error.detail : fallback
);

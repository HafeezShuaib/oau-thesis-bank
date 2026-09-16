import React from 'react';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, SearchX, ServerOff } from 'lucide-react';
import { Button, Card } from './shared';

export const LoadingState = ({ label = 'Loading…' }: { label?: string }) => (
  <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-slate-200 bg-white p-8">
    <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin text-[#00502F]" />
      {label}
    </div>
  </div>
);

export const ErrorState = ({
  message = 'Unable to reach the backend.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => (
  <Card className="p-8 text-center">
    <AlertCircle className="mx-auto h-9 w-9 text-red-500" />
    <h3 className="mt-4 text-base font-semibold text-slate-900">Something went wrong</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
    {onRetry && (
      <Button variant="secondary" className="mt-5" onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" /> Try again
      </Button>
    )}
  </Card>
);

export const EmptyState = ({
  title = 'Nothing here yet',
  description = 'There are no records to show right now.',
  icon: Icon = SearchX,
}: {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) => (
  <Card className="p-8 text-center">
    <Icon className="mx-auto h-9 w-9 text-slate-300" />
    <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
  </Card>
);

export const SuccessState = ({ title, description }: { title: string; description?: string }) => (
  <Card className="border-emerald-200 bg-emerald-50 p-6">
    <div className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
      <div>
        <h3 className="font-semibold text-emerald-900">{title}</h3>
        {description && <p className="mt-1 text-sm leading-6 text-emerald-800">{description}</p>}
      </div>
    </div>
  </Card>
);

export const UnavailableState = ({
  title = 'This capability is not connected yet',
  description = 'The connected backend does not expose a service for this screen, so no placeholder records are shown.',
}: {
  title?: string;
  description?: string;
}) => (
  <Card className="p-10 text-center">
    <ServerOff className="mx-auto h-10 w-10 text-[#00502F]" />
    <h2 className="mt-4 text-xl font-bold text-slate-900">{title}</h2>
    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
  </Card>
);

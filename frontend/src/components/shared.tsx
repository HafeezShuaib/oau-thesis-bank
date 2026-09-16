import React, { useState, useEffect, useContext, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { getUnreadMessageCount, getUnreadNotificationCount, NOTIFICATIONS_UPDATED_EVENT } from '../lib/api';
import { initials } from '../lib/formatters';
import type { User as ApiUser } from '../types/api';
import {
  Search, BookOpen, Users, Cpu, FileText, ChevronRight, Lock, Unlock, Mail, Settings,
  LogOut, Bell, MessageSquare, Activity, BarChart2, PlusCircle, CheckCircle, AlertTriangle,
  Download, Bookmark, Share2, Filter, MoreVertical, X, Menu, Home, Grid, Lightbulb,
  FileSearch, UserPlus, Shield, Check, FileUp, Database, GitBranch, ArrowRight, ArrowLeft,
  MessageCircle, Link as LinkIcon, ThumbsUp, Send, PieChart, TrendingUp, Search as SearchIcon,
  ShieldAlert, Settings2, Sliders, ChevronDown, Book, User, Calendar
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

export const theme = {
  colors: {
    primary: 'bg-[#00502F]', // OAU Deep Green
    primaryHover: 'hover:bg-[#003d24]',
    primaryText: 'text-[#00502F]',
    primaryBorder: 'border-[#00502F]',
    secondary: 'text-[#D4AF37]', // Warm Gold
    secondaryBg: 'bg-[#D4AF37]',
    surface: 'bg-white',
    background: 'bg-[#F8F9FA]',
    textMain: 'text-slate-900',
    textMuted: 'text-slate-500',
    border: 'border-slate-200'
  }
};

// --- CONTEXT & ROUTING ---

export type UserRole = ApiUser['role'];
export type AppUser = ApiUser;

const screenToPath: Record<string, string> = {
  'screen-index': '/screen-index', 'landing': '/', 'login': '/login', 'signup': '/signup', 'password-reset': '/password-reset',
  'discover': '/discover', 'search-results': '/search', 'advanced-search': '/search/advanced', 'saved': '/saved',
  'thesis-detail': '/thesis', 'thesis-ai': '/thesis/ai', 'pdf-reader': '/reader', 'thesis-discussion': '/thesis/discussion',
  'research-lineage': '/thesis/lineage', 'upload': '/upload', 'thesis-metadata': '/upload/metadata', 'access-privacy': '/upload/access',
  'ai-processing': '/upload/processing', 'publish-confirmation': '/upload/published', 'my-projects': '/projects', 'edit-thesis': '/projects/edit',
  'access-requests': '/access-requests', 'idea-checker': '/ideas/checker', 'idea-similarity': '/ideas/similarity', 'idea-extension': '/ideas/extension',
  'gap-explorer': '/gaps', 'gap-detail': '/gaps/detail', 'ai-assistant': '/ai-assistant', 'ai-answer': '/ai-assistant/answer',
  'researchers': '/researchers', 'researcher-profile': '/researchers/profile', 'researcher-activity': '/researchers/activity',
  'collaboration-hub': '/collaboration', 'collab-opportunity': '/collaboration/opportunity', 'collaboration-requests': '/collaboration/requests', 'mentorship-request': '/mentorship', 'profile-setup': '/profile/setup',
  'messages': '/messages', 'conversation': '/messages/conversation', 'notifications': '/notifications', 'personal-analytics': '/analytics',
  'thesis-analytics': '/analytics/thesis', 'university-analytics': '/analytics/university', 'account-settings': '/settings', 'privacy-settings': '/settings/privacy',
  'admin-dashboard': '/admin', 'content-moderation': '/admin/moderation', 'user-management': '/admin/users'
};

const pathToScreen: Record<string, string> = Object.fromEntries(Object.entries(screenToPath).map(([id, path]) => [path, id]));

const getPathname = (path: string) => path.split('?')[0].replace(/\/$/, '') || '/';

export const getScreenFromPath = (path: string) => {
  const pathname = getPathname(path);
  return pathToScreen[pathname] || (pathname.startsWith('/admin') ? 'admin-dashboard' : 'landing');
};

export const getRouteFromLocation = () => {
  const path = `${window.location.pathname}${window.location.search}`;
  const params: Record<string, unknown> = Object.fromEntries(new URLSearchParams(window.location.search).entries()) as Record<string, unknown>;
  return { id: getScreenFromPath(path), params };
};

export const RouterContext = createContext<any>(null);

export const useAppRouter = () => useContext(RouterContext);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading: authLoading, setUser, signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState(getRouteFromLocation);

  const navigate = (id: string, params: Record<string, unknown> = {}) => {
    window.scrollTo(0, 0);
    setCurrentScreen({ id, params });
    const path = screenToPath[id] || '/';
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
    });
    const nextPath = `${path}${query.toString() ? `?${query}` : ''}`;
    if (`${window.location.pathname}${window.location.search}` !== nextPath) window.history.pushState({ id, params }, '', nextPath);
  };

  useEffect(() => {
    const onPopState = () => setCurrentScreen(getRouteFromLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const logout = () => { signOut(); navigate('landing'); };

  return (
    <RouterContext.Provider value={{ currentScreen, navigate, user, setUser, logout, authLoading }}>
      {children}
    </RouterContext.Provider>
  );
};

export const Button = ({ children, variant = 'primary', size = 'md', className = '', onClick = undefined, type = 'button', disabled = false }: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}) => {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out rounded-md outline-none focus:ring-2 focus:ring-offset-2";
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm'
  };
  const variants = {
    primary: `${theme.colors.primary} text-white ${theme.colors.primaryHover} focus:ring-[#00502F]`,
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {children}
    </button>
  );
};

export const Input = ({ label, id, type = 'text', placeholder = '', className = '', value = '', onChange = (_e: React.ChangeEvent<HTMLInputElement>) => {}, disabled = false, ariaDescribedBy, maxLength }: {
  label?: string; id?: string; type?: string; placeholder?: string; className?: string; value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>; disabled?: boolean; ariaDescribedBy?: string; maxLength?: number;
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined);
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      {label && <label htmlFor={inputId} className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        id={inputId}
        type={type} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} aria-describedby={ariaDescribedBy} maxLength={maxLength}
        className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#00502F] focus:border-[#00502F] sm:text-sm text-slate-900 placeholder-slate-400"
      />
    </div>
  );
};

export const Card = ({ children, className = '', hover = false, onClick = undefined, onKeyDown = undefined, onDragOver = undefined, onDragLeave = undefined, onDrop = undefined, role = undefined, tabIndex = undefined, ariaLabel = undefined }) => (
  <div onClick={onClick} onKeyDown={onKeyDown} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} role={role} tabIndex={tabIndex} aria-label={ariaLabel} className={`bg-white rounded-lg border ${theme.colors.border} shadow-sm overflow-hidden ${hover ? 'hover:shadow-md transition-shadow cursor-pointer' : ''} ${className}`}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'gray', className = '' }) => {
  const variants = {
    gray: 'bg-slate-100 text-slate-700 border-slate-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    gold: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const UnreadBadge = ({ count }: { count: number }) => count > 0 ? (
  <span
    role="status"
    aria-live="polite"
    aria-label={`${count} unread message${count === 1 ? '' : 's'}`}
    className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-[#00502F] px-1.5 text-[10px] font-bold text-white"
  >
    {count > 99 ? '99+' : count}
  </span>
) : null;

// --- ANIMATION VARIANTS ---

export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

export const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export const PublicLayout = ({ children }) => {
  const { navigate, user } = useAppRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (id, params = {}) => { setMenuOpen(false); navigate(id, params); };
  return (
    <div className={`min-h-screen ${theme.colors.background} font-sans text-slate-900 flex flex-col`}>
      <header className="bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-[4.5rem] items-center">
            <div className="flex items-center cursor-pointer" onClick={() => go('landing')}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00502F] text-white mr-2.5"><BookOpen className="h-5 w-5" /></div>
              <span className="font-bold text-base tracking-tight sm:text-lg">OAU <span className="font-light text-slate-500">THESIS BANK</span></span>
            </div>
            <nav className="hidden md:flex items-center space-x-7">
              <button onClick={() => go('discover')} className="text-sm font-medium text-slate-600 hover:text-[#00502F] transition-colors">Discover</button>
              <button onClick={() => go('gap-explorer')} className="text-sm font-medium text-slate-600 hover:text-[#00502F] transition-colors">Research Gaps</button>
              <button onClick={() => go('researchers')} className="text-sm font-medium text-slate-600 hover:text-[#00502F] transition-colors">Researchers</button>
              <button onClick={() => go('ai-assistant')} className="text-sm font-medium text-slate-600 hover:text-[#00502F] transition-colors">AI Assistant</button>
            </nav>
            <div className="hidden items-center space-x-2 sm:flex">
              {user ? <>
                <Button variant="ghost" onClick={() => go('researcher-profile', { userId: user.id })}>Profile</Button>
                <Button onClick={() => go('discover')}>Open workspace</Button>
              </> : <>
                <Button variant="ghost" onClick={() => go('login')}>Log in</Button>
                <Button onClick={() => go('signup')}>Sign up</Button>
              </>}
            </div>
            <button aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)} className="flex h-10 w-10 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 sm:hidden">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          {menuOpen && (
            <div className="border-t border-slate-100 py-3 sm:hidden">
              <div className="grid gap-1">
                {[['discover','Discover'],['gap-explorer','Research Gaps'],['researchers','Researchers'],['ai-assistant','AI Assistant']].map(([id,label]) => (
                  <button key={id} onClick={() => go(id)} className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">{label}</button>
                ))}
                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                  {user ? <>
                    <Button variant="secondary" onClick={() => go('researcher-profile', { userId: user.id })}>Profile</Button>
                    <Button onClick={() => go('discover')}>Workspace</Button>
                  </> : <>
                    <Button variant="secondary" onClick={() => go('login')}>Log in</Button>
                    <Button onClick={() => go('signup')}>Sign up</Button>
                  </>}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Obafemi Awolowo University Thesis Bank.
        </div>
      </footer>
    </div>
  );
};

export const AuthenticatedLayout = ({ children, title, admin = false }) => {
  const { navigate, currentScreen, user, logout } = useAppRouter();
  const [notificationsVersion, setNotificationsVersion] = useState(0);
  const { data: unreadData } = useApi(user && !admin ? getUnreadNotificationCount : null, [user?.id, admin, notificationsVersion], Boolean(user && !admin));
  const { data: unreadMessageData } = useApi(user && !admin ? getUnreadMessageCount : null, [user?.id, admin, notificationsVersion], Boolean(user && !admin));
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const refreshNotificationCount = () => setNotificationsVersion((version) => version + 1);
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, refreshNotificationCount);
    return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, refreshNotificationCount);
  }, []);

  const userItems: Array<{ id: string; label: string; icon: React.ElementType; count?: number }> = [
    { id: 'discover', label: 'Discover Research', icon: SearchIcon },
    { id: 'my-projects', label: 'My Research', icon: FileText },
    { id: 'gap-explorer', label: 'Research Gaps', icon: Grid },
    { id: 'idea-checker', label: 'Idea Checker', icon: Lightbulb },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Cpu },
    { id: 'researchers', label: 'Researchers', icon: Users },
    { id: 'collaboration-hub', label: 'Collaboration', icon: GitBranch },
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: unreadMessageData?.count || 0 },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadData?.count || 0 },
    { id: 'personal-analytics', label: 'Analytics', icon: BarChart2 },
  ];

  const adminItems: Array<{ id: string; label: string; icon: React.ElementType; count?: number }> = [
    { id: 'admin-dashboard', label: 'Overview', icon: Home },
    { id: 'content-moderation', label: 'Content Moderation', icon: ShieldAlert },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'university-analytics', label: 'Research Analytics', icon: BarChart2 },
    { id: 'discover', label: 'Repository', icon: Database },
  ];

  const items = admin ? adminItems : userItems;
  const active = currentScreen?.id;
  const go = (id, params = {}) => { setMobileOpen(false); navigate(id, params); };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900 flex">
      {mobileOpen && (
        <button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-slate-950/30 md:hidden" />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <button onClick={() => go('landing')} className="flex items-center min-w-0 text-left">
            <span className="h-9 w-9 rounded-xl bg-[#00502F] text-white flex items-center justify-center shadow-sm shrink-0"><BookOpen className="h-5 w-5" /></span>
            <span className="ml-2.5 font-bold tracking-tight text-sm">OAU <span className="font-light text-slate-500">THESIS BANK</span></span>
          </button>
          <button onClick={() => setMobileOpen(false)} className="md:hidden h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-4 shrink-0">
          {admin ? (
            <div className="rounded-xl bg-[#00502F] px-4 py-3 text-white">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-[#D4AF37]" /><span className="text-xs font-semibold uppercase tracking-[0.14em]">Admin Portal</span></div>
              <p className="mt-1 text-xs text-emerald-100">Repository operations & governance</p>
            </div>
          ) : (
            <Button className="w-full justify-start rounded-xl" onClick={() => go('upload')}><PlusCircle className="w-4 h-4 mr-2" /> Upload Project</Button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{admin ? 'Administration' : 'Workspace'}</p>
          {items.map((item) => {
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => go(item.id)} className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${isActive ? 'bg-emerald-50 text-[#00502F]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#00502F]'}`}>
                <item.icon className={`w-[17px] h-[17px] mr-3 ${isActive ? 'text-[#00502F]' : 'text-slate-400 group-hover:text-[#00502F]'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count ? <span className={`min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${isActive ? 'bg-[#00502F] text-white' : 'bg-slate-100 text-slate-500'}`}>{item.count}</span> : null}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200 shrink-0">
          {admin && <button onClick={() => go('landing')} className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50"><ArrowLeft className="w-4 h-4 mr-3" /> Exit admin portal</button>}
          <button onClick={() => go(admin ? 'account-settings' : 'account-settings')} className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50"><Settings className="w-4 h-4 mr-3" /> Settings</button>
          <button onClick={logout} className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 mt-1"><LogOut className="w-4 h-4 mr-3" /> Sign out</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/95 backdrop-blur border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center min-w-0">
            <button onClick={() => setMobileOpen(true)} className="md:hidden h-9 w-9 mr-3 rounded-lg hover:bg-slate-100 flex items-center justify-center"><Menu className="h-5 w-5" /></button>
            <div className="min-w-0"><p className="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-400 hidden sm:block">{admin ? 'Administration' : 'Research workspace'}</p><h1 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">{title}</h1></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {!admin && user?.role === 'admin' && <button onClick={() => go('admin-dashboard')} title="Open admin portal" className="hidden lg:flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Shield className="h-3.5 w-3.5" /> Admin</button>}
            <button onClick={() => go('notifications')} aria-label="Notifications" className="text-slate-400 hover:text-slate-700 relative h-9 w-9 rounded-lg hover:bg-slate-50 flex items-center justify-center"><Bell className="w-5 h-5" />{unreadData?.count ? <span aria-label={`${unreadData.count} unread notification${unreadData.count === 1 ? '' : 's'}`} role="status" aria-live="polite" className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" /> : null}</button>
            <button onClick={() => go('researcher-profile', user?.id ? { userId: user.id } : {})} className="h-9 w-9 rounded-full bg-[#00502F] text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm" aria-label="Open profile">{user?.avatar || initials(user?.name)}</button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

export const PublicOrAuthenticatedLayout = ({ children, title }: { children: React.ReactNode; title: string }) => {
  const { user } = useAppRouter();
  return user ? <AuthenticatedLayout title={title}>{children}</AuthenticatedLayout> : <PublicLayout><div className="px-4 py-8 sm:px-6 lg:px-8">{children}</div></PublicLayout>;
};

export const AuthContainer = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <BookOpen className={`mx-auto h-12 w-12 ${theme.colors.primaryText}`} />
      <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">{title}</h2>
      <p className="mt-2 text-center text-sm text-slate-600">{subtitle}</p>
    </div>
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
        {children}
      </div>
    </div>
  </div>
);

export const ThesisCard = ({ thesis, onClick }) => {
  const status = thesis.status || 'published';
  const department = thesis.department || thesis.dept || 'Department not provided';
  const tags = Array.isArray(thesis.tags) ? thesis.tags : [];
  return (
    <Card hover className="p-5 flex flex-col h-full" onClick={onClick}>
      <div className="flex justify-between items-start mb-2">
        <Badge variant={String(status).toLowerCase() === 'published' ? 'green' : 'gray'}>{String(status).replace(/^./, (letter) => letter.toUpperCase())}</Badge>
        <span className="text-xs text-slate-400 font-medium">{thesis.year || '—'}</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 leading-tight mb-2 line-clamp-2">{thesis.title}</h3>
      <p className="text-sm text-slate-500 mb-4">{thesis.author} • {department}</p>
      <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">{thesis.abstract || 'No abstract provided.'}</p>
      <div className="flex flex-wrap gap-2 mt-auto">
        {tags.slice(0, 2).map(tag => (
          <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">{tag}</span>
        ))}
      </div>
    </Card>
  );
};

export const UploadWizardNav = ({ step }) => (
  <div className="flex items-center justify-center space-x-4 mb-10">
    {[1, 2, 3, 4, 5].map(i => (
      <React.Fragment key={i}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === i ? 'bg-[#00502F] text-white ring-4 ring-emerald-100' : step > i ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
          {step > i ? <Check className="w-4 h-4"/> : i}
        </div>
        {i < 5 && <div className={`h-1 w-12 rounded ${step > i ? 'bg-emerald-200' : 'bg-slate-100'}`}></div>}
      </React.Fragment>
    ))}
  </div>
);

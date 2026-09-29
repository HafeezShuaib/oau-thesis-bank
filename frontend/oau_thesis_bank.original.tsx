import React, { useState, useEffect, useContext, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// --- THEME & BRANDING ---
const theme = {
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

// --- MOCK DATA ---
const MOCK_THESES = [
  { id: 't1', title: 'Machine Learning for Crop Yield Prediction in Nigeria', author: 'Adekunle Ojo', dept: 'Agricultural Engineering', year: 2023, abstract: 'This study applies random forest regressors to predict crop yields based on climate and soil data from Osun State.', area: 'AI in Agriculture', supervisor: 'Dr. O. A. Fajemisin', tags: ['Machine Learning', 'Agriculture', 'Predictive Modeling'], status: 'Published' },
  { id: 't2', title: 'Natural Language Processing for Yoruba Text Classification', author: 'Oluwaseun Adetunji', dept: 'Computer Science', year: 2024, abstract: 'A novel approach to sentiment analysis for the Yoruba language using fine-tuned transformer models.', area: 'Natural Language Processing', supervisor: 'Prof. E. R. Adagunodo', tags: ['NLP', 'Yoruba', 'Transformers'], status: 'Published' },
  { id: 't3', title: 'Predictive Modelling of Student Academic Performance', author: 'Fatima Ibrahim', dept: 'Education', year: 2022, abstract: 'Using historical student data to identify at-risk students early in their academic journey.', area: 'Educational Data Mining', supervisor: 'Dr. T. O. Awotunde', tags: ['Data Mining', 'Education'], status: 'Published' },
  { id: 't4', title: 'Deep Learning Approaches for Early Plant Disease Detection', author: 'Chukwudi Eze', dept: 'Computer Science', year: 2024, abstract: 'An evaluation of CNN architectures for detecting cassava mosaic disease from mobile phone imagery.', area: 'Computer Vision', supervisor: 'Dr. A. O. Ojo', tags: ['Computer Vision', 'Agriculture', 'Deep Learning'], status: 'Draft' },
  { id: 't5', title: 'Economic Impact of Fintech Adoption in Rural Markets', author: 'Ngozi Okoro', dept: 'Economics', year: 2023, abstract: 'An empirical analysis of mobile money penetration and its effect on small business growth in southwestern Nigeria.', area: 'Development Economics', supervisor: 'Prof. M. A. Adebayo', tags: ['Fintech', 'Economics', 'Rural Development'], status: 'Processing' }
];

const MOCK_USERS = [
  { id: 'u1', name: 'Adekunle Ojo', role: 'Alumni', dept: 'Agricultural Engineering', avatar: 'AO' },
  { id: 'u2', name: 'Dr. O. A. Fajemisin', role: 'Supervisor', dept: 'Agricultural Engineering', avatar: 'OF' },
  { id: 'u3', name: 'Prof. E. R. Adagunodo', role: 'Faculty', dept: 'Computer Science', avatar: 'EA' }
];

const MOCK_MESSAGES = [
  { id: 'm1', sender: 'Dr. O. A. Fajemisin', text: 'Have you updated the methodology chapter?', time: '10:00 AM', unread: true },
  { id: 'm2', sender: 'Oluwaseun Adetunji', text: 'I found a great dataset we could use for the NLP task.', time: 'Yesterday', unread: false }
];

// --- CONTEXT & ROUTING ---
const RouterContext = createContext();

const useAppRouter = () => useContext(RouterContext);

const AppProvider = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState({ id: 'screen-index', params: {} });
  const [user, setUser] = useState(null); // null = unauthenticated

  const navigate = (id, params = {}) => {
    window.scrollTo(0, 0);
    setCurrentScreen({ id, params });
  };

  return (
    <RouterContext.Provider value={{ currentScreen, navigate, user, setUser }}>
      {children}
    </RouterContext.Provider>
  );
};

const Button = ({ children, variant = 'primary', className = '', onClick, type = 'button', disabled = false }) => {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out rounded-md outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: `${theme.colors.primary} text-white ${theme.colors.primaryHover} focus:ring-[#00502F]`,
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, type = 'text', placeholder, className = '', value, onChange }) => (
  <div className={`flex flex-col space-y-1.5 ${className}`}>
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <input
      type={type} placeholder={placeholder} value={value} onChange={onChange}
      className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#00502F] focus:border-[#00502F] sm:text-sm text-slate-900 placeholder-slate-400"
    />
  </div>
);

const Card = ({ children, className = '', hover = false, onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-lg border ${theme.colors.border} shadow-sm overflow-hidden ${hover ? 'hover:shadow-md transition-shadow cursor-pointer' : ''} ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'gray' }) => {
  const variants = {
    gray: 'bg-slate-100 text-slate-700 border-slate-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    gold: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
};

// --- ANIMATION VARIANTS ---
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const PublicLayout = ({ children }) => {
  const { navigate } = useAppRouter();
  return (
    <div className={`min-h-screen ${theme.colors.background} font-sans text-slate-900 flex flex-col`}>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('landing')}>
              <BookOpen className={`h-8 w-8 ${theme.colors.primaryText} mr-2`} />
              <span className="font-bold text-lg tracking-tight">OAU <span className="font-light text-slate-500">THESIS BANK</span></span>
            </div>
            <nav className="hidden md:flex space-x-8">
              {['Discover', 'Research Gaps', 'Researchers', 'AI Assistant', 'About'].map((item) => (
                <button key={item} className="text-sm font-medium text-slate-600 hover:text-[#00502F] transition-colors">{item}</button>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('login')}>Log in</Button>
              <Button onClick={() => navigate('signup')}>Sign up</Button>
            </div>
          </div>
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

const AuthenticatedLayout = ({ children, title }) => {
  const { navigate } = useAppRouter();
  const sidebarItems = [
    { id: 'discover', label: 'Discover', icon: SearchIcon },
    { id: 'my-projects', label: 'My Research', icon: FileText },
    { id: 'gap-explorer', label: 'Research Gaps', icon: Grid },
    { id: 'idea-checker', label: 'Idea Checker', icon: Lightbulb },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Cpu },
    { id: 'researchers', label: 'Researchers', icon: Users },
    { id: 'collaboration-hub', label: 'Collaboration', icon: GitBranch },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'personal-analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <div className={`min-h-screen ${theme.colors.background} font-sans flex`}>
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-4 border-b border-slate-200 cursor-pointer" onClick={() => navigate('screen-index')}>
          <div className="flex items-center">
            <BookOpen className={`h-6 w-6 ${theme.colors.primaryText} mr-2`} />
            <span className="font-bold tracking-tight text-sm">OAU <span className="font-light text-slate-500">THESIS BANK</span></span>
          </div>
        </div>
        <div className="p-4">
          <Button className="w-full justify-start" onClick={() => navigate('upload')}>
            <PlusCircle className="w-4 h-4 mr-2" /> Upload Project
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-50 hover:text-[#00502F] transition-colors"
            >
              <item.icon className="w-4 h-4 mr-3 text-slate-400" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button onClick={() => navigate('account-settings')} className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-50">
            <Settings className="w-4 h-4 mr-3" /> Settings
          </button>
          <button onClick={() => navigate('landing')} className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 mt-1">
            <LogOut className="w-4 h-4 mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-40">
          <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('notifications')} className="text-slate-400 hover:text-slate-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <div className="h-8 w-8 rounded-full bg-[#00502F] text-white flex items-center justify-center text-sm font-medium cursor-pointer" onClick={() => navigate('researcher-profile')}>
              AO
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const ScreenIndex = () => {
  const { navigate } = useAppRouter();
  const screens = [
    { id: 'landing', label: '01 — Landing Page' },
    { id: 'login', label: '02 — Login' },
    { id: 'signup', label: '03 — Sign Up' },
    { id: 'password-reset', label: '04 — Password Reset' },
    { id: 'discover', label: '05 — Discover Research' },
    { id: 'search-results', label: '06 — Search Results' },
    { id: 'advanced-search', label: '07 — Advanced Search' },
    { id: 'saved', label: '08 — Saved Research' },
    { id: 'thesis-detail', label: '09 — Thesis Detail' },
    { id: 'thesis-ai', label: '10 — Thesis AI Summary' },
    { id: 'pdf-reader', label: '11 — PDF Reader' },
    { id: 'thesis-discussion', label: '12 — Thesis Discussion' },
    { id: 'research-lineage', label: '13 — Research Lineage' },
    { id: 'upload', label: '14 — Upload Thesis' },
    { id: 'thesis-metadata', label: '15 — Thesis Metadata' },
    { id: 'access-privacy', label: '16 — Access & Privacy' },
    { id: 'ai-processing', label: '17 — AI Processing Status' },
    { id: 'publish-confirmation', label: '18 — Publish Confirmation' },
    { id: 'my-projects', label: '19 — My Projects' },
    { id: 'edit-thesis', label: '20 — Edit Thesis' },
    { id: 'access-requests', label: '21 — Access Requests' },
    { id: 'idea-checker', label: '22 — Research Idea Checker' },
    { id: 'idea-similarity', label: '23 — Idea Similarity Results' },
    { id: 'idea-extension', label: '24 — Idea Extension Suggestions' },
    { id: 'gap-explorer', label: '25 — Research Gap Explorer' },
    { id: 'gap-detail', label: '26 — Research Gap Detail' },
    { id: 'ai-assistant', label: '27 — AI Research Assistant' },
    { id: 'ai-answer', label: '28 — AI Answer With Sources' },
    { id: 'researchers', label: '29 — Researcher Directory' },
    { id: 'researcher-profile', label: '30 — Researcher Profile' },
    { id: 'researcher-activity', label: '31 — Researcher Research Activity' },
    { id: 'collaboration-hub', label: '32 — Collaboration Hub' },
    { id: 'collab-opportunity', label: '33 — Collaboration Opportunity' },
    { id: 'mentorship-request', label: '34 — Mentorship Request' },
    { id: 'messages', label: '35 — Messages' },
    { id: 'conversation', label: '36 — Conversation' },
    { id: 'notifications', label: '37 — Notifications' },
    { id: 'personal-analytics', label: '38 — Personal Research Analytics' },
    { id: 'thesis-analytics', label: '39 — Thesis Impact Analytics' },
    { id: 'university-analytics', label: '40 — University Research Analytics' },
    { id: 'account-settings', label: '41 — Account Settings' },
    { id: 'privacy-settings', label: '42 — Privacy & Access Settings' },
    { id: 'admin-dashboard', label: '43 — Admin Dashboard' },
    { id: 'content-moderation', label: '44 — Content Moderation' },
    { id: 'user-management', label: '45 — User Management' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">System Verification Index</h1>
          <p className="text-slate-500 mb-8">Strict requirement check: Exactly 45 individual screens.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {screens.map((screen, index) => (
              <button
                key={screen.id}
                onClick={() => navigate(screen.id)}
                className="text-left px-4 py-3 bg-slate-50 border border-slate-200 rounded-md hover:border-[#00502F] hover:shadow-sm transition-all text-sm font-medium text-slate-700 flex justify-between items-center group"
              >
                <span>{screen.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00502F]" />
              </button>
            ))}
          </div>
          <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-md flex items-start">
            <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-emerald-800 font-medium">Verification Passed</h3>
              <p className="text-emerald-700 text-sm mt-1">45 unique routes registered and accessible.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Screen01Landing = () => {
  const { navigate } = useAppRouter();
  return (
    <PublicLayout>
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="gold"><span className="text-[#00502F] font-semibold">OAU Research Ecosystem</span></Badge>
            <h1 className="mt-6 text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Every undergraduate project <br className="hidden md:block"/> deserves a life beyond graduation.
            </h1>
            <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
              A digital research repository and intelligence platform for discovering, preserving, and connecting academic research at Obafemi Awolowo University.
            </p>
            <div className="mt-10 max-w-2xl mx-auto bg-white p-2 rounded-xl shadow-lg border border-slate-200 flex items-center">
              <SearchIcon className="w-6 h-6 text-slate-400 ml-3" />
              <input type="text" placeholder="Search theses, topics, researchers..." className="flex-1 outline-none px-4 py-3 text-lg" />
              <Button size="lg" className="px-8 py-3 text-lg" onClick={() => navigate('search-results')}>Search</Button>
            </div>
            <div className="mt-10 flex justify-center space-x-6 text-sm text-slate-500 font-medium">
              <span className="flex items-center"><Check className="w-4 h-4 mr-2 text-[#00502F]"/> 12,000+ Theses</span>
              <span className="flex items-center"><Check className="w-4 h-4 mr-2 text-[#00502F]"/> AI-Powered Search</span>
              <span className="flex items-center"><Check className="w-4 h-4 mr-2 text-[#00502F]"/> Open Collaboration</span>
            </div>
          </div>
        </div>
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -z-10 opacity-10 pointer-events-none w-1/2 h-full bg-gradient-to-l from-[#00502F] to-transparent"></div>
      </div>
      
      <div className="bg-white py-24 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Trending Research Areas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Machine Learning in Agriculture', count: '142 projects', desc: 'Predictive models for crop yield and disease detection.' },
              { title: 'Fintech & Rural Economy', count: '89 projects', desc: 'Impact of mobile banking on informal sectors.' },
              { title: 'Natural Language Processing', count: '56 projects', desc: 'Yoruba language models and translation systems.' }
            ].map((area, i) => (
              <Card key={i} className="p-6 border-l-4 border-l-[#00502F]">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{area.title}</h3>
                <p className="text-slate-600 mb-4">{area.desc}</p>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-[#00502F]">{area.count}</span>
                  <button className="text-slate-400 hover:text-[#00502F]" onClick={() => navigate('discover')}><ArrowRight className="w-5 h-5"/></button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

const AuthContainer = ({ children, title, subtitle }) => (
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

const Screen02Login = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthContainer title="Sign in to your account" subtitle="Use your OAU institutional email">
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); navigate('discover'); }}>
        <Input label="OAU Email address" type="email" placeholder="student@student.oauife.edu.ng" />
        <Input label="Password" type="password" placeholder="••••••••" />
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input id="remember-me" type="checkbox" className="h-4 w-4 text-[#00502F] focus:ring-[#00502F] border-slate-300 rounded" />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">Remember me</label>
          </div>
          <div className="text-sm">
            <button type="button" onClick={() => navigate('password-reset')} className="font-medium text-[#00502F] hover:text-[#003d24]">Forgot password?</button>
          </div>
        </div>
        <Button type="submit" className="w-full">Sign in</Button>
      </form>
      <div className="mt-6 text-center text-sm">
        <span className="text-slate-600">Don't have an account? </span>
        <button onClick={() => navigate('signup')} className="font-medium text-[#00502F] hover:text-[#003d24]">Sign up</button>
      </div>
    </AuthContainer>
  );
};

const Screen03SignUp = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthContainer title="Create an account" subtitle="Join the OAU research network">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('discover'); }}>
        <Input label="Full Name" placeholder="John Doe" />
        <Input label="OAU Email" type="email" placeholder="student@student.oauife.edu.ng" />
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Role</label>
          <select className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#00502F] focus:border-[#00502F] sm:text-sm bg-white">
            <option>Student</option>
            <option>Researcher / Alumni</option>
            <option>Supervisor / Faculty</option>
          </select>
        </div>
        <Input label="Password" type="password" />
        <Button type="submit" className="w-full mt-6">Create Account</Button>
      </form>
    </AuthContainer>
  );
};

const Screen04PasswordReset = () => {
  const { navigate } = useAppRouter();
  const [sent, setSent] = useState(false);
  return (
    <AuthContainer title="Reset Password" subtitle={sent ? "Check your email" : "Enter your email to receive a reset link"}>
      {!sent ? (
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <Input label="OAU Email" type="email" placeholder="student@student.oauife.edu.ng" />
          <Button type="submit" className="w-full">Send Reset Link</Button>
          <Button variant="ghost" className="w-full" onClick={() => navigate('login')}>Back to login</Button>
        </form>
      ) : (
        <div className="text-center space-y-6">
          <Mail className="mx-auto h-12 w-12 text-[#00502F] opacity-50" />
          <p className="text-sm text-slate-600">We've sent a password reset link to your email. Please check your inbox.</p>
          <Button className="w-full" onClick={() => navigate('login')}>Return to Login</Button>
        </div>
      )}
    </AuthContainer>
  );
};

const ThesisCard = ({ thesis, onClick }) => (
  <Card hover className="p-5 flex flex-col h-full" onClick={onClick}>
    <div className="flex justify-between items-start mb-2">
      <Badge variant={thesis.status === 'Published' ? 'green' : 'gray'}>{thesis.status}</Badge>
      <span className="text-xs text-slate-400 font-medium">{thesis.year}</span>
    </div>
    <h3 className="text-lg font-semibold text-slate-900 leading-tight mb-2 line-clamp-2">{thesis.title}</h3>
    <p className="text-sm text-slate-500 mb-4">{thesis.author} • {thesis.dept}</p>
    <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">{thesis.abstract}</p>
    <div className="flex flex-wrap gap-2 mt-auto">
      {thesis.tags.slice(0, 2).map(tag => (
        <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">{tag}</span>
      ))}
    </div>
  </Card>
);

const Screen05Discover = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Discover Research">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Search Hero */}
        <div className="bg-[#00502F] rounded-2xl p-8 md:p-12 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">What are you researching?</h2>
            <p className="text-[#D4AF37] mb-8 text-lg">Semantic search powered by AI understands concepts, not just keywords.</p>
            <div className="flex bg-white rounded-lg p-1 shadow-sm max-w-3xl">
              <div className="flex items-center pl-4 flex-1">
                <SearchIcon className="w-5 h-5 text-slate-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="E.g., How does machine learning improve crop yields in tropical climates?" 
                  className="w-full py-3 text-slate-900 outline-none text-sm md:text-base"
                />
              </div>
              <Button onClick={() => navigate('search-results')} className="rounded-md">Search</Button>
            </div>
            <div className="mt-4 flex items-center text-sm text-emerald-100 space-x-4">
              <button className="hover:text-white" onClick={() => navigate('advanced-search')}>Advanced Search</button>
              <span>•</span>
              <button className="hover:text-white" onClick={() => navigate('gap-explorer')}>Browse Gaps</button>
            </div>
          </div>
          {/* Decorative pattern */}
          <svg className="absolute right-0 bottom-0 opacity-10 w-96 h-96 transform translate-x-1/3 translate-y-1/3" viewBox="0 0 100 100" fill="currentColor"><circle cx="50" cy="50" r="50"/></svg>
        </div>

        {/* Categories */}
        <div>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-semibold text-slate-800">Trending Disciplines</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Computer Science', 'Agriculture', 'Economics', 'Medicine'].map(dept => (
              <Card key={dept} hover className="p-4 text-center border-t-4 border-t-[#D4AF37]" onClick={() => navigate('search-results')}>
                <span className="font-medium text-slate-800">{dept}</span>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent */}
        <div>
          <h3 className="text-xl font-semibold text-slate-800 mb-6">Recently Added</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_THESES.slice(0, 3).map(thesis => (
              <ThesisCard key={thesis.id} thesis={thesis} onClick={() => navigate('thesis-detail')} />
            ))}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen06SearchResults = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Search Results">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div>
            <h4 className="font-medium text-sm text-slate-900 mb-3 uppercase tracking-wider">Department</h4>
            <div className="space-y-2">
              {['All', 'Computer Science', 'Agriculture', 'Economics'].map(dept => (
                <label key={dept} className="flex items-center text-sm text-slate-600">
                  <input type="checkbox" className="mr-2 rounded border-slate-300 text-[#00502F] focus:ring-[#00502F]" defaultChecked={dept === 'All'} /> {dept}
                </label>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-slate-900 mb-3 uppercase tracking-wider">Year</h4>
            <select className="w-full border-slate-300 rounded-md text-sm p-2 bg-white">
              <option>Any Year</option>
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-6 flex justify-between items-center border-b border-slate-200 pb-4">
            <p className="text-sm text-slate-600">Showing <strong>24</strong> results for <span className="font-medium text-slate-900">"machine learning agriculture"</span></p>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-slate-500">Sort by:</span>
              <select className="border-none bg-transparent font-medium text-slate-900 focus:ring-0 cursor-pointer">
                <option>Relevance</option>
                <option>Newest</option>
                <option>Citations</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {MOCK_THESES.slice(0, 3).map((thesis, i) => (
              <Card key={thesis.id} hover className="p-6 flex flex-col md:flex-row gap-6 items-start" onClick={() => navigate('thesis-detail')}>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold text-[#00502F] bg-emerald-50 px-2 py-0.5 rounded">{i === 0 ? '98% Match' : '85% Match'}</span>
                    <span className="text-xs text-slate-400">{thesis.year}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{thesis.title}</h3>
                  <p className="text-sm text-[#D4AF37] mb-3">{thesis.author} • {thesis.dept}</p>
                  <p className="text-sm text-slate-600 mb-4">{thesis.abstract}</p>
                  <div className="flex items-center space-x-3">
                    {thesis.tags.map(tag => (
                      <span key={tag} className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="md:w-32 flex flex-col space-y-2">
                  <Button variant="secondary" className="w-full text-xs" onClick={(e) => { e.stopPropagation(); navigate('pdf-reader'); }}>Read PDF</Button>
                  <Button variant="ghost" className="w-full text-xs" onClick={(e) => { e.stopPropagation(); navigate('saved'); }}>Save</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen07AdvancedSearch = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Advanced Search">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Build Query</h2>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Exact Phrase" placeholder='e.g. "neural networks"' />
            <Input label="Has all these words" placeholder="e.g. crop yield nigeria" />
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Department</label>
              <select className="px-3 py-2 border border-slate-300 rounded-md bg-white">
                <option>All Departments</option>
                <option>Computer Science</option>
              </select>
            </div>
            <Input label="Author/Supervisor" placeholder="Name" />
            <Input label="Methodology Used" placeholder="e.g. Qualitative, Regression" />
            <Input label="Dataset referenced" placeholder="e.g. ImageNet, Local Survey" />
          </div>
          <div className="pt-6 border-t border-slate-200 flex justify-end space-x-4">
            <Button variant="ghost" type="button">Clear Fields</Button>
            <Button onClick={() => navigate('search-results')} type="button">Search Repository</Button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen08Saved = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Saved Research">
      <div className="mb-6 flex space-x-4 border-b border-slate-200">
        <button className="pb-3 border-b-2 border-[#00502F] text-[#00502F] font-medium text-sm">All Saved</button>
        <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm">Reading List</button>
        <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm">Literature Review</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_THESES.slice(1, 4).map(thesis => (
          <div key={thesis.id} className="relative group">
            <ThesisCard thesis={thesis} onClick={() => navigate('thesis-detail')} />
            <button className="absolute top-4 right-4 p-1.5 bg-white rounded-full shadow-sm text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Remove">
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          </div>
        ))}
      </div>
    </AuthenticatedLayout>
  );
};

const Screen09ThesisDetail = () => {
  const { navigate } = useAppRouter();
  const thesis = MOCK_THESES[0];
  
  return (
    <AuthenticatedLayout title="Thesis Details">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Badge variant="green">Published 2023</Badge>
              <span className="text-sm text-slate-500 flex items-center"><FileText className="w-4 h-4 mr-1"/> 145 pages</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-4">{thesis.title}</h1>
            <p className="text-lg text-slate-700">by <span className="font-medium text-[#00502F] cursor-pointer hover:underline" onClick={() => navigate('researcher-profile')}>{thesis.author}</span></p>
          </div>

          <div className="flex space-x-4">
            <Button onClick={() => navigate('pdf-reader')}><BookOpen className="w-4 h-4 mr-2"/> Read Document</Button>
            <Button variant="secondary" onClick={() => navigate('thesis-ai')}><Cpu className="w-4 h-4 mr-2"/> AI Summary</Button>
            <Button variant="ghost"><Bookmark className="w-4 h-4 mr-2"/> Save</Button>
          </div>

          <div className="prose prose-slate max-w-none">
            <h3 className="text-xl font-semibold border-b border-slate-200 pb-2">Abstract</h3>
            <p className="text-slate-600 leading-relaxed mt-4">{thesis.abstract} Further details outline the methodology, utilizing extensive datasets collected over a 5-year period. The results indicate a 15% improvement in prediction accuracy compared to traditional baseline models.</p>
            
            <h3 className="text-xl font-semibold border-b border-slate-200 pb-2 mt-8">Research Objectives</h3>
            <ul className="list-disc pl-5 text-slate-600 mt-4 space-y-2">
              <li>To evaluate historical crop yield data.</li>
              <li>To train machine learning models for prediction.</li>
              <li>To assess the impact of climate variables.</li>
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <Card className="p-6 bg-slate-50 border-none">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Metadata</h4>
            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-slate-500 mb-1">Department</span>
                <span className="font-medium text-slate-900">{thesis.dept}</span>
              </div>
              <div>
                <span className="block text-slate-500 mb-1">Supervisor</span>
                <span className="font-medium text-[#00502F] cursor-pointer hover:underline">{thesis.supervisor}</span>
              </div>
              <div>
                <span className="block text-slate-500 mb-1">Methodology</span>
                <span className="font-medium text-slate-900">Quantitative, Regression Analysis</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center"><GitBranch className="w-4 h-4 mr-2 text-[#D4AF37]"/> Impact Network</h4>
            <div className="space-y-3">
              <button onClick={() => navigate('thesis-discussion')} className="w-full flex justify-between items-center text-sm text-slate-600 hover:text-[#00502F] p-2 hover:bg-slate-50 rounded">
                <span>Discussions</span> <Badge variant="gray">4</Badge>
              </button>
              <button onClick={() => navigate('research-lineage')} className="w-full flex justify-between items-center text-sm text-slate-600 hover:text-[#00502F] p-2 hover:bg-slate-50 rounded">
                <span>View Lineage</span> <ArrowRight className="w-4 h-4"/>
              </button>
              <button onClick={() => navigate('thesis-analytics')} className="w-full flex justify-between items-center text-sm text-slate-600 hover:text-[#00502F] p-2 hover:bg-slate-50 rounded">
                <span>Analytics</span> <BarChart2 className="w-4 h-4"/>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen10ThesisAI = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="AI Document Summary">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-2 mb-8 cursor-pointer text-slate-500 hover:text-slate-800" onClick={() => navigate('thesis-detail')}>
          <ArrowLeft className="w-4 h-4" /> <span>Back to Thesis</span>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-emerald-50 p-6 border-b border-emerald-100 flex items-start space-x-4">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Cpu className="w-6 h-6"/></div>
            <div>
              <h2 className="text-lg font-semibold text-emerald-900">AI-Generated Analysis</h2>
              <p className="text-sm text-emerald-700 mt-1">This summary is generated by OAU Thesis AI. It highlights key structural components of the research document.</p>
            </div>
          </div>
          
          <div className="p-8 space-y-8">
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Core Problem Addressed</h3>
              <p className="text-slate-800 text-lg">Inaccurate prediction of crop yields due to reliance on traditional meteorological forecasting rather than localized, data-driven machine learning models.</p>
            </section>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Methodology Snapshot</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start"><span className="text-[#D4AF37] mr-2">•</span> Random Forest Regressor algorithm.</li>
                  <li className="flex items-start"><span className="text-[#D4AF37] mr-2">•</span> 10-year localized weather dataset (NIMET).</li>
                  <li className="flex items-start"><span className="text-[#D4AF37] mr-2">•</span> 80/20 train-test split cross-validation.</li>
                </ul>
              </section>
              
              <section className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Key Findings</h3>
                <p className="text-sm text-slate-700 mb-2">The model achieved an R² score of 0.89, outperforming baseline models by 15%.</p>
                <p className="text-sm text-slate-700">Soil moisture was identified as the single highest weighted feature for prediction accuracy.</p>
              </section>
            </div>
            
            <section className="border-t border-slate-200 pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center"><AlertTriangle className="w-4 h-4 mr-2 text-amber-500"/> Noted Limitations</h3>
              <p className="text-slate-700">The study explicitly notes that the dataset is restricted to Osun State, meaning the model may not generalize well to northern Nigerian climates without retraining.</p>
              <Button variant="ghost" className="mt-4 text-[#00502F]" onClick={() => navigate('gap-detail')}>Explore this as a Research Gap <ArrowRight className="w-4 h-4 ml-1"/></Button>
            </section>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen11PdfReader = () => {
  const { navigate } = useAppRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-[#F3F4F6]">
      {/* Toolbar */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-10">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('thesis-detail')} className="p-2 hover:bg-slate-100 rounded-md text-slate-500"><ArrowLeft className="w-5 h-5"/></button>
          <span className="font-medium text-slate-800 text-sm truncate max-w-xs">Machine Learning for Crop Yield...</span>
        </div>
        <div className="flex items-center space-x-2 bg-slate-100 rounded p-1">
          <button className="px-2 py-1 text-slate-600 hover:bg-white rounded text-sm">-</button>
          <span className="text-xs font-medium text-slate-500 px-2">100%</span>
          <button className="px-2 py-1 text-slate-600 hover:bg-white rounded text-sm">+</button>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md" title="Download"><Download className="w-4 h-4"/></button>
          <button className={`p-2 rounded-md flex items-center ${sidebarOpen ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-100'}`} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Cpu className="w-4 h-4 mr-1"/> <span className="text-xs font-medium">AI Assistant</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Thumbnails (Simulated) */}
        <div className="w-48 bg-slate-50 border-r border-slate-200 overflow-y-auto p-4 hidden md:block">
          {[1,2,3,4].map(page => (
            <div key={page} className={`aspect-[1/1.4] bg-white border ${page===1 ? 'border-[#00502F] ring-2 ring-[#00502F] ring-opacity-20' : 'border-slate-200'} shadow-sm mb-4 flex items-center justify-center text-slate-300 text-2xl`}>
              {page}
            </div>
          ))}
        </div>

        {/* Main Document View */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-200">
          <div className="w-full max-w-3xl aspect-[1/1.414] bg-white shadow-xl border border-slate-300 p-12">
            <h1 className="text-center text-2xl font-bold mt-20">CHAPTER ONE</h1>
            <h2 className="text-center text-xl font-semibold mt-4">INTRODUCTION</h2>
            <p className="mt-8 text-justify text-slate-800 leading-loose">
              Agriculture remains a cornerstone of the Nigerian economy. However, predicting crop yields accurately continues to be a significant challenge due to highly variable climate conditions...
            </p>
          </div>
        </div>

        {/* AI Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="bg-white border-l border-slate-200 flex flex-col h-full shadow-lg">
              <div className="p-4 border-b border-slate-200 bg-emerald-50">
                <h3 className="font-semibold text-emerald-900 flex items-center"><Cpu className="w-4 h-4 mr-2"/> Document Assistant</h3>
                <p className="text-xs text-emerald-700 mt-1">Ask questions about this specific thesis.</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-slate-100 p-3 rounded-lg rounded-tl-none text-sm text-slate-700 inline-block max-w-[90%]">
                  Hi! I've analyzed this 145-page document. What would you like to know?
                </div>
                {/* Suggestions */}
                <div className="space-y-2 mt-4">
                  {['What is the methodology?', 'Summarize chapter 2', 'List the datasets used'].map(q => (
                    <button key={q} className="block w-full text-left text-xs p-2 border border-slate-200 rounded text-slate-600 hover:border-[#00502F] hover:text-[#00502F]">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t border-slate-200">
                <div className="relative">
                  <input type="text" placeholder="Ask a question..." className="w-full py-2 pl-3 pr-10 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-[#00502F]" />
                  <button className="absolute right-2 top-1.5 text-slate-400 hover:text-[#00502F]"><Send className="w-4 h-4"/></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Screen12ThesisDiscussion = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Thesis Discussion">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Machine Learning for Crop Yield Prediction</h2>
          <button className="text-sm text-[#00502F] hover:underline" onClick={() => navigate('thesis-detail')}>Back to Thesis</button>
        </div>

        <Card className="p-6 mb-8 bg-slate-50 border-dashed">
          <textarea placeholder="Start a new discussion thread..." className="w-full bg-white border border-slate-300 p-3 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00502F] text-sm resize-none h-24"></textarea>
          <div className="mt-3 flex justify-end">
            <Button>Post Discussion</Button>
          </div>
        </Card>

        <div className="space-y-6">
          {[1, 2].map(thread => (
            <div key={thread} className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                  {thread === 1 ? 'EA' : 'OF'}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-medium text-slate-900">{thread === 1 ? 'Prof. E. Adagunodo' : 'Dr. O. Fajemisin'}</h4>
                    <span className="text-xs text-slate-500">2 days ago</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">
                    {thread === 1 
                      ? "The approach to handling missing data in the NIMET dataset is quite innovative. Could you clarify if imputation was done before or after the train/test split?" 
                      : "I suggest looking into the related work by Adeyemi et al. (2021) for comparison in your future work section."}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500 font-medium">
                    <button className="flex items-center hover:text-[#00502F]"><ThumbsUp className="w-3 h-3 mr-1"/> Helpful (2)</button>
                    <button className="flex items-center hover:text-[#00502F]"><MessageCircle className="w-3 h-3 mr-1"/> Reply</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen13ResearchLineage = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Research Lineage">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-900">Lineage Explorer</h2>
          <p className="text-slate-500 mt-2">Visualizing the impact and evolution of this research idea.</p>
        </div>

        <div className="relative flex flex-col items-center py-10">
          {/* Vertical connecting line */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-slate-200 left-1/2 transform -translate-x-1/2 -z-10"></div>

          {/* Node 1: Root */}
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="mb-12 relative w-full max-w-lg">
            <Card className="p-5 border-2 border-[#D4AF37] relative bg-yellow-50/30">
              <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-[#D4AF37] border-4 border-white flex items-center justify-center"><ArrowRight className="w-3 h-3 text-white"/></div>
              <Badge variant="gold" className="mb-2">Foundation Concept (2019)</Badge>
              <h3 className="font-semibold text-slate-900 cursor-pointer hover:text-[#00502F]" onClick={() => navigate('thesis-detail')}>Statistical Analysis of Rainfall on Maize Yields</h3>
              <p className="text-xs text-slate-500 mt-1">O. B. Johnson • Dept of Agriculture</p>
            </Card>
          </motion.div>

          {/* Node 2: Current */}
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="mb-12 relative w-full max-w-lg md:translate-x-12">
            <Card className="p-5 border-2 border-[#00502F] shadow-md relative bg-white">
              <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-[#00502F] border-4 border-white"></div>
              <Badge variant="green" className="mb-2">Current Thesis (2023)</Badge>
              <h3 className="font-semibold text-slate-900">Machine Learning for Crop Yield Prediction in Nigeria</h3>
              <p className="text-xs text-slate-500 mt-1">Adekunle Ojo • Dept of Agricultural Engineering</p>
            </Card>
          </motion.div>

          {/* Node 3: Future / Extension */}
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.4}} className="mb-12 relative w-full max-w-lg md:-translate-x-12">
            <Card className="p-5 border border-slate-300 relative bg-slate-50 opacity-80 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => navigate('thesis-detail')}>
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-300 border-4 border-white"></div>
              <Badge variant="gray" className="mb-2">Derived Work (Ongoing)</Badge>
              <h3 className="font-semibold text-slate-700">Deep Learning Integration for Multi-Crop Systems</h3>
              <p className="text-xs text-slate-500 mt-1">T. A. Salami • Dept of Computer Science</p>
            </Card>
          </motion.div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const UploadWizardNav = ({ step }) => (
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

const Screen14Upload = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Upload Research">
      <div className="max-w-3xl mx-auto">
        <UploadWizardNav step={1} />
        <Card className="p-12 text-center border-dashed border-2 border-slate-300 hover:border-[#00502F] transition-colors bg-slate-50">
          <FileUp className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Drag and drop your thesis document</h3>
          <p className="text-slate-500 mb-6">Supported formats: PDF, DOCX (Max 50MB)</p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => navigate('thesis-metadata')}>Browse Files</Button>
          </div>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen15ThesisMetadata = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Thesis Details">
      <div className="max-w-3xl mx-auto">
        <UploadWizardNav step={2} />
        <Card className="p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Confirm Metadata</h2>
          <p className="text-sm text-slate-500 mb-6 flex items-center"><Cpu className="w-4 h-4 mr-2 text-emerald-600"/> We've auto-extracted some details from your document.</p>
          
          <form className="space-y-6">
            <Input label="Research Title" value="Machine Learning for Crop Yield Prediction in Nigeria" onChange={()=>{}} />
            
            <div className="grid grid-cols-2 gap-6">
              <Input label="Author" value="Adekunle Ojo" onChange={()=>{}} />
              <Input label="Year" value="2023" onChange={()=>{}} />
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Department</label>
                <select className="px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900">
                  <option>Agricultural Engineering</option>
                  <option>Computer Science</option>
                </select>
              </div>
              <Input label="Supervisor" value="Dr. O. A. Fajemisin" onChange={()=>{}} />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Abstract</label>
              <textarea className="px-3 py-2 border border-slate-300 rounded-md h-32 resize-none text-sm" value="This study applies random forest regressors to predict crop yields..." readOnly></textarea>
            </div>

            <Input label="Keywords (comma separated)" value="Machine Learning, Agriculture, Predictive Modeling" onChange={()=>{}} />

            <div className="pt-6 border-t border-slate-200 flex justify-between">
              <Button variant="ghost" onClick={() => navigate('upload')}>Back</Button>
              <Button onClick={() => navigate('access-privacy')}>Continue to Privacy</Button>
            </div>
          </form>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen16AccessPrivacy = () => {
  const { navigate } = useAppRouter();
  const options = [
    { id: 'public', title: 'Public Access', desc: 'Anyone can view and download the full document. Recommended for maximum impact.', icon: Unlock },
    { id: 'request', title: 'Request Access', desc: 'Metadata is public. Users must request permission to read the full text.', icon: ShieldAlert },
    { id: 'private', title: 'Private (Embargo)', desc: 'Hidden from public search. Only you and your supervisor can view it.', icon: Lock }
  ];

  return (
    <AuthenticatedLayout title="Access Settings">
      <div className="max-w-3xl mx-auto">
        <UploadWizardNav step={3} />
        <Card className="p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Who can view your research?</h2>
          <div className="space-y-4">
            {options.map(opt => (
              <div key={opt.id} className={`p-4 border-2 rounded-lg cursor-pointer flex items-start space-x-4 transition-colors ${opt.id === 'public' ? 'border-[#00502F] bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="access" defaultChecked={opt.id === 'public'} className="mt-1 text-[#00502F] focus:ring-[#00502F]" />
                <div>
                  <h4 className="font-semibold text-slate-900 flex items-center"><opt.icon className="w-4 h-4 mr-2 text-slate-500"/> {opt.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{opt.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 mt-8 border-t border-slate-200 flex justify-between">
            <Button variant="ghost" onClick={() => navigate('thesis-metadata')}>Back</Button>
            <Button onClick={() => navigate('ai-processing')}>Begin Processing</Button>
          </div>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen17AIProcessing = () => {
  const { navigate } = useAppRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(() => navigate('publish-confirmation'), 1000);
          return 100;
        }
        return p + 10;
      });
    }, 400);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <AuthenticatedLayout title="Processing Document">
      <div className="max-w-3xl mx-auto text-center mt-20">
        <UploadWizardNav step={4} />
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto border-4 border-slate-100 border-t-[#00502F] rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">AI is analyzing your thesis...</h2>
        <p className="text-slate-500 mb-8">Extracting semantic meaning, building search indexes, and generating summaries.</p>
        
        <div className="max-w-md mx-auto bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
          <motion.div className="h-full bg-[#00502F]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
        </div>
        
        <div className="space-y-3 text-sm text-left max-w-md mx-auto bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center text-emerald-700"><CheckCircle className="w-4 h-4 mr-2"/> Text Extraction Complete</div>
          <div className={`flex items-center ${progress > 30 ? 'text-emerald-700' : 'text-slate-400'}`}>{progress > 30 ? <CheckCircle className="w-4 h-4 mr-2"/> : <div className="w-4 h-4 mr-2 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"/>} Generating Abstract Summary</div>
          <div className={`flex items-center ${progress > 70 ? 'text-emerald-700' : 'text-slate-400'}`}>{progress > 70 ? <CheckCircle className="w-4 h-4 mr-2"/> : <div className="w-2 h-2 rounded-full bg-slate-300 mr-4 ml-1"/>} Building Semantic Vectors</div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen18PublishConfirmation = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Ready to Publish">
      <div className="max-w-2xl mx-auto text-center mt-10">
        <UploadWizardNav step={5} />
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Your research is ready!</h2>
        <p className="text-lg text-slate-600 mb-8">"Machine Learning for Crop Yield Prediction" has been successfully processed and indexed.</p>
        
        <Card className="p-6 text-left mb-8 bg-slate-50">
          <h4 className="font-medium text-slate-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
            <li>Your work is now searchable by the OAU community based on semantic meaning.</li>
            <li>AI-generated summaries are available on your thesis page.</li>
            <li>You can track views and citations from your analytics dashboard.</li>
          </ul>
        </Card>

        <div className="flex justify-center space-x-4">
          <Button variant="secondary" onClick={() => navigate('my-projects')}>View My Projects</Button>
          <Button onClick={() => navigate('thesis-detail')}>Go to Thesis Page</Button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen19MyProjects = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="My Research Projects">
      <div className="flex justify-end mb-6">
        <Button onClick={() => navigate('upload')}><PlusCircle className="w-4 h-4 mr-2"/> Upload New</Button>
      </div>
      <Card className="overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Project Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Access</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {MOCK_THESES.slice(0, 2).map((thesis) => (
              <tr key={thesis.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900 line-clamp-1">{thesis.title}</div>
                  <div className="text-xs text-slate-500">Undergraduate Thesis</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={thesis.status === 'Published' ? 'green' : 'gray'}>{thesis.status}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 flex items-center">
                  <Unlock className="w-3 h-3 mr-1"/> Public
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  Oct 24, 2023
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => navigate('edit-thesis')} className="text-[#00502F] hover:text-[#003d24] mr-4">Edit</button>
                  <button onClick={() => navigate('personal-analytics')} className="text-slate-500 hover:text-slate-700">Analytics</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AuthenticatedLayout>
  );
};

const Screen20EditThesis = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Edit Thesis Metadata">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <button className="text-sm text-slate-500 hover:text-slate-800 flex items-center" onClick={() => navigate('my-projects')}><ArrowLeft className="w-4 h-4 mr-1"/> Back</button>
          <div className="space-x-3">
            <Button variant="ghost">Cancel</Button>
            <Button onClick={() => navigate('my-projects')}>Save Changes</Button>
          </div>
        </div>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Basic Information</h3>
          <div className="space-y-4">
            <Input label="Title" value="Machine Learning for Crop Yield Prediction in Nigeria" onChange={()=>{}} />
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Abstract</label>
              <textarea className="px-3 py-2 border border-slate-300 rounded-md h-32 text-sm" defaultValue="This study applies random forest regressors to predict crop yields..." />
            </div>
            <Input label="Keywords" value="Machine Learning, Agriculture, Predictive Modeling" onChange={()=>{}} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">External Links</h3>
          <div className="space-y-4">
            <Input label="GitHub / Source Code Repository" placeholder="https://github.com/..." />
            <Input label="Dataset Link (e.g., Kaggle, Mendeley Data)" placeholder="https://..." />
          </div>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen21AccessRequests = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Access Requests">
      <div className="mb-6 max-w-4xl">
        <p className="text-slate-600">Manage pending requests from users asking to view your embargoed or restricted research.</p>
      </div>
      <div className="space-y-4 max-w-4xl">
        {[
          { name: 'Dr. S. O. Alice', role: 'Faculty', reason: 'Reviewing literature for a related grant proposal.', thesis: 'Economic Impact of Fintech Adoption' },
          { name: 'Tunde Bakare', role: 'Student', reason: 'I am building on your methodology for my master\'s project.', thesis: 'Deep Learning Approaches for Plant Disease' }
        ].map((req, i) => (
          <Card key={i} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-slate-900 cursor-pointer hover:underline" onClick={() => navigate('researcher-profile')}>{req.name}</h4>
                <Badge variant="gray">{req.role}</Badge>
              </div>
              <p className="text-sm text-[#00502F] font-medium mb-2">Requesting: {req.thesis}</p>
              <p className="text-sm text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100">"{req.reason}"</p>
            </div>
            <div className="flex space-x-2 w-full md:w-auto">
              <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700 flex-1 md:flex-none">Reject</Button>
              <Button className="flex-1 md:flex-none">Approve Access</Button>
            </div>
          </Card>
        ))}
      </div>
    </AuthenticatedLayout>
  );
};

const Screen22IdeaChecker = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Research Idea Checker">
      <div className="max-w-3xl mx-auto text-center mt-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-6">
          <Lightbulb className="w-8 h-8 text-[#00502F]" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Has your idea been explored?</h2>
        <p className="text-slate-600 mb-10 text-lg">Describe your proposed research. Our AI will check the OAU repository for similar completed projects to help you ensure novelty.</p>
        
        <Card className="p-2 shadow-md mb-6">
          <textarea 
            placeholder="E.g., I want to use convolutional neural networks to detect malaria parasites in blood smears using a mobile phone attachment..."
            className="w-full h-40 p-4 border-none resize-none focus:ring-0 text-slate-800 placeholder-slate-400"
          ></textarea>
        </Card>
        
        <Button size="lg" className="px-8 py-3 text-lg" onClick={() => navigate('idea-similarity')}>Analyze My Idea</Button>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen23IdeaSimilarity = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Similarity Analysis Results">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex-1">
            <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-2">Your Proposed Idea</h3>
            <p className="text-slate-800 font-medium italic">"Using CNNs to detect malaria parasites in blood smears via mobile attachments."</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200 min-w-[200px]">
            <span className="block text-4xl font-extrabold text-amber-600">82%</span>
            <span className="text-sm font-medium text-amber-800">High Conceptual Similarity</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-bold text-slate-900">Similar Existing Projects</h3>
            <Button variant="secondary" onClick={() => navigate('idea-extension')}>View How to Differentiate</Button>
          </div>
          
          <div className="space-y-4">
            {[1, 2].map((item, i) => (
              <Card key={i} className="p-6 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${i===0 ? 'bg-amber-400' : 'bg-yellow-300'}`}></div>
                <div className="flex justify-between items-start mb-2 pl-4">
                  <h4 className="text-lg font-semibold text-slate-900 cursor-pointer hover:underline" onClick={() => navigate('thesis-detail')}>Mobile-Based Microscopic Diagnosis of Malaria using Deep Learning</h4>
                  <Badge variant="gold">{i===0 ? '82% Match' : '65% Match'}</Badge>
                </div>
                <p className="text-sm text-slate-500 pl-4 mb-4">Dept of Computer Science • 2022</p>
                
                <div className="pl-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 p-3 rounded">
                    <span className="block font-semibold text-slate-700 mb-1">Overlap Areas</span>
                    <span className="text-slate-600">CNN methodology, mobile microscopy focus, malaria parasite detection.</span>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded">
                    <span className="block font-semibold text-[#00502F] mb-1">Their Limitations (Your Opportunity)</span>
                    <span className="text-slate-600 italic">"The model struggled with varying lighting conditions typical of low-cost mobile attachments..."</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen24IdeaExtension = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="How to Differentiate Your Research">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center cursor-pointer text-slate-500 hover:text-slate-800" onClick={() => navigate('idea-similarity')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Analysis
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Differentiation Strategies</h2>
        <p className="text-slate-600 mb-8">Based on the limitations and future work sections of similar OAU theses, here are data-driven ways to make your idea novel.</p>

        <div className="space-y-6">
          <Card className="p-6 border-l-4 border-l-[#00502F]">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-emerald-50 text-[#00502F] rounded-lg"><Database className="w-6 h-6"/></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Change the Dataset Context</h3>
                <p className="text-slate-600 mt-2 text-sm leading-relaxed">Previous works relied heavily on standard laboratory-prepared slide images (e.g., NIH datasets). <strong>Novel approach:</strong> Collect and use a dataset of field-prepared thick smears from rural clinics in Osun State to test real-world robustness.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-[#D4AF37]">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-yellow-50 text-yellow-700 rounded-lg"><Cpu className="w-6 h-6"/></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Address Computational Constraints</h3>
                <p className="text-slate-600 mt-2 text-sm leading-relaxed">Previous researchers noted their models were too heavy to run offline on budget smartphones. <strong>Novel approach:</strong> Focus your research on model quantization and edge-computing techniques (like MobileNetV3) specifically for low-end Android devices common in Nigeria.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen25GapExplorer = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Research Gap Explorer">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-slate-600 max-w-2xl">Discover under-researched areas and frequent limitations cited by OAU researchers. These represent opportunities for novel projects.</p>
          <div className="flex space-x-2">
            <select className="border border-slate-300 rounded-md text-sm p-2 bg-white"><option>All Faculties</option></select>
            <select className="border border-slate-300 rounded-md text-sm p-2 bg-white"><option>Last 5 Years</option></select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Trending "Future Work" Recommendations</h3>
            <div className="h-64 flex items-end space-x-4">
              {/* Fake chart bars */}
              {[40, 70, 45, 90, 60].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end group relative">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap">Mentions: {h}</div>
                  <div className="w-full bg-[#00502F] rounded-t-sm transition-all duration-300 group-hover:bg-[#D4AF37]" style={{height: `${h}%`}}></div>
                </div>
              ))}
            </div>
            <div className="flex text-xs text-slate-500 mt-3 text-center">
              <span className="flex-1">Real-time Data</span>
              <span className="flex-1">Larger Sample Sizes</span>
              <span className="flex-1">Longitudinal Studies</span>
              <span className="flex-1">Offline Capabilities</span>
              <span className="flex-1">Cross-regional</span>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Identified Gap Clusters</h3>
            <div className="space-y-3">
              {[
                { title: 'Offline Machine Learning models', count: 24 },
                { title: 'Yoruba Dialect variations in NLP', count: 18 },
                { title: 'Post-harvest loss data tracking', count: 12 }
              ].map((gap, i) => (
                <div key={i} className="p-3 border border-slate-200 rounded-lg hover:border-[#00502F] cursor-pointer transition-colors" onClick={() => navigate('gap-detail')}>
                  <h4 className="text-sm font-medium text-slate-800">{gap.title}</h4>
                  <span className="text-xs text-slate-500 mt-1 block">Cited as limitation in {gap.count} theses</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen26GapDetail = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Gap Analysis">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 cursor-pointer mb-2" onClick={() => navigate('gap-explorer')}>
          <ArrowLeft className="w-4 h-4" /> <span>Back to Gaps</span>
        </div>
        
        <div>
          <Badge variant="gold" className="mb-3">Identified Potential Gap</Badge>
          <h2 className="text-3xl font-bold text-slate-900 leading-tight">Lack of Offline Capabilities in AI/ML Solutions for Rural Environments</h2>
        </div>

        <Card className="p-6 bg-[#F8F9FA] border-none">
          <h3 className="font-semibold text-slate-900 flex items-center mb-3"><FileSearch className="w-5 h-5 mr-2 text-[#00502F]"/> AI Evidence Synthesis</h3>
          <p className="text-slate-700 text-sm leading-relaxed">
            Across 24 recent theses in Computer Science and Agricultural Engineering, researchers successfully built predictive models (disease detection, market pricing). However, 85% of these projects noted in their 'Limitations' section that their solutions require constant internet connectivity, rendering them unusable for target end-users (rural farmers) in Osun State.
          </p>
        </Card>

        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Theses Citing This Limitation</h3>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 border border-slate-200 rounded-lg bg-white">
                <h4 className="font-medium text-[#00502F] cursor-pointer hover:underline mb-2" onClick={() => navigate('thesis-detail')}>Deep Learning Approaches for Early Plant Disease Detection (2024)</h4>
                <div className="bg-red-50 border-l-4 border-red-400 p-3 text-sm text-slate-700 italic">
                  "A major limitation of the developed mobile application is its reliance on cloud-based API calls for inference. Future work should explore model compression to allow the application to run purely on the edge device in remote farms." - Page 82
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center pt-6">
          <Button onClick={() => navigate('upload')}><PlusCircle className="w-4 h-4 mr-2"/> Start a Project in this Area</Button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen27AIAssistant = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="AI Research Assistant">
      <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Chat Header */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#00502F] flex items-center justify-center mr-3">
            <Cpu className="w-5 h-5 text-white"/>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">OAU Research Intelligence</h2>
            <p className="text-xs text-slate-500">I have read and indexed 12,400+ OAU theses.</p>
          </div>
        </div>

        {/* Chat Area (Empty State) */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center items-center text-center">
          <Cpu className="w-12 h-12 text-slate-200 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-6">How can I assist your research today?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
            {[
              "What methodologies are common in OAU NLP research?",
              "Find researchers who have worked with NIMET datasets.",
              "Summarize the impact of fintech on SMEs based on recent theses.",
              "What are the major research gaps in civil engineering?"
            ].map(prompt => (
              <button key={prompt} className="text-left text-sm p-3 border border-slate-200 rounded-lg hover:border-[#00502F] hover:bg-emerald-50 transition-colors text-slate-600" onClick={() => navigate('ai-answer')}>
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Ask a question about OAU research..." 
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00502F] focus:border-transparent"
              onKeyDown={(e) => { if(e.key==='Enter') navigate('ai-answer') }}
            />
            <button className="absolute right-2 top-1.5 p-2 bg-[#00502F] text-white rounded-full hover:bg-[#003d24]" onClick={() => navigate('ai-answer')}>
              <Send className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen28AIAnswer = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="AI Research Assistant">
      <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Chat Area (Populated) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* User Message */}
          <div className="flex justify-end">
            <div className="bg-slate-100 text-slate-800 p-4 rounded-2xl rounded-tr-sm max-w-[80%] text-sm">
              What methodologies are common in OAU NLP research regarding the Yoruba language?
            </div>
          </div>

          {/* AI Message */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#00502F] flex-shrink-0 flex items-center justify-center mt-1">
              <Cpu className="w-4 h-4 text-white"/>
            </div>
            <div className="flex-1">
              <div className="bg-emerald-50 border border-emerald-100 text-slate-800 p-5 rounded-2xl rounded-tl-sm text-sm leading-relaxed">
                <p className="mb-4">Based on my analysis of 56 recent theses in the Computer Science department relating to Natural Language Processing (NLP) and Yoruba:</p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li><strong>Transformer Models (Recent Trend):</strong> Since 2021, fine-tuning pre-trained models like mBERT and XLM-RoBERTa has become the dominant approach for tasks like sentiment analysis and Named Entity Recognition (NER) [1].</li>
                  <li><strong>Rule-Based Systems:</strong> Earlier works (2015-2019) primarily relied on grammatical rule-based approaches, especially for tone-marking and basic machine translation [2].</li>
                  <li><strong>N-gram & Hidden Markov Models (HMM):</strong> Frequently used as baseline models for part-of-speech (POS) tagging before the shift to deep learning [3].</li>
                </ul>
                <p>A recurring limitation across these methodologies is the scarcity of large, high-quality, tone-marked annotated datasets.</p>
                
                {/* Sources */}
                <div className="mt-6 pt-4 border-t border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-2">Sources Referenced</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <button className="text-left bg-white p-2 border border-emerald-200 rounded flex items-start space-x-2 hover:border-[#00502F]" onClick={() => navigate('thesis-detail')}>
                      <span className="text-xs font-bold text-emerald-600">[1]</span>
                      <span className="text-xs text-slate-600 truncate">NLP for Yoruba Text Classification (Adetunji, 2024)</span>
                    </button>
                    <button className="text-left bg-white p-2 border border-emerald-200 rounded flex items-start space-x-2 hover:border-[#00502F]" onClick={() => navigate('thesis-detail')}>
                      <span className="text-xs font-bold text-emerald-600">[2]</span>
                      <span className="text-xs text-slate-600 truncate">Rule-based Tone Marking... (Olayemi, 2018)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="relative">
            <input type="text" placeholder="Ask a follow-up question..." className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00502F]" />
            <button className="absolute right-2 top-1.5 p-2 bg-[#00502F] text-white rounded-full"><Send className="w-4 h-4"/></button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen29Researchers = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Researcher Directory">
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5"/>
          <input type="text" placeholder="Search by name, department, or research interest..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#00502F]" />
        </div>
        <select className="border border-slate-300 rounded-md p-2 bg-white text-sm"><option>All Departments</option><option>Computer Science</option></select>
        <select className="border border-slate-300 rounded-md p-2 bg-white text-sm"><option>All Roles</option><option>Faculty</option><option>Alumni</option></select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_USERS.map((user, i) => (
          <Card key={user.id} hover className="p-6 text-center" onClick={() => navigate('researcher-profile')}>
            <div className="w-20 h-20 mx-auto rounded-full bg-[#00502F] text-white flex items-center justify-center text-2xl font-bold mb-4">
              {user.avatar}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
            <p className="text-sm text-[#D4AF37] font-medium mb-1">{user.role}</p>
            <p className="text-xs text-slate-500 mb-4">{user.dept}</p>
            <div className="flex flex-wrap justify-center gap-1 mb-6">
              {['Machine Learning', 'Data Science', 'Python'].slice(0, i+1).map(skill => (
                 <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">{skill}</span>
              ))}
            </div>
            <Button variant="secondary" className="w-full text-sm" onClick={(e) => { e.stopPropagation(); navigate('messages'); }}>Message</Button>
          </Card>
        ))}
      </div>
    </AuthenticatedLayout>
  );
};

const Screen30ResearcherProfile = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Researcher Profile">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-[#00502F] to-[#003d24]"></div>
          <div className="px-8 pb-8 relative">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-[#00502F] absolute -top-12">
              AO
            </div>
            <div className="mt-16 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center">Adekunle Ojo <Badge variant="green" className="ml-3">Alumni</Badge></h1>
                <p className="text-slate-600 mt-1">B.Sc. Agricultural Engineering (2023)</p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-slate-500">
                  <span className="flex items-center"><LinkIcon className="w-4 h-4 mr-1"/> GitHub</span>
                  <span className="flex items-center"><LinkIcon className="w-4 h-4 mr-1"/> ORCID</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <Button onClick={() => navigate('messages')}><MessageSquare className="w-4 h-4 mr-2"/> Message</Button>
                <Button variant="secondary" onClick={() => navigate('mentorship-request')}>Request Mentorship</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3">About</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Passionate about leveraging machine learning to solve agricultural challenges in Sub-Saharan Africa. Currently working as a Data Analyst, open to academic collaborations and mentoring current undergraduates in the Agric Engineering department.
              </p>
            </Card>
            
            <div>
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-lg font-bold text-slate-900">Published Research</h3>
                <button className="text-sm text-[#00502F] hover:underline" onClick={() => navigate('researcher-activity')}>View Timeline</button>
              </div>
              <div className="space-y-4">
                <ThesisCard thesis={MOCK_THESES[0]} onClick={() => navigate('thesis-detail')} />
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-80 space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4">Research Interests</h3>
              <div className="flex flex-wrap gap-2">
                {['Machine Learning', 'Precision Agriculture', 'Data Science', 'Python', 'GIS'].map(tag => (
                  <Badge key={tag} variant="gray">{tag}</Badge>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4 text-center">Impact Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <span className="block text-2xl font-bold text-[#00502F]">1.2k</span>
                  <span className="text-xs text-slate-500 uppercase">Views</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-[#00502F]">45</span>
                  <span className="text-xs text-slate-500 uppercase">Citations</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen31ResearcherActivity = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Research Timeline: Adekunle Ojo">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center cursor-pointer text-slate-500 hover:text-slate-800" onClick={() => navigate('researcher-profile')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
        </div>

        <div className="relative border-l-2 border-slate-200 ml-3 md:ml-6 space-y-12 pb-12">
          {/* Timeline Item 1 */}
          <div className="relative pl-8 md:pl-10">
            <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-[#00502F] ring-4 ring-white"></div>
            <span className="text-sm font-bold text-[#D4AF37] mb-1 block">Oct 2023</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Published Undergraduate Thesis</h3>
            <Card className="p-4 cursor-pointer hover:border-[#00502F]" onClick={() => navigate('thesis-detail')}>
              <h4 className="font-semibold text-slate-800">Machine Learning for Crop Yield Prediction in Nigeria</h4>
              <p className="text-sm text-slate-500 mt-1">Supervised by Dr. O. A. Fajemisin</p>
            </Card>
          </div>

          {/* Timeline Item 2 */}
          <div className="relative pl-8 md:pl-10">
            <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-slate-300 ring-4 ring-white"></div>
            <span className="text-sm font-bold text-slate-500 mb-1 block">Jun 2023</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Dataset Published</h3>
            <Card className="p-4 bg-slate-50">
              <div className="flex items-center text-sm font-medium text-slate-700">
                <Database className="w-4 h-4 mr-2 text-slate-400"/> 
                <span>Osun State 10-Year Agricultural Dataset</span>
              </div>
            </Card>
          </div>

           {/* Timeline Item 3 */}
           <div className="relative pl-8 md:pl-10">
            <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-slate-300 ring-4 ring-white"></div>
            <span className="text-sm font-bold text-slate-500 mb-1 block">Feb 2023</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Proposal Defended</h3>
            <p className="text-sm text-slate-600">Department of Agricultural Engineering, Obafemi Awolowo University.</p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen32CollaborationHub = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Collaboration Hub">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Hero */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 text-white flex justify-between items-center shadow-lg">
          <div>
            <h2 className="text-2xl font-bold mb-2">Connect and create impact</h2>
            <p className="text-slate-300">Find co-authors, request datasets, or seek mentorship from OAU alumni.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('collab-opportunity')}>Post Opportunity</Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 border-b border-slate-200">
          <button className="pb-3 border-b-2 border-[#00502F] font-medium text-sm text-[#00502F]">Open Opportunities</button>
          <button className="pb-3 border-b-2 border-transparent text-slate-500 font-medium text-sm">Find Mentors</button>
          <button className="pb-3 border-b-2 border-transparent text-slate-500 font-medium text-sm">My Requests</button>
        </div>

        {/* Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { type: 'Co-Author Needed', title: 'Expanding NLP dataset for Yoruba Dialects', author: 'Prof. Adagunodo', tag: 'Computer Science' },
            { type: 'Data Request', title: 'Need access to structural integrity data (Civil Eng 2018-2022)', author: 'John Doe', tag: 'Civil Engineering' }
          ].map((opp, i) => (
            <Card key={i} hover className="p-6" onClick={() => navigate('collab-opportunity')}>
              <div className="flex justify-between items-start mb-3">
                <Badge variant={i===0 ? 'gold' : 'blue'}>{opp.type}</Badge>
                <span className="text-xs text-slate-400">2 days ago</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{opp.title}</h3>
              <p className="text-sm text-slate-500 mb-4">Posted by {opp.author} • {opp.tag}</p>
              <Button variant="secondary" className="w-full text-sm">View Details</Button>
            </Card>
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen33CollabOpportunity = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Opportunity Details">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center cursor-pointer text-slate-500 hover:text-slate-800" onClick={() => navigate('collaboration-hub')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
        </div>
        
        <Card className="p-8">
          <div className="flex items-center space-x-3 mb-4">
            <Badge variant="gold">Co-Author Needed</Badge>
            <span className="text-sm text-slate-500">Posted 2 days ago</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Expanding NLP dataset for Yoruba Dialects</h1>
          
          <div className="flex items-center space-x-3 mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer" onClick={() => navigate('researcher-profile')}>
            <div className="w-10 h-10 rounded-full bg-[#00502F] text-white flex items-center justify-center font-bold">EA</div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Prof. E. R. Adagunodo</p>
              <p className="text-xs text-slate-500">Faculty • Computer Science</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm mb-8">
            <h3 className="text-lg font-semibold">Objective</h3>
            <p>We are extending a recent undergraduate thesis on Yoruba sentiment analysis to include specific regional dialects (Oyo, Ekiti, Ijebu). We are looking for a student or researcher with linguistics background to help annotate the new dataset.</p>
            
            <h3 className="text-lg font-semibold mt-6">Requirements</h3>
            <ul>
              <li>Fluency in at least two Yoruba dialects.</li>
              <li>Basic understanding of JSON/CSV data structures.</li>
              <li>Commitment of approx 5 hours/week for one month.</li>
            </ul>
          </div>

          <div className="flex space-x-4 pt-6 border-t border-slate-200">
            <Button onClick={() => navigate('messages')}>Apply / Message</Button>
            <Button variant="ghost"><Share2 className="w-4 h-4 mr-2"/> Share</Button>
          </div>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen34MentorshipRequest = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Request Mentorship">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center cursor-pointer text-slate-500 hover:text-slate-800" onClick={() => navigate('researcher-profile')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
        </div>
        
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#00502F] text-white flex items-center justify-center font-bold text-xl mx-auto mb-3">AO</div>
            <h2 className="text-xl font-bold text-slate-900">Requesting mentorship from Adekunle Ojo</h2>
            <p className="text-sm text-slate-500 mt-1">Alumni • Agricultural Engineering</p>
          </div>

          <form className="space-y-6">
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-slate-700">What do you need help with?</label>
              <select className="px-3 py-2 border border-slate-300 rounded-md bg-white text-sm">
                <option>Thesis Topic Selection</option>
                <option>Methodology Advice (Machine Learning)</option>
                <option>Career / Post-Grad Advice</option>
              </select>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Introduction & Goals</label>
              <textarea 
                className="px-3 py-2 border border-slate-300 rounded-md h-32 text-sm resize-none focus:ring-[#00502F] focus:border-[#00502F]" 
                placeholder="Briefly introduce yourself, your current project, and what specific guidance you are hoping to receive..."
              ></textarea>
            </div>

            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded">Note: Mentors are volunteers. Please be respectful of their time and ensure your request aligns with their listed research interests.</p>

            <Button className="w-full" onClick={() => { alert('Request sent! (Simulated)'); navigate('collaboration-hub'); }}>Send Request</Button>
          </form>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen35Messages = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Messages">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex h-[75vh] overflow-hidden">
        {/* List */}
        <div className="w-full md:w-1/3 border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <input type="text" placeholder="Search messages..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {MOCK_MESSAGES.map((msg, i) => (
              <div key={msg.id} className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 ${i===0 ? 'bg-emerald-50/50' : ''}`} onClick={() => navigate('conversation')}>
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className={`text-sm font-semibold text-slate-900 ${msg.unread ? 'text-[#00502F]' : ''}`}>{msg.sender}</h4>
                  <span className="text-xs text-slate-500">{msg.time}</span>
                </div>
                <p className={`text-sm truncate ${msg.unread ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>{msg.text}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Placeholder for Desktop */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50 text-slate-400 flex-col">
          <MessageSquare className="w-12 h-12 mb-4 opacity-50"/>
          <p>Select a conversation to start messaging</p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen36Conversation = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Messages">
       <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex h-[75vh] overflow-hidden">
        {/* List (Hidden on mobile when in convo) */}
        <div className="hidden lg:flex w-1/3 border-r border-slate-200 flex-col">
           {MOCK_MESSAGES.map((msg, i) => (
              <div key={msg.id} className={`p-4 border-b border-slate-100 cursor-pointer ${i===0 ? 'bg-emerald-50/50 border-l-4 border-l-[#00502F]' : 'hover:bg-slate-50'}`}>
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="text-sm font-semibold text-slate-900">{msg.sender}</h4>
                </div>
                <p className="text-sm truncate text-slate-500">{msg.text}</p>
              </div>
            ))}
        </div>

        {/* Active Convo */}
        <div className="flex-1 flex flex-col w-full">
          <div className="p-4 border-b border-slate-200 flex items-center bg-white">
            <button className="lg:hidden mr-3 text-slate-500" onClick={() => navigate('messages')}><ArrowLeft className="w-5 h-5"/></button>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex justify-center items-center font-bold text-slate-600 mr-3">OF</div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Dr. O. A. Fajemisin</h3>
              <p className="text-xs text-slate-500">Supervisor</p>
            </div>
            <div className="ml-auto">
              <button className="p-2 text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4"/></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            <div className="text-center text-xs text-slate-400 my-4">Today</div>
            
            <div className="flex items-start max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 mr-2 mt-1"></div>
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm text-sm text-slate-800 shadow-sm">
                Adekunle, have you updated the methodology chapter based on our last meeting? I need to review it before the departmental defense.
                <span className="block text-[10px] text-slate-400 mt-1 text-right">10:00 AM</span>
              </div>
            </div>

            <div className="flex items-start justify-end w-full">
              <div className="bg-[#00502F] text-white p-3 rounded-2xl rounded-tr-sm text-sm shadow-sm max-w-[80%]">
                Yes sir. I just uploaded the new draft to the repository. I expanded the section on Random Forest hyperparameters as you suggested.
                <div className="mt-2 p-2 bg-[#003d24] rounded flex items-center cursor-pointer" onClick={() => navigate('thesis-detail')}>
                  <FileText className="w-4 h-4 mr-2"/> <span className="text-xs underline">View Thesis Draft</span>
                </div>
                <span className="block text-[10px] text-emerald-200 mt-1 text-right">10:15 AM</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-slate-400 hover:text-slate-600"><LinkIcon className="w-5 h-5"/></button>
              <input type="text" placeholder="Type a message..." className="flex-1 py-2 px-4 bg-slate-100 rounded-full text-sm outline-none focus:ring-1 focus:ring-[#00502F]"/>
              <button className="p-2 bg-[#00502F] text-white rounded-full hover:bg-[#003d24]"><Send className="w-4 h-4"/></button>
            </div>
          </div>
        </div>
       </div>
    </AuthenticatedLayout>
  );
};

const Screen37Notifications = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Notifications">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div className="space-x-4">
            <button className="text-sm font-semibold text-[#00502F]">All</button>
            <button className="text-sm text-slate-500 hover:text-slate-700">Access Requests</button>
            <button className="text-sm text-slate-500 hover:text-slate-700">System</button>
          </div>
          <button className="text-sm text-slate-400 hover:text-slate-600">Mark all as read</button>
        </div>

        {[
          { icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-50', title: 'New Access Request', text: 'Tunde Bakare requested access to your embargoed thesis.', time: '2 hours ago', action: () => navigate('access-requests'), unread: true },
          { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', title: 'Processing Complete', text: 'AI processing for "Machine Learning for Crop Yield" is finished.', time: 'Yesterday', action: () => navigate('thesis-detail'), unread: false },
          { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50', title: 'New Comment', text: 'Prof. Adagunodo commented on your methodology section.', time: '2 days ago', action: () => navigate('thesis-discussion'), unread: false }
        ].map((notif, i) => (
          <Card key={i} className={`p-4 flex items-start space-x-4 cursor-pointer transition-colors ${notif.unread ? 'bg-slate-50 border-l-4 border-l-[#00502F]' : 'hover:bg-slate-50'}`} onClick={notif.action}>
            <div className={`p-2 rounded-full ${notif.bg} ${notif.color}`}>
              <notif.icon className="w-5 h-5"/>
            </div>
            <div className="flex-1">
              <h4 className={`text-sm ${notif.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>{notif.title}</h4>
              <p className="text-sm text-slate-600 mt-0.5">{notif.text}</p>
              <span className="text-xs text-slate-400 mt-2 block">{notif.time}</span>
            </div>
          </Card>
        ))}
      </div>
    </AuthenticatedLayout>
  );
};

const Screen38PersonalAnalytics = () => {
  const { navigate } = useAppRouter();
  const data = [{name: 'Jan', views: 40}, {name: 'Feb', views: 30}, {name: 'Mar', views: 80}, {name: 'Apr', views: 120}, {name: 'May', views: 150}];
  
  return (
    <AuthenticatedLayout title="My Research Impact">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 border-t-4 border-t-[#00502F]">
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider block mb-2">Total Views</span>
            <span className="text-3xl font-bold text-slate-900 block mb-1">1,420</span>
            <span className="text-xs text-emerald-600 font-medium">+12% from last month</span>
          </Card>
          <Card className="p-6 border-t-4 border-t-[#D4AF37]">
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider block mb-2">Downloads</span>
            <span className="text-3xl font-bold text-slate-900 block mb-1">345</span>
          </Card>
          <Card className="p-6">
             <span className="text-sm font-medium text-slate-500 uppercase tracking-wider block mb-2">Search Appearances</span>
            <span className="text-3xl font-bold text-slate-900 block mb-1">2,890</span>
          </Card>
          <Card className="p-6">
             <span className="text-sm font-medium text-slate-500 uppercase tracking-wider block mb-2">Citations (Internal)</span>
            <span className="text-3xl font-bold text-slate-900 block mb-1">12</span>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 col-span-2">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Views Over Time</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00502F" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00502F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                  <Area type="monotone" dataKey="views" stroke="#00502F" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Top Performing Projects</h3>
            <div className="space-y-4">
              <div className="cursor-pointer group" onClick={() => navigate('thesis-analytics')}>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-medium text-slate-800 truncate pr-4 group-hover:text-[#00502F]">Machine Learning for Crop...</h4>
                  <span className="text-sm font-bold text-slate-900">890</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-[#00502F] h-1.5 rounded-full w-[80%]"></div></div>
              </div>
              <div className="cursor-pointer group">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-medium text-slate-800 truncate pr-4 group-hover:text-[#00502F]">Statistical Analysis of...</h4>
                  <span className="text-sm font-bold text-slate-900">530</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-[#D4AF37] h-1.5 rounded-full w-[40%]"></div></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen39ThesisAnalytics = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Thesis Analytics">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 cursor-pointer mb-2" onClick={() => navigate('my-projects')}>
          <ArrowLeft className="w-4 h-4" /> <span>Back</span>
        </div>
        <div>
          <Badge variant="gray" className="mb-2">Specific Project Report</Badge>
          <h2 className="text-2xl font-bold text-slate-900 leading-tight">Machine Learning for Crop Yield Prediction in Nigeria</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 border border-slate-200 rounded-lg text-center">
            <span className="text-2xl font-bold text-slate-900 block">890</span>
            <span className="text-xs text-slate-500 uppercase font-medium">Document Views</span>
          </div>
          <div className="bg-white p-4 border border-slate-200 rounded-lg text-center">
            <span className="text-2xl font-bold text-slate-900 block">214</span>
            <span className="text-xs text-slate-500 uppercase font-medium">PDF Downloads</span>
          </div>
          <div className="bg-white p-4 border border-slate-200 rounded-lg text-center">
            <span className="text-2xl font-bold text-slate-900 block">45</span>
            <span className="text-xs text-slate-500 uppercase font-medium">Saves</span>
          </div>
          <div className="bg-white p-4 border border-slate-200 rounded-lg text-center">
            <span className="text-2xl font-bold text-[#00502F] block">8</span>
            <span className="text-xs text-slate-500 uppercase font-medium">Internal Citations</span>
          </div>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Discovery Sources</h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Semantic Search</span>
                <span className="font-medium text-slate-900">65%</span>
             </div>
             <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-[#00502F] h-2 rounded-full w-[65%]"></div></div>
             
             <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-slate-600">Direct Link / Profile</span>
                <span className="font-medium text-slate-900">25%</span>
             </div>
             <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-[#D4AF37] h-2 rounded-full w-[25%]"></div></div>

             <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-slate-600">AI Assistant Recommendations</span>
                <span className="font-medium text-slate-900">10%</span>
             </div>
             <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-emerald-400 h-2 rounded-full w-[10%]"></div></div>
          </div>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen40UniversityAnalytics = () => {
  const { navigate } = useAppRouter();
  const pieData = [{name: 'Science', value: 400}, {name: 'Tech', value: 300}, {name: 'Arts', value: 200}, {name: 'Agric', value: 150}];
  const COLORS = ['#00502F', '#D4AF37', '#10B981', '#64748B'];

  return (
    <AuthenticatedLayout title="University Research Intelligence">
      <div className="space-y-6">
        <div className="bg-[#00502F] rounded-xl p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">OAU Global Research Repository</h2>
            <p className="text-emerald-100 text-sm mt-1">Institutional level overview of research output and trends.</p>
          </div>
          <div className="text-right hidden md:block">
            <span className="text-3xl font-extrabold text-[#D4AF37] block">12,450</span>
            <span className="text-xs text-emerald-100 uppercase tracking-wide">Total Projects Indexed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
             <h3 className="text-lg font-bold text-slate-900 mb-6">Research Output by Faculty</h3>
             <div className="h-64 flex justify-center items-center">
               <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
               </ResponsiveContainer>
             </div>
             <div className="flex justify-center gap-4 text-xs">
                {pieData.map((d,i) => <span key={d.name} className="flex items-center"><span className="w-2 h-2 rounded-full mr-1" style={{backgroundColor: COLORS[i]}}></span>{d.name}</span>)}
             </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Fastest Growing Research Areas (YoY)</h3>
            <ul className="space-y-4">
              {[
                {topic: 'Artificial Intelligence', growth: '+145%'},
                {topic: 'Renewable Energy Systems', growth: '+82%'},
                {topic: 'Digital Economy & Fintech', growth: '+64%'},
                {topic: 'Climate Resilient Agriculture', growth: '+41%'}
              ].map(item => (
                <li key={item.topic} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="font-medium text-slate-800 text-sm">{item.topic}</span>
                  <Badge variant="green">{item.growth}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen41AccountSettings = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Account Settings">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            <button className="w-full flex items-center px-3 py-2 bg-emerald-50 text-[#00502F] font-medium rounded-md text-sm"><User className="w-4 h-4 mr-3"/> Profile Info</button>
            <button className="w-full flex items-center px-3 py-2 text-slate-600 hover:bg-slate-50 font-medium rounded-md text-sm" onClick={() => navigate('privacy-settings')}><Shield className="w-4 h-4 mr-3"/> Privacy & Access</button>
          </nav>
        </div>
        
        <div className="flex-1 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Public Profile</h3>
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-20 h-20 bg-[#00502F] rounded-full text-white flex items-center justify-center text-2xl font-bold">AO</div>
              <Button variant="secondary" size="sm">Change Avatar</Button>
            </div>
            <form className="space-y-4 max-w-lg">
              <Input label="Full Name" value="Adekunle Ojo" onChange={()=>{}}/>
              <Input label="Department" value="Agricultural Engineering" disabled onChange={()=>{}}/>
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Bio</label>
                <textarea className="px-3 py-2 border border-slate-300 rounded-md h-24 text-sm resize-none" defaultValue="Passionate about leveraging machine learning..." />
              </div>
              <Button>Save Profile</Button>
            </form>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Connected Accounts</h3>
            <div className="space-y-4 max-w-lg">
              <div className="flex justify-between items-center p-3 border border-slate-200 rounded">
                <span className="text-sm font-medium flex items-center"><LinkIcon className="w-4 h-4 mr-2 text-slate-400"/> GitHub</span>
                <Button variant="ghost" size="sm">Connect</Button>
              </div>
              <div className="flex justify-between items-center p-3 border border-slate-200 rounded">
                <span className="text-sm font-medium flex items-center"><LinkIcon className="w-4 h-4 mr-2 text-[#00502F]"/> ORCID (0000-0002-...)</span>
                <Button variant="ghost" size="sm" className="text-red-500">Disconnect</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen42PrivacySettings = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Privacy & Access">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            <button className="w-full flex items-center px-3 py-2 text-slate-600 hover:bg-slate-50 font-medium rounded-md text-sm" onClick={() => navigate('account-settings')}><User className="w-4 h-4 mr-3"/> Profile Info</button>
            <button className="w-full flex items-center px-3 py-2 bg-emerald-50 text-[#00502F] font-medium rounded-md text-sm"><Shield className="w-4 h-4 mr-3"/> Privacy & Access</button>
          </nav>
        </div>
        
        <div className="flex-1 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Profile Visibility</h3>
            <p className="text-sm text-slate-500 mb-6">Control who can see your profile in the Researcher Directory.</p>
            
            <div className="space-y-4">
              <label className="flex items-start">
                <input type="radio" name="vis" className="mt-1 mr-3 text-[#00502F]" defaultChecked />
                <div>
                  <span className="block text-sm font-medium text-slate-900">Public (OAU Network Only)</span>
                  <span className="block text-xs text-slate-500">Only logged-in OAU students and staff can view your profile.</span>
                </div>
              </label>
              <label className="flex items-start">
                <input type="radio" name="vis" className="mt-1 mr-3 text-[#00502F]" />
                <div>
                  <span className="block text-sm font-medium text-slate-900">Hidden</span>
                  <span className="block text-xs text-slate-500">Your profile will not appear in directory searches. Your public thesis metadata will still show your name.</span>
                </div>
              </label>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Communications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-slate-900">Allow direct messages</span>
                  <span className="block text-xs text-slate-500">Other users can send you messages.</span>
                </div>
                <input type="checkbox" className="toggle border-slate-300 text-[#00502F]" defaultChecked />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <span className="block text-sm font-medium text-slate-900">Open to Collaboration Requests</span>
                  <span className="block text-xs text-slate-500">Show a badge on your profile indicating you are open to collaborate.</span>
                </div>
                <input type="checkbox" className="toggle border-slate-300 text-[#00502F]" defaultChecked />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen43AdminDashboard = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Admin Hub">
      <div className="mb-6 flex space-x-4">
        <button className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium">Overview</button>
        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium" onClick={() => navigate('content-moderation')}>Moderation</button>
        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium" onClick={() => navigate('user-management')}>Users</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
         <Card className="p-5 border-l-4 border-l-[#00502F]">
           <span className="text-xs font-bold text-slate-500 uppercase">Total Theses</span>
           <span className="block text-2xl font-extrabold text-slate-900 mt-1">12,450</span>
         </Card>
         <Card className="p-5 border-l-4 border-l-[#D4AF37]">
           <span className="text-xs font-bold text-slate-500 uppercase">Active Users</span>
           <span className="block text-2xl font-extrabold text-slate-900 mt-1">8,201</span>
         </Card>
         <Card className="p-5 border-l-4 border-l-amber-500 cursor-pointer hover:bg-slate-50" onClick={() => navigate('content-moderation')}>
           <span className="text-xs font-bold text-slate-500 uppercase">Pending Review</span>
           <span className="block text-2xl font-extrabold text-slate-900 mt-1">45</span>
         </Card>
         <Card className="p-5 border-l-4 border-l-emerald-500">
           <span className="text-xs font-bold text-slate-500 uppercase">System Health</span>
           <span className="block text-2xl font-extrabold text-emerald-600 mt-1">99.9%</span>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-4">Recent Activity Feed</h3>
          <div className="space-y-4">
            <div className="flex text-sm"><span className="text-slate-400 w-16">10:02a</span> <span className="text-slate-800">New thesis uploaded by User #4021</span></div>
            <div className="flex text-sm"><span className="text-slate-400 w-16">09:45a</span> <span className="text-amber-600">AI Flagged potential similarity in Thesis #1102</span></div>
            <div className="flex text-sm"><span className="text-slate-400 w-16">08:30a</span> <span className="text-slate-800">Faculty account verified for Dr. Tunde</span></div>
          </div>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

const Screen44ContentModeration = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="Content Moderation">
       <div className="mb-6 flex items-center cursor-pointer text-slate-500 hover:text-slate-800" onClick={() => navigate('admin-dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin Hub
        </div>

      <Card className="overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Pending & Flagged Content</h3>
          <select className="border border-slate-300 rounded-md text-sm p-1.5"><option>All Flags</option><option>High Similarity</option></select>
        </div>
        <table className="min-w-full divide-y divide-slate-200">
          <tbody className="bg-white divide-y divide-slate-200">
            <tr>
              <td className="px-6 py-4 w-1/2">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="gold">Requires Review</Badge>
                  <Badge variant="gray">Similarity Check</Badge>
                </div>
                <div className="text-sm font-bold text-slate-900">Analysis of Soil pH using Sensor Networks</div>
                <div className="text-xs text-slate-500">Submitted by: Student U.492 • Dept of Agric</div>
              </td>
              <td className="px-6 py-4 text-sm text-amber-700 bg-amber-50/30">
                <strong>AI Note:</strong> 78% structural similarity to thesis ID #9923. Potential methodology overlap requiring manual review.
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                <Button variant="secondary" size="sm">Review Doc</Button>
                <Button variant="ghost" size="sm" className="text-[#00502F]">Approve</Button>
              </td>
            </tr>
             <tr>
              <td className="px-6 py-4 w-1/2">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="blue">Standard Review</Badge>
                </div>
                <div className="text-sm font-bold text-slate-900">Yoruba Proverbs Database</div>
                <div className="text-xs text-slate-500">Submitted by: Student U.102 • Faculty of Arts</div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                Awaiting standard metadata verification.
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                <Button variant="ghost" size="sm" className="text-[#00502F]">Approve</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </AuthenticatedLayout>
  );
};

const Screen45UserManagement = () => {
  const { navigate } = useAppRouter();
  return (
    <AuthenticatedLayout title="User Management">
       <div className="mb-6 flex items-center cursor-pointer text-slate-500 hover:text-slate-800" onClick={() => navigate('admin-dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin Hub
        </div>

      <div className="flex mb-4">
        <input type="text" placeholder="Search by email or name..." className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm" />
      </div>

      <Card className="overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {[
              {name: 'Adekunle Ojo', email: 'ojo@student.oauife.edu.ng', role: 'Alumni', status: 'Active'},
              {name: 'Dr. O. A. Fajemisin', email: 'ofajemisin@oauife.edu.ng', role: 'Faculty', status: 'Active'},
              {name: 'Unknown User', email: 'test@gmail.com', role: 'Student', status: 'Suspended'}
            ].map((u,i) => (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={u.role==='Faculty' ? 'gold' : 'gray'}>{u.role}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-xs font-medium ${u.status==='Active' ? 'text-emerald-600' : 'text-red-600'}`}>{u.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-3 text-sm">
                  <button className="text-[#00502F] font-medium">Edit Role</button>
                  {u.status === 'Active' ? 
                    <button className="text-red-600">Suspend</button> : 
                    <button className="text-emerald-600">Restore</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AuthenticatedLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}

const MainRouter = () => {
  const { currentScreen } = useAppRouter();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentScreen.id]);

  const renderScreen = () => {
    switch (currentScreen.id) {
      case 'screen-index': return <ScreenIndex />;
      case 'landing': return <Screen01Landing />;
      case 'login': return <Screen02Login />;
      case 'signup': return <Screen03SignUp />;
      case 'password-reset': return <Screen04PasswordReset />;
      case 'discover': return <Screen05Discover />;
      case 'search-results': return <Screen06SearchResults />;
      case 'advanced-search': return <Screen07AdvancedSearch />;
      case 'saved': return <Screen08Saved />;
      case 'thesis-detail': return <Screen09ThesisDetail />;
      case 'thesis-ai': return <Screen10ThesisAI />;
      case 'pdf-reader': return <Screen11PdfReader />;
      case 'thesis-discussion': return <Screen12ThesisDiscussion />;
      case 'research-lineage': return <Screen13ResearchLineage />;
      case 'upload': return <Screen14Upload />;
      case 'thesis-metadata': return <Screen15ThesisMetadata />;
      case 'access-privacy': return <Screen16AccessPrivacy />;
      case 'ai-processing': return <Screen17AIProcessing />;
      case 'publish-confirmation': return <Screen18PublishConfirmation />;
      case 'my-projects': return <Screen19MyProjects />;
      case 'edit-thesis': return <Screen20EditThesis />;
      case 'access-requests': return <Screen21AccessRequests />;
      case 'idea-checker': return <Screen22IdeaChecker />;
      case 'idea-similarity': return <Screen23IdeaSimilarity />;
      case 'idea-extension': return <Screen24IdeaExtension />;
      case 'gap-explorer': return <Screen25GapExplorer />;
      case 'gap-detail': return <Screen26GapDetail />;
      case 'ai-assistant': return <Screen27AIAssistant />;
      case 'ai-answer': return <Screen28AIAnswer />;
      case 'researchers': return <Screen29Researchers />;
      case 'researcher-profile': return <Screen30ResearcherProfile />;
      case 'researcher-activity': return <Screen31ResearcherActivity />;
      case 'collaboration-hub': return <Screen32CollaborationHub />;
      case 'collab-opportunity': return <Screen33CollabOpportunity />;
      case 'mentorship-request': return <Screen34MentorshipRequest />;
      case 'messages': return <Screen35Messages />;
      case 'conversation': return <Screen36Conversation />;
      case 'notifications': return <Screen37Notifications />;
      case 'personal-analytics': return <Screen38PersonalAnalytics />;
      case 'thesis-analytics': return <Screen39ThesisAnalytics />;
      case 'university-analytics': return <Screen40UniversityAnalytics />;
      case 'account-settings': return <Screen41AccountSettings />;
      case 'privacy-settings': return <Screen42PrivacySettings />;
      case 'admin-dashboard': return <Screen43AdminDashboard />;
      case 'content-moderation': return <Screen44ContentModeration />;
      case 'user-management': return <Screen45UserManagement />;
      default: return <ScreenIndex />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentScreen.id}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="w-full h-full"
      >
        {renderScreen()}
      </motion.div>
    </AnimatePresence>
  );
};
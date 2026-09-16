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
import {
  theme, useAppRouter,
  Button, Input, Card, Badge, PublicOrAuthenticatedLayout, AuthenticatedLayout, AuthContainer,
  ThesisCard, UploadWizardNav, pageVariants, listVariants, itemVariants
} from '../components/shared';
import { useApi } from '../hooks/useApi';
import { searchTheses } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';

const Screen05Discover = () => {
  const { navigate } = useAppRouter();
  const [query, setQuery] = useState('');
  const { data, loading, error, refetch } = useApi(() => searchTheses(), [], true);
  const recent = data?.results.slice(0, 3).map((result) => result.thesis) || [];
  return (
    <PublicOrAuthenticatedLayout title="Discover Research">
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
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter') navigate('search-results', { q: query }); }}
                  placeholder="E.g., How does machine learning improve crop yields in tropical climates?"
                  className="w-full py-3 text-slate-900 outline-none text-sm md:text-base"
                />
              </div>
              <Button onClick={() => navigate('search-results', { q: query })} className="rounded-md">Search</Button>
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
          {loading && <LoadingState label="Loading recent research…" />}
          {error && <ErrorState onRetry={() => void refetch()} />}
          {!loading && !error && recent.length === 0 && <EmptyState title="No published research yet" description="Published public theses will appear here when the repository has records." />}
          {!loading && !error && recent.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((thesis) => (
              <ThesisCard key={thesis.id} thesis={thesis} onClick={() => navigate('thesis-detail', { thesisId: thesis.id })} />
            ))}
          </div>}
        </div>
      </div>
    </PublicOrAuthenticatedLayout>
  );
};

export default Screen05Discover;

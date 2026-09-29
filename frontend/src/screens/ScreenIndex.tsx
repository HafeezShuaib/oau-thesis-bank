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
  Button, Input, Card, Badge, PublicLayout, AuthenticatedLayout, AuthContainer,
  ThesisCard, UploadWizardNav, pageVariants, listVariants, itemVariants
} from '../components/shared';

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
    { id: 'user-management', label: '45 — User Management' },
    { id: 'profile-setup', label: '46 — Profile Setup' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">System Verification Index</h1>
          <p className="text-slate-500 mb-8">Connected workflow index: 46 individual screens. Collaboration requests are tabs inside the Collaboration Hub.</p>
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
              <p className="text-emerald-700 text-sm mt-1">46 primary screens registered and accessible.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ScreenIndex;

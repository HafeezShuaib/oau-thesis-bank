import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, BookOpen, Users, Cpu, FileText, ChevronRight, Check, ArrowRight,
  Database, GitBranch, Lightbulb, ShieldCheck, Sparkles, GraduationCap,
  Quote, Menu, X, TrendingUp, LockKeyhole, Upload, Compass
} from 'lucide-react';
import { useAppRouter, Button, PublicLayout, Badge } from '../components/shared';
import { useApi } from '../hooks/useApi';
import { searchTheses } from '../lib/api';
import { LoadingState, ErrorState, EmptyState } from '../components/AsyncState';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } }
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } }
};

const Screen01Landing = () => {
  const { navigate } = useAppRouter();
  const { data: searchResponse, loading, error, refetch } = useApi(() => searchTheses(), [], true);
  const liveTheses = searchResponse?.results.slice(0, 3) || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (id: string, params: Record<string, unknown> = {}) => {
    setMobileOpen(false);
    navigate(id, params);
  };

  const stats = [
    { value: searchResponse ? `${searchResponse.count}` : '—', label: 'Published public projects', icon: Database },
    { value: 'OAU', label: 'University research archive', icon: GraduationCap },
    { value: 'Live', label: 'Connected repository', icon: Users },
    { value: '24/7', label: 'Research discovery', icon: Compass }
  ];

  const features = [
    {
      icon: Search,
      title: 'Discover research',
      text: 'Search across years, departments, topics, authors and research areas without digging through disconnected files.',
      action: 'Explore the repository',
      screen: 'discover'
    },
    {
      icon: Lightbulb,
      title: 'Find research gaps',
      text: 'Move beyond keyword search. Surface patterns, underexplored questions and opportunities hidden across previous projects.',
      action: 'Explore research gaps',
      screen: 'gap-explorer'
    },
    {
      icon: Cpu,
      title: 'Ask the research assistant',
      text: 'Ask questions about the research collection and get answers grounded in thesis sources instead of generic AI responses.',
      action: 'Try the AI assistant',
      screen: 'ai-assistant'
    },
    {
      icon: Users,
      title: 'Connect with researchers',
      text: 'Find students, alumni, supervisors and researchers working around similar ideas and build meaningful academic connections.',
      action: 'Browse researchers',
      screen: 'researchers'
    },
    {
      icon: GitBranch,
      title: 'See research lineage',
      text: 'Trace how ideas evolve from earlier undergraduate projects into new questions, methods and opportunities.',
      action: 'View a research lineage',
      screen: 'research-lineage'
    },
    {
      icon: ShieldCheck,
      title: 'Preserve your work',
      text: 'Give your undergraduate project a lasting academic home with clear metadata, access controls and responsible publishing.',
      action: 'Learn about publishing',
      screen: 'upload'
    }
  ];

  const disciplines = [
    ['Computer Science', 'Browse live research'],
    ['Engineering', 'Browse live research'],
    ['Agriculture', 'Browse live research'],
    ['Social Sciences', 'Browse live research'],
    ['Education', 'Browse live research'],
    ['Health Sciences', 'Browse live research']
  ];

  return (
    <PublicLayout>
      <div className="overflow-hidden bg-[#F8F9FA]">
        {/* Hero */}
        <section className="relative border-b border-slate-200 bg-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-0 top-0 h-full w-1/3 bg-[#00502F]/[0.025]" />
            <div className="absolute right-[-180px] top-[-180px] h-[420px] w-[420px] rounded-full border border-[#D4AF37]/20" />
            <div className="absolute right-[-120px] top-[-120px] h-[300px] w-[300px] rounded-full border border-[#00502F]/10" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-24 lg:pt-20">
            <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col justify-center">
              <motion.div variants={fadeUp}>
                <Badge variant="gold">
                  <span className="font-semibold text-[#00502F]">OAU Research Ecosystem</span>
                </Badge>
              </motion.div>

              <motion.h1 variants={fadeUp} className="mt-6 max-w-3xl text-4xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-[4.15rem] lg:leading-[1.03]">
                Every undergraduate project deserves a life <span className="text-[#00502F]">beyond graduation.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                OAU Thesis Bank is a living research ecosystem for discovering, preserving and connecting undergraduate research at Obafemi Awolowo University.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="px-6" onClick={() => go('discover')}>
                  Explore research <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="secondary" className="px-6" onClick={() => go('signup')}>
                  Create an account
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
                {['University research archive', 'AI-assisted discovery', 'Built for OAU researchers'].map((item) => (
                  <span key={item} className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-[#00502F]" />{item}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Search / product preview */}
            <motion.div
              initial={{ opacity: 0, x: 35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="relative flex items-center justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-xl">
                <div className="absolute -inset-4 rounded-[2rem] bg-[#00502F]/[0.035]" />
                <div className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_70px_rgba(15,23,42,0.10)]">
                  <div className="rounded-xl bg-[#F8F9FA] p-4 sm:p-5">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00502F] text-white">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">OAU Thesis Bank</p>
                          <p className="text-sm font-semibold text-slate-800">Research discovery</p>
                        </div>
                      </div>
                      <span className="hidden text-xs text-slate-400 sm:block">Repository</span>
                    </div>

                    <form className="mt-5 rounded-xl border border-slate-200 bg-white p-2 shadow-sm" onSubmit={(event) => { event.preventDefault(); go('search-results', { q: searchQuery.trim() }); }}>
                      <div className="flex items-center">
                        <Search className="ml-2 h-5 w-5 shrink-0 text-slate-400" />
                        <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} aria-label="Search the repository" placeholder="Try “machine learning agriculture”" className="min-w-0 flex-1 px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400" />
                        <button type="submit" className="rounded-lg bg-[#00502F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#003d24]">Search</button>
                      </div>
                    </form>

                    <div className="mt-5 grid gap-3">
                      {loading && <p className="px-3 py-4 text-sm text-slate-500">Loading repository…</p>}
                      {error && <button onClick={() => void refetch()} className="px-3 py-4 text-left text-sm text-red-600 hover:underline">Unable to reach the backend. Try again.</button>}
                      {!loading && !error && liveTheses.length === 0 && <p className="px-3 py-4 text-sm text-slate-500">No published research yet.</p>}
                      {liveTheses.map(({ thesis }, index) => (
                        <motion.button
                          key={thesis.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          onClick={() => go('thesis-detail', { thesisId: thesis.id })}
                          className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#00502F]/30 hover:shadow-md"
                        >
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00502F]/[0.07] text-[#00502F]">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-sm font-semibold text-slate-800 group-hover:text-[#00502F]">{thesis.title}</p>
                            <p className="mt-1 text-xs text-slate-500">{thesis.department} · {thesis.year || 'Year not provided'}</p>
                          </div>
                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#00502F]" />
                        </motion.button>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/[0.06] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-4 w-4 text-[#A47D00]" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">Research intelligence</p>
                          <p className="text-[11px] text-slate-500">Discover related work and emerging gaps.</p>
                        </div>
                      </div>
                      <button onClick={() => go('gap-explorer')} className="text-xs font-semibold text-[#00502F]">Explore</button>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85, duration: 0.45 }}
                  className="absolute -bottom-5 -left-4 hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:block lg:-left-12"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-[#00502F]">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Research activity</p>
                      <p className="text-sm font-bold text-slate-900">Growing every year</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-slate-200 bg-white">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 px-4 sm:px-6 lg:grid-cols-4 lg:px-8"
          >
            {stats.map(({ value, label, icon: Icon }) => (
              <motion.div variants={fadeUp} key={label} className="px-4 py-7 sm:px-7 sm:py-8">
                <Icon className="mb-3 h-5 w-5 text-[#00502F]" />
                <p className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Mission */}
        <section className="bg-[#F8F9FA] py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
              <motion.div variants={fadeUp}>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#00502F]">More than an archive</p>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Turn past projects into tomorrow’s starting point.</h2>
              </motion.div>
              <motion.p variants={fadeUp} className="max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                Thousands of undergraduate projects contain useful questions, methods, datasets and observations. OAU Thesis Bank makes that knowledge easier to find, understand and build upon—while keeping authorship and access at the centre.
              </motion.p>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                { icon: Upload, title: 'Preserve', text: 'Give completed research a durable academic home with structured metadata and controlled access.' },
                { icon: Search, title: 'Understand', text: 'Search semantically, read summaries and follow relationships between research topics.' },
                { icon: GitBranch, title: 'Build forward', text: 'Identify gaps, find collaborators and extend existing ideas into stronger research.' }
              ].map(({ icon: Icon, title, text }) => (
                <motion.div key={title} variants={fadeUp} className="border-t-2 border-[#00502F] bg-white p-7 shadow-sm">
                  <Icon className="h-6 w-6 text-[#00502F]" />
                  <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="max-w-3xl">
              <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-[0.18em] text-[#00502F]">Built around the research journey</motion.p>
              <motion.h2 variants={fadeUp} className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">From “Has this been done?” to “What can we do next?”</motion.h2>
              <motion.p variants={fadeUp} className="mt-4 text-lg leading-8 text-slate-600">A connected set of tools for the moments that matter before, during and after a research project.</motion.p>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, text, action, screen }) => (
                <motion.article variants={fadeUp} key={title} className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#00502F]/30 hover:shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#00502F]/[0.07] text-[#00502F] transition group-hover:bg-[#00502F] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
                  <p className="mt-3 flex-1 leading-7 text-slate-600">{text}</p>
                  <button onClick={() => go(screen)} className="mt-6 flex items-center text-sm font-bold text-[#00502F]">
                    {action}<ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                  </button>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-[#00502F] py-20 text-white sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-14 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
              <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
                <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-[0.18em] text-[#E8D58A]">How it works</motion.p>
                <motion.h2 variants={fadeUp} className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">One research journey. One connected ecosystem.</motion.h2>
                <motion.p variants={fadeUp} className="mt-5 leading-8 text-white/75">The platform follows the way researchers actually work—from finding prior studies to sharing work and forming new collaborations.</motion.p>
                <motion.div variants={fadeUp} className="mt-8">
                  <Button variant="secondary" size="lg" onClick={() => go('signup')}>Join the ecosystem <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </motion.div>
              </motion.div>

              <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="space-y-3">
                {[
                  ['01', 'Discover', 'Search previous projects, researchers, topics and methods.'],
                  ['02', 'Understand', 'Read the thesis, inspect metadata and use AI-assisted summaries.'],
                  ['03', 'Identify', 'Compare related work and uncover possible research gaps.'],
                  ['04', 'Connect', 'Find researchers, collaborators and mentors around shared interests.'],
                  ['05', 'Contribute', 'Preserve your own project so the next researcher can start further ahead.']
                ].map(([number, title, text]) => (
                  <motion.div variants={fadeUp} key={number} className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.06] p-4 transition hover:bg-white/[0.09] sm:p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#E8D58A]/50 text-xs font-bold text-[#E8D58A]">{number}</div>
                    <div>
                      <h3 className="font-bold">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-white/65">{text}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Disciplines */}
        <section className="bg-[#F8F9FA] py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-[0.18em] text-[#00502F]">Explore by discipline</motion.p>
                <motion.h2 variants={fadeUp} className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">Research across the university.</motion.h2>
              </div>
              <motion.button variants={fadeUp} onClick={() => go('discover')} className="flex items-center text-sm font-bold text-[#00502F]">View all research <ArrowRight className="ml-2 h-4 w-4" /></motion.button>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {disciplines.map(([name, count]) => (
                <motion.button variants={fadeUp} key={name} onClick={() => go('discover')} className="flex items-center justify-between border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#00502F]/30 hover:shadow-md">
                  <div>
                    <p className="font-bold text-slate-900">{name}</p>
                    <p className="mt-1 text-sm text-slate-500">{count}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300" />
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Trust / testimonial */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.55 }} className="border-y border-slate-200 py-12 text-center sm:py-16">
              <Quote className="mx-auto h-8 w-8 text-[#D4AF37]" />
              <blockquote className="mx-auto mt-6 max-w-3xl text-2xl font-semibold leading-9 tracking-tight text-slate-900 sm:text-3xl sm:leading-10">
                “Good research should not disappear when a student graduates. It should become context for the person who comes next.”
              </blockquote>
              <p className="mt-6 text-sm font-semibold text-slate-500">The idea behind OAU Thesis Bank</p>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#F8F9FA] pb-20 sm:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.5 }} className="relative overflow-hidden bg-[#00502F] px-6 py-12 sm:px-10 sm:py-14 lg:px-16">
              <div className="absolute right-0 top-0 h-full w-1/3 border-l border-white/10" />
              <div className="relative max-w-3xl">
                <div className="flex items-center gap-2 text-[#E8D58A]"><LockKeyhole className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-[0.18em]">Research with purpose</span></div>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Your project can be the starting point for someone else’s breakthrough.</h2>
                <p className="mt-4 max-w-2xl leading-7 text-white/70">Explore the collection today, or create your account and add your own research to the growing OAU research ecosystem.</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" variant="secondary" onClick={() => go('discover')}>Explore research</Button>
                  <button onClick={() => go('signup')} className="inline-flex items-center justify-center rounded-md border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Create your account <ArrowRight className="ml-2 h-4 w-4" /></button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default Screen01Landing;

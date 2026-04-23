import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Zap, Shield, BarChart3, Bell, Settings, Workflow,
  ArrowRight, Play, ChevronRight, Star,
  ShoppingCart, CreditCard, Code, ExternalLink,
  Globe, Mail
} from 'lucide-react';

/* Inline SVG social icons (lucide removed brand icons) */
const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);
const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
);
const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
);

/* =============================================
   NAVBAR — Floating Glass Capsule
   ============================================= */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = ['Features', 'Solutions', 'Pricing', 'Contact'];

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-[100] flex justify-center px-4 pt-4 pointer-events-none">
      <div
        className={`pointer-events-auto rounded-full max-w-[820px] w-full flex items-center justify-between px-6 py-3 transition-all duration-500 ${scrolled
          ? 'glass-strong shadow-2xl shadow-black/50'
          : 'glass'
          }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-lg gradient-cta flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-[16px] font-bold text-white tracking-tight">
            TicketIQ
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-[13px] font-medium text-text-secondary hover:text-white transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3 underline-offset-4">
          <Link
            to="/login"
            className="hidden md:block text-[13px] font-medium text-text-secondary hover:text-white transition-colors py-2 px-3"
          >
            Login
          </Link>
          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <Link 
            to="/register" 
            className="hidden md:block btn-primary text-[13px] px-5 py-2.5 no-underline"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto absolute top-20 left-4 right-4 glass-strong rounded-2xl p-6 md:hidden"
        >
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="block py-3 text-[15px] font-medium text-text-secondary hover:text-white transition-colors border-b border-white/5 last:border-0"
              onClick={() => setMobileOpen(false)}
            >
              {link}
            </a>
          ))}
          <Link 
            to="/register" 
            className="btn-primary w-full mt-4 text-[14px] flex items-center justify-center no-underline"
            onClick={() => setMobileOpen(false)}
          >
            Get Started
          </Link>
          <Link 
            to="/login" 
            className="block w-full mt-4 text-center text-[14px] font-medium text-text-secondary hover:text-white transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Login
          </Link>
        </motion.div>
      )}
    </nav>
  );
};

/* =============================================
   HERO — 3D Immersive Stage (CRITICAL SECTION)
   ============================================= */
const Hero = () => {
  return (
    <section id="hero" className="relative h-screen w-full flex flex-col items-center justify-start overflow-hidden">

      {/* LAYER 1: Gradient Background (Bottommost) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#050510]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-tr from-purple-900/40 via-purple-600/20 to-transparent blur-[150px]" />
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-900/30 via-blue-600/15 to-transparent blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-pink-900/20 via-purple-800/10 to-transparent blur-[100px]" />
      </div>

      {/* LAYER 2: 3D Object — CENTERED, behind text */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="w-full h-full">
          <Spline scene="https://prod.spline.design/ZvAm7csnGKeNmwiK/scene.splinecode" />
        </div>
      </div>

      {/* LAYER 3: Hero Text — ON TOP, pushed below navbar */}
      <div className="relative z-20 flex flex-col items-center text-center px-6 pointer-events-none w-full max-w-5xl pt-[100px]">

        {/* Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="pointer-events-auto mb-1 mt-8.5"
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass-midium border border-neon-purple/20">
            <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" />
            <span className="text-[12px] font-semibold text-neon-purple tracking-widest uppercase font-display">
              SLA-Powered Support OS
            </span>
          </div>
        </motion.div>

        {/* Main Heading — 3 lines, slide-in from alternating sides */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          >
            <span className="block font-display text-[52px] sm:text-[68px] md:text-[80px] lg:text-[96px] font-bold leading-[0.95] tracking-tighter text-white">
              Prioritize
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          >
            <span className="block font-display text-[52px] sm:text-[68px] md:text-[80px] lg:text-[96px] font-bold leading-[0.95] tracking-tighter gradient-text">
              Smarter.
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
          >
            <span className="block font-display text-[52px] sm:text-[68px] md:text-[80px] lg:text-[96px] font-bold leading-[0.95] tracking-tighter text-white/40">
              Resolve Faster.
            </span>
          </motion.div>
        </div>

        {/* Subtext — short & clean */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="text-base md:text-lg text-text-secondary max-w-[480px] mb-10 font-body"
        >
          ticket prioritization & SLA monitoring for support teams that can't afford to miss a deadline.
        </motion.p>

        {/* Hero Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="flex flex-col sm:flex-row items-center gap-4 pointer-events-auto mb-8"
        >
          <Link to="/register" className="btn-primary flex items-center gap-3 text-[15px] px-7 py-3.5 no-underline">
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button className="btn-secondary flex items-center gap-3 text-[15px] px-7 py-3.5">
            <Play className="w-4 h-4" />
            View Demo
          </button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="flex flex-wrap items-center justify-center gap-5 pointer-events-auto "
        >
          {/* {['No credit card', '14-day free trial', 'Cancel anytime'].map((text) => (
            <div key={text} className="flex items-center gap-2 text-[12px] text-text-muted">
              <Shield className="w-3 h-3 text-neon-cyan" />
              {text}
            </div>
          ))} */}
        </motion.div>
      </div>

      {/* Scroll Indicator — always at absolute bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 "
      >
        <span className="text-[10px] text-text-muted uppercase tracking-widest font-display ml-4">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5 ml-3 ">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-1.5 rounded-full bg-neon-purple"
          />
        </div>
      </motion.div>
    </section>
  );
};

/* =============================================
   LOGO STRIP
   ============================================= */
const LogoStrip = () => {
  const logos = ['QUANTUM', 'NEXUS.IO', 'ORBITAL', 'KINETIC', 'SYNAPSE', 'METASPACE'];
  return (
    <section className="py-16 px-6 border-y border-white/5 relative z-20">
      <p className="text-center text-[11px] font-semibold text-text-muted tracking-widest uppercase mb-10 font-display">
        Trusted by 500+ support teams worldwide
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-4 max-w-5xl mx-auto">
        {logos.map((name) => (
          <span
            key={name}
            className="font-display text-xl font-bold text-white/10 hover:text-white/25 transition-colors duration-300 cursor-default"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
};

/* =============================================
   FEATURES SECTION
   ============================================= */
const features = [
  {
    icon: Zap,
    title: 'Domain-Adaptive Ticket Prioritization',
    desc: 'Auto-prioritize tickets using domain-specific rules for banking, healthcare, e-commerce and more.',
    color: 'neon-purple',
  },
  {
    icon: Shield,
    title: 'SLA Deadline Monitoring',
    desc: 'Real-time SLA tracking with predictive breach alerts before deadlines are missed.',
    color: 'neon-cyan',
  },
  {
    icon: BarChart3,
    title: 'Intelligent Ticket Classification',
    desc: 'AI-powered categorization with sentiment analysis and urgency scoring.',
    color: 'neon-blue',
  },
  {
    icon: Bell,
    title: 'Real-time Alerts & Notifications',
    desc: 'Instant notifications via Slack, email, and webhooks when SLAs are at risk.',
    color: 'neon-pink',
  },
  {
    icon: Settings,
    title: 'Performance Analytics Dashboard',
    desc: 'Comprehensive analytics with team performance metrics and resolution trends.',
    color: 'neon-purple',
  },
  {
    icon: Workflow,
    title: 'Workflow Automation',
    desc: 'Automate ticket routing, escalation chains, and response templates.',
    color: 'neon-cyan',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-28 px-6 relative z-20">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-[12px] font-bold text-neon-purple tracking-widest uppercase font-display">
            Features
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            Everything you need to{' '}
            <span className="gradient-text-alt">deliver exceptional support</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-[600px] mx-auto">
            A complete toolkit to transform your support operations from reactive to proactive.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass-card p-8 group"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${feature.color === 'neon-purple' ? 'bg-neon-purple/10 text-neon-purple' :
                  feature.color === 'neon-cyan' ? 'bg-neon-cyan/10 text-neon-cyan' :
                    feature.color === 'neon-blue' ? 'bg-neon-blue/10 text-neon-blue' :
                      'bg-neon-pink/10 text-neon-pink'
                  }`}
              >
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-text-secondary text-[15px] leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* =============================================
   HOW IT WORKS
   ============================================= */
const steps = [
  {
    num: '01',
    title: 'Customer submits a ticket',
    desc: 'Tickets come in from any channel — email, chat, API, or portal. TicketIQ captures everything.',
    icon: Mail,
  },
  {
    num: '02',
    title: 'TicketIQ analyzes domain + urgency',
    desc: 'Our AI engine applies your domain rules, sentiment analysis, and account-value weighting in real-time.',
    icon: Zap,
  },
  {
    num: '03',
    title: 'System assigns priority & tracks SLA',
    desc: 'Tickets are auto-prioritized, routed to the right agent, and SLA timers start ticking immediately.',
    icon: Shield,
  },
];

const HowItWorks = () => {
  return (
    <section className="py-28 px-6 relative z-20 border-y border-white/5">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-purple-900/10 to-cyan-900/10 blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-[12px] font-bold text-neon-cyan tracking-widest uppercase font-display">
            How it Works
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
            Three steps to{' '}
            <span className="gradient-text-alt">smarter support</span>
          </h2>
        </motion.div>

        <div className="space-y-6 relative">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: i * 0.15, ease: 'easeOut' }}
              className="glass-card p-8 flex flex-col md:flex-row items-start md:items-center gap-8 group hover:border-neon-purple/20"
            >
              {/* Step Number + Icon */}
              <div className="flex-shrink-0 flex items-center gap-5">
                <span className="font-display text-[64px] font-bold text-white/5 leading-none select-none">{step.num}</span>
                <div className="w-16 h-16 rounded-2xl gradient-cta flex items-center justify-center shadow-lg shadow-neon-purple/30 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              {/* Text */}
              <div className="flex-1">
                <span className="font-display text-[11px] font-bold text-neon-purple tracking-widest uppercase">
                  Step {step.num}
                </span>
                <h3 className="font-display text-2xl font-bold text-white mt-2 mb-3">
                  {step.title}
                </h3>
                <p className="text-text-secondary text-[16px] leading-relaxed">
                  {step.desc}
                </p>
              </div>
              {/* Right arrow */}
              <ChevronRight className="hidden md:block w-6 h-6 text-white/10 group-hover:text-neon-purple group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* =============================================
   DASHBOARD PREVIEW
   ============================================= */
const DashboardPreview = () => {
  const tickets = [
    { id: 'TK-2847', title: 'Payment gateway timeout', priority: 'Critical', sla: '0:45:12', status: 'bg-red-500' },
    { id: 'TK-2848', title: 'Order delivery delay 5+ days', priority: 'High', sla: '2:15:33', status: 'bg-amber-500' },
    { id: 'TK-2849', title: 'Account login issue', priority: 'Medium', sla: '4:30:00', status: 'bg-blue-500' },
    { id: 'TK-2850', title: 'Update billing address', priority: 'Low', sla: '23:59:59', status: 'bg-green-500' },
  ];

  return (
    <section className="py-28 px-6 relative z-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-[12px] font-bold text-neon-cyan tracking-widest uppercase font-display">
            Live Dashboard
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            Real-time visibility into{' '}
            <span className="gradient-text-alt">every ticket</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card overflow-hidden glow-purple"
        >
          {/* Menu bar */}
          <div className="h-10 bg-white/[0.02] border-b border-white/5 flex items-center justify-between px-5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-[11px] font-display text-text-muted">TicketIQ — Live Dashboard</span>
            <div />
          </div>

          <div className="p-6 md:p-8">
            {/* Priority Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Critical', count: 3, color: 'bg-red-500', bar: '90%' },
                { label: 'High', count: 12, color: 'bg-amber-500', bar: '70%' },
                { label: 'Medium', count: 28, color: 'bg-blue-500', bar: '50%' },
                { label: 'Low', count: 45, color: 'bg-green-500', bar: '30%' },
              ].map((item) => (
                <div key={item.label} className="bg-white/[0.02] rounded-2xl p-5 border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider font-display">
                      {item.label}
                    </span>
                  </div>
                  <div className="font-display text-3xl font-bold text-white mb-3">{item.count}</div>
                  <div className="w-full h-1 rounded-full bg-white/5">
                    <div className={`h-full rounded-full ${item.color} transition-all duration-1000`} style={{ width: item.bar }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Ticket Table */}
            <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-[11px] font-bold text-text-muted uppercase tracking-wider font-display">
                <span className="col-span-2">ID</span>
                <span className="col-span-4">Subject</span>
                <span className="col-span-2">Priority</span>
                <span className="col-span-2">SLA Timer</span>
                <span className="col-span-2">Status</span>
              </div>
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <span className="col-span-2 font-display text-[13px] font-semibold text-neon-purple">
                    {ticket.id}
                  </span>
                  <span className="col-span-4 text-[14px] text-text-primary truncate">
                    {ticket.title}
                  </span>
                  <span className="col-span-2">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${ticket.status}/10 ${ticket.status.replace('bg-', 'text-')}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${ticket.status}`} />
                      {ticket.priority}
                    </span>
                  </span>
                  <span className="col-span-2 font-display text-[13px] font-semibold text-text-primary tabular-nums">
                    {ticket.sla}
                  </span>
                  <span className="col-span-2">
                    <span className="text-[11px] font-bold text-neon-cyan bg-neon-cyan/10 px-2.5 py-1 rounded-full">
                      Active
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* =============================================
   USE CASES
   ============================================= */
const useCases = [
  {
    icon: ShoppingCart,
    title: 'E-commerce',
    desc: 'Prioritize delivery disputes, refund requests, and order issues. Auto-escalate high-value customer tickets.',
    color: 'neon-cyan',
  },
  {
    icon: CreditCard,
    title: 'Fintech',
    desc: 'Instant escalation for payment failures, fraud alerts, and compliance-sensitive issues with PCI-DSS awareness.',
    color: 'neon-purple',
  },
  {
    icon: Code,
    title: 'SaaS',
    desc: 'Route technical bugs to engineering, billing issues to finance, and feature requests to product — automatically.',
    color: 'neon-blue',
  },
];

const UseCases = () => {
  return (
    <section id="solutions" className="py-28 px-6 relative z-20 border-y border-white/5">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-purple-900/15 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-[12px] font-bold text-neon-purple tracking-widest uppercase font-display">
            Use Cases
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            Built for <span className="gradient-text-alt">every industry</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: ShoppingCart,
              title: 'E-commerce',
              desc: 'Prioritize delivery disputes, refund requests, and order issues. Auto-escalate high-value customer tickets.',
              gradient: 'from-cyan-500/20 via-teal-600/10 to-transparent',
              border: 'border-cyan-500/20',
              iconBg: 'bg-cyan-500/15 text-cyan-400',
              glow: 'bg-cyan-400',
              link: 'text-cyan-400 hover:text-cyan-300',
            },
            {
              icon: CreditCard,
              title: 'Fintech',
              desc: 'Instant escalation for payment failures, fraud alerts, and compliance-sensitive issues with PCI-DSS awareness.',
              gradient: 'from-violet-500/20 via-purple-600/10 to-transparent',
              border: 'border-violet-500/20',
              iconBg: 'bg-violet-500/15 text-violet-400',
              glow: 'bg-violet-400',
              link: 'text-violet-400 hover:text-violet-300',
            },
            {
              icon: Code,
              title: 'SaaS',
              desc: 'Route technical bugs to engineering, billing issues to finance, and feature requests to product — automatically.',
              gradient: 'from-blue-500/20 via-indigo-600/10 to-transparent',
              border: 'border-blue-500/20',
              iconBg: 'bg-blue-500/15 text-blue-400',
              glow: 'bg-blue-400',
              link: 'text-blue-400 hover:text-blue-300',
            },
          ].map((uc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`relative overflow-hidden rounded-3xl p-8 border bg-gradient-to-br ${uc.gradient} ${uc.border} group cursor-default`}
            >
              {/* Ambient glow blob */}
              <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[80px] opacity-10 group-hover:opacity-25 transition-opacity duration-500 ${uc.glow}`} />
              {/* Top glow line */}
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent ${uc.link.split(' ')[0].replace('text-', 'text-')} opacity-30`} />

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${uc.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                <uc.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-4">{uc.title}</h3>
              <p className="text-text-secondary text-[15px] leading-relaxed mb-6">{uc.desc}</p>
              <a href="#" className={`inline-flex items-center gap-2 text-[14px] font-semibold transition-colors group/link cursor-pointer ${uc.link}`}>
                Learn more
                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* =============================================
   TESTIMONIALS
   ============================================= */
const testimonials = [
  {
    quote: "TicketIQ reduced our average resolution time by 40%. The AI prioritization is genuinely game-changing.",
    author: 'Sarah Chen',
    role: 'VP of Support, Orbital',
    rating: 5,
  },
  {
    quote: "We went from 15% SLA breaches to under 1% in the first month. Our team finally has clarity.",
    author: 'Marcus Rivera',
    role: 'CTO, NexusBank',
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-28 px-6 relative z-20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-[12px] font-bold text-neon-cyan tracking-widest uppercase font-display">
            Testimonials
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
            Loved by support teams
          </h2>
        </motion.div>

        <div className="space-y-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="glass-card p-10 md:p-14 relative overflow-hidden group"
            >
              {/* Big quote mark */}
              <span className="absolute top-6 right-10 font-display text-[120px] leading-none text-white/[0.03] select-none pointer-events-none">&ldquo;</span>

              {/* Stars */}
              <div className="flex gap-1.5 mb-8">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="font-display text-2xl md:text-3xl font-medium text-white leading-snug mb-10 max-w-[800px]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-white font-display font-bold text-xl flex-shrink-0">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <div className="font-display text-[16px] font-bold text-white">{t.author}</div>
                  <div className="text-[14px] text-text-muted mt-0.5">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* =============================================
   PRICING
   ============================================= */
const pricingPlans = [
  {
    name: 'Starter',
    price: '29',
    desc: 'Perfect for small teams getting started.',
    features: ['Up to 500 tickets/mo', 'Basic prioritization', 'Email alerts', 'SLA tracking'],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Pro',
    price: '79',
    desc: 'For growing teams that need intelligence.',
    features: ['Unlimited tickets', 'AI prioritization', 'Multi-channel alerts', 'Custom SLA rules', 'Analytics dashboard', 'API access'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'For organizations at scale.',
    features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'SLA guarantees', 'SOC2 & HIPAA', 'On-prem option'],
    cta: 'Contact Sales',
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-28 px-6 relative z-20 border-y border-white/5">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-purple-900/10 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-[12px] font-bold text-neon-purple tracking-widest uppercase font-display">
            Pricing
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            Simple, transparent <span className="gradient-text-alt">pricing</span>
          </h2>
          <p className="text-text-secondary text-lg">No hidden fees. Cancel anytime.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`rounded-3xl p-8 relative ${plan.popular
                ? 'glass-strong border-neon-purple/30 glow-purple'
                : 'glass-card'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full text-[11px] font-bold text-white tracking-wider uppercase font-display">
                  Most Popular
                </div>
              )}

              <h3 className="font-display text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-text-muted text-[14px] mb-6">{plan.desc}</p>

              <div className="flex items-baseline gap-1 mb-8">
                {plan.price !== 'Custom' && <span className="text-text-muted text-lg">$</span>}
                <span className="font-display text-5xl font-bold text-white">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-text-muted text-[14px]">/mo</span>}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[14px] text-text-secondary">
                    <Shield className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3.5 rounded-full font-semibold text-[15px] transition-all duration-300 cursor-pointer ${plan.popular
                ? 'btn-primary'
                : 'btn-secondary'
                }`}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* =============================================
   CTA SECTION
   ============================================= */
const CTASection = () => {
  return (
    <section className="py-28 px-6 relative z-20 overflow-hidden">
      {/* Full gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-cyan-900/20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-neon-purple/20 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-gradient-to-tr from-neon-cyan/10 to-transparent blur-[100px] pointer-events-none" />
      {/* Top border glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-purple/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-purple/30 bg-neon-purple/10 mb-8"
          >
            <Zap className="w-3.5 h-3.5 text-neon-purple" />
            <span className="font-display text-[12px] font-bold text-neon-purple tracking-widest uppercase">Get Started Today</span>
          </motion.div>

          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Upgrade Your</span><br />
            <span className="gradient-text">Support System</span><br />
            <span className="text-white/60 text-4xl md:text-5xl">with TicketIQ</span>
          </h2>

          <p className="text-text-secondary text-xl max-w-[520px] mx-auto mb-12">
            Join 500+ teams already delivering faster, smarter support with AI-powered prioritization.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register" className="btn-primary flex items-center gap-3 text-[17px] px-12 py-5 shadow-[0_0_60px_rgba(168,85,247,0.4)] no-underline">
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="btn-secondary flex items-center gap-3 text-[17px] px-12 py-5">
              Book a Demo
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-12">
            {[
              { val: '50k+', label: 'Tickets Monthly' },
              { val: '120+', label: 'Integrations' },
              { val: '4.9/5', label: 'G2 Rating' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-display text-4xl font-bold text-white mb-1">{stat.val}</div>
                <div className="text-[12px] font-bold text-text-muted uppercase tracking-widest font-display">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* =============================================
   FOOTER
   ============================================= */
const Footer = () => {
  const columns = [
    { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API Docs', 'Changelog'] },
    { title: 'Solutions', links: ['E-commerce', 'Fintech', 'SaaS', 'Healthcare'] },
    { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
    { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Status'] },
  ];

  return (
    <footer id="contact" className="border-t border-white/5 pt-20 pb-10 px-6 relative z-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg gradient-cta flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-[18px] font-bold text-white tracking-tight">
                TicketIQ
              </span>
            </div>
            <p className="text-text-muted text-[14px] leading-relaxed max-w-[280px] mb-6">
              Domain-Adaptive Customer Support Ticket Prioritization & SLA Monitoring System.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/Harsh-Chauhan05/TicketIQ"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-text-muted hover:text-neon-purple transition-colors cursor-pointer"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/harshchauhan-it" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-text-muted hover:text-neon-purple transition-colors cursor-pointer"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-text-muted hover:text-neon-purple transition-colors cursor-pointer"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-[12px] font-bold text-text-muted uppercase tracking-widest mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[14px] text-text-secondary hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[13px] text-text-muted">
            © 2026 TicketIQ. All rights reserved.
          </span>
          <div className="flex items-center gap-2 text-[13px] text-text-muted">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
};

/* =============================================
   APP — Full Landing Page Assembly
   ============================================= */
function Landing() {
  return (
    <div className="overflow-x-hidden bg-[#050510] text-text-primary">
      <Navbar />
      <Hero />
      <LogoStrip />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <UseCases />
      <Testimonials />
      <Pricing />
      <CTASection />
      <Footer />
    </div>
  );
}

export default Landing;

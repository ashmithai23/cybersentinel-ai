import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  LayoutDashboard,
  Radar,
  Activity,
  AlertTriangle,
  Network,
  Lock,
  Cpu,
  FileText,
  BarChart3,
  BookOpen,
  Settings,
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  X,
  Volume2,
  VolumeX,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { authService, settingsService } from '../services/api';
import { SystemStatus, User } from '../types';
import { LoginPage } from '../pages/LoginPage';
import { CyberBackground } from '../components/CyberBackground';
import { PageTransition } from '../components/PageTransition';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => {
    return localStorage.getItem('cybersentinel_audio') !== 'false';
  });
  const [signedOut, setSignedOut] = useState<boolean>(
    localStorage.getItem('cybersentinel_signed_out') === 'true' || !localStorage.getItem('cybersentinel_token')
  );

  const refreshUser = () => {
    setUser(authService.getCurrentUser());
    setSignedOut(localStorage.getItem('cybersentinel_signed_out') === 'true' || !localStorage.getItem('cybersentinel_token'));
  };

  useEffect(() => {
    refreshUser();
    settingsService.getStatus().then(setStatus).catch(() => {});
  }, []);

  // Keyboard shortcut for Command Palette: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setShowNotifications(false);
        setShowProfile(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    localStorage.setItem('cybersentinel_audio', String(next));
  };

  const handleLogout = () => {
    localStorage.setItem('cybersentinel_signed_out', 'true');
    authService.logout();
    setUser(null);
    setSignedOut(true);
    setShowProfile(false);
  };

  const navItems = [
    { label: 'SOC Dashboard', path: '/', icon: LayoutDashboard, badge: 'Live' },
    { label: 'Threat Detection', path: '/detection', icon: Radar, badge: 'AI' },
    { label: 'Security Events', path: '/events', icon: Activity, badge: 'Stream' },
    { label: 'Vulnerability Findings', path: '/findings', icon: AlertTriangle, badge: 'SOAR' },
    { label: 'Network Analysis', path: '/network', icon: Network },
    { label: 'API Security', path: '/api-security', icon: Lock },
    { label: 'AI Models', path: '/models', icon: Cpu },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Analytics', path: '/analytics', icon: BarChart3, badge: 'New' },
    { label: 'Interview Mode', path: '/info', icon: BookOpen },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const commandItems = [
    { title: 'Launch Threat Detection Pipeline', path: '/detection', category: 'Action' },
    { title: 'View Real-Time Event Stream', path: '/events', category: 'Telemetry' },
    { title: 'Review Vulnerability Findings & SOAR', path: '/findings', category: 'Security' },
    { title: 'Network Topology & Anomaly Inspection', path: '/network', category: 'Network' },
    { title: 'API Security & Malicious Payloads', path: '/api-security', category: 'API' },
    { title: 'AI Model Benchmark (ANN, CNN, LSTM)', path: '/models', category: 'MLOps' },
    { title: 'Historical Threat Trends & MTTR Analytics', path: '/analytics', category: 'Analytics' },
    { title: 'Generate Automated SOC Assessment Report', path: '/reports', category: 'Reports' },
    { title: 'Interview Mode: Deep-Dive Architecture Guide', path: '/info', category: 'Knowledge' },
    { title: 'Platform Configuration & Audit Logs', path: '/settings', category: 'Config' },
  ];

  const filteredCommandItems = commandItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative flex h-screen bg-[#060911] text-slate-100 overflow-hidden font-sans select-none">
      {/* Interactive Holographic Canvas & Particle Mesh Background */}
      <CyberBackground />

      {/* COMMAND PALETTE MODAL */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl glass-panel bg-[#0F172A]/95 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden"
            >
              <div className="flex items-center px-4 py-3.5 border-b border-slate-800">
                <Search className="w-5 h-5 text-cyan-400 mr-3 animate-pulse" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type a command or jump to page... (ESC to close)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  onClick={() => setIsCommandPaletteOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                {filteredCommandItems.length > 0 ? (
                  filteredCommandItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsCommandPaletteOpen(false);
                        navigate(item.path);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left text-xs hover:bg-cyan-500/15 text-slate-200 hover:text-cyan-300 transition-all group border border-transparent hover:border-cyan-500/30"
                    >
                      <span className="font-medium">{item.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 group-hover:bg-cyan-950 border border-slate-700 text-slate-400 group-hover:text-cyan-400 font-mono">
                        {item.category}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No matching shortcuts found for "{searchQuery}"
                  </div>
                )}
              </div>
              <div className="px-4 py-2.5 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between font-mono">
                <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-400">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-400">K</kbd> anytime</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1"><Sparkles className="w-3 h-3" /> CyberSentinel AI</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PERMANENT HIGH-TECH ENTERPRISE SIDEBAR */}
      <aside className="w-64 bg-[#080D1A]/90 backdrop-blur-2xl border-r border-cyan-500/20 flex flex-col justify-between z-20 shadow-2xl">
        <div>
          {/* Brand Logo */}
          <div className="h-16 flex items-center px-5 border-b border-cyan-500/20 space-x-3 bg-[#060A14]/90">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 rounded-xl text-cyan-400 shadow-lg shadow-cyan-950/60"
            >
              <ShieldAlert className="w-6 h-6" />
            </motion.div>
            <div>
              <h1 className="font-extrabold text-base tracking-wider text-white flex items-center gap-1.5">
                CYBERSENTINEL <span className="text-cyan-400 text-[10px] px-2 py-0.5 bg-cyan-950/90 border border-cyan-500/40 rounded-full font-mono font-bold shadow-sm">AI</span>
              </h1>
              <p className="text-[10px] text-cyan-400/80 font-mono tracking-tight font-semibold">ENTERPRISE SOC PLATFORM</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative group block"
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/25 via-cyan-500/10 to-transparent text-cyan-200 border border-cyan-500/40 shadow-lg shadow-cyan-950/50 font-semibold'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`w-4 h-4 mr-3 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold border ${
                        isActive
                          ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/50 shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM STATUS BAR */}
        <div className="p-3.5 border-t border-cyan-500/20 bg-[#050810]/95 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold tracking-wider text-cyan-400/80 uppercase font-mono">SOC Telemetry Engine</span>
            <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ONLINE
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
            <div className="p-1.5 bg-[#0A101F] border border-cyan-500/20 rounded-lg flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">ML Core:</span>
              <span className="text-cyan-400 font-bold text-[10px]">ANN/CNN</span>
            </div>
            <div className="p-1.5 bg-[#0A101F] border border-cyan-500/20 rounded-lg flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Latency:</span>
              <span className="text-emerald-400 font-bold text-[10px]">5.5ms</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden z-10">
        {/* TOP NAVIGATION BAR */}
        <header className="h-16 bg-[#080D1A]/85 backdrop-blur-xl border-b border-cyan-500/20 flex items-center justify-between px-6 z-10 shadow-lg">
          {/* Global Search Trigger (Ctrl+K) */}
          <div
            onClick={() => setIsCommandPaletteOpen(true)}
            className="relative w-80 lg:w-96 cursor-pointer group"
          >
            <div className="w-full bg-[#050812]/90 hover:bg-[#0A1020] border border-slate-800 hover:border-cyan-500/50 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-400 flex items-center justify-between transition-all shadow-inner">
              <div className="flex items-center">
                <Search className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors mr-2" />
                <span>Search telemetry, IP, attacks...</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="text-[10px] font-mono bg-slate-800/80 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300">Ctrl</kbd>
                <kbd className="text-[10px] font-mono bg-slate-800/80 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300">K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Audio Feedback Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleAudio}
              title={audioEnabled ? 'Audio alerts enabled' : 'Audio alerts muted'}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                audioEnabled
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-800/50 text-slate-500 border-slate-700/60'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </motion.button>

            {/* SOC CLUSTER BADGE */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shadow-lg shadow-emerald-950/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-mono font-bold text-emerald-300 tracking-wider">SOC: MONITORING</span>
            </div>

            {/* Notifications Modal Toggle */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/60 border border-slate-800 relative transition-all"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-84 bg-[#0B101D] border border-cyan-500/40 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-2xl"
                  >
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <ShieldAlert className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-white">Live SOC Alerts</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                        3 HIGH RISK
                      </span>
                    </div>
                    <div className="space-y-2 mt-3 text-xs">
                      <div
                        onClick={() => { setShowNotifications(false); navigate('/findings'); }}
                        className="p-2.5 bg-[#060A14] hover:bg-slate-800/60 rounded-xl border border-red-500/30 cursor-pointer transition-all"
                      >
                        <div className="flex justify-between font-bold text-red-400">
                          <span>Volumetric Flood (DoS)</span>
                          <span className="text-[10px] font-mono text-slate-400">18:42</span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1">48,200 pps surge on Gateway /api/v1/network</div>
                      </div>
                      <div
                        onClick={() => { setShowNotifications(false); navigate('/api-security'); }}
                        className="p-2.5 bg-[#060A14] hover:bg-slate-800/60 rounded-xl border border-amber-500/30 cursor-pointer transition-all"
                      >
                        <div className="flex justify-between font-bold text-amber-400">
                          <span>SQL Injection Attempt</span>
                          <span className="text-[10px] font-mono text-slate-400">18:40</span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1">Malicious payload pattern in /api/v1/auth/login</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800 text-center">
                      <button
                        onClick={() => { setShowNotifications(false); navigate('/events'); }}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center justify-center gap-1 w-full"
                      >
                        View Real-Time Security Event Stream <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-cyan-950">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-slate-200 leading-none">{user?.full_name || 'Lead Security Analyst'}</div>
                  <div className="text-[10px] font-mono text-cyan-400 mt-0.5">{user?.role || 'Admin'}</div>
                </div>
              </button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-60 bg-[#0B101D] border border-cyan-500/30 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-2xl"
                  >
                    <div className="px-2 py-2 border-b border-slate-800 text-xs">
                      <div className="font-bold text-white">{user?.full_name}</div>
                      <div className="text-slate-400 text-[11px] font-mono">{user?.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl flex items-center mt-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out Session
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER WITH SMOOTH ROUTE TRANSITIONS */}
        <main className="flex-1 overflow-y-auto p-6 bg-transparent relative">
          {signedOut ? (
            <LoginPage onLoginSuccess={() => {
              setSignedOut(false);
              refreshUser();
            }} />
          ) : (
            <PageTransition key={location.pathname}>
              {children}
            </PageTransition>
          )}
        </main>
      </div>
    </div>
  );
};

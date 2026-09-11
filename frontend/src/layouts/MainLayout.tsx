import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Database,
  CheckCircle2,
  Server,
  Command,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { authService, settingsService } from '../services/api';
import { SystemStatus, User } from '../types';
import { LoginPage } from '../pages/LoginPage';

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
    <div className="flex h-screen bg-[#080C14] text-slate-100 overflow-hidden font-sans">
      {/* COMMAND PALETTE MODAL */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl glass-panel bg-[#0F172A]/95 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center px-4 py-3 border-b border-slate-800">
              <Search className="w-5 h-5 text-cyan-400 mr-3" />
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
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs hover:bg-cyan-500/15 text-slate-200 hover:text-cyan-300 transition-all group"
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
            <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
              <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-400 font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-400 font-mono">K</kbd> anytime</span>
              <span>CyberSentinel SOC Navigator</span>
            </div>
          </div>
        </div>
      )}

      {/* PERMANENT HIGH-TECH SIDEBAR */}
      <aside className="w-64 bg-[#0A0F1D] border-r border-slate-800/80 flex flex-col justify-between z-20 select-none">
        <div>
          {/* Brand Logo */}
          <div className="h-16 flex items-center px-5 border-b border-slate-800/80 space-x-3 bg-[#080C14]">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 shadow-lg shadow-cyan-950/40">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wider text-white flex items-center gap-1.5">
                CYBERSENTINEL <span className="text-cyan-400 text-[10px] px-1.5 py-0.5 bg-cyan-950/80 border border-cyan-500/30 rounded-full font-mono font-bold">AI</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight">DEFENSIVE SOC PLATFORM</p>
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
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/40 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`w-4 h-4 mr-3 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold border ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM STATUS BAR */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#070B12] space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">SOC Telemetry</span>
            <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              READY
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
            <div className="p-1.5 bg-[#0D1527] border border-slate-800/60 rounded-lg flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Model:</span>
              <span className="text-cyan-400 font-bold text-[10px]">ANN/RF</span>
            </div>
            <div className="p-1.5 bg-[#0D1527] border border-slate-800/60 rounded-lg flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Engine:</span>
              <span className="text-emerald-400 font-bold text-[10px]">Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP NAVIGATION BAR */}
        <header className="h-16 bg-[#0A0F1D]/90 backdrop-blur border-b border-slate-800/80 flex items-center justify-between px-6 z-10">
          {/* Global Search Trigger (Ctrl+K) */}
          <div
            onClick={() => setIsCommandPaletteOpen(true)}
            className="relative w-80 lg:w-96 cursor-pointer group"
          >
            <div className="w-full bg-[#080C14] hover:bg-[#0C1222] border border-slate-800 hover:border-cyan-500/40 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-400 flex items-center justify-between transition-all">
              <div className="flex items-center">
                <Search className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors mr-2" />
                <span>Search telemetry, IP, attacks...</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="text-[10px] font-mono bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300">Ctrl</kbd>
                <kbd className="text-[10px] font-mono bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300">K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Audio Feedback Toggle */}
            <button
              onClick={toggleAudio}
              title={audioEnabled ? 'Audio alerts enabled' : 'Audio alerts muted'}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                audioEnabled
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : 'bg-slate-800/50 text-slate-500 border-slate-700/60'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* SOC CLUSTER BADGE */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shadow-lg shadow-emerald-950/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-mono font-bold text-emerald-300 tracking-wider">SOC: MONITORING</span>
            </div>

            {/* Notifications Modal Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 border border-slate-800 relative transition-all"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-84 bg-[#0F172A] border border-cyan-500/30 rounded-2xl shadow-2xl p-4 z-50">
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
                      className="p-2.5 bg-[#0B0F17] hover:bg-slate-800/60 rounded-xl border border-red-500/30 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between font-bold text-red-400">
                        <span>Volumetric Flood (DoS)</span>
                        <span className="text-[10px] font-mono text-slate-400">18:42</span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-1">48,200 pps surge on Gateway /api/v1/network</div>
                    </div>
                    <div
                      onClick={() => { setShowNotifications(false); navigate('/api-security'); }}
                      className="p-2.5 bg-[#0B0F17] hover:bg-slate-800/60 rounded-xl border border-orange-500/30 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between font-bold text-orange-400">
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
                </div>
              )}
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

              {showProfile && (
                <div className="absolute right-0 mt-2 w-60 bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl p-3 z-50">
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
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#080C14]">
          {signedOut ? (
            <LoginPage onLoginSuccess={() => {
              setSignedOut(false);
              refreshUser();
            }} />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};


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
  Server
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

  const handleLogout = () => {
    localStorage.setItem('cybersentinel_signed_out', 'true');
    authService.logout();
    setUser(null);
    setSignedOut(true);
    setShowProfile(false);
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Threat Detection', path: '/detection', icon: Radar },
    { label: 'Security Events', path: '/events', icon: Activity },
    { label: 'Vulnerability Findings', path: '/findings', icon: AlertTriangle },
    { label: 'Network Analysis', path: '/network', icon: Network },
    { label: 'API Security', path: '/api-security', icon: Lock },
    { label: 'AI Models', path: '/models', icon: Cpu },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Interview Mode', path: '/info', icon: BookOpen },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#0B0F17] text-slate-100 overflow-hidden">
      {/* PERMANENT SIDEBAR */}
      <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between z-20 select-none">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wider text-white flex items-center gap-1">
                CYBERSENTINEL <span className="text-cyan-400 text-xs px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/30 rounded font-mono">AI</span>
              </h1>
              <p className="text-[10px] text-slate-400 tracking-tight">Threat Intelligence Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-950/50'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM STATUS BAR */}
        <div className="p-4 border-t border-slate-800 bg-[#0B0F17]/50 space-y-2">
          <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase px-1">System Telemetry</div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sys: <strong className="text-slate-100">OK</strong></span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Model: <strong className="text-slate-100">Ready</strong></span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>API: <strong className="text-slate-100">Online</strong></span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>DB: <strong className="text-slate-100">Active</strong></span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP NAVIGATION BAR */}
        <header className="h-16 bg-[#0F172A]/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 z-10">
          {/* Global Search */}
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search findings, IP addresses, threat categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B0F17] border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* DEMO ENVIRONMENT BADGE */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span className="text-[11px] font-mono font-semibold text-amber-300 tracking-wider">DEMO ENVIRONMENT</span>
            </div>

            {/* Notifications Modal Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#131B2E] border border-slate-800 rounded-xl shadow-2xl p-4 z-50">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-semibold text-white">Security Alerts</span>
                    <span className="text-[10px] text-cyan-400">3 New</span>
                  </div>
                  <div className="space-y-3 mt-3">
                    <div className="text-xs p-2 bg-slate-900/60 rounded border border-red-500/30">
                      <div className="font-semibold text-red-400">Volumetric DoS Attack</div>
                      <div className="text-[11px] text-slate-400">45k pps burst detected on Gateway</div>
                    </div>
                    <div className="text-xs p-2 bg-slate-900/60 rounded border border-orange-500/30">
                      <div className="font-semibold text-orange-400">SQL Injection Vector</div>
                      <div className="text-[11px] text-slate-400">Attempted payload in /api/v1/auth</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-slate-800/60"
              >
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-semibold text-xs">
                  SA
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-slate-200">{user?.full_name || 'Lead Security Analyst'}</div>
                  <div className="text-[10px] text-cyan-400">{user?.role || 'Admin'}</div>
                </div>
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 bg-[#131B2E] border border-slate-800 rounded-xl shadow-2xl p-3 z-50">
                  <div className="px-2 py-1.5 border-b border-slate-800 text-xs">
                    <div className="font-semibold text-white">{user?.full_name}</div>
                    <div className="text-slate-400 text-[11px]">{user?.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-2 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded flex items-center mt-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0B0F17]">
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

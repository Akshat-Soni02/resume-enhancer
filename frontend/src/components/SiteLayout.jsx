import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Settings, Zap } from 'lucide-react';

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-white' : 'text-slate-400 hover:text-white'
  }`;

const optimizeLinkClass = ({ isActive }) =>
  `inline-flex items-center rounded-full px-3 py-1.5 text-sm font-bold transition-all ${
    isActive
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
      : 'bg-indigo-600/15 text-indigo-200 border border-indigo-500/25 hover:bg-indigo-600/25 hover:text-white'
  }`;

export default function SiteLayout({ onOpenSettings }) {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">ResumeAI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <NavLink to="/" className={optimizeLinkClass}>Optimize</NavLink>
            <NavLink to="/features" className={navLinkClass}>Features</NavLink>
            <NavLink to="/pricing" className={navLinkClass}>Pricing</NavLink>
            <NavLink to="/templates" className={navLinkClass}>Templates</NavLink>
            <NavLink to="/ats-guide" className={navLinkClass}>ATS Guide</NavLink>
            <NavLink to="/blog" className={navLinkClass}>Blog</NavLink>
            <NavLink to="/support" className={navLinkClass}>Support</NavLink>
          </nav>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 ml-auto shrink-0"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <h2 className="text-lg font-black tracking-tighter text-white">ResumeAI</h2>
            </div>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
              The ultimate AI-powered resume optimizer. Tailor your resume to any job description in seconds and get past the ATS filters.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Product</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/features" className="hover:text-indigo-400 transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
              <li><Link to="/templates" className="hover:text-indigo-400 transition-colors">Templates</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Resources</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link></li>
              <li><Link to="/ats-guide" className="hover:text-indigo-400 transition-colors">ATS Guide</Link></li>
              <li><Link to="/support" className="hover:text-indigo-400 transition-colors">Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">© 2026 ResumeAI. Built with Gemini.</p>
          <div className="flex space-x-6 text-slate-600 text-xs">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


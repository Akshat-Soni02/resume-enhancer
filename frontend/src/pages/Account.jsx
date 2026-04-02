import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, LogOut, FileText, Briefcase, Loader2, Download } from 'lucide-react';
import PageShell from './PageShell';
import { useAuth } from '../context/AuthContext';
import { fetchMe, listResumes, listResumeExports } from '../utils/authApi';

function formatWhen(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '—';
  }
}

export default function Account() {
  const { user, loading, firebaseReady, signInWithGoogle, signOutUser, getIdToken } = useAuth();
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [exports, setExports] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    setBusy(true);
    setErr(null);
    try {
      const [me, rs, ex] = await Promise.all([
        fetchMe(getIdToken),
        listResumes(getIdToken),
        listResumeExports(getIdToken),
      ]);
      setProfile(me);
      setResumes(rs);
      setExports(ex);
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message || 'Failed to load account data.');
    } finally {
      setBusy(false);
    }
  }, [user, getIdToken]);

  useEffect(() => {
    load();
  }, [load]);

  const downloadTex = (latex, filename) => {
    const blob = new Blob([latex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!firebaseReady) {
    return (
      <PageShell title="Account" subtitle="Cloud sync is not configured for this build.">
        <p className="text-slate-400 text-sm">
          Add <code className="text-indigo-300">VITE_FIREBASE_*</code> keys to your frontend environment to enable Google sign-in and Firestore.
        </p>
        <Link to="/" className="text-indigo-400 text-sm font-medium hover:underline">
          Back to Optimize
        </Link>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
        <Loader2 className="animate-spin" size={20} />
        <span>Loading…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <PageShell
        title="Account"
        subtitle="Sign in with Google to save resumes and track optimized exports in the cloud."
      >
        <button
          type="button"
          onClick={() => signInWithGoogle().catch((e) => setErr(e.message))}
          className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 font-bold px-6 py-3 hover:bg-slate-100 transition-colors"
        >
          <LogIn size={18} />
          Sign in with Google
        </button>
        {err && <p className="text-rose-400 text-sm">{err}</p>}
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Account"
      subtitle={profile?.email || user.email || 'Signed in'}
    >
      <div className="flex flex-wrap items-center gap-4">
        {user.photoURL && (
          <img src={user.photoURL} alt="" className="w-14 h-14 rounded-full border border-slate-700" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate">{profile?.display_name || user.displayName}</p>
          <p className="text-slate-500 text-sm truncate">{profile?.email || user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => signOutUser()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 text-slate-300 px-4 py-2 text-sm hover:bg-slate-800"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>

      {err && <p className="text-rose-400 text-sm">{err}</p>}
      {busy && (
        <p className="text-slate-500 text-sm flex items-center gap-2">
          <Loader2 className="animate-spin" size={14} />
          Refreshing…
        </p>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="text-indigo-400" size={20} />
          <h2 className="text-lg font-bold text-white">Saved resumes</h2>
        </div>
        {resumes.length === 0 ? (
          <p className="text-slate-500 text-sm">No saved resumes yet. Save from the Optimize flow after signing in.</p>
        ) : (
          <ul className="space-y-3">
            {resumes.map((r) => (
              <li key={r.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-slate-800 rounded-xl p-4">
                <div>
                  <p className="text-white font-medium">{r.title}</p>
                  <p className="text-slate-500 text-xs">Template: {r.template_id} · {formatWhen(r.updated_at || r.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="text-amber-400" size={20} />
          <h2 className="text-lg font-bold text-white">Application history (exports)</h2>
        </div>
        {exports.length === 0 ? (
          <p className="text-slate-500 text-sm">No exports yet. Save an optimized .tex from Step 3 after signing in.</p>
        ) : (
          <ul className="space-y-3">
            {exports.map((x) => (
              <li key={x.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-slate-800 rounded-xl p-4">
                <div>
                  <p className="text-white font-medium">{x.job_title}</p>
                  {x.company && <p className="text-slate-400 text-sm">{x.company}</p>}
                  <p className="text-slate-500 text-xs mt-1">{formatWhen(x.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadTex(x.optimized_latex, `resume_${x.id.slice(0, 8)}.tex`)}
                  className="inline-flex items-center gap-2 self-start rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2"
                >
                  <Download size={14} />
                  Download .tex
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link to="/" className="inline-block text-indigo-400 text-sm font-medium hover:underline">
        ← Back to Optimize
      </Link>
    </PageShell>
  );
}

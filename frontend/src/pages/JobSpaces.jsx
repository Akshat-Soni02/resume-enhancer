import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Link2, Loader2, LogOut, Plus, Users } from 'lucide-react';
import {
  addJobLink,
  createSpace,
  getSpace,
  joinSpace,
  leaveSpace,
  listMySpaces,
} from '../utils/jobSpacesApi';
import { getOrCreateUserId } from '../utils/userId';

function shortUser(id) {
  if (id.startsWith('session-')) return 'Guest';
  return `${id.slice(0, 8)}…`;
}

const MAX_SPACES = 5;

export default function JobSpaces() {
  const [spaces, setSpaces] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [detailSpace, setDetailSpace] = useState(null);
  const [links, setLinks] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [newSpaceName, setNewSpaceName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkNote, setLinkNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);

  const myId = getOrCreateUserId();

  const refreshList = useCallback(async () => {
    setListError(null);
    setLoadingList(true);
    try {
      const data = await listMySpaces();
      setSpaces(data.spaces);
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Could not load spaces.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const openSpace = async (id) => {
    setSelectedId(id);
    setFormError(null);
    setLoadingDetail(true);
    try {
      const data = await getSpace(id);
      setDetailSpace(data.space);
      setLinks(data.links);
      setMemberCount(data.members.length);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not open space.');
      setSelectedId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(null);
    setBusy(true);
    try {
      const s = await createSpace(newSpaceName.trim());
      setNewSpaceName('');
      await refreshList();
      await openSpace(s.id);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Create failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setFormError(null);
    setBusy(true);
    try {
      const { space } = await joinSpace(joinCode);
      setJoinCode('');
      await refreshList();
      await openSpace(space.id);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Join failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    if (!selectedId || !detailSpace) return;
    setFormError(null);
    setBusy(true);
    try {
      await leaveSpace(selectedId);
      setSelectedId(null);
      setDetailSpace(null);
      setLinks([]);
      await refreshList();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Leave failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!selectedId || !linkUrl.trim()) return;
    setFormError(null);
    setBusy(true);
    try {
      const { link } = await addJobLink(selectedId, {
        url: linkUrl.trim(),
        title: linkTitle.trim(),
        note: linkNote.trim(),
      });
      setLinkUrl('');
      setLinkTitle('');
      setLinkNote('');
      setLinks((prev) => [link, ...prev]);
      await refreshList();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not add link.');
    } finally {
      setBusy(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  const atLimit = spaces.length >= MAX_SPACES;

  if (selectedId && detailSpace) {
    return (
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => {
            setSelectedId(null);
            setDetailSpace(null);
            setFormError(null);
          }}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          All spaces
        </button>

        {formError && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
            {formError}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {detailSpace.name || 'Job space'}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Users size={16} />
                  {memberCount} member{memberCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLeave}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <LogOut size={16} />
              Leave space
            </button>
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Invite code</p>
            <div className="flex flex-wrap items-center gap-3">
              <code className="text-xl font-mono font-bold text-indigo-300 tracking-widest">
                {detailSpace.join_code}
              </code>
              <button
                type="button"
                onClick={() => copyCode(detailSpace.join_code)}
                className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300"
              >
                <Copy size={14} />
                Copy
              </button>
            </div>
            <p className="text-slate-500 text-xs mt-2">Share this code so others can join and post job links.</p>
          </div>

          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Link2 size={18} className="text-indigo-400" />
            Share a job link
          </h2>
          <form onSubmit={handleAddLink} className="space-y-3 mb-10">
            <input
              type="url"
              required
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Title (optional)"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                className="rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <input
                type="text"
                placeholder="Note (optional)"
                value={linkNote}
                onChange={(e) => setLinkNote(e.target.value)}
                className="rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Add link
            </button>
          </form>

          <h2 className="text-lg font-semibold text-white mb-4">Job links</h2>
          {loadingDetail ? (
            <div className="flex justify-center py-12 text-slate-500">
              <Loader2 className="animate-spin" size={28} />
            </div>
          ) : links.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center border border-dashed border-slate-800 rounded-xl">
              No links yet. Be the first to share one.
            </p>
          ) : (
            <ul className="space-y-3">
              {links.map((l) => (
                <li
                  key={l.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 hover:border-slate-700 transition-colors"
                >
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 font-medium text-sm break-all"
                  >
                    {l.title || l.url}
                  </a>
                  {l.title && <p className="text-xs text-slate-500 mt-1 break-all">{l.url}</p>}
                  {l.note && <p className="text-slate-400 text-sm mt-2">{l.note}</p>}
                  <p className="text-slate-600 text-xs mt-2">
                    by {l.user_id === myId ? 'You' : shortUser(l.user_id)} · {new Date(l.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-8 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to optimize
      </Link>

      {listError && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
          {listError}
          <p className="text-rose-400/80 text-xs mt-2">
            Start the API locally:{' '}
            <code className="text-rose-300">cd backend && uvicorn main:app --reload</code>
          </p>
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Job spaces</h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
          Create a space, share the invite code, and collect job posting links together. You can be in up to {MAX_SPACES}{' '}
          spaces at once (created or joined).
        </p>
        <p className="text-slate-600 text-xs mt-2">
          Spaces: <span className="text-slate-400">{spaces.length}</span> / {MAX_SPACES}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
        >
          <h2 className="text-white font-bold mb-4">Create a space</h2>
          <input
            type="text"
            placeholder="Space name (optional)"
            value={newSpaceName}
            onChange={(e) => setNewSpaceName(e.target.value)}
            disabled={atLimit || busy}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 mb-4 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={atLimit || busy}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 rounded-lg transition-colors"
          >
            {atLimit ? `Limit reached (${MAX_SPACES} spaces)` : 'Create space'}
          </button>
        </motion.form>

        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onSubmit={handleJoin}
          className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
        >
          <h2 className="text-white font-bold mb-4">Join with code</h2>
          <input
            type="text"
            placeholder="e.g. ABCD1234"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            disabled={atLimit || busy}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 mb-4 disabled:opacity-50 tracking-wider"
          />
          <button
            type="submit"
            disabled={atLimit || busy || !joinCode.trim()}
            className="w-full border border-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-lg transition-colors"
          >
            Join space
          </button>
        </motion.form>
      </div>

      {formError && !listError && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
          {formError}
        </div>
      )}

      <h2 className="text-lg font-semibold text-white mb-4">Your spaces</h2>
      {loadingList ? (
        <div className="flex justify-center py-16 text-slate-500">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : spaces.length === 0 ? (
        <p className="text-slate-500 text-sm py-12 text-center border border-dashed border-slate-800 rounded-2xl">
          You are not in any space yet. Create one or join with a code.
        </p>
      ) : (
        <ul className="space-y-2">
          {spaces.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => openSpace(s.id)}
                className="w-full text-left rounded-xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900/60 hover:border-slate-700 px-5 py-4 transition-colors flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-white font-medium">{s.name || 'Untitled space'}</p>
                  <p className="text-slate-500 text-xs mt-1 font-mono">{s.join_code}</p>
                </div>
                <span className="text-slate-500 text-xs shrink-0">
                  {s.link_count ?? 0} link{(s.link_count ?? 0) !== 1 ? 's' : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

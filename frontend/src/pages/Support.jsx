import React, { useState } from 'react';
import PageShell from './PageShell';

const FAQ = ({ q, a }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
    <p className="text-white font-bold">{q}</p>
    <p className="text-slate-400 text-sm mt-2 leading-relaxed">{a}</p>
  </div>
);

export default function Support() {
  const [message, setMessage] = useState('');
  return (
    <PageShell
      title="Support"
      subtitle="Need help? Start with the FAQ or send a message. (UI-only for now.)"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-bold">Contact</h3>
          <p className="text-slate-400 text-sm mt-2">
            Describe what you tried, what you expected, and what happened.
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="Write your message..."
            className="mt-4 w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none resize-none"
          />
          <button
            type="button"
            className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl"
            onClick={() => setMessage('')}
          >
            Send
          </button>
          <p className="text-xs text-slate-500 mt-2">This is a placeholder screen; wire it to email/CRM later.</p>
        </div>

        <div className="space-y-4">
          <FAQ q="Why do I need my own API key?" a="The key is stored locally in your browser and used to call Gemini through the backend for your requests." />
          <FAQ q="My file won’t upload" a="Make sure it’s a text-based PDF and under the size limit. Scanned PDFs may not extract well." />
          <FAQ q="I’m getting rate-limited (429)" a="Try again later, or switch the model in Settings to a faster/lighter option." />
        </div>
      </div>
    </PageShell>
  );
}


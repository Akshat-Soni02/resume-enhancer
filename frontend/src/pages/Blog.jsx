import React from 'react';
import PageShell from './PageShell';

const posts = [
  { title: 'How ATS really scores your resume', date: 'Mar 2026', excerpt: 'A practical breakdown of keyword density, structure, and recruiter behavior.' },
  { title: 'Strong bullets: impact > responsibilities', date: 'Mar 2026', excerpt: 'Rewrite examples using action + metric + method.' },
  { title: 'The JD parsing checklist', date: 'Mar 2026', excerpt: 'What to extract so your resume can align quickly.' },
];

export default function Blog() {
  return (
    <PageShell title="Blog" subtitle="Short reads for shipping better applications faster.">
      <div className="space-y-4">
        {posts.map((p) => (
          <div key={p.title} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-white font-bold">{p.title}</h3>
              <span className="text-xs text-slate-500">{p.date}</span>
            </div>
            <p className="text-slate-400 text-sm mt-2">{p.excerpt}</p>
            <button type="button" className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium">
              Read more
            </button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}


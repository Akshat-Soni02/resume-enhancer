import React from 'react';
import PageShell from './PageShell';

const templates = [
  { name: 'Classic ATS', desc: 'Clean, scanner-friendly structure. Best default.' },
  { name: 'Modern Minimal', desc: 'Tighter spacing and modern typography.' },
  { name: 'Engineer Focus', desc: 'Highlights systems, performance, and impact.' },
  { name: 'Research Focus', desc: 'Emphasis on papers, methods, and results.' },
  { name: 'Product Focus', desc: 'Metrics, stakeholder work, and outcomes.' },
  { name: 'Student / New Grad', desc: 'Projects-first layout with concise sections.' },
];

const Card = ({ name, desc }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
    <h3 className="text-white font-bold">{name}</h3>
    <p className="text-slate-400 text-sm mt-1">{desc}</p>
    <button type="button" className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium">
      Preview
    </button>
  </div>
);

export default function Templates() {
  return (
    <PageShell
      title="Templates"
      subtitle="Minimal template gallery UI. You can later connect these to distinct LaTeX skeletons."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((t) => (
          <Card key={t.name} name={t.name} desc={t.desc} />
        ))}
      </div>
    </PageShell>
  );
}


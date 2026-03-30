import React from 'react';
import PageShell from './PageShell';

const Section = ({ title, children }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
    <h3 className="text-white font-bold">{title}</h3>
    <div className="text-slate-300 text-sm mt-3 space-y-2 leading-relaxed">{children}</div>
  </div>
);

export default function ATSGuide() {
  return (
    <PageShell
      title="ATS Guide"
      subtitle="A minimal, actionable checklist you can follow before applying."
    >
      <div className="grid grid-cols-1 gap-6">
        <Section title="1) Match the JD language">
          <p>Use the same nouns the JD uses (e.g. “low-latency systems”, “market microstructure”, “distributed systems”). Avoid synonyms unless you include both.</p>
          <p>Put the most relevant skills near the top of your skills section.</p>
        </Section>
        <Section title="2) Write bullets like a recruiter">
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            <li>Start with an action verb (Built, Led, Optimized, Shipped).</li>
            <li>Add a metric (latency ↓ 35%, cost ↓ 90%, throughput ↑ 2x).</li>
            <li>Include the method / tech (C++, Python, Redis, GCP, etc.).</li>
          </ul>
        </Section>
        <Section title="3) Reduce ambiguity">
          <p>If a bullet is vague, it won’t match well. Replace “worked on” with what you delivered and how it moved a metric.</p>
        </Section>
      </div>
    </PageShell>
  );
}


import React from 'react';
import PageShell from './PageShell';

const Tier = ({ name, price, blurb, bullets, cta, highlighted }) => (
  <div className={`rounded-2xl border p-6 ${highlighted ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-slate-800 bg-slate-900/50'}`}>
    <div className="flex items-baseline justify-between">
      <h3 className="text-white font-bold text-lg">{name}</h3>
      <span className="text-slate-300 font-black">{price}</span>
    </div>
    <p className="text-slate-400 text-sm mt-2">{blurb}</p>
    <ul className="mt-4 space-y-2 text-sm text-slate-300">
      {bullets.map((b) => (
        <li key={b} className="flex gap-2">
          <span className="text-emerald-400">✓</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
    <button
      type="button"
      className={`mt-6 w-full font-bold py-3 rounded-xl transition-all ${
        highlighted ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
      }`}
    >
      {cta}
    </button>
    <p className="mt-3 text-xs text-slate-500">
      Pricing is placeholder UI. Hook up billing when you’re ready.
    </p>
  </div>
);

export default function Pricing() {
  return (
    <PageShell
      title="Pricing"
      subtitle="Simple tiers. Upgrade later if you want analytics, teams, or hosted keys."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Tier
          name="Starter"
          price="$0"
          blurb="For quick checks."
          bullets={['Parse JD', 'Upload PDF', 'Get suggestions']}
          cta="Use for free"
        />
        <Tier
          name="Pro"
          price="$12/mo"
          blurb="For regular applications."
          bullets={['Bulk accept changes', 'Advanced prompts', 'Export-ready LaTeX']}
          cta="Start Pro"
          highlighted
        />
        <Tier
          name="Team"
          price="$49/mo"
          blurb="For recruiting & coaching."
          bullets={['Shared templates', 'Team workspaces', 'Usage analytics']}
          cta="Contact sales"
        />
      </div>
    </PageShell>
  );
}


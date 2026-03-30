import React from 'react';

export default function PageShell({ title, subtitle, children }) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate-400 mt-2">{subtitle}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}


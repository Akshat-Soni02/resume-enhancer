import React from 'react';
import PageShell from './PageShell';
import { CheckCircle2, Sparkles, Shield, Zap } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300">
        <Icon size={18} />
      </div>
      <div>
        <h3 className="text-white font-bold">{title}</h3>
        <p className="text-slate-400 text-sm mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  </div>
);

export default function Features() {
  return (
    <PageShell
      title="Features"
      subtitle="A minimal workflow that still feels premium: parse the JD, optimize, export."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard
          icon={Sparkles}
          title="JD parsing"
          desc="Extracts job title, company, required/preferred skills, responsibilities, and ATS keywords from a URL or pasted text."
        />
        <FeatureCard
          icon={Zap}
          title="AI-powered optimization"
          desc="Generates a structured LaTeX resume and actionable suggestions, ranked by ATS impact."
        />
        <FeatureCard
          icon={Shield}
          title="Local key storage"
          desc="Your Gemini API key is stored in your browser (LocalStorage) and sent only to the backend for processing."
        />
        <FeatureCard
          icon={CheckCircle2}
          title="Review & apply suggestions"
          desc="Accept/reject changes individually or in bulk (high/medium/all). Your LaTeX updates instantly."
        />
      </div>
    </PageShell>
  );
}


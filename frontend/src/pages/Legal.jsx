import React from 'react';
import PageShell from './PageShell';

export function Privacy() {
  return (
    <PageShell title="Privacy Policy" subtitle="Minimal placeholder copy. Replace with your legal text.">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-slate-300 text-sm space-y-3 leading-relaxed">
        <p>We store your Gemini API key locally in your browser (LocalStorage). We do not store your key in a database.</p>
        <p>Requests are sent to the backend to process your resume and job description. You control what you upload and paste.</p>
      </div>
    </PageShell>
  );
}

export function Terms() {
  return (
    <PageShell title="Terms of Service" subtitle="Minimal placeholder copy. Replace with your legal text.">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-slate-300 text-sm space-y-3 leading-relaxed">
        <p>This application is provided as-is. You are responsible for the content you submit and the outputs you use.</p>
        <p>Do not upload confidential data you are not authorized to share.</p>
      </div>
    </PageShell>
  );
}


import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = ['Input', 'Optimize', 'Export'];
  return (
    <div className="flex items-center justify-center space-x-4 mb-12">
      {steps.map((step, idx) => (
        <React.Fragment key={step}>
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                currentStep > idx + 1
                  ? 'bg-green-500 text-white'
                  : currentStep === idx + 1
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {currentStep > idx + 1 ? <Check size={16} /> : idx + 1}
            </div>
            <span className={`text-sm font-medium ${currentStep === idx + 1 ? 'text-white' : 'text-slate-500'}`}>
              {step}
            </span>
          </div>
          {idx < steps.length - 1 && <div className="w-12 h-px bg-slate-800" />}
        </React.Fragment>
      ))}
    </div>
  );
}

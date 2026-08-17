import React from 'react';
import { useApp } from '../../../context/AppContext';

const PRESETS = [
  { label: 'FastAPI :8000', url: 'http://127.0.0.1:8000/openapi.json' },
  { label: 'Express :3000', url: 'http://localhost:3000/api-docs' },
  { label: 'Spring :8080', url: 'http://localhost:8080/v3/api-docs' },
  { label: 'Flask :5000', url: 'http://localhost:5000/openapi.json' }
];

export const PresetPills: React.FC = () => {
  const { loadSpecFromUrl, serverUrl } = useApp();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
      {PRESETS.map((p) => {
        const isActive = serverUrl === p.url;
        return (
          <button
            key={p.label}
            onClick={() => loadSpecFromUrl(p.url)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium transition-all whitespace-nowrap select-none border ${
              isActive
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 dark:text-emerald-400 font-bold shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500/50 hover:text-emerald-500'
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
};

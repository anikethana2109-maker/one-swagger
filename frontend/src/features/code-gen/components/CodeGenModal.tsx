import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { generateCurlSnippet, generatePythonRequestsSnippet, generateFetchSnippet, generateGoSnippet } from '../services/codeSnippetGenerator';
import { X, Copy, Check, Terminal } from 'lucide-react';

export const CodeGenModal: React.FC = () => {
  const { isCodeGenOpen, setIsCodeGenOpen, requestConfig, authToken } = useApp();
  const [lang, setLang] = useState<'curl' | 'python' | 'fetch' | 'go'>('curl');
  const [copied, setCopied] = useState(false);

  if (!isCodeGenOpen) return null;

  let snippet = '';
  if (lang === 'curl') snippet = generateCurlSnippet(requestConfig, authToken);
  else if (lang === 'python') snippet = generatePythonRequestsSnippet(requestConfig, authToken);
  else if (lang === 'fetch') snippet = generateFetchSnippet(requestConfig, authToken);
  else if (lang === 'go') snippet = generateGoSnippet(requestConfig, authToken);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setIsCodeGenOpen(false)}>
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Generate Code Snippet
            </h3>
          </div>

          <button onClick={() => setIsCodeGenOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-3 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
          {(['curl', 'python', 'fetch', 'go'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-t-lg transition-all ${
                lang === l
                  ? 'border-b-2 border-emerald-500 text-emerald-500 bg-emerald-500/5'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="p-4 relative group">
          <button
            onClick={handleCopy}
            className="absolute right-6 top-6 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 shadow"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>

          <pre className="p-4 bg-zinc-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-80 leading-relaxed border border-zinc-800">
            <code>{snippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

import { useEffect, useRef, useState } from 'react';
import { Play, Terminal, Eye, AlertCircle } from 'lucide-react';
import type { Language } from '../types';

interface CodePreviewProps {
  code: string;
  language: Language;
}

export function CodePreview({ code, language }: CodePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'console'>('preview');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runCode();
  }, [code, language]);

  function runCode() {
    setError(null);
    setConsoleOutput([]);

    if (!code.trim()) {
      setConsoleOutput(['// No code to run']);
      return;
    }

    const canRun = ['javascript', 'html', 'css', 'web', 'react'].includes(language);
    if (!canRun) {
      setConsoleOutput([
        `// ${language.toUpperCase()} preview is not available in the browser.`,
        '// The code is displayed for reference only.',
        '',
        '// Output would be:',
        ...getSimulatedOutput(code, language),
      ]);
      return;
    }

    let htmlContent = '';

    if (language === 'html' || language === 'web') {
      // Check if code already has full HTML structure
      if (code.includes('<html') || code.includes('<!DOCTYPE') || code.includes('<head')) {
        htmlContent = code;
      } else {
        htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:'Segoe UI',sans-serif;color:#e0e0e0;background:#1a1a2e;padding:20px;margin:0;}</style></head><body>${code}</body></html>`;
      }
    } else if (language === 'css') {
      htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${code}</style></head><body style="font-family:'Segoe UI',sans-serif;background:#1a1a2e;color:#e0e0e0;padding:20px;margin:0;">
        <h1>Heading 1</h1><h2>Heading 2</h2><p>This is a paragraph of text to demonstrate your CSS styles.</p>
        <div class="container"><div class="card"><h3>Card Title</h3><p>Card content goes here.</p></div></div>
        <button>Click Me</button> <a href="#">Link</a>
        <ul><li>Item One</li><li>Item Two</li><li>Item Three</li></ul>
      </body></html>`;
    } else if (language === 'javascript' || language === 'react') {
      htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8">
        <style>
          body { font-family: 'SF Mono', 'Fira Code', monospace; background: #0d1117; color: #c9d1d9; padding: 16px; margin: 0; font-size: 13px; line-height: 1.6; }
          .log { padding: 4px 0; border-bottom: 1px solid #21262d; }
          .log:last-child { border-bottom: none; }
          .log-prefix { color: #58a6ff; }
          .error { color: #f85149; }
          .warn { color: #d29922; }
        </style>
      </head><body><div id="root"></div><div id="output"></div>
      <script>
        const output = document.getElementById('output');
        const origLog = console.log;
        const origError = console.error;
        const origWarn = console.warn;
        
        function formatVal(v) {
          if (v === undefined) return 'undefined';
          if (v === null) return 'null';
          if (typeof v === 'object') return JSON.stringify(v, null, 2);
          return String(v);
        }
        
        console.log = function(...args) {
          origLog.apply(console, args);
          const div = document.createElement('div');
          div.className = 'log';
          div.innerHTML = '<span class="log-prefix">▸ </span>' + args.map(formatVal).join(' ');
          output.appendChild(div);
          window.parent.postMessage({ type: 'console', level: 'log', args: args.map(formatVal) }, '*');
        };
        
        console.error = function(...args) {
          origError.apply(console, args);
          const div = document.createElement('div');
          div.className = 'log error';
          div.innerHTML = '<span>✕ </span>' + args.map(formatVal).join(' ');
          output.appendChild(div);
          window.parent.postMessage({ type: 'console', level: 'error', args: args.map(formatVal) }, '*');
        };

        console.warn = function(...args) {
          origWarn.apply(console, args);
          const div = document.createElement('div');
          div.className = 'log warn';
          div.innerHTML = '<span>⚠ </span>' + args.map(formatVal).join(' ');
          output.appendChild(div);
          window.parent.postMessage({ type: 'console', level: 'warn', args: args.map(formatVal) }, '*');
        };
        
        try {
          ${code}
        } catch(e) {
          console.error(e.message);
          window.parent.postMessage({ type: 'error', message: e.message }, '*');
        }
      </script></body></html>`;
    }

    if (iframeRef.current) {
      iframeRef.current.srcdoc = htmlContent;
    }
  }

  function getSimulatedOutput(code: string, lang: Language): string[] {
    if (lang === 'python') {
      const printMatches = code.match(/print\((.+)\)/g);
      if (printMatches) {
        return printMatches.map((m) => {
          const content = m.replace(/print\(/, '').replace(/\)$/, '');
          return `>>> ${content}`;
        });
      }
    }
    if (lang === 'sql') {
      return ['-- Query would execute against your database', '-- Results would appear here'];
    }
    if (lang === 'typescript') {
      return ['// TypeScript compiles to JavaScript', '// Type checking would occur at compile time'];
    }
    return ['// Output simulation not available'];
  }

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'console') {
        setConsoleOutput((prev) => [
          ...prev,
          `${event.data.level === 'error' ? '✕' : event.data.level === 'warn' ? '⚠' : '▸'} ${event.data.args.join(' ')}`,
        ]);
      } else if (event.data?.type === 'error') {
        setError(event.data.message);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const canRender = ['html', 'web', 'css'].includes(language);

  return (
    <div className="flex flex-col h-full bg-[#0d1117] rounded-xl overflow-hidden border border-gray-800">
      {/* Tab Bar */}
      <div className="flex items-center justify-between bg-[#161b22] border-b border-gray-800 px-2">
        <div className="flex">
          {canRender && (
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
                activeTab === 'preview'
                  ? 'text-emerald-400 border-emerald-400'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          )}
          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
              activeTab === 'console' || !canRender
                ? 'text-emerald-400 border-emerald-400'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Console
          </button>
        </div>
        <button
          onClick={runCode}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors"
        >
          <Play className="w-3 h-3" />
          Run
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {error && (
          <div className="absolute top-2 left-2 right-2 z-10 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-2 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        {(activeTab === 'preview' && canRender) ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-modals"
            title="Code Preview"
          />
        ) : (
          <div className="h-full overflow-auto p-4">
            {activeTab === 'console' || !canRender ? (
              <div className="font-mono text-xs space-y-1">
                {language === 'javascript' || language === 'react' || language === 'typescript' ? (
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full border-0 absolute inset-0"
                    sandbox="allow-scripts"
                    title="Code Output"
                  />
                ) : (
                  consoleOutput.map((line, i) => (
                    <div key={i} className="text-gray-400 py-0.5">
                      {line}
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

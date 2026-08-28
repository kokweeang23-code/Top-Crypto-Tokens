import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, ExternalLink, RefreshCw, MessageCircle } from 'lucide-react';

interface DisqusCommentsProps {
  shortname?: string;
  url?: string;
  identifier?: string;
  title?: string;
  language?: string;
}

export function DisqusComments({
  shortname = 'top-crypto-tokens',
  url = 'https://top-crypto-tokens-pqvo.vercel.app/',
  identifier = 'crypto-pulse-main-dashboard',
  title = 'Crypto Pulse - Top 10 Non-Stablecoins by Volume',
  language = 'en_US',
}: DisqusCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoadError(false);
    const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://top-crypto-tokens-pqvo.vercel.app/');

    // Configure window.disqus_config
    const win = window as any;
    win.disqus_config = function () {
      this.page.url = canonicalUrl;
      this.page.identifier = identifier;
      this.page.title = title;
      if (language) {
        this.language = language;
      }
    };

    if (win.DISQUS) {
      try {
        win.DISQUS.reset({
          reload: true,
          config: win.disqus_config,
        });
      } catch (err) {
        console.warn('Disqus reset notice:', err);
      }
    } else {
      const scriptId = 'disqus-embed-script';
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }

      try {
        const dsq = document.createElement('script');
        dsq.id = scriptId;
        dsq.type = 'text/javascript';
        dsq.async = true;
        dsq.src = `https://${shortname}.disqus.com/embed.js`;
        dsq.setAttribute('data-timestamp', String(+new Date()));
        dsq.onerror = () => {
          setLoadError(true);
        };
        (document.head || document.body).appendChild(dsq);
      } catch (e) {
        setLoadError(true);
      }
    }
  }, [shortname, url, identifier, title, language, refreshKey]);

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-cyan-400" />
          <span>Disqus Channel: <strong className="text-slate-200">{shortname}</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="flex items-center gap-1 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Reload comments thread"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>
          <a
            href={`https://${shortname}.disqus.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-cyan-300 transition-colors"
          >
            <span>Open on Disqus</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="min-h-[240px] relative bg-slate-950/40 rounded-xl p-4 border border-slate-800/80">
        <div id="disqus_thread" key={`disqus-thread-${refreshKey}`} className="min-h-[220px] w-full" />

        {loadError && (
          <div className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 text-center text-xs text-slate-400 mt-4 flex flex-col items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-400/80" />
            <p>If comments are blocked by browser tracker protection or cookies, you can participate directly on the Disqus website.</p>
            <a
              href={`https://${shortname}.disqus.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors mt-1"
            >
              <span>Join Discussion on Disqus</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}


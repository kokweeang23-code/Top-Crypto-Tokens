import React, { useEffect, useRef, useState } from 'react';
import { Users, Sparkles, ExternalLink, RefreshCw, X, MessageSquare } from 'lucide-react';

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
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isVisible) return;
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
  }, [shortname, url, identifier, title, language, refreshKey, isVisible]);

  if (!isVisible) {
    return (
      <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm text-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700">
            <MessageSquare className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">TOP CRYPTO TOKENS COMMUNITY FORUM</div>
            <div className="text-xs text-slate-500">Live feedback, token momentum reviews, and market sentiment.</div>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          Open Forum
        </button>
      </div>
    );
  }

  return (
    <section ref={containerRef} className="mt-10 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-slate-900">
      {/* Top Badges & Close Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 bg-[#131722] text-white rounded-md text-[11px] font-extrabold tracking-wider uppercase">
            DISQUS COMMUNITY
          </span>
          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium">
            Top Crypto Tokens
          </span>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          title="Minimize discussion forum"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Heading & Subtitle */}
      <div className="mt-3.5">
        <div className="flex items-center gap-2.5">
          <Users className="w-6 h-6 text-slate-900 shrink-0" />
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase font-sans">
            TOP CRYPTO TOKENS COMMUNITY FORUM
          </h2>
        </div>
        <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-normal">
          Live feedback, token momentum updates, liquidity analysis, and market sentiment.
        </p>
      </div>

      {/* Action Bar with Forum ID and Controls */}
      <div className="mt-4 p-3 sm:p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <Sparkles className="w-4 h-4 text-slate-500" />
          <span>
            Disqus Forum ID:{' '}
            <span className="font-mono text-slate-400 font-medium">{shortname}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://${shortname}.disqus.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-[#131722] hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Open in Disqus</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="px-3.5 py-1.5 bg-[#131722] hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="Reload comments thread"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* Disqus Embed Thread Container */}
      <div className="mt-6 min-h-[300px] w-full">
        <div id="disqus_thread" key={`disqus-thread-${refreshKey}`} className="min-h-[260px] w-full" />

        {loadError && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600 mt-4 flex flex-col items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-slate-400" />
            <p className="font-medium text-slate-700">
              If comments are blocked by browser tracker protection or cookies, you can participate directly on the Disqus website.
            </p>
            <a
              href={`https://${shortname}.disqus.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition-colors mt-1 shadow-xs"
            >
              <span>Join Discussion on Disqus</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}



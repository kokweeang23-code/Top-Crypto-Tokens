import React, { useEffect, useState } from 'react';
import { MessageSquare, MessageCircle, Sparkles } from 'lucide-react';

interface TalkToUsProps {
  url?: string;
  identifier?: string;
  title?: string;
  shortname?: string;
}

export const TalkToUsView: React.FC<TalkToUsProps> = ({
  url = 'https://top-crypto-tokens-pqvo.vercel.app/',
  identifier = 'top-crypto-tokens',
  title = 'Top Crypto Tokens - Talk to Us',
  shortname = 'top-crypto-tokens',
}) => {
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoadError(false);
    const win = window as any;

    // Set Disqus Configuration Variables
    win.disqus_config = function () {
      this.page.url = url;
      this.page.identifier = identifier;
      this.page.title = title;
      this.language = 'en';
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
        dsq.onerror = () => setLoadError(true);
        (document.head || document.body).appendChild(dsq);
      } catch (e) {
        setLoadError(true);
      }
    }

    // Load count.js for comment counts if not present
    const countScriptId = 'disqus-count-script';
    if (!document.getElementById(countScriptId)) {
      try {
        const countScript = document.createElement('script');
        countScript.id = countScriptId;
        countScript.async = true;
        countScript.src = `https://${shortname}.disqus.com/count.js`;
        (document.head || document.body).appendChild(countScript);
      } catch (e) {
        // silent catch
      }
    }
  }, [url, identifier, title, shortname]);

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-slate-900 mt-2">
      {/* Header & Badges */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 bg-[#131722] text-white rounded-md text-[11px] font-extrabold tracking-wider uppercase">
            DISQUS COMMUNITY
          </span>
          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium">
            Talk to Us
          </span>
        </div>

        <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <MessageCircle className="w-3.5 h-3.5 text-cyan-600" />
          <span
            className="disqus-comment-count"
            data-disqus-identifier={identifier}
            data-disqus-url={url}
          >
            Comments
          </span>
        </div>
      </div>

      {/* Main Title */}
      <div className="mt-3.5">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-6 h-6 text-slate-900 shrink-0" />
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase font-sans">
            Talk to Us & Community Forum
          </h2>
        </div>
        <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-normal">
          Share your feedback, token momentum ideas, liquidity questions, and market thoughts with the community.
        </p>
      </div>

      {/* Forum Info Bar */}
      <div className="mt-4 p-3 sm:p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <Sparkles className="w-4 h-4 text-slate-500" />
          <span>
            Disqus Forum ID:{' '}
            <span className="font-mono text-slate-600 font-semibold">{shortname}</span>
          </span>
        </div>
        <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          Live Embedded Forum
        </span>
      </div>

      {/* Embedded Disqus Forum */}
      <div className="mt-6 min-h-[350px] w-full">
        <div id="disqus_thread" className="min-h-[280px] w-full" />
        <noscript>
          Please enable JavaScript to view the{' '}
          <a href="https://disqus.com/?ref_noscript" rel="nofollow">
            comments powered by Disqus.
          </a>
        </noscript>

        {loadError && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 mt-4">
            Unable to load Disqus comments directly. Please ensure third-party cookies or tracker blockers are disabled.
          </div>
        )}
      </div>
    </section>
  );
};



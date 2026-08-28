import React, { useEffect, useRef } from 'react';

interface DisqusCommentsProps {
  shortname: string;
  url?: string;
  identifier: string;
  title: string;
  language?: string;
}

export function DisqusComments({
  shortname,
  url,
  identifier,
  title,
  language = 'zh_TW',
}: DisqusCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://top-crypto-tokens-pqvo.vercel.app/');
    
    // Set Disqus configuration on window object
    const win = window as any;
    win.disqus_config = function () {
      this.page.url = pageUrl;
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
        console.warn('Disqus reset error:', err);
      }
    } else {
      const scriptId = 'disqus-embed-script';
      if (!document.getElementById(scriptId)) {
        try {
          const dsq = document.createElement('script');
          dsq.id = scriptId;
          dsq.type = 'text/javascript';
          dsq.async = true;
          dsq.src = `https://${shortname}.disqus.com/embed.js`;
          dsq.setAttribute('data-timestamp', String(+new Date()));
          dsq.onerror = () => {
            // Silently handle cases where Disqus is blocked by tracking protection or sandbox
          };
          (document.head || document.body).appendChild(dsq);
        } catch (e) {}
      }
    }
  }, [shortname, url, identifier, title, language]);

  return (
    <div ref={containerRef} className="w-full">
      <div id="disqus_thread" className="min-h-[220px]" />
    </div>
  );
}

import React, { useMemo } from 'react';
// @ts-ignore
import { DiscussionEmbed, CommentCount } from 'disqus-react';
import { MessageSquare, MessageCircle, Sparkles } from 'lucide-react';

interface ArticleData {
  url: string;
  id: string;
  title: string;
}

interface TalkToUsProps {
  article?: ArticleData;
}

const DEFAULT_ARTICLE: ArticleData = {
  url: 'https://top-crypto-tokens-pqvo.vercel.app/',
  id: 'crypto-pulse-talk-to-us',
  title: 'Talk to Us - Top Crypto Tokens',
};

export const TalkToUsView: React.FC<TalkToUsProps> = React.memo(({
  article = DEFAULT_ARTICLE,
}) => {
  const currentArticle = article || DEFAULT_ARTICLE;

  const discussionConfig = useMemo(() => ({
    url: currentArticle.url,
    identifier: currentArticle.id,
    title: currentArticle.title,
    language: 'en',
  }), [currentArticle.url, currentArticle.id, currentArticle.title]);

  const commentCountConfig = useMemo(() => ({
    url: currentArticle.url,
    identifier: currentArticle.id,
    title: currentArticle.title,
  }), [currentArticle.url, currentArticle.id, currentArticle.title]);

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
          <CommentCount
            shortname="top-crypto-tokens"
            config={commentCountConfig}
          >
            {/* Placeholder Text */}
            Comments
          </CommentCount>
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
            <span className="font-mono text-slate-600 font-semibold">top-crypto-tokens</span>
          </span>
        </div>
        <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          Live Embedded Forum
        </span>
      </div>

      {/* Embedded Disqus Forum */}
      <div className="mt-6 min-h-[350px] w-full">
        <DiscussionEmbed
          shortname="top-crypto-tokens"
          config={discussionConfig}
        />
      </div>
    </section>
  );
});


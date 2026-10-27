import React, { useState } from 'react';
import { MALYCHITE_GUIDES } from '../data/guides';
import { MalychitePost } from '../types';
import { BookOpen, Search, Clock, Calendar, ArrowLeft, Sparkles, Video } from 'lucide-react';

export const MalychiteBlog: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<MalychitePost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const categories = ['All', 'Foundations', 'Ideograms & Gestalts', 'AOL Quenching', 'Astral & Non-Local', 'Dream Telepathy'];

  const filteredPosts = MALYCHITE_GUIDES.filter(post => {
    if (categoryFilter !== 'All' && post.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = post.title.toLowerCase().includes(q);
      const sumMatch = post.summary.toLowerCase().includes(q);
      const tagMatch = post.tags.some(t => t.toLowerCase().includes(q));
      return titleMatch || sumMatch || tagMatch;
    }
    return true;
  });

  if (selectedPost) {
    return (
      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setSelectedPost(null)}
          className="flex items-center gap-2 text-xs text-[#2DD4BF] hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Malychite Teachings Library</span>
        </button>

        <article className="bg-[#0D0F22] border border-[#242A5C] rounded-2xl p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#8A90B8] mb-3">
            <span className="text-[#C4B5FD] font-semibold">{selectedPost.category}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(selectedPost.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{selectedPost.readTimeMinutes} min read</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display leading-tight mb-4">
            {selectedPost.title}
          </h1>

          <div className="p-4 rounded-xl bg-[#141738] border border-[#242A5C] text-xs sm:text-sm text-[#5EEAD4] italic mb-8">
            "{selectedPost.summary}"
          </div>

          <div className="space-y-5 text-sm sm:base text-[#D4D8F0] leading-relaxed font-sans">
            {selectedPost.content.map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="mt-8 pt-6 border-t border-[#242A5C]/60 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#71779E] mr-2">Tags:</span>
            {selectedPost.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded bg-[#080914] border border-[#242A5C] text-[#C4B5FD]"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Phase 2 Live Sessions Notice as instructed */}
          <div className="mt-8 p-4 rounded-xl bg-[#080914] border border-[#242A5C] flex items-start gap-3 text-xs text-[#8A90B8]">
            <Video className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Phase 2 Curriculum Integration:</span>
              <p className="mt-0.5 text-[#71779E]">
                Live interactive workshops and webinars anchored directly onto this teaching module will launch in Phase 2, with live session recordings archived back into this written library.
              </p>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Blog Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242A5C]/60 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono-code text-[#C4B5FD] mb-1">
            <BookOpen className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>Malychite Teachings & Field Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            The Remote Viewing Library
          </h1>
        </div>

        <span className="text-xs text-[#71779E] font-mono-code">
          {MALYCHITE_GUIDES.length} Curated Essays
        </span>
      </div>

      <p className="text-sm text-[#9FA6D1] leading-relaxed mb-6">
        A grounded, serious curriculum on Controlled Remote Viewing (CRV), ideogram kinematics, quenching Analytical Overlay (AOL), and sensory signal discrimination. Written by Malychite for disciplined practitioners.
      </p>

      {/* Filter Chips & Search Bar */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-[#2DD4BF]/15 text-[#5EEAD4] border border-[#2DD4BF]/50'
                  : 'bg-[#141733]/60 text-[#8A90B8] hover:text-white border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#5A608B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Malychite guides by concept, protocol, or tag..."
            className="w-full pl-9 pr-3.5 py-2 bg-[#0E1026] border border-[#242A5C] rounded-xl text-xs text-white placeholder-[#5A608B] focus:outline-none focus:border-[#2DD4BF]"
          />
        </div>
      </div>

      {/* Post Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPosts.map(post => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="bg-[#0D0F22] border border-[#242A5C] hover:border-[#2DD4BF]/50 rounded-2xl p-6 shadow-lg cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#8A90B8] mb-2">
                <span className="text-[#C4B5FD] font-semibold">{post.category}</span>
                <span className="font-mono-code text-[11px]">{post.readTimeMinutes} min read</span>
              </div>

              <h2 className="font-display text-lg font-bold text-white group-hover:text-[#2DD4BF] transition-colors leading-snug mb-2">
                {post.title}
              </h2>

              <p className="text-xs text-[#9FA6D1] leading-relaxed line-clamp-3 mb-4">
                {post.summary}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#242A5C]/40 text-xs">
              <span className="text-[11px] text-[#71779E]">
                {new Date(post.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-[#2DD4BF] font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Read Guide →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

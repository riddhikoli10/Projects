
import React from 'react';
import { Post, SentimentAnalysis } from '../types';

interface PostCardProps {
  post: Post & { analysis: SentimentAnalysis };
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'negative': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'neutral': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <i className="fab fa-twitter text-sky-400"></i>;
      case 'instagram': return <i className="fab fa-instagram text-pink-400"></i>;
      case 'facebook': return <i className="fab fa-facebook text-blue-400"></i>;
      case 'linkedin': return <i className="fab fa-linkedin text-blue-500"></i>;
      default: return <i className="fas fa-share-alt text-slate-400"></i>;
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-xl border border-slate-800 overflow-hidden hover:border-indigo-500/50 transition-all">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex items-center gap-2">
          {getPlatformIcon(post.platform)}
          <span className="font-semibold text-slate-200">@{post.author}</span>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getSentimentColor(post.analysis.sentiment)}`}>
          {post.analysis.sentiment}
        </span>
      </div>
      <div className="p-4">
        <p className="text-white leading-relaxed italic text-sm">"{post.text}"</p>
        
        <div className="mt-4 flex flex-wrap gap-1">
          {post.analysis.keyTopics.map((topic, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full font-medium border border-indigo-500/20">
              #{topic}
            </span>
          ))}
        </div>
      </div>
      <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
         <div className="flex gap-2">
           <div className="flex items-center gap-1 text-[10px] text-slate-400">
             <i className="far fa-smile text-green-400"></i>
             <span>{Math.round(post.analysis.emotions.joy * 100)}%</span>
           </div>
           <div className="flex items-center gap-1 text-[10px] text-slate-400">
             <i className="far fa-angry text-red-400"></i>
             <span>{Math.round(post.analysis.emotions.anger * 100)}%</span>
           </div>
         </div>
         <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Confidence: {Math.round(post.analysis.score * 100)}%</span>
      </div>
    </div>
  );
};

export default PostCard;


import React, { useState, useEffect } from 'react';
import { Post, BatchAnalysisResult } from './types';
import { trainWithSyntheticData, analyzePostsLocal } from './services/localMLService';
import PostCard from './components/PostCard';
import SentimentGauge from './components/SentimentGauge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const SAMPLE_POSTS: Post[] = [
  { id: '1', author: 'tech_guru', platform: 'twitter', text: 'The new AI updates are absolutely mind-blowing! Best thing I have seen.', timestamp: new Date().toISOString() },
  { id: '2', author: 'sad_clown', platform: 'facebook', text: 'This is the worst service I have ever used. Terrible experience.', timestamp: new Date().toISOString() },
  { id: '3', author: 'career_pro', platform: 'linkedin', text: 'Excited to announce my new role! Truly wonderful news.', timestamp: new Date().toISOString() },
];

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<BatchAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTraining, setIsTraining] = useState(true);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [mlMetrics, setMlMetrics] = useState<any>(null);

  useEffect(() => {
    const initML = async () => {
      try {
        const metrics = await trainWithSyntheticData((p) => setTrainingProgress(p));
        setMlMetrics(metrics);
      } catch (e) {
        console.error("Training failed", e);
      } finally {
        setIsTraining(false);
      }
    };
    initML();
  }, []);

  const handleAddPost = () => {
    if (!inputText.trim()) return;
    const newPost: Post = {
      id: Date.now().toString(),
      author: 'User_' + Math.floor(Math.random() * 1000),
      platform: 'twitter',
      text: inputText,
      timestamp: new Date().toISOString(),
    };
    setPosts([newPost, ...posts]);
    setInputText('');
  };

  const handleClearFeed = () => {
    setPosts([]);
    setAnalysisResult(null);
  };

  const runAnalysis = async () => {
    if (posts.length === 0 || isTraining) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzePostsLocal(posts);
      setAnalysisResult(result);
    } catch (err) {
      console.error("Analysis Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const chartData = analysisResult?.overallStats?.sentimentDistribution 
    ? Object.entries(analysisResult.overallStats.sentimentDistribution).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      })) 
    : [];

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#8b5cf6'];

  if (isTraining) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
            <i className="fas fa-brain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-indigo-500"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2 tracking-tight">Sentilyze Local Core</h1>
            <p className="text-slate-400 text-sm">Training browser-based Naive Bayes classifier...</p>
          </div>
          <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${trainingProgress}%` }}></div>
          </div>
          <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest">{trainingProgress}% COMPLETED</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <header className="bg-slate-900/80 backdrop-blur-md text-white shadow-2xl sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <i className="fas fa-brain text-white"></i>
              </div>
              <h1 className="text-xl font-bold tracking-tight">Sentilyze<span className="text-indigo-400">Pro</span></h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleClearFeed}
              className="px-4 py-2 rounded-xl font-bold text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all flex items-center gap-2 border border-slate-700 hover:border-red-400/30"
              title="Clear all data"
            >
              <i className="fas fa-trash-alt text-xs"></i>
              <span className="hidden sm:inline">Clear Feed</span>
            </button>
            <button 
              onClick={runAnalysis}
              disabled={isAnalyzing || posts.length === 0}
              className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                isAnalyzing || posts.length === 0 ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl active:scale-95'
              }`}
            >
              {isAnalyzing ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-terminal"></i>}
              Analyze
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800">
            <textarea
              className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-white placeholder:text-slate-500 font-medium"
              rows={3}
              placeholder="Enter text for classification..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              onClick={handleAddPost}
              className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg"
            >
              Add to Feed
            </button>
          </section>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {posts.length > 0 ? (
              posts.map((post) => {
                const analyzed = analysisResult?.posts?.find(p => p.id === post.id);
                return analyzed ? (
                  <PostCard key={post.id} post={analyzed} />
                ) : (
                  <div key={post.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 animate-pulse flex justify-between items-center shadow-lg">
                    <p className="text-sm text-slate-500 italic truncate w-3/4">{post.text}</p>
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                <i className="fas fa-inbox text-slate-700 text-4xl mb-4"></i>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Feed is empty</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {analysisResult?.overallStats ? (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SentimentGauge score={analysisResult.overallStats.averageScore || 0} label="Average Confidence" />
                <div className="bg-slate-900 p-5 rounded-xl shadow-xl border border-slate-800 flex flex-col justify-center">
                   <div className="text-center">
                     <span className="text-4xl font-bold text-indigo-400 tracking-tighter">
                       {analysisResult.posts.length}
                     </span>
                     <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                       Classified Documents
                     </span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800">
                  <h3 className="text-md font-bold text-slate-200 mb-6 uppercase tracking-tight flex items-center gap-2">
                    <i className="fas fa-chart-pie text-indigo-500"></i>
                    Class Breakdown
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                          {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip 
                          contentStyle={{borderRadius: '12px', background: '#1e293b', border: '1px solid #334155', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', color: '#fff'}} 
                          itemStyle={{color: '#fff'}}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-900 rounded-3xl border-2 border-dashed border-slate-800 p-12 text-center">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 shadow-xl border border-indigo-500/20">
                <i className="fas fa-shield-halved text-4xl text-indigo-400"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Classifier Ready</h3>
              <p className="text-slate-400 max-w-sm mx-auto mb-8">
                The analysis engine is trained and ready to process your social feed with extreme speed.
              </p>
              <button 
                onClick={runAnalysis}
                disabled={posts.length === 0}
                className={`px-8 py-3 font-bold rounded-xl transition-all shadow-2xl active:scale-95 border ${
                  posts.length === 0 ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500 border-indigo-400/20'
                }`}
              >
                {posts.length === 0 ? 'Add Posts to Start' : 'Start Analysis'}
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-slate-950 text-slate-600 py-6 text-center text-[10px] uppercase font-bold tracking-[0.2em] border-t border-slate-900">
        Sentilyze Neural Node v2.0 • Offline-First Native Inference
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;

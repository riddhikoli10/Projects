
export interface Post {
  id: string;
  author: string;
  text: string;
  platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin';
  timestamp: string;
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  score: number; // 0 to 1
  emotions: {
    joy: number;
    anger: number;
    sadness: number;
    surprise: number;
    fear: number;
  };
  keyTopics: string[];
  summary: string;
}

export interface BatchAnalysisResult {
  posts: (Post & { analysis: SentimentAnalysis })[];
  overallStats: {
    averageScore: number;
    sentimentDistribution: {
      positive: number;
      negative: number;
      neutral: number;
      mixed: number;
    };
    trendingTopics: string[];
    executiveSummary: string;
  };
}

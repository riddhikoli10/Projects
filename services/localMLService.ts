import { SentimentAnalysis, Post, BatchAnalysisResult } from "../types";
import { TRAINING_SAMPLES } from "../data/trainingData";

// List of words that strongly indicate sentiment to boost the statistical model
const SENTIMENT_BOOSTERS: Record<string, number> = {
  // Negative boosters
  'worst': -5.0,
  'terrible': -4.0,
  'disaster': -4.0,
  'hate': -4.0,
  'unusable': -3.5,
  'broken': -3.0,
  'useless': -3.0,
  'annoying': -2.5,
  'disappointed': -3.0,
  'bad': -2.5,
  'poor': -2.5,
  'sucks': -4.0,
  'horrible': -4.0,
  // Positive boosters
  'best': 5.0,
  'love': 4.0,
  'amazing': 4.0,
  'incredible': 4.0,
  'brilliant': 3.5,
  'perfect': 4.0,
  'wonderful': 3.5,
  'excellent': 3.5,
  'satisfied': 3.0,
  'great': 2.5,
  'awesome': 3.0,
  'good': 3.5,
  'nice': 2.5,
  'fantastic': 3.5,
  'helpful': 2.5,
  'well': 2.0
};

// Common negation words that flip the sentiment of the next word
const NEGATION_WORDS = new Set([
  'not', 'no', 'never', 'neither', 'nor', 'cannot', "can't", "isn't", 
  "aren't", "wasn't", "weren't", "don't", "doesn't", "didn't", 
  "haven't", "hasn't", "hadnt", "won't", "wouldn't", "shouldn't", "barely", "hardly"
]);

class NaiveBayesClassifier {
  private vocabulary: Set<string> = new Set();
  private classCounts: Record<string, number> = { positive: 0, negative: 0, neutral: 0 };
  private wordCounts: Record<string, Record<string, number>> = {
    positive: {},
    negative: {},
    neutral: {}
  };
  private totalDocs = 0;

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s']/g, ' ') // Keep apostrophes for contractions like isn't
      .split(/\s+/)
      .filter(word => word.length >= 2 || word === 'no');
  }

  train(text: string, label: string) {
    if (this.classCounts[label] === undefined) return;
    
    const tokens = this.tokenize(text);
    this.classCounts[label]++;
    this.totalDocs++;

    tokens.forEach(token => {
      this.vocabulary.add(token);
      this.wordCounts[label][token] = (this.wordCounts[label][token] || 0) + 1;
    });
  }

  predict(text: string): { sentiment: 'positive' | 'negative' | 'neutral'; score: number } {
    if (this.totalDocs === 0) return { sentiment: 'neutral', score: 0.5 };

    const tokens = this.tokenize(text);
    const scores: Record<string, number> = {};
    
    const classTotals: Record<string, number> = {};
    Object.keys(this.classCounts).forEach(label => {
      classTotals[label] = Object.values(this.wordCounts[label]).reduce((a, b) => a + b, 0);
    });

    let negateNext = false;

    Object.keys(this.classCounts).forEach(label => {
      let logProb = Math.log(this.classCounts[label] / this.totalDocs);
      negateNext = false; // Reset negation for each class loop

      tokens.forEach(token => {
        // If the previous word was a negation, this word acts as its opposite
        const isNegated = negateNext;
        
        // Check if current word is a negation for the NEXT word
        if (NEGATION_WORDS.has(token)) {
          negateNext = true;
          // "Not" itself is often a slight negative signal statistically
          const count = this.wordCounts[label][token] || 0;
          logProb += Math.log((count + 1) / (classTotals[label] + this.vocabulary.size));
          return;
        } else {
          negateNext = false;
        }

        const count = this.wordCounts[label][token] || 0;
        let wordLogProb = Math.log((count + 1) / (classTotals[label] + this.vocabulary.size));
        
        // REFINED BOOSTING with Negation Awareness
        if (SENTIMENT_BOOSTERS[token]) {
          const boost = SENTIMENT_BOOSTERS[token];
          // If negated, flip the booster's direction
          const effectiveBoost = isNegated ? -boost : boost;
          const absBoost = Math.abs(effectiveBoost);
          
          if (effectiveBoost > 0) { // Positive indicator
            if (label === 'positive') wordLogProb += absBoost;
            else wordLogProb -= absBoost;
          } else { // Negative indicator
            if (label === 'negative') wordLogProb += absBoost;
            else wordLogProb -= absBoost;
          }
        }
        
        logProb += wordLogProb;
      });

      scores[label] = logProb;
    });

    const maxLog = Math.max(...Object.values(scores));
    const exps = Object.entries(scores).map(([label, log]) => ({ 
      label, 
      val: Math.exp(log - maxLog) 
    }));
    const sumExps = exps.reduce((a, b) => a + b.val, 0);
    
    const results = exps.map(e => ({ 
      label: e.label as 'positive' | 'negative' | 'neutral', 
      prob: e.val / sumExps 
    }));
    
    const best = results.reduce((a, b) => a.prob > b.prob ? a : b);
    return { sentiment: best.label, score: best.prob };
  }

  getMetrics() {
    return {
      vocabSize: this.vocabulary.size,
      totalTrainingSamples: this.totalDocs,
      priors: {
        positive: this.totalDocs > 0 ? this.classCounts.positive / this.totalDocs : 0,
        negative: this.totalDocs > 0 ? this.classCounts.negative / this.totalDocs : 0,
        neutral: this.totalDocs > 0 ? this.classCounts.neutral / this.totalDocs : 0,
      }
    };
  }
}

export const classifier = new NaiveBayesClassifier();

export const trainWithSyntheticData = async (onProgress?: (progress: number) => void) => {
  const data = TRAINING_SAMPLES;
  for (let i = 0; i < data.length; i++) {
    classifier.train(data[i].t, data[i].l);
    if (onProgress && i % 50 === 0) {
      onProgress(Math.round((i / data.length) * 100));
      await new Promise(r => setTimeout(r, 0)); 
    }
  }
  if (onProgress) onProgress(100);
  return classifier.getMetrics();
};

export const localAnalyze = (text: string): SentimentAnalysis => {
  const prediction = classifier.predict(text);
  const lowerText = text.toLowerCase();
  
  // Refined rule triggers for UI visuals
  const hasNegation = Array.from(NEGATION_WORDS).some(nw => lowerText.includes(nw + ' '));
  
  // Logic to determine if anger/joy icons should light up
  let isAngry = lowerText.includes('worst') || lowerText.includes('terrible') || lowerText.includes('hate') || lowerText.includes('bad');
  let isHappy = lowerText.includes('best') || lowerText.includes('love') || lowerText.includes('amazing') || lowerText.includes('good') || lowerText.includes('great');

  // If negated, flip the emotional trigger for the UI indicators
  if (hasNegation) {
    if (lowerText.includes('not good') || lowerText.includes('not great') || lowerText.includes("isn't good")) {
      isAngry = true;
      isHappy = false;
    }
  }

  const emotions = {
    joy: isHappy ? 0.8 : (prediction.sentiment === 'positive' ? 0.6 : 0.1),
    anger: isAngry ? 0.9 : (prediction.sentiment === 'negative' ? 0.4 : 0.05),
    sadness: lowerText.includes('sad') || lowerText.includes('disappointed') ? 0.7 : 0.1,
    surprise: text.includes('!') ? 0.6 : 0.1,
    fear: lowerText.includes('worry') ? 0.5 : 0.05
  };

  return {
    sentiment: prediction.sentiment as any,
    score: prediction.score,
    emotions,
    keyTopics: text.split(' ').filter(w => w.length > 5).slice(0, 3).map(w => w.replace(/[^\w]/g, '')),
    summary: `Refined Local Classifier identifies this as ${prediction.sentiment.toUpperCase()}.`
  };
};

export const analyzePostsLocal = async (posts: Post[]): Promise<BatchAnalysisResult> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const analyzedPosts = posts.map(post => ({
    ...post,
    analysis: localAnalyze(post.text)
  }));

  const avgScore = analyzedPosts.length > 0 
    ? analyzedPosts.reduce((acc, p) => acc + p.analysis.score, 0) / analyzedPosts.length 
    : 0;

  const dist = analyzedPosts.reduce((acc, p) => {
    const sent = p.analysis.sentiment;
    acc[sent] = (acc[sent] || 0) + 1;
    return acc;
  }, { positive: 0, negative: 0, neutral: 0, mixed: 0 });

  return {
    posts: analyzedPosts,
    overallStats: {
      averageScore: avgScore,
      sentimentDistribution: dist,
      trendingTopics: Array.from(new Set(analyzedPosts.flatMap(p => p.analysis.keyTopics))).slice(0, 5),
      executiveSummary: `Analysis complete for ${posts.length} documents.`
    }
  };
};
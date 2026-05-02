export interface TrainingSample {
  t: string; // text
  l: 'positive' | 'negative' | 'neutral'; // label
}

const templates = {
  positive: [
    "I absolutely love the new features in this update!",
    "Incredible customer support, they fixed my issue in minutes.",
    "This is the best experience I have ever had with an app.",
    "So happy with the performance lately, super smooth.",
    "Amazing work by the development team, truly impressive.",
    "I am highly satisfied with the quality of the service.",
    "Brilliant interface design, very intuitive and clean.",
    "A game changer for my daily workflow, love it!",
    "Five stars! Everything works perfectly as expected.",
    "Exceeded my expectations in every way possible.",
    "Highly recommend this to anyone looking for efficiency.",
    "Wonderful community and helpful documentation.",
    "The latest release is a masterpiece of software engineering.",
    "I feel so much more productive using this tool.",
    "Great value for money, absolutely worth the investment."
  ],
  negative: [
    "This update is a total disaster, nothing works.",
    "I hate the new layout, it's so confusing and ugly.",
    "Worst customer service experience of my life.",
    "Constant crashes and bugs, I am losing my patience.",
    "Waste of money, the app is unusable most of the time.",
    "Terrible performance, it takes forever to load anything.",
    "So disappointed with the direction this project is taking.",
    "Useless features that nobody asked for, very annoying.",
    "The app keeps freezing my phone, unacceptable.",
    "Broken support links and no response from the team.",
    "I regret buying the premium version, stay away.",
    "Poor documentation and zero help from the community.",
    "This is a massive step backwards for the platform.",
    "Glitchy, slow, and full of errors. Avoid at all costs.",
    "I am switching to a competitor, this is just bad."
  ],
  neutral: [
    "The app received an update this morning.",
    "Checking out the new features now, will report back.",
    "It works fine for basic tasks but lacks advanced options.",
    "Average experience, nothing special to mention here.",
    "The price is fair for what is being offered.",
    "Meeting expectations but not exceeding them.",
    "A standard utility tool for social media management.",
    "The interface has changed slightly in the latest version.",
    "Does exactly what it says on the box, no more, no less.",
    "It is an okay product for casual users.",
    "Comparing this with other options currently available.",
    "The service was down for maintenance for an hour.",
    "Noticed some minor changes to the settings menu.",
    "It is a decent alternative if you are on a budget.",
    "The documentation is straightforward and simple."
  ]
};

const suffixes = [
  " indeed.", " personally.", " for me.", " in my opinion.",
  "!", "...", " - absolutely.", " - without a doubt.",
  " clearly.", " honestly.", " simply.", " quite frankly.",
  " today.", " lately.", " overall.", " fundamentally."
];

const prefixes = [
  "Honestly, ", "Actually, ", "To be fair, ", "Just noticed: ",
  "Quick update: ", "In my experience, ", "Looking back, ",
  "Overall, ", "I think ", "Most likely, ", "Generally speaking, "
];

/**
 * Generates 1050 samples (350 per category) based on templates
 */
const generateData = (): TrainingSample[] => {
  const data: TrainingSample[] = [];
  
  const categories: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral'];
  
  categories.forEach(cat => {
    const baseTemplates = templates[cat];
    // Generate 350 variations for each category
    for (let i = 0; i < 350; i++) {
      const base = baseTemplates[i % baseTemplates.length];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      
      // Create variety by mixing prefix/suffix and original
      let text = base;
      if (i % 3 === 0) text = prefix + base.toLowerCase();
      if (i % 3 === 1) text = base + suffix;
      if (i % 3 === 2) text = prefix + base.toLowerCase() + suffix;
      
      data.push({ t: text, l: cat });
    }
  });

  // Shuffle the data
  return data.sort(() => Math.random() - 0.5);
};

export const TRAINING_SAMPLES = generateData();

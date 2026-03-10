interface LessonKeywordEntry {
  lessonId: string;
  moduleId: string;
  title: string;
  keywords: string[];
}

const LESSON_KEYWORDS: LessonKeywordEntry[] = [
  {
    lessonId: 'choosing-first-card',
    moduleId: 'first-90-days',
    title: 'Choosing Your First Points Card',
    keywords: ['first card', 'first credit card', 'which card', 'best card for beginners', 'new to points'],
  },
  {
    lessonId: 'hitting-signup-bonus',
    moduleId: 'first-90-days',
    title: 'Hitting Your Sign-Up Bonus',
    keywords: ['sign-up bonus', 'signup bonus', 'minimum spend', 'bonus points', 'welcome bonus'],
  },
  {
    lessonId: 'everyday-earning',
    moduleId: 'first-90-days',
    title: 'Set Up Everyday Earning',
    keywords: ['everyday earning', 'daily spending', 'earn rate', 'points per dollar', 'maximise earning'],
  },
  {
    lessonId: 'beginner-mistakes',
    moduleId: 'first-90-days',
    title: 'Common Beginner Mistakes',
    keywords: ['beginner mistakes', 'common mistakes', 'points expire', 'paying interest', 'avoid mistakes'],
  },
  {
    lessonId: 'credit-card-strategies',
    moduleId: 'earning',
    title: 'Credit Card Earning Strategies',
    keywords: ['card strategy', 'card pairing', 'multiple cards', 'retention offer', 'supplementary card'],
  },
  {
    lessonId: 'shopping-portals',
    moduleId: 'earning',
    title: 'Shopping Portals & Partner Offers',
    keywords: ['shopping portal', 'qantas shopping', 'velocity estore', 'online shopping points', 'triple dip'],
  },
  {
    lessonId: 'transfer-partners',
    moduleId: 'earning',
    title: 'Transfer Partners Explained',
    keywords: ['transfer partner', 'krisflyer', 'asia miles', 'membership rewards', 'transfer bonus', 'amex transfer'],
  },
  {
    lessonId: 'earning-without-credit-card',
    moduleId: 'earning',
    title: 'Earning Without a Credit Card',
    keywords: ['without credit card', 'no credit card', 'earn without card', 'debit card points', 'everyday rewards'],
  },
  {
    lessonId: 'understanding-points-value',
    moduleId: 'redeeming',
    title: 'Understanding Points Value',
    keywords: ['points value', 'cents per point', 'redemption value', 'cpp', 'points worth'],
  },
  {
    lessonId: 'finding-availability',
    moduleId: 'redeeming',
    title: 'Finding Reward Seat Availability',
    keywords: ['reward seat', 'availability', 'award seat', 'classic reward', 'expertflyer'],
  },
  {
    lessonId: 'booking-first-reward',
    moduleId: 'redeeming',
    title: 'Booking Your First Reward Flight',
    keywords: ['book reward', 'first reward flight', 'reward booking', 'taxes and fees', 'how to book'],
  },
  {
    lessonId: 'sweet-spots',
    moduleId: 'redeeming',
    title: 'Best Redemption Sweet Spots',
    keywords: ['sweet spot', 'best redemption', 'qsuites', 'business class value', 'upgrade reward'],
  },
];

export interface LessonMatch {
  lessonId: string;
  moduleId: string;
  title: string;
}

export function findRelevantLesson(messageContent: string): LessonMatch | null {
  const lower = messageContent.toLowerCase();
  let bestMatch: LessonMatch | null = null;
  let bestScore = 0;

  for (const entry of LESSON_KEYWORDS) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score += kw.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = {
        lessonId: entry.lessonId,
        moduleId: entry.moduleId,
        title: entry.title,
      };
    }
  }

  // Threshold: require at least 8 chars worth of matched keywords
  return bestScore >= 8 ? bestMatch : null;
}

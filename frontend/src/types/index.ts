export interface PageContext {
  page_url: string;
  page_type: 'homepage' | 'card_review' | 'article' | 'seat_alerts' | 'guide' | 'other';
  page_title: string;
  device: 'mobile' | 'desktop' | 'tablet';
  referrer: string | null;
  is_returning_visitor: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  ctas?: CtaEvent[];
  isStreaming?: boolean;
}

export interface CtaEvent {
  cta_id: string;
  cta_type: 'card_application' | 'seat_alert_create' | 'email_capture' | 'guide_link';
  label: string;
  url: string;
  review_url?: string;
  card?: {
    card_id: string;
    card_name: string;
    signup_bonus: {
      points: number;
      program: string;
      min_spend: number;
      min_spend_period_months: number;
    };
    annual_fee: number;
    annual_fee_first_year: number | null;
  };
}

export interface Suggestion {
  label: string;
  action: string;
  type: 'query' | 'nba' | 'lesson';
  url?: string;
  lessonId?: string;
}

export interface UserProfile {
  name: string;
  preferred_program: 'qantas' | 'velocity' | 'krisflyer' | 'not_sure' | '';
  travel_goal: 'business' | 'economy' | 'flexible' | '';
  max_annual_fee: 'no_fee' | 'under_200' | 'under_500' | 'any' | '';
  home_city: string;
  destination_regions: string[];
  travel_frequency: 'once_year' | '2_3_year' | 'monthly_plus' | '';
  points_balance: 'starting' | 'under_50k' | '50_100k' | 'over_100k' | '';
}

export interface SavedItem extends ChatMessage {
  savedAt: string;
  notes?: string;
}

export interface SSEEvent {
  type: 'text_delta' | 'cta' | 'done';
  content?: string | CtaEvent;
  session_id?: string;
  greeting?: boolean;
  error?: boolean;
  suggestions?: Suggestion[];
}

export interface LearningLesson {
  id: string;
  title: string;
  durationMinutes: number;
  content: string; // markdown
  askPerryPrompt?: string;
  askPerryPrompts?: string[];
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  color: 'blue' | 'orange' | 'green';
  lessons: LearningLesson[];
}

export interface LessonProgress {
  lessonId: string;
  completedAt: string;
}

export interface LearningProgress {
  completedLessons: LessonProgress[];
}

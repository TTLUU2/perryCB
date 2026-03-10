import { useState } from 'react';
import { ChatMessage, CtaEvent } from '../types';
import { PerryIcon } from './PerryIcon';
import { CardRecommendation } from './cta/CardRecommendation';
import { SeatAlertLink } from './cta/SeatAlertLink';
import { EmailCapture } from './cta/EmailCapture';
import { renderMarkdown } from '../utils/markdown';

interface MessageBubbleProps {
  message: ChatMessage;
  onCtaClick: (ctaId: string) => void;
  onBookmark?: (message: ChatMessage) => void;
  isBookmarked?: boolean;
}

function CtaRenderer({ cta, onCtaClick }: { cta: CtaEvent; onCtaClick: (id: string) => void }) {
  switch (cta.cta_type) {
    case 'card_application':
      return <CardRecommendation cta={cta} onCtaClick={onCtaClick} />;
    case 'seat_alert_create':
      return <SeatAlertLink cta={cta} onCtaClick={onCtaClick} />;
    case 'email_capture':
      return <EmailCapture cta={cta} onCtaClick={onCtaClick} />;
    case 'guide_link':
      return (
        <div className="pg-cta-card">
          <a
            href={cta.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onCtaClick(cta.cta_id)}
            className="text-sm text-ph-blue hover:underline font-medium"
          >
            {cta.label}
          </a>
        </div>
      );
    default:
      return null;
  }
}

export function MessageBubble({ message, onCtaClick, onBookmark, isBookmarked }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [showToast, setShowToast] = useState(false);

  const handleBookmark = () => {
    if (!isBookmarked && onBookmark) {
      onBookmark(message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
    }
  };

  // Split CTAs: card_application goes outside the bubble, others stay inside
  const cardCtas = message.ctas?.filter(c => c.cta_type === 'card_application') || [];
  const otherCtas = message.ctas?.filter(c => c.cta_type !== 'card_application') || [];

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 ${!isUser ? 'gap-2' : ''}`}>
      {!isUser && (
        <div className="shrink-0 mt-1">
          <PerryIcon size={28} />
        </div>
      )}
      <div className={`relative ${cardCtas.length > 0 ? 'max-w-[92%]' : 'max-w-[80%]'} ${!isUser ? 'pg-msg-wrapper' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'pg-bubble-user rounded-br-md'
              : 'pg-bubble-assistant rounded-bl-md'
          }`}
        >
          {message.content && (
            <div
              className="pg-message-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
            />
          )}
          {otherCtas.length > 0 && (
            <div className="mt-2">
              {otherCtas.map((cta, i) => (
                <CtaRenderer key={`${cta.cta_id}-${i}`} cta={cta} onCtaClick={onCtaClick} />
              ))}
            </div>
          )}
          {message.isStreaming && !message.content && (
            <div className="flex gap-1">
              <span className="pg-typing-dot w-1.5 h-1.5 bg-ph-gray-400 rounded-full" />
              <span className="pg-typing-dot w-1.5 h-1.5 bg-ph-gray-400 rounded-full" />
              <span className="pg-typing-dot w-1.5 h-1.5 bg-ph-gray-400 rounded-full" />
            </div>
          )}
        </div>

        {/* Card CTAs — rendered outside the bubble for more width */}
        {cardCtas.length > 0 && (
          <div className="mt-2">
            {cardCtas.map((cta, i) => (
              <CtaRenderer key={`${cta.cta_id}-${i}`} cta={cta} onCtaClick={onCtaClick} />
            ))}
          </div>
        )}

        {/* Bookmark button — assistant messages only */}
        {!isUser && !message.isStreaming && message.content && (
          <button
            onClick={handleBookmark}
            className={`pg-bookmark-btn ${isBookmarked ? 'pg-bookmarked' : ''}`}
            aria-label={isBookmarked ? 'Saved' : 'Save this recommendation'}
          >
            <svg width="12" height="12" viewBox="0 0 20 20" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M5 3a2 2 0 00-2 2v12l7-4 7 4V5a2 2 0 00-2-2H5z" />
            </svg>
          </button>
        )}

        {/* Toast */}
        {showToast && <div className="pg-toast">Saved!</div>}
      </div>
    </div>
  );
}

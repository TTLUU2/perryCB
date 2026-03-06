import { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  onCtaClick: (ctaId: string) => void;
  onBookmark?: (message: ChatMessage) => void;
  isSaved?: (messageId: string) => boolean;
}

/** Tiny plane SVG used as a background decoration. */
function MiniPlaneSvg({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  );
}

/** Sydney Opera House silhouette */
function SydneyOperaSvg({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 70 35" fill="currentColor">
      <path d="M5 35 Q12 5 20 35Z" />
      <path d="M15 35 Q25 0 35 35Z" />
      <path d="M30 35 Q40 2 50 35Z" />
      <path d="M42 35 Q48 12 55 35Z" />
      <rect x="0" y="32" width="70" height="3" />
    </svg>
  );
}

/** Eiffel Tower silhouette */
function EiffelTowerSvg({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 60" fill="currentColor">
      <polygon points="12,0 22,52 24,52 24,60 0,60 0,52 2,52" />
      <rect x="5" y="32" width="14" height="2" rx="0.5" />
      <rect x="8" y="18" width="8" height="1.5" rx="0.5" />
    </svg>
  );
}

/** Big Ben / Elizabeth Tower silhouette */
function BigBenSvg({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 18 60" fill="currentColor">
      <polygon points="9,0 11,15 7,15" />
      <rect x="4" y="15" width="10" height="12" rx="1" />
      <circle cx="9" cy="21" r="3.5" opacity="0.4" />
      <rect x="3" y="27" width="12" height="28" />
      <rect x="1" y="55" width="16" height="5" />
    </svg>
  );
}

/** Tokyo Tower silhouette */
function TokyoTowerSvg({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 60" fill="currentColor">
      <rect x="11" y="0" width="2" height="10" />
      <polygon points="12,10 22,52 24,52 24,60 0,60 0,52 2,52" />
      <rect x="7" y="24" width="10" height="3" rx="0.5" />
      <rect x="4" y="38" width="16" height="3" rx="0.5" />
    </svg>
  );
}

/** Statue of Liberty silhouette */
function StatueOfLibertySvg({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 30 60" fill="currentColor">
      <ellipse cx="24" cy="3" rx="2.5" ry="4" />
      <path d="M22 7 L16 18 L18 19 L24 8Z" />
      <circle cx="15" cy="16" r="4" />
      <path d="M11 13 L9 7 L12 12 M15 12 L15 6 M19 13 L21 7 L18 12" strokeWidth="1" stroke="currentColor" />
      <path d="M10 20 L20 20 L22 52 L24 60 L6 60 L8 52Z" />
    </svg>
  );
}

function BackgroundScene() {
  return (
    <div className="pg-bg-scene" aria-hidden="true">
      {/* Clouds */}
      <div className="pg-cloud pg-cloud--1" />
      <div className="pg-cloud pg-cloud--2" />
      <div className="pg-cloud pg-cloud--3" />
      <div className="pg-cloud pg-cloud--4" />
      <div className="pg-cloud pg-cloud--5" />
      {/* Mini planes */}
      <MiniPlaneSvg className="pg-mini-plane pg-mini-plane--1 text-ph-blue" />
      <MiniPlaneSvg className="pg-mini-plane pg-mini-plane--2 text-ph-blue" />
      <MiniPlaneSvg className="pg-mini-plane pg-mini-plane--3 text-ph-blue" />
      {/* Floating sparkles */}
      <div className="pg-sparkle pg-sparkle--1" />
      <div className="pg-sparkle pg-sparkle--2" />
      <div className="pg-sparkle pg-sparkle--3" />
      <div className="pg-sparkle pg-sparkle--4" />
      <div className="pg-sparkle pg-sparkle--5" />
      <div className="pg-sparkle pg-sparkle--6" />
      {/* Contrail lines */}
      <div className="pg-contrail pg-contrail--1" />
      <div className="pg-contrail pg-contrail--2" />
      {/* Tourism landmark skyline */}
      <SydneyOperaSvg className="pg-landmark pg-landmark--opera" />
      <EiffelTowerSvg className="pg-landmark pg-landmark--eiffel" />
      <BigBenSvg className="pg-landmark pg-landmark--bigben" />
      <TokyoTowerSvg className="pg-landmark pg-landmark--tokyo" />
      <StatueOfLibertySvg className="pg-landmark pg-landmark--liberty" />
    </div>
  );
}

export function MessageList({ messages, onCtaClick, onBookmark, isSaved }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages or streaming content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="pg-messages flex items-center justify-center text-ph-gray-400 text-sm">
        <BackgroundScene />
        <span className="relative z-10">Start a conversation...</span>
      </div>
    );
  }

  return (
    <div className="pg-messages">
      <BackgroundScene />
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          onCtaClick={onCtaClick}
          onBookmark={onBookmark}
          isBookmarked={isSaved?.(msg.id)}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

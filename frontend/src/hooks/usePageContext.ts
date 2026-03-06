import { useMemo } from 'react';
import { PageContext } from '../types';

function detectPageType(): PageContext['page_type'] {
  const url = window.location.href.toLowerCase();
  if (url.includes('/credit-cards/')) return 'card_review';
  if (url.includes('/seat-alerts')) return 'seat_alerts';
  if (url.includes('/guides/') || url.includes('/beginner')) return 'guide';
  if (url.includes('/article') || url.includes('/blog/') || url.includes('/news/')) return 'article';
  if (url === window.location.origin + '/' || url.endsWith('.com.au/')) return 'homepage';
  return 'other';
}

function detectDevice(): PageContext['device'] {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function usePageContext(): PageContext {
  return useMemo(
    () => ({
      page_url: window.location.href,
      page_type: detectPageType(),
      page_title: document.title,
      device: detectDevice(),
      referrer: document.referrer || null,
      is_returning_visitor: !!localStorage.getItem('pg_session_id'),
    }),
    [],
  );
}

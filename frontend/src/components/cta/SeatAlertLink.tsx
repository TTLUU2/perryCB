import { CtaEvent } from '../../types';

interface SeatAlertLinkProps {
  cta: CtaEvent;
  onCtaClick: (ctaId: string) => void;
}

export function SeatAlertLink({ cta, onCtaClick }: SeatAlertLinkProps) {
  return (
    <div className="pg-cta-card">
      <div className="font-semibold text-sm text-ph-gray-800">{cta.label}</div>
      <div className="text-xs text-ph-gray-500 mt-1">
        Get notified when reward seats open up on your route
      </div>
      <div className="mt-3">
        <a
          href={cta.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onCtaClick(cta.cta_id)}
          className="pg-cta-button text-xs"
        >
          Create Seat Alert
        </a>
      </div>
    </div>
  );
}

import { CtaEvent } from '../../types';

interface EmailCaptureProps {
  cta: CtaEvent;
  onCtaClick: (ctaId: string) => void;
}

export function EmailCapture({ cta, onCtaClick }: EmailCaptureProps) {
  return (
    <div className="pg-cta-card bg-ph-blue-light">
      <div className="font-semibold text-sm text-ph-gray-800">{cta.label}</div>
      <div className="text-xs text-ph-gray-500 mt-1">
        Free email course to kickstart your points journey
      </div>
      <div className="mt-3">
        <a
          href={cta.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onCtaClick(cta.cta_id)}
          className="pg-cta-button text-xs"
        >
          Get the Free Toolkit
        </a>
      </div>
    </div>
  );
}

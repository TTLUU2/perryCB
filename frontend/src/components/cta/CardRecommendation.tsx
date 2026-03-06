import { CtaEvent } from '../../types';

interface CardRecommendationProps {
  cta: CtaEvent;
  onCtaClick: (ctaId: string) => void;
}

export function CardRecommendation({ cta, onCtaClick }: CardRecommendationProps) {
  const card = cta.card;
  if (!card) return null;

  const bonus = card.signup_bonus;
  const feeText = card.annual_fee_first_year === 0
    ? `$${card.annual_fee}/yr ($0 first year)`
    : `$${card.annual_fee}/yr`;

  return (
    <div className="pg-cta-card">
      <div className="font-semibold text-sm text-ph-gray-800">{card.card_name}</div>
      {bonus && (
        <div className="text-sm text-ph-gray-600 mt-1">
          {bonus.points.toLocaleString()} bonus {bonus.program} points
          {bonus.min_spend > 0 && (
            <span className="text-ph-gray-400">
              {' '}(min spend ${bonus.min_spend.toLocaleString()} in {bonus.min_spend_period_months} months)
            </span>
          )}
        </div>
      )}
      <div className="text-xs text-ph-gray-400 mt-1">Fee: {feeText}</div>
      <div className="mt-3 flex gap-2">
        <a
          href={cta.review_url || cta.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onCtaClick(cta.cta_id)}
          className="pg-cta-button text-xs"
        >
          View Review & Apply
        </a>
      </div>
    </div>
  );
}

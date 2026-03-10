import { CtaEvent } from '../../types';

interface CardRecommendationProps {
  cta: CtaEvent;
  onCtaClick: (ctaId: string) => void;
}

const ISSUER_COLORS: Record<string, string> = {
  'American Express': '#006fcf',
  'NAB': '#c8102e',
  'Westpac': '#d5002b',
  'Commonwealth Bank': '#ffcc00',
  'HSBC': '#db0011',
  'Citi': '#003b70',
  'Qantas Money': '#e4002b',
  'ANZ': '#007dba',
  'St.George': '#e01a22',
  'Suncorp': '#009a44',
};

const PROGRAM_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  'qantas': { bg: '#fde8e8', text: '#c81e1e', label: 'Qantas' },
  'velocity': { bg: '#ede9fe', text: '#7c3aed', label: 'Velocity' },
  'krisflyer': { bg: '#dbeafe', text: '#2563eb', label: 'KrisFlyer' },
  'amex_mr': { bg: '#dbeafe', text: '#006fcf', label: 'Amex MR' },
  'flexible': { bg: '#d1fae5', text: '#059669', label: 'Flexible' },
};

const DEFAULT_BORDER_COLOR = '#374B6A';

export function CardRecommendation({ cta, onCtaClick }: CardRecommendationProps) {
  const card = cta.card;
  if (!card) return null;

  const bonus = card.signup_bonus;
  const issuer = card.issuer || '';
  const borderColor = ISSUER_COLORS[issuer] || DEFAULT_BORDER_COLOR;
  const programKey = card.program || bonus?.program || '';
  const programStyle = PROGRAM_STYLES[programKey];

  const feeText = card.annual_fee_first_year === 0
    ? `$${card.annual_fee}/yr ($0 first year)`
    : card.annual_fee_first_year != null && card.annual_fee_first_year < card.annual_fee
      ? `$${card.annual_fee}/yr ($${card.annual_fee_first_year} first year)`
      : `$${card.annual_fee}/yr`;

  return (
    <div
      className="pg-card-tile"
      style={{ borderLeftColor: borderColor }}
    >
      {/* Header: issuer + program badge */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: borderColor }}>
          {issuer}
        </span>
        {programStyle && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: programStyle.bg, color: programStyle.text }}
          >
            {programStyle.label}
          </span>
        )}
      </div>

      {/* Card name */}
      <div className="font-semibold text-[13px] text-gray-800 leading-snug mb-2">
        {card.card_name}
      </div>

      {/* Bonus + fee row */}
      <div className="flex items-baseline gap-2 mb-1">
        {bonus && (
          <span className="text-[15px] font-bold" style={{ color: borderColor }}>
            {bonus.points.toLocaleString()} bonus pts
          </span>
        )}
        <span className="text-[11px] text-gray-500">{feeText}</span>
      </div>

      {/* Earn rate + key perk */}
      {card.earn_rates?.general != null && (
        <div className="text-[11px] text-gray-500 leading-relaxed">
          {card.earn_rates.general} pts/$1 general earn
        </div>
      )}
      {card.key_perk && (
        <div className="text-[11px] text-gray-500 leading-relaxed">
          {card.key_perk}
        </div>
      )}

      {/* CTA link */}
      <div className="mt-2">
        <a
          href={cta.review_url || cta.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onCtaClick(cta.cta_id)}
          className="text-[12px] font-semibold hover:underline"
          style={{ color: borderColor }}
        >
          View Review & Apply &rarr;
        </a>
      </div>
    </div>
  );
}

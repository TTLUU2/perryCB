import { useState } from 'react';

const PH_BASE = 'https://www.pointhacks.com.au';

const TOOLS = [
  { label: 'Card Finder', desc: 'Find your ideal points card', url: `${PH_BASE}/card-finder/`, icon: 'search' },
  { label: 'Compare All Cards', desc: 'Side-by-side card table', url: `${PH_BASE}/credit-cards/`, icon: 'table' },
  { label: 'Best Frequent Flyer Deals', desc: 'Top offers right now', url: `${PH_BASE}/best-frequent-flyer-deals`, icon: 'star' },
  { label: 'Seat Alerts', desc: 'Track reward seat releases', url: 'https://seat-alerts.pointhacks.com.au/', icon: 'bell' },
  { label: 'Beginner Guides', desc: 'Learn the points basics', url: `${PH_BASE}/ultimate-guides`, icon: 'book' },
  { label: 'Tools & Calculators', desc: 'Points calculators & more', url: `${PH_BASE}/tools-calculators`, icon: 'calc' },
] as const;

function ToolIcon({ type }: { type: string }) {
  const cls = "w-4 h-4 text-ph-blue shrink-0";
  switch (type) {
    case 'search':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      );
    case 'table':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
        </svg>
      );
    case 'star':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    case 'bell':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
      );
    case 'book':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      );
    case 'calc':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 0a1 1 0 100 2h.01a1 1 0 100-2H10zm4-2H6V6h8v2z" clipRule="evenodd" />
        </svg>
      );
    default:
      return null;
  }
}

interface ToolsDrawerProps {
  onInteraction?: () => void;
}

export function ToolsDrawer({ onInteraction }: ToolsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);

  const handleLinkClick = () => {
    onInteraction?.();
  };

  return (
    <div className="pg-tools-drawer">
      <button
        onClick={toggle}
        className="pg-tools-toggle"
        aria-expanded={isOpen}
        aria-label="Toggle Tools & Resources"
      >
        <span className="text-xs font-medium text-ph-gray-600">Tools & Resources</span>
        <svg
          className={`w-3.5 h-3.5 text-ph-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div className={`pg-tools-grid-wrapper ${isOpen ? 'pg-tools-open' : 'pg-tools-closed'}`}>
        <div className="pg-tools-grid">
          {TOOLS.map((tool) => (
            <a
              key={tool.url}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="pg-tool-card"
            >
              <ToolIcon type={tool.icon} />
              <div className="min-w-0">
                <div className="text-xs font-medium text-ph-gray-800 truncate">{tool.label}</div>
                <div className="text-[10px] text-ph-gray-500 leading-tight truncate">{tool.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

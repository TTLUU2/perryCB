import { useState, useRef, useEffect } from 'react';

interface InputBarProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function InputBar({ onSend, disabled }: InputBarProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 border-t border-ph-gray-100 bg-white rounded-b-[20px]">
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          handleInput();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Ask about points, cards, or travel..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-xl border border-ph-gray-200 bg-white px-4 py-2.5 text-sm text-black
                   focus:outline-none focus:border-ph-blue focus:ring-2 focus:ring-ph-blue/20
                   disabled:bg-ph-gray-50 disabled:text-ph-gray-400
                   placeholder:text-ph-gray-400 transition-all"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="flex-shrink-0 w-9 h-9 rounded-full text-white
                   flex items-center justify-center transition-all
                   bg-gradient-to-br from-ph-blue to-[#4F6786]
                   hover:from-ph-blue-dark hover:to-ph-blue hover:shadow-md
                   disabled:from-ph-gray-300 disabled:to-ph-gray-300 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}

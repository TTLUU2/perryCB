export function renderMarkdown(text: string): string {
  // Simple markdown rendering: bold, links, line breaks
  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Line breaks (double newline → paragraph break)
    .replace(/\n\n/g, '</p><p>')
    // Single newlines
    .replace(/\n/g, '<br/>');

  let result = `<p>${html}</p>`;

  // Callout blocks: Tip, Warning, Key Point
  result = result.replace(
    /<p><strong>Tip:<\/strong>\s*([\s\S]*?)<\/p>/g,
    '<div class="pg-callout pg-callout--tip"><svg class="pg-callout-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 1 4 12.7V17H8v-2.3A7 7 0 0 1 12 2z"/></svg><span>$1</span></div>'
  );
  result = result.replace(
    /<p><strong>Warning:<\/strong>\s*([\s\S]*?)<\/p>/g,
    '<div class="pg-callout pg-callout--warning"><svg class="pg-callout-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>$1</span></div>'
  );
  result = result.replace(
    /<p><strong>Key Point:<\/strong>\s*([\s\S]*?)<\/p>/g,
    '<div class="pg-callout pg-callout--keypoint"><svg class="pg-callout-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><span>$1</span></div>'
  );

  return result;
}

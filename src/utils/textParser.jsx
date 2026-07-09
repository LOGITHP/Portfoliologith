import React from 'react';

/**
 * Formats a description text with support for:
 * - Highlighted text using ==text==
 * - Bold text using **text**
 * - Clickable links (URLs beginning with http:// or https://)
 * - Line breaks (\n) rendered as <br />
 */
export function formatDescription(text) {
  if (!text) return null;

  // Split text into matches of URLs, double-equals highlights, or double-asterisk bolds
  const parts = text.split(/(https?:\/\/[^\s]+|==[^=]+==|\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    if (!part) return null;

    // Highlight: ==text==
    if (part.startsWith('==') && part.endsWith('==')) {
      return (
        <span key={i} className="text-highlight">
          {part.slice(2, -2)}
        </span>
      );
    }

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Clickable links
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a 
          key={i} 
          href={part} 
          target="_blank" 
          rel="noreferrer" 
          className="description-link"
        >
          {part}
        </a>
      );
    }

    // Normal text, preserve newlines
    const lines = part.split('\n');
    return (
      <React.Fragment key={i}>
        {lines.map((line, lineIdx) => (
          <React.Fragment key={lineIdx}>
            {lineIdx > 0 && <br />}
            {line}
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  });
}

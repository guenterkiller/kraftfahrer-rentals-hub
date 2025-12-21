import React from 'react';

/**
 * Safely renders FAQ answer text with limited formatting support.
 * Only supports <strong> tags - no dangerouslySetInnerHTML needed.
 * 
 * This component parses simple HTML-like markup and renders it as safe React elements.
 */
interface SafeFAQAnswerProps {
  text: string;
  className?: string;
}

const SafeFAQAnswer = ({ text, className }: SafeFAQAnswerProps) => {
  // Parse text and convert <strong>...</strong> to React elements
  const parseText = (input: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const regex = /<strong>(.*?)<\/strong>/gi;
    let lastIndex = 0;
    let match;
    let keyIndex = 0;

    while ((match = regex.exec(input)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(input.slice(lastIndex, match.index));
      }
      // Add the strong element
      parts.push(
        <strong key={`strong-${keyIndex++}`} className="font-semibold">
          {match[1]}
        </strong>
      );
      lastIndex = regex.lastIndex;
    }

    // Add remaining text after last match
    if (lastIndex < input.length) {
      parts.push(input.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className={className}>
      {parseText(text)}
    </div>
  );
};

export default SafeFAQAnswer;

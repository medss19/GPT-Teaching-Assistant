import React from "react";

// Function to format message text with code blocks
export const formatMessage = (text) => {
  // First handle code blocks with triple backticks
  const parts = text.split("```");

  if (parts.length === 1) {
    // No code blocks, just handle basic markdown
    return <div className="formatted-text">{formatBasicMarkdown(text)}</div>;
  }

  return (
    <div className="formatted-text">
      {parts.map((part, index) => {
        // Even indices are regular text, odd indices are code
        if (index % 2 === 0) {
          return <div key={index}>{formatBasicMarkdown(part)}</div>;
        } else {
          return (
            <pre key={index} className="code-block">
              <code>{part}</code>
            </pre>
          );
        }
      })}
    </div>
  );
};

// Helper function to handle basic markdown formatting
export const formatBasicMarkdown = (text) => {
  if (!text) return null;

  const lines = text.split('\n');
  const result = [];
  let currentList = null;
  let listType = null; // 'ul' for unordered, 'ol' for ordered

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Check if line is a list item
    const unorderedMatch = trimmedLine.match(/^[*•-]\s+(.*)/);
    const orderedMatch = trimmedLine.match(/^(\d+)\.\s+(.*)/);

    if (unorderedMatch || orderedMatch) {
      // If we're starting a new list or changing list type
      const newListType = unorderedMatch ? 'ul' : 'ol';

      if (!currentList || listType !== newListType) {
        // If we have a previous list, add it to results
        if (currentList) {
          result.push(currentList);
        }

        // Start a new list
        currentList = {
          type: newListType,
          items: [],
          key: `list-${i}`
        };
        listType = newListType;
      }

      // Add the item to the current list
      const content = unorderedMatch ? unorderedMatch[1] : orderedMatch[2];
      currentList.items.push({
        content: formatInlineMarkdown(content),
        key: `item-${i}`
      });
    } else {
      // Not a list item, so if we have a list going, finish it
      if (currentList) {
        result.push(currentList);
        currentList = null;
        listType = null;
      }

      // Process non-list line
      if (trimmedLine) {
        result.push({
          type: 'p',
          content: formatInlineMarkdown(trimmedLine),
          key: `p-${i}`
        });
      } else if (i > 0 && i < lines.length - 1 && lines[i - 1].trim() && lines[i + 1].trim()) {
        // Only add line breaks between content
        result.push({
          type: 'br',
          key: `br-${i}`
        });
      }
    }
  }

  // Add any remaining list
  if (currentList) {
    result.push(currentList);
  }

  // Convert result to React elements
  return result.map((item) => {
    if (item.type === 'p') {
      return <p key={item.key}>{item.content}</p>;
    } else if (item.type === 'br') {
      return <br key={item.key} />;
    } else if (item.type === 'ul' || item.type === 'ol') {
      const ListComponent = item.type === 'ul' ? 'ul' : 'ol';
      return (
        <ListComponent key={item.key} className={`markdown-${item.type}`}>
          {item.items.map((listItem) => (
            <li key={listItem.key}>{listItem.content}</li>
          ))}
        </ListComponent>
      );
    }
    return null;
  });
};

// Process inline formatting like bold, italic, etc.
export const formatInlineMarkdown = (text) => {
  if (!text) return text;

  // Handle bold text (**text**)
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let parts = [];
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the bold text
    parts.push(<strong key={`bold-${match.index}`}>{match[1]}</strong>);

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no bold text was found, just return the original text
  if (parts.length === 0) {
    parts = [text];
  }

  // Process italic text (*text*)
  const processedParts = [];

  parts.forEach((part, index) => {
    if (typeof part === 'string') {
      const italicRegex = /\*([^*]+)\*/g;
      let italicParts = [];
      let italicLastIndex = 0;
      let italicMatch;

      while ((italicMatch = italicRegex.exec(part)) !== null) {
        // Add text before the match
        if (italicMatch.index > italicLastIndex) {
          italicParts.push(part.substring(italicLastIndex, italicMatch.index));
        }

        // Add the italic text
        italicParts.push(<em key={`italic-${italicMatch.index}`}>{italicMatch[1]}</em>);

        italicLastIndex = italicMatch.index + italicMatch[0].length;
      }

      // Add any remaining text
      if (italicLastIndex < part.length) {
        italicParts.push(part.substring(italicLastIndex));
      }

      // If no italic text was found, just use the original part
      if (italicParts.length === 0) {
        processedParts.push(part);
      } else {
        processedParts.push(...italicParts);
      }
    } else {
      processedParts.push(part);
    }
  });

  return processedParts;
};

// Get formatted date for display
export const getFormattedDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString();
};
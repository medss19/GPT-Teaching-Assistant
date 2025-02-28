import React from "react";
import './markdownFormatting.css';

// Function to format message text with code blocks and other markdown elements
export const formatMessage = (text) => {
  if (!text) return null;

  // First handle code blocks with triple backticks
  const parts = text.split("```");

  if (parts.length === 1) {
    // No code blocks, just handle all other markdown
    return <div className="formatted-text">{formatMarkdown(text)}</div>;
  }

  return (
    <div className="formatted-text">
      {parts.map((part, index) => {
        // Even indices are regular text, odd indices are code
        if (index % 2 === 0) {
          return <div key={index}>{formatMarkdown(part)}</div>;
        } else {
          // Check for language specification in the first line
          const lines = part.split('\n');
          let language = '';
          let codeContent = part;
          
          if (lines[0].trim() && !lines[0].trim().includes(' ')) {
            language = lines[0].trim();
            codeContent = lines.slice(1).join('\n');
          }

          return (
            <pre key={index} className={`code-block ${language ? `language-${language}` : ''}`}>
              {language && <div className="code-language">{language}</div>}
              <code>{codeContent}</code>
            </pre>
          );
        }
      })}
    </div>
  );
};

// Main function to handle markdown conversion
export const formatMarkdown = (text) => {
  if (!text) return null;

  // Process headings, paragraphs, lists, etc.
  const lines = text.split('\n');
  const result = [];
  let currentList = null;
  let listType = null; // 'ul' for unordered, 'ol' for ordered
  let blockquoteContent = [];
  let inBlockquote = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Process headings (# Heading)
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      // Close any open lists or blockquotes
      if (currentList) {
        result.push(currentList);
        currentList = null;
        listType = null;
      }
      
      if (inBlockquote) {
        result.push({
          type: 'blockquote',
          content: blockquoteContent,
          key: `blockquote-${i}`
        });
        blockquoteContent = [];
        inBlockquote = false;
      }

      const level = headingMatch[1].length; // Number of # symbols
      result.push({
        type: `h${level}`,
        content: formatInlineMarkdown(headingMatch[2]),
        key: `heading-${i}`
      });
      continue;
    }

    // Process horizontal rules
    if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
      // Close any open lists or blockquotes
      if (currentList) {
        result.push(currentList);
        currentList = null;
        listType = null;
      }
      
      if (inBlockquote) {
        result.push({
          type: 'blockquote',
          content: blockquoteContent,
          key: `blockquote-${i}`
        });
        blockquoteContent = [];
        inBlockquote = false;
      }

      result.push({
        type: 'hr',
        key: `hr-${i}`
      });
      continue;
    }

    // Process blockquotes
    if (trimmedLine.startsWith('> ')) {
      inBlockquote = true;
      blockquoteContent.push(formatInlineMarkdown(trimmedLine.substring(2)));
      continue;
    } else if (inBlockquote) {
      // End of blockquote
      result.push({
        type: 'blockquote',
        content: blockquoteContent,
        key: `blockquote-${i}`
      });
      blockquoteContent = [];
      inBlockquote = false;
    }

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

  // Add any remaining blockquote
  if (inBlockquote && blockquoteContent.length > 0) {
    result.push({
      type: 'blockquote',
      content: blockquoteContent,
      key: `blockquote-end`
    });
  }

  // Convert result to React elements
  return result.map((item) => {
    if (item.type === 'p') {
      return <p key={item.key}>{item.content}</p>;
    } else if (item.type === 'br') {
      return <br key={item.key} />;
    } else if (item.type === 'h1') {
      return <h1 key={item.key} className="markdown-h1">{item.content}</h1>;
    } else if (item.type === 'h2') {
      return <h2 key={item.key} className="markdown-h2">{item.content}</h2>;
    } else if (item.type === 'h3') {
      return <h3 key={item.key} className="markdown-h3">{item.content}</h3>;
    } else if (item.type === 'h4') {
      return <h4 key={item.key} className="markdown-h4">{item.content}</h4>;
    } else if (item.type === 'h5') {
      return <h5 key={item.key} className="markdown-h5">{item.content}</h5>;
    } else if (item.type === 'h6') {
      return <h6 key={item.key} className="markdown-h6">{item.content}</h6>;
    } else if (item.type === 'hr') {
      return <hr key={item.key} className="markdown-hr" />;
    } else if (item.type === 'ul' || item.type === 'ol') {
      const ListComponent = item.type === 'ul' ? 'ul' : 'ol';
      return (
        <ListComponent key={item.key} className={`markdown-${item.type}`}>
          {item.items.map((listItem) => (
            <li key={listItem.key}>{listItem.content}</li>
          ))}
        </ListComponent>
      );
    } else if (item.type === 'blockquote') {
      return (
        <blockquote key={item.key} className="markdown-blockquote">
          {item.content.map((line, index) => (
            <p key={`blockquote-line-${index}`}>{line}</p>
          ))}
        </blockquote>
      );
    }
    return null;
  });
};

// Process inline formatting like bold, italic, code, etc.
export const formatInlineMarkdown = (text) => {
  if (!text) return text;

  // Handle inline code with backticks
  let parts = processInlineCode(text);
  
  // Handle bold text (**text**)
  parts = processBoldText(parts);
  
  // Handle italic text (*text*)
  parts = processItalicText(parts);

  return parts;
};

// Helper function to process inline code
const processInlineCode = (text) => {
  if (typeof text !== 'string') return [text];
  
  const codeRegex = /`([^`]+)`/g;
  let parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the code
    parts.push(<code key={`code-${match.index}`} className="inline-code">{match[1]}</code>);

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no inline code was found, just return the original text
  if (parts.length === 0) {
    parts = [text];
  }

  return parts;
};

// Helper function to process bold text
const processBoldText = (parts) => {
  const processedParts = [];

  parts.forEach((part, index) => {
    if (typeof part === 'string') {
      const boldRegex = /\*\*([^*]+)\*\*/g;
      let boldParts = [];
      let boldLastIndex = 0;
      let boldMatch;

      while ((boldMatch = boldRegex.exec(part)) !== null) {
        // Add text before the match
        if (boldMatch.index > boldLastIndex) {
          boldParts.push(part.substring(boldLastIndex, boldMatch.index));
        }

        // Add the bold text
        boldParts.push(<strong key={`bold-${boldMatch.index}`}>{boldMatch[1]}</strong>);

        boldLastIndex = boldMatch.index + boldMatch[0].length;
      }

      // Add any remaining text
      if (boldLastIndex < part.length) {
        boldParts.push(part.substring(boldLastIndex));
      }

      // If no bold text was found, just use the original part
      if (boldParts.length === 0) {
        processedParts.push(part);
      } else {
        processedParts.push(...boldParts);
      }
    } else {
      processedParts.push(part);
    }
  });

  return processedParts;
};

// Helper function to process italic text
const processItalicText = (parts) => {
  const processedParts = [];

  parts.forEach((part) => {
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

// Add CSS class related utilities
export const addClassNameBasedOnContent = (content) => {
  // Check for various types of content to add appropriate classes
  if (content.includes('```')) {
    return 'contains-code';
  }
  if (content.match(/^#+\s/m)) {
    return 'contains-headings';
  }
  if (content.match(/\*\*.*\*\*/)) {
    return 'contains-emphasis';
  }
  return '';
};
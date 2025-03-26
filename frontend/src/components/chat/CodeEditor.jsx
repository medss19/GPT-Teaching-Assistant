// CodeEditor.jsx
import React, { useState, useEffect } from "react";
import closeIcon from "../../assets/close.png";
import "./CodeEditor.css";

// CodeEditor component to display on the right side of the chat
const CodeEditor = ({ isOpen, onClose, onSubmit }) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [editorTheme, setEditorTheme] = useState("dark");
  
  // Keeping only the most popular languages for now
  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "typescript", label: "TypeScript" }
  ];

  // Get placeholder text based on language
  const getPlaceholder = (lang) => {
    const placeholders = {
      javascript: "// Enter your JavaScript code here...\n\nconst example = () => {\n  console.log('Hello world');\n};",
      python: "# Enter your Python code here...\n\ndef example():\n    print('Hello world')",
      java: "// Enter your Java code here...\n\npublic class Example {\n    public static void main(String[] args) {\n        System.out.println(\"Hello world\");\n    }\n}",
      cpp: "// Enter your C++ code here...\n\n#include <iostream>\n\nint main() {\n    std::cout << \"Hello world\" << std::endl;\n    return 0;\n}",
      typescript: "// Enter your TypeScript code here...\n\nconst example = (): void => {\n  console.log('Hello world');\n};"
    };
    
    return placeholders[lang] || `// Enter your ${languages.find(l => l.value === lang)?.label || 'code'} here...`;
  };

  // Handle code submission
  const handleSubmit = () => {
    if (code.trim()) {
      onSubmit(code, language);
    }
  };

  // Auto-focus the textarea when opened
  useEffect(() => {
    if (isOpen) {
      const textarea = document.querySelector('.code-textarea');
      if (textarea) {
        textarea.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`code-editor-panel ${editorTheme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <div className="code-editor-header">
        <div className="code-editor-controls">
          <select 
            className="language-selector"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          
          <button 
            className="theme-toggle"
            onClick={() => setEditorTheme(editorTheme === 'dark' ? 'light' : 'dark')}
            title={editorTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {editorTheme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        
        <button className="close-editor" onClick={onClose} title="Close editor">
          <img src={closeIcon} alt="Close" className="close-icon" />
        </button>
      </div>

      <div className="code-editor-content">
        <textarea
          className="code-textarea"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={getPlaceholder(language)}
          spellCheck="false"
          autoComplete="off"
        />
      </div>

      <div className="code-editor-footer">
        <button className="code-submit-button" onClick={handleSubmit}>
          Ask about this code
        </button>
        <div className="editor-info">
          <span className="language-indicator">{languages.find(l => l.value === language)?.label}</span>
          <span className="line-count">{code.split('\n').length} lines</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
"use client";

import React, { useState, useRef, useEffect } from "react";
import ExampleChips from "./ExampleChips";

interface InputAreaProps {
  placeholder: string;
  examples: string[];
  onSubmit: (text: string) => void;
  isLoading: boolean;
  buttonText: string;
}

export default function InputArea({
  placeholder,
  examples,
  onSubmit,
  isLoading,
  buttonText
}: InputAreaProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSelectExample = (ex: string) => {
    setText(ex);
  };

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text);
    }
  };

  return (
    <div className="lab-input-area">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="lab-textarea"
        placeholder={placeholder}
        disabled={isLoading}
      />
      <ExampleChips examples={examples} onSelect={handleSelectExample} />
      <button
        className="lab-submit-btn"
        onClick={handleSubmit}
        disabled={!text.trim() || isLoading}
      >
        {isLoading ? (
          <>
            <span className="lab-spinner"></span> 处理中...
          </>
        ) : (
          buttonText
        )}
      </button>
    </div>
  );
}

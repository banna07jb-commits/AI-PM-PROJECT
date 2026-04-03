"use client";

import React from "react";

interface ExampleChipsProps {
  examples: string[];
  onSelect: (text: string) => void;
}

export default function ExampleChips({ examples, onSelect }: ExampleChipsProps) {
  return (
    <div className="lab-examples">
      <span className="text-sm mr-2 opacity-80">💬 试试示例：</span>
      {examples.map((ex, index) => (
        <span
          key={index}
          className="lab-chip"
          onClick={() => onSelect(ex)}
        >
          {ex}
        </span>
      ))}
    </div>
  );
}

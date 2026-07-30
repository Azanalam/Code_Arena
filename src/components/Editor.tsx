"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

export function Editor({ value, onChange, language = "javascript", readOnly = false }: EditorProps) {
  return (
    <MonacoEditor
      height="100%"
      language={language}
      theme="vs-dark"
      value={value}
      onChange={(v) => onChange(v ?? "")}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        readOnly,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: { top: 12 },
      }}
    />
  );
}

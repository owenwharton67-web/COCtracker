"use client";

export function ExportPreview({ json }: { json: string }) {
  return (
    <textarea
      readOnly
      rows={12}
      value={json}
      onFocus={(e) => e.currentTarget.select()}
      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-mono text-muted"
    />
  );
}

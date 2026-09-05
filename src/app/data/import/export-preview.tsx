"use client";

import { useState } from "react";
import { secondaryButtonClasses } from "@/components/ui";

export function ExportPreview({ json }: { json: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API can be unavailable (permissions, non-HTTPS) - the
      // textarea itself is still selectable/copyable manually either way.
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        readOnly
        rows={12}
        value={json}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-mono text-muted"
      />
      <button type="button" onClick={copy} className={secondaryButtonClasses}>
        {copied ? "Copied!" : "Copy to clipboard"}
      </button>
    </div>
  );
}

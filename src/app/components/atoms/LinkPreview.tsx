import React from "react";
import type { RichTextItemResponse } from "@notionhq/client";
import { getLinkPreview } from "@/lib/linkPreview";
import { richTextToPlainText } from "@/lib/notion";

interface LinkPreviewProps {
  url: string;
  caption?: RichTextItemResponse[];
}

export async function LinkPreview({ url, caption }: LinkPreviewProps) {
  const preview = await getLinkPreview(url);
  const captionText = caption ? richTextToPlainText(caption) : "";

  return (
    <div className="flex flex-col">
      <a
        className="link-preview"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="link-preview-title">{preview.title}</span>
        {preview.description && (
          <span className="link-preview-description">{preview.description}</span>
        )}
        <span className="link-preview-url">{preview.url}</span>
      </a>
      {captionText && <p className="text-sm text-notion-gray">{captionText}</p>}
    </div>
  );
}

import React from "react";
import { renderRichText } from "@/lib/notion";
import type { RichTextItemResponse } from "@notionhq/client";

interface Heading4Props {
  richText: RichTextItemResponse[];
}

export function Heading4({ richText }: Heading4Props) {
  return <h4>{renderRichText(richText)}</h4>;
}

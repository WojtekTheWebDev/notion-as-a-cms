import React from "react";
import type { BlockObjectResponse } from "@notionhq/client";
import { Heading1 } from "../atoms/Heading1";
import { Heading2 } from "../atoms/Heading2";
import { Heading3 } from "../atoms/Heading3";
import { Heading4 } from "../atoms/Heading4";
import { Paragraph } from "../atoms/Paragraph";
import { BulletedListItem } from "../atoms/BulletedListItem";
import { NumberedListItem } from "../atoms/NumberedListItem";
import { TodoListItem } from "../atoms/TodoListItem";
import { ImageWithCaption } from "../atoms/ImageWithCaption";
import { LinkPreview } from "../atoms/LinkPreview";
import { Divider } from "../atoms/Divider";

interface NotionRendererProps {
  blocks: BlockObjectResponse[];
}

export const NotionRenderer = ({ blocks }: NotionRendererProps) => {
  return (
    <div className="p-4">
      {blocks.map((block) => {
        if (!("type" in block)) return null;

        const { id, type } = block;

        switch (type) {
          case "heading_1":
            return <Heading1 key={id} richText={block.heading_1.rich_text} />;
          case "heading_2":
            return <Heading2 key={id} richText={block.heading_2.rich_text} />;
          case "heading_3":
            return <Heading3 key={id} richText={block.heading_3.rich_text} />;
          case "heading_4":
            return <Heading4 key={id} richText={block.heading_4.rich_text} />;
          case "paragraph":
            return <Paragraph key={id} richText={block.paragraph.rich_text} />;
          case "bulleted_list_item":
            return (
              <BulletedListItem
                key={id}
                richText={block.bulleted_list_item.rich_text}
              />
            );
          case "numbered_list_item":
            return (
              <NumberedListItem
                key={id}
                richText={block.numbered_list_item.rich_text}
              />
            );
          case "to_do":
            return (
              <TodoListItem
                key={id}
                richText={block.to_do.rich_text}
                checked={block.to_do.checked}
              />
            );
          case "image":
            return <ImageWithCaption key={id} image={block.image} />;
          case "bookmark":
            return (
              <LinkPreview
                key={id}
                url={block.bookmark.url}
                caption={block.bookmark.caption}
              />
            );
          case "link_preview":
            return <LinkPreview key={id} url={block.link_preview.url} />;
          case "divider":
            return <Divider key={id} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

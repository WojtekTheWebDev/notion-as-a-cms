const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
  "&apos;": "'",
};

const decodeEntities = (value: string): string =>
  value.replace(
    /&(?:amp|lt|gt|quot|#39|#x27|apos);/g,
    (match) => HTML_ENTITIES[match] ?? match
  );

const readMetaContent = (html: string, key: string): string => {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]*?content=["']([^"']*)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]*?(?:property|name)=["']${key}["']`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeEntities(match[1]).trim();
  }

  return "";
};

const readTitleTag = (html: string): string => {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? decodeEntities(match[1]).trim() : "";
};

const getHostname = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export interface LinkPreview {
  url: string;
  title: string;
  description: string;
  hostname: string;
}

export const getLinkPreview = async (url: string): Promise<LinkPreview> => {
  const hostname = getHostname(url);
  const fallback: LinkPreview = { url, title: hostname, description: "", hostname };

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; notion-as-a-cms link preview)",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return fallback;

    const html = (await response.text()).slice(0, 500_000);

    return {
      url,
      hostname,
      title: readMetaContent(html, "og:title") || readTitleTag(html) || hostname,
      description:
        readMetaContent(html, "og:description") ||
        readMetaContent(html, "description"),
    };
  } catch {
    return fallback;
  }
};

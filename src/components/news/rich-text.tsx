import type { RichTextDocument } from "@/types/database";

/**
 * Renders a Tiptap / ProseMirror document.
 *
 * Walks the node tree and emits React elements. Content is never passed to
 * `dangerouslySetInnerHTML` — because the stored value is structured JSON
 * rather than HTML, XSS is impossible by construction rather than by
 * sanitisation, and an unknown node type is skipped instead of rendered.
 */
export function RichText({
  doc,
  lang,
}: {
  doc: RichTextDocument | null;
  lang?: "en" | "ml";
}) {
  if (!doc) return null;

  return (
    <div
      lang={lang}
      className="flex flex-col gap-6 text-[1.0625rem] leading-[1.75] text-muted [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-medium [&_strong]:text-ink"
    >
      {renderNodes(doc.content ?? [])}
    </div>
  );
}

function renderNodes(nodes: RichTextDocument[]): React.ReactNode {
  return nodes.map((node, index) => renderNode(node, index));
}

function renderNode(node: RichTextDocument, key: number): React.ReactNode {
  switch (node.type) {
    case "paragraph":
      return <p key={key}>{renderNodes(node.content ?? [])}</p>;

    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      const Tag = (level === 2 ? "h2" : level === 3 ? "h3" : "h4") as "h2";
      return (
        <Tag key={key} className="text-h3 mt-4 text-ink">
          {renderNodes(node.content ?? [])}
        </Tag>
      );
    }

    case "bulletList":
      return (
        <ul key={key} className="flex list-disc flex-col gap-2 pl-5">
          {renderNodes(node.content ?? [])}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="flex list-decimal flex-col gap-2 pl-5">
          {renderNodes(node.content ?? [])}
        </ol>
      );

    case "listItem":
      return <li key={key}>{renderNodes(node.content ?? [])}</li>;

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-l-2 border-line-strong pl-6 text-ink"
        >
          {renderNodes(node.content ?? [])}
        </blockquote>
      );

    case "horizontalRule":
      return <hr key={key} className="border-line" />;

    case "hardBreak":
      return <br key={key} />;

    case "text": {
      let element: React.ReactNode = node.text;

      for (const mark of node.marks ?? []) {
        if (mark.type === "bold") element = <strong>{element}</strong>;
        if (mark.type === "italic") element = <em>{element}</em>;
        if (mark.type === "link") {
          element = (
            <a
              href={String(mark.attrs?.href ?? "#")}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              {element}
            </a>
          );
        }
      }

      return <span key={key}>{element}</span>;
    }

    // Unknown node types are skipped rather than guessed at.
    default:
      return node.content ? (
        <div key={key}>{renderNodes(node.content)}</div>
      ) : null;
  }
}

"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Table as TableIcon,
  Undo2,
} from "lucide-react";
import { useEffect } from "react";

import { cn } from "@/lib/utils/cn";
import type { RichTextDocument } from "@/types/database";

/**
 * Article editor.
 *
 * Tiptap over ProseMirror, chosen for one non-obvious reason: Malayalam is a
 * complex script that needs IME composition handling and grapheme-aware cursor
 * movement, and ProseMirror has the most mature implementation of that on the
 * web.
 *
 * Content is stored as ProseMirror JSON rather than HTML, so rendering never
 * touches dangerouslySetInnerHTML and XSS is impossible by construction.
 *
 * The toolbar is deliberately short: no font sizes, no colours, no alignment.
 * A committee member cannot make an article look off-brand because the tools
 * to do so do not exist — that is the "fixed design, editable content" rule
 * enforced at the point of authoring.
 */
export function RichTextEditor({
  value,
  onChange,
  lang,
  placeholder,
}: {
  value: RichTextDocument | null;
  onChange: (doc: RichTextDocument | null) => void;
  lang?: "en" | "ml";
  placeholder?: string;
}) {
  const editor = useEditor({
    // Rendering on the server would mismatch on hydration.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        // H1 is always the article title, never body content.
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer nofollow" },
      }),
      Image.configure({ inline: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value ?? undefined,
    editorProps: {
      attributes: {
        lang: lang ?? "en",
        class: cn(
          "min-h-64 rounded-b-md border border-t-0 border-line bg-surface px-4 py-3",
          "prose-editor focus:outline-none",
        ),
      },
    },
    onUpdate: ({ editor: instance }) => {
      const json = instance.getJSON() as RichTextDocument;
      const empty = instance.isEmpty;
      onChange(empty ? null : json);
    },
  });

  // Keep the editing surface tagged with the right language so Malayalam gets
  // its own typography and screen readers announce it correctly.
  useEffect(() => {
    if (!editor) return;
    editor.setOptions({
      editorProps: {
        attributes: {
          lang: lang ?? "en",
          class: cn(
            "min-h-64 rounded-b-md border border-t-0 border-line bg-surface px-4 py-3",
            "prose-editor focus:outline-none",
          ),
        },
      },
    });
  }, [editor, lang]);

  if (!editor) {
    return (
      <div className="min-h-72 animate-pulse rounded-md border border-line bg-subtle" />
    );
  }

  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      {placeholder ? (
        <p className="mt-2 text-xs text-muted">{placeholder}</p>
      ) : null}
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const button = (
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    active?: boolean,
  ) => (
    <button
      key={label}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded transition-colors",
        active
          ? "bg-accent-soft text-accent"
          : "text-muted hover:bg-subtle hover:text-ink",
      )}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border border-line bg-subtle px-2 py-1.5 [&_svg]:size-4">
      {button(
        "Heading 2",
        <Heading2 />,
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        editor.isActive("heading", { level: 2 }),
      )}
      {button(
        "Heading 3",
        <Heading3 />,
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        editor.isActive("heading", { level: 3 }),
      )}

      <Divider />

      {button(
        "Bold",
        <Bold />,
        () => editor.chain().focus().toggleBold().run(),
        editor.isActive("bold"),
      )}
      {button(
        "Italic",
        <Italic />,
        () => editor.chain().focus().toggleItalic().run(),
        editor.isActive("italic"),
      )}
      {button(
        "Link",
        <Link2 />,
        () => {
          const previous = editor.getAttributes("link").href as
            | string
            | undefined;
          const url = window.prompt("Link URL", previous ?? "https://");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        },
        editor.isActive("link"),
      )}

      <Divider />

      {button(
        "Bulleted list",
        <List />,
        () => editor.chain().focus().toggleBulletList().run(),
        editor.isActive("bulletList"),
      )}
      {button(
        "Numbered list",
        <ListOrdered />,
        () => editor.chain().focus().toggleOrderedList().run(),
        editor.isActive("orderedList"),
      )}
      {button(
        "Quote",
        <Quote />,
        () => editor.chain().focus().toggleBlockquote().run(),
        editor.isActive("blockquote"),
      )}
      {button("Divider", <Minus />, () =>
        editor.chain().focus().setHorizontalRule().run(),
      )}
      {button("Table", <TableIcon />, () =>
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
      )}

      <Divider />

      {button("Undo", <Undo2 />, () => editor.chain().focus().undo().run())}
      {button("Redo", <Redo2 />, () => editor.chain().focus().redo().run())}
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-line" />;
}

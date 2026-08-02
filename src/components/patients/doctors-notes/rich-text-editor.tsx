"use client";

import { useEffect, useRef, useState } from "react";

import { Extension, Mark, type Editor } from "@tiptap/core";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  ClipboardPaste,
  Code2,
  Copy,
  Highlighter,
  ImageIcon,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Palette,
  Printer,
  Quote,
  Redo2,
  Scissors,
  Search,
  Strikethrough,
  Table as TableIcon,
  Type,
  Underline,
  Undo2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/menu";
import {
  FONT_FAMILIES,
  FONT_SIZES,
  HIGHLIGHT_COLORS,
  TEXT_COLORS,
} from "@/lib/patients/progress-notes";
import { cn } from "@/lib/utils";

const FontSize = Extension.create({
  name: "fontSize",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};

              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),

      unsetFontSize:
        () =>
        ({ chain }) =>
          chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
    };
  },
});

const SearchHighlightMark = Mark.create({
  name: "searchHighlight",
  inclusive: false,
  excludes: "",

  renderHTML() {
    return ["mark", { class: "pn-search-hit" }];
  },

  parseHTML() {
    return [{ tag: "mark.pn-search-hit" }];
  },
});

const SearchHighlight = Extension.create({
  name: "searchHighlight",

  addExtensions() {
    return [SearchHighlightMark];
  },

  addCommands() {
    return {
      setSearchHighlight:
        (term: string) =>
        ({ editor, tr, dispatch }) => {
          const { schema } = editor.state;
          const markType = schema.marks.searchHighlight;
          const haystack = term.trim().toLowerCase();

          if (!haystack) return false;

          let matches = 0;

          tr.doc.descendants((node, pos) => {
            if (!node.isText) return true;

            const text = node.text ?? "";
            const lowered = text.toLowerCase();

            let from = 0;

            while (true) {
              const index = lowered.indexOf(haystack, from);

              if (index === -1) break;

              tr.addMark(
                pos + index,
                pos + index + haystack.length,
                markType.create(),
              );
              matches += 1;
              from = index + haystack.length;
            }

            return true;
          });

          if (matches > 0 && dispatch) dispatch(tr);

          return matches > 0;
        },

      clearSearchHighlight:
        () =>
        ({ tr, dispatch, editor }) => {
          const { schema } = editor.state;
          const markType = schema.marks.searchHighlight;

          let removed = false;

          tr.doc.descendants((node, pos) => {
            if (!node.isText) return true;

            const hasHit = node.marks.some((mark) => mark.type === markType);

            if (hasHit) {
              tr.removeMark(pos, pos + node.nodeSize, markType);
              removed = true;
            }

            return true;
          });

          if (removed && dispatch) dispatch(tr);

          return true;
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
    searchHighlight: {
      setSearchHighlight: (term: string) => ReturnType;
      clearSearchHighlight: () => ReturnType;
    };
  }
}

function getSearchHits(editor: Editor): { from: number; to: number }[] {
  const hits: { from: number; to: number }[] = [];

  const markType = editor.state.schema.marks.searchHighlight;

  editor.state.doc.descendants((node, pos) => {
    if (!node.isText) return true;

    const isHit = node.marks.some((mark) => mark.type === markType);

    if (isHit) hits.push({ from: pos, to: pos + node.nodeSize });

    return true;
  });

  return hits;
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
      className={cn(
        "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border text-[#555555] transition-colors",
        active
          ? "border-[#d9534f] bg-[#fdecea] text-[#d9534f]"
          : "border-transparent hover:border-[#e5e5e5] hover:bg-[#f5f5f5]",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0.5 border-r border-[#eeeeee] pr-1.5">
      {children}
    </div>
  );
}

function ToolbarDropdown({
  label,
  value,
  children,
  onOpenChange,
}: {
  label: string;
  value: React.ReactNode;
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        className="flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-[4px] border border-transparent px-1.5 text-[11px] font-medium text-[#555555] transition-colors hover:border-[#e5e5e5] hover:bg-[#f5f5f5]"
        aria-label={label}
      >
        {value}

        <ChevronDown className="h-3 w-3 text-[#999999]" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-44">{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

function EditorToolbar({
  editor,
  searchOpen,
  setSearchOpen,
  onToggleFullscreen,
  isFullscreen,
  onToggleSource,
  sourceMode,
}: {
  editor: Editor;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onToggleSource: () => void;
  sourceMode: boolean;
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      isBold: current.isActive("bold"),
      isItalic: current.isActive("italic"),
      isUnderline: current.isActive("underline"),
      isStrike: current.isActive("strike"),
      isBulletList: current.isActive("bulletList"),
      isOrderedList: current.isActive("orderedList"),
      isBlockquote: current.isActive("blockquote"),
      isLink: current.isActive("link"),
      align: current.isActive({ textAlign: "left" })
        ? "left"
        : current.isActive({ textAlign: "center" })
          ? "center"
          : current.isActive({ textAlign: "right" })
            ? "right"
            : current.isActive({ textAlign: "justify" })
              ? "justify"
              : "left",
      canUndo: current.can().undo(),
      canRedo: current.can().redo(),
      canIndent: current.can().sinkListItem("listItem"),
      canOutdent: current.can().liftListItem("listItem"),
      fontSize: current.getAttributes("textStyle").fontSize as
        | string
        | undefined,
      fontFamily: current.getAttributes("textStyle").fontFamily as
        | string
        | undefined,
    }),
  });

  const handleCut = () => {
    editor.commands.focus();
    document.execCommand("cut");
  };

  const handleCopy = () => {
    editor.commands.focus();
    document.execCommand("copy");
  };

  const handlePaste = () => {
    editor.commands.focus();
    document.execCommand("paste");
  };

  const handleLink = () => {
    if (state.isLink) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    const url = window.prompt("Enter the link URL:", "https://");

    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  const handleImage = () => {
    const src = window.prompt("Enter the image URL:", "https://");

    if (src) {
      editor.chain().focus().setImage({ src }).run();
    }
  };

  const handleTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const currentFontSize = state.fontSize ?? "Size";
  const currentFontFamily = state.fontFamily ?? "Font";

  return (
    <div className="flex flex-col border-b border-[#eeeeee] bg-[#fcfcfc]">
      <div className="flex flex-wrap items-center gap-1.5 px-2 py-1.5">
        <ToolbarGroup>
          <ToolbarButton
            label="Undo (Ctrl+Z)"
            disabled={!state.canUndo}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton
            label="Redo"
            disabled={!state.canRedo}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 className="h-3.5 w-3.5" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolbarButton label="Cut" onClick={handleCut}>
            <Scissors className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton label="Copy" onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton label="Paste" onClick={handlePaste}>
            <ClipboardPaste className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton label="Print" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton
            label="Search"
            active={searchOpen}
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-3.5 w-3.5" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolbarButton
            label="Bold (Ctrl+B)"
            active={state.isBold}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton
            label="Italic (Ctrl+I)"
            active={state.isItalic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton
            label="Underline"
            active={state.isUnderline}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <Underline className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton
            label="Strikethrough"
            active={state.isStrike}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolbarDropdown
            label="Font family"
            value={
              <span className="flex items-center gap-1">
                <Type className="h-3 w-3" />

                {currentFontFamily}
              </span>
            }
          >
            <DropdownMenuLabel>Font Family</DropdownMenuLabel>

            {FONT_FAMILIES.map((family) => (
              <DropdownMenuItem
                key={family}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .setFontFamily(family)
                    .run()
                }
              >
                <span style={{ fontFamily: family }}>{family}</span>
              </DropdownMenuItem>
            ))}
          </ToolbarDropdown>

          <ToolbarDropdown
            label="Font size"
            value={currentFontSize}
          >
            <DropdownMenuLabel>Font Size</DropdownMenuLabel>

            {FONT_SIZES.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => editor.chain().focus().setFontSize(size).run()}
              >
                <span style={{ fontSize: size }}>{size}</span>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => editor.chain().focus().unsetFontSize().run()}
            >
              Default size
            </DropdownMenuItem>
          </ToolbarDropdown>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-[4px] border border-transparent px-1.5 text-[11px] font-medium text-[#555555] transition-colors hover:border-[#e5e5e5] hover:bg-[#f5f5f5]"
              aria-label="Text color"
            >
              <Palette className="h-3.5 w-3.5" />

              <ChevronDown className="h-3 w-3 text-[#999999]" />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="min-w-40">
              <DropdownMenuLabel>Text Color</DropdownMenuLabel>

              <div className="grid grid-cols-5 gap-1.5 p-2">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={() =>
                      editor.chain().focus().setColor(color).run()
                    }
                    className="h-6 w-6 cursor-pointer rounded border border-[#eeeeee]"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => editor.chain().focus().unsetColor().run()}
              >
                Default color
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-[4px] border border-transparent px-1.5 text-[11px] font-medium text-[#555555] transition-colors hover:border-[#e5e5e5] hover:bg-[#f5f5f5]"
              aria-label="Highlight"
            >
              <Highlighter className="h-3.5 w-3.5" />

              <ChevronDown className="h-3 w-3 text-[#999999]" />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="min-w-40">
              <DropdownMenuLabel>Highlight Color</DropdownMenuLabel>

              <div className="grid grid-cols-6 gap-1.5 p-2">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color })
                        .run()
                    }
                    className="h-6 w-6 cursor-pointer rounded border border-[#eeeeee]"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => editor.chain().focus().unsetHighlight().run()}
              >
                Remove highlight
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolbarButton
            label="Bullet list"
            active={state.isBulletList}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton
            label="Numbered list"
            active={state.isOrderedList}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton
            label="Align left"
            active={state.align === "left"}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton
            label="Align center"
            active={state.align === "center"}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton
            label="Align right"
            active={state.align === "right"}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton
            label="Justify"
            active={state.align === "justify"}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton
            label="Indent"
            disabled={!state.canIndent}
            onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
          >
            <IndentIncrease className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton
            label="Outdent"
            disabled={!state.canOutdent}
            onClick={() => editor.chain().focus().liftListItem("listItem").run()}
          >
            <IndentDecrease className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton
            label="Block quote"
            active={state.isBlockquote}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-3.5 w-3.5" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolbarButton
            label={state.isLink ? "Remove link" : "Insert link"}
            active={state.isLink}
            onClick={handleLink}
          >
            {state.isLink ? (
              <Link2Off className="h-3.5 w-3.5" />
            ) : (
              <Link2 className="h-3.5 w-3.5" />
            )}
          </ToolbarButton>

          <ToolbarButton label="Insert image" onClick={handleImage}>
            <ImageIcon className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton label="Insert table" onClick={handleTable}>
            <TableIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
        </ToolbarGroup>

        <div className="ml-auto flex items-center gap-0.5">
          <ToolbarButton
            label={isFullscreen ? "Exit full screen" : "Full screen"}
            active={isFullscreen}
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </ToolbarButton>

          <ToolbarButton
            label="Source view"
            active={sourceMode}
            onClick={onToggleSource}
          >
            <Code2 className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>
      </div>

      {searchOpen && (
        <SearchBar
          editor={editor}
          onClose={() => {
            setSearchOpen(false);
          }}
        />
      )}
    </div>
  );
}

function SearchBar({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const [term, setTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const updateSearch = (nextTerm: string) => {
    setTerm(nextTerm);

    editor.chain().focus().clearSearchHighlight().run();

    if (nextTerm.trim().length >= 2) {
      editor.chain().setSearchHighlight(nextTerm).run();
    }

    setActiveIndex(0);
  };

  const hits = getSearchHits(editor);

  const moveTo = (index: number) => {
    const matches = getSearchHits(editor);

    if (matches.length === 0) return;

    const safe = ((index % matches.length) + matches.length) % matches.length;
    const hit = matches[safe];

    setActiveIndex(safe);

    editor.chain().focus().setTextSelection({
      from: hit.from,
      to: hit.to,
    }).run();
  };

  const close = () => {
    editor.chain().clearSearchHighlight().run();
    onClose();
  };

  return (
    <div className="flex items-center gap-1.5 border-t border-[#eeeeee] bg-white px-2 py-1.5">
      <Search className="h-3.5 w-3.5 text-[#999999]" />

      <input
        autoFocus
        value={term}
        onChange={(event) => updateSearch(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            moveTo(activeIndex + 1);
          } else if (event.key === "Escape") {
            close();
          }
        }}
        placeholder="Search in note..."
        className="h-6 w-48 rounded border border-[#dddddd] px-2 text-[11px] text-[#333333] outline-none focus:border-[#d9534f]"
      />

      <span className="text-[10px] text-[#888888]">
        {term.trim().length >= 2 ? `${activeIndex + 1}/${hits.length}` : ""}
      </span>

      <button
        type="button"
        title="Previous match"
        onClick={() => moveTo(activeIndex - 1)}
        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-[#555555] hover:bg-[#f5f5f5]"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        title="Next match"
        onClick={() => moveTo(activeIndex + 1)}
        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-[#555555] hover:bg-[#f5f5f5]"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        title="Close search"
        onClick={close}
        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-[#555555] hover:bg-[#f5f5f5]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function RichTextEditor({
  content,
  onChange,
  readOnly = false,
}: {
  content: string;
  onChange: (html: string) => void;
  readOnly?: boolean;
}) {
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState(content);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const contentRef = useRef(content);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Enter today's clinical progress note...",
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      Image.configure({ inline: false }),
      SearchHighlight,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor: current }) => {
      contentRef.current = current.getHTML();
      onChange(current.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "pn-editor min-h-[500px] max-w-none px-4 py-3 text-[14px] leading-relaxed text-[#333333] focus:outline-none",
        spellcheck: "false",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [editor, readOnly]);

  const toggleSource = () => {
    if (!editor) return;

    if (sourceMode) {
      editor.commands.setContent(sourceHtml);
      onChange(sourceHtml);
      setSourceMode(false);

      return;
    }

    setSourceHtml(editor.getHTML());
    setSourceMode(true);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[6px] border border-[#dddddd] bg-white",
        isFullscreen &&
          "fixed inset-0 z-50 rounded-none border-0 bg-[#f5f6f8] p-4 shadow-2xl",
      )}
    >
      {!readOnly && editor && (
        <EditorToolbar
          editor={editor}
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          onToggleFullscreen={() => setIsFullscreen((value) => !value)}
          isFullscreen={isFullscreen}
          onToggleSource={toggleSource}
          sourceMode={sourceMode}
        />
      )}

      {sourceMode ? (
        <textarea
          value={sourceHtml}
          onChange={(event) => setSourceHtml(event.target.value)}
          spellCheck={false}
          className="min-h-[500px] w-full resize-none border-0 bg-[#fafafa] px-4 py-3 font-mono text-[12px] leading-relaxed text-[#333333] outline-none"
        />
      ) : (
        <EditorContent editor={editor} />
      )}

      {!readOnly && (
        <div className="flex items-center justify-between border-t border-[#eeeeee] bg-[#fcfcfc] px-3 py-1.5 text-[10px] text-[#999999]">
          <span>
            Shortcuts: Ctrl+B bold · Ctrl+I italic · Ctrl+S save draft
          </span>

          {isFullscreen && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => setIsFullscreen(false)}
              className="text-[10px]"
            >
              <Minimize2 />

              Exit full screen
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

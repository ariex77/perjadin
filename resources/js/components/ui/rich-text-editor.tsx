"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Strikethrough, Italic, List, ListOrdered } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
    const editor = useEditor({
        editorProps: {
            attributes: {
                class: `prose prose-sm max-w-none w-full break-words border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 min-h-48 rounded-md rounded-t-none border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className || ''}`,
                ...(placeholder && { placeholder }),
            },
        },
        extensions: [
            StarterKit.configure({
                orderedList: {
                    HTMLAttributes: {
                        class: "list-decimal pl-4",
                    },
                },
                bulletList: {
                    HTMLAttributes: {
                        class: "list-disc pl-4",
                    },
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Update editor content when value prop changes
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [editor, value]);

    return (
        <>
            {editor && <RichTextEditorToolbar editor={editor} />}
            <EditorContent editor={editor} />
        </>
    );
};

const RichTextEditorToolbar = ({ editor }: { editor: any }) => {
    return (
        <div className="bg-background rounded-md rounded-b-none border-b border-muted p-1 flex flex-row items-center gap-1 flex-wrap">
            <Toggle
                size="sm"
                pressed={editor.isActive("bold")}
                onPressedChange={() =>
                    editor.chain().focus().toggleBold().run()
                }
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() =>
                    editor.chain().focus().toggleItalic().run()
                }
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("strike")}
                onPressedChange={() =>
                    editor.chain().focus().toggleStrike().run()
                }
            >
                <Strikethrough className="h-4 w-4" />
            </Toggle>
            <Separator orientation="vertical" className="w-[1px] h-8" />
            <Toggle
                size="sm"
                pressed={editor.isActive("bulletList")}
                onPressedChange={() =>
                    editor.chain().focus().toggleBulletList().run()
                }
            >
                <List className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("orderedList")}
                onPressedChange={() =>
                    editor.chain().focus().toggleOrderedList().run()
                }
            >
                <ListOrdered className="h-4 w-4" />
            </Toggle>
        </div>
    );
};

export default RichTextEditor;

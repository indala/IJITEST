"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import {
    AlignLeft,
    Bold,
    Code,
    Heading2,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Palette,
    RemoveFormatting,
    Underline,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AnnouncementEditorProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
};

type ToolbarButtonProps = {
    label: string;
    onClick: () => void;
    children: ReactNode;
    disabled?: boolean;
};

function ToolbarButton({ label, onClick, children, disabled }: ToolbarButtonProps) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            title={label}
            onMouseDown={event => event.preventDefault()}
            onClick={onClick}
            disabled={disabled}
            className="text-muted-foreground hover:text-foreground"
        >
            {children}
        </Button>
    );
}

export function AnnouncementEditor({
    value,
    onChange,
    placeholder = "Write the announcement content...",
    disabled = false,
}: AnnouncementEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const updateValue = () => {
        const nextValue = editorRef.current?.innerHTML || "";
        onChange(nextValue);
    };

    const runCommand = (command: string, commandValue?: string) => {
        editorRef.current?.focus();
        document.execCommand(command, false, commandValue);
        updateValue();
    };

    const addLink = () => {
        const url = window.prompt("Enter the full link URL");
        if (!url?.trim()) return;
        runCommand("createLink", url.trim());
    };

    const chooseColor = (command: "foreColor" | "hiliteColor", label: string) => {
        const color = window.prompt(`${label} (for example #000066)`);
        if (!color?.trim()) return;
        runCommand(command, color.trim());
    };

    return (
        <div className={cn(
            "overflow-hidden rounded-md border border-input bg-background shadow-xs",
            disabled && "opacity-60"
        )}>
            <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 p-1">
                <ToolbarButton label="Bold" onClick={() => runCommand("bold")} disabled={disabled}>
                    <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton label="Italic" onClick={() => runCommand("italic")} disabled={disabled}>
                    <Italic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton label="Underline" onClick={() => runCommand("underline")} disabled={disabled}>
                    <Underline className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton label="Text color" onClick={() => chooseColor("foreColor", "Text color")} disabled={disabled}>
                    <Palette className="h-4 w-4" />
                </ToolbarButton>
                <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
                <ToolbarButton label="Heading" onClick={() => runCommand("formatBlock", "h3")} disabled={disabled}>
                    <Heading2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton label="Paragraph" onClick={() => runCommand("formatBlock", "p")} disabled={disabled}>
                    <AlignLeft className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton label="Bulleted list" onClick={() => runCommand("insertUnorderedList")} disabled={disabled}>
                    <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton label="Numbered list" onClick={() => runCommand("insertOrderedList")} disabled={disabled}>
                    <ListOrdered className="h-4 w-4" />
                </ToolbarButton>
                <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
                <ToolbarButton label="Add link" onClick={addLink} disabled={disabled}>
                    <LinkIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton label="Blockquote" onClick={() => runCommand("formatBlock", "blockquote")} disabled={disabled}>
                    <Code className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton label="Clear formatting" onClick={() => runCommand("removeFormat")} disabled={disabled}>
                    <RemoveFormatting className="h-4 w-4" />
                </ToolbarButton>
            </div>
            <div
                ref={editorRef}
                contentEditable={!disabled}
                role="textbox"
                aria-multiline="true"
                aria-label="Announcement content"
                data-placeholder={placeholder}
                suppressContentEditableWarning
                onInput={updateValue}
                onBlur={updateValue}
                className="min-h-56 px-3 py-3 text-body-sm leading-7 outline-none [&:empty]:before:pointer-events-none [&:empty]:before:text-muted-foreground [&:empty]:before:content-[attr(data-placeholder)] [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-semibold [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6"
            />
        </div>
    );
}

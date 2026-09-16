const ALLOWED_TAGS = new Set([
    "a", "blockquote", "br", "div", "em", "font", "h3", "h4", "li", "ol", "p", "strong",
    "u", "ul",
]);

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function sanitizeTag(match: string): string {
    const closing = /^<\//.test(match);
    const nameMatch = match.match(/^<\/?\s*([a-z0-9]+)/i);
    const name = nameMatch?.[1]?.toLowerCase();
    if (!name || !ALLOWED_TAGS.has(name)) return "";
    if (closing) {
        if (name === "div") return "</p>";
        if (name === "font") return "</span>";
        return `</${name}>`;
    }
    if (name === "br") return "<br>";
    if (name === "div") return "<p>";
    if (name === "font") {
        const color = match.match(/\bcolor\s*=\s*["'](#[0-9a-f]{3,8})["']/i)?.[1];
        return color ? `<span style="color:${color}">` : "<span>";
    }
    if (name !== "a") return `<${name}>`;

    const href = match.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]?.trim();
    if (!href || !/^(https?:|mailto:)/i.test(href)) return "<a>";
    return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">`;
}

export function sanitizeAnnouncementHtml(value: string): string {
    return value
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<[^>]*>/g, sanitizeTag)
        .trim();
}

function markdownToHtml(value: string): string {
    const escaped = escapeHtml(value.trim());
    const lines = escaped.split(/\r?\n/);
    const output: string[] = [];
    let listType: "ul" | "ol" | null = null;

    const closeList = () => {
        if (listType) {
            output.push(`</${listType}>`);
            listType = null;
        }
    };

    for (const line of lines) {
        const heading = line.match(/^###\s+(.+)$/);
        const unordered = line.match(/^[-*]\s+(.+)$/);
        const ordered = line.match(/^\d+\.\s+(.+)$/);

        if (heading) {
            closeList();
            output.push(`<h3>${heading[1]}</h3>`);
        } else if (unordered || ordered) {
            const nextType = unordered ? "ul" : "ol";
            if (listType !== nextType) {
                closeList();
                listType = nextType;
                output.push(`<${listType}>`);
            }
            output.push(`<li>${(unordered?.[1] || ordered?.[1]) ?? ""}</li>`);
        } else if (line.trim()) {
            closeList();
            output.push(`<p>${line}</p>`);
        }
    }
    closeList();

    return output.join("")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/__(.+?)__/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/_([^_]+)_/g, "<em>$1</em>");
}

export function announcementContentToHtml(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "";
    return /<\s*[a-z][^>]*>/i.test(trimmed)
        ? sanitizeAnnouncementHtml(trimmed)
        : markdownToHtml(trimmed);
}

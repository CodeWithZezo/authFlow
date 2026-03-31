import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { Check, Copy } from "lucide-react";
import type { Components } from "react-markdown";
import "highlight.js/styles/atom-one-dark.css";

interface MarkdownRendererProps {
  content: string;
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-all"
      style={{
        color: copied ? "var(--color-success)" : "var(--color-text-muted)",
      }}
      aria-label={copied ? "Copied!" : "Copy code"}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ─── Extract plain text from React children (for copy) ───────────────────────
function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (
    children &&
    typeof children === "object" &&
    "props" in (children as object)
  ) {
    return extractText((children as React.ReactElement).props.children);
  }
  return "";
}

// ─── Custom components ────────────────────────────────────────────────────────
function buildComponents(): Components {
  return {
    h1: ({ children, id }) => (
      <h1
        id={id}
        className="scroll-mt-20"
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "var(--color-text-primary)",
          letterSpacing: "-0.02em",
          marginBottom: "0.5rem",
          marginTop: 0,
          lineHeight: 1.2,
          fontFamily: "var(--font-display)",
        }}
      >
        {children}
      </h1>
    ),

    h2: ({ children, id }) => (
      <h2
        id={id}
        className="scroll-mt-20"
        style={{
          fontSize: "1.35rem",
          fontWeight: 700,
          color: "var(--color-text-primary)",
          marginTop: "2.5rem",
          marginBottom: "0.75rem",
          paddingBottom: "0.5rem",
          borderBottom: "1px solid var(--color-border)",
          fontFamily: "var(--font-display)",
        }}
      >
        {children}
      </h2>
    ),

    h3: ({ children, id }) => (
      <h3
        id={id}
        className="scroll-mt-20"
        style={{
          fontSize: "1.05rem",
          fontWeight: 600,
          color: "var(--color-text-primary)",
          marginTop: "2rem",
          marginBottom: "0.5rem",
        }}
      >
        {children}
      </h3>
    ),

    h4: ({ children, id }) => (
      <h4
        id={id}
        className="scroll-mt-20"
        style={{
          fontSize: "0.8rem",
          fontWeight: 600,
          color: "var(--color-text-muted)",
          marginTop: "1.5rem",
          marginBottom: "0.4rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {children}
      </h4>
    ),

    p: ({ children }) => (
      <p
        style={{
          color: "var(--color-text-secondary)",
          lineHeight: 1.75,
          marginBottom: "1rem",
          fontSize: "0.95rem",
        }}
      >
        {children}
      </p>
    ),

    // Inline code — block code is handled by pre
    code: ({ children, className }) => {
      const isBlock = Boolean(className?.startsWith("language-"));
      if (isBlock) {
        // Inside a <pre> — just pass through, pre handles the wrapper
        return <code className={className}>{children}</code>;
      }
      return (
        <code
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.82em",
            padding: "0.15em 0.45em",
            borderRadius: "5px",
            background: "var(--color-surface-2)",
            color: "var(--color-accent)",
            border: "1px solid var(--color-border)",
          }}
        >
          {children}
        </code>
      );
    },

    // Pre — wraps highlighted code block with header + copy button
    pre: ({ children }) => {
      // children is the <code className="language-xxx"> element
      const codeEl = children as React.ReactElement<{
        className?: string;
        children?: React.ReactNode;
      }>;

      const className = codeEl?.props?.className ?? "";
      const lang = className.replace("language-", "") || "text";
      const plainText = extractText(codeEl?.props?.children);

      return (
        <div
          className="my-5 overflow-hidden rounded-xl border"
          style={{ borderColor: "var(--color-border)", background: "#1a1b26" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b px-4 py-2"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            <div className="flex items-center gap-1.5">
              {(["#ef4444", "#f59e0b", "#22c55e"] as const).map((c) => (
                <span
                  key={c}
                  className="block h-2.5 w-2.5 rounded-full"
                  style={{ background: c, opacity: 0.7 }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {lang !== "text" && (
                <span
                  className="rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                  style={{
                    background: "var(--color-surface-2)",
                    color: "var(--color-text-muted)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {lang}
                </span>
              )}
              <CopyButton text={plainText} />
            </div>
          </div>

          {/* Code body — rehype-highlight has already processed the AST */}
          <div className="overflow-x-auto">
            <pre
              style={{
                margin: 0,
                padding: "1rem 1.25rem",
                background: "transparent",
                fontSize: "13px",
                lineHeight: "1.65",
                fontFamily: "var(--font-mono)",
              }}
            >
              {children}
            </pre>
          </div>
        </div>
      );
    },

    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: "3px solid var(--color-accent)",
          margin: "1.25rem 0",
          padding: "0.75rem 1rem",
          background: "var(--color-accent-dim)",
          borderRadius: "0 8px 8px 0",
        }}
      >
        <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
          {children}
        </div>
      </blockquote>
    ),

    ul: ({ children }) => (
      <ul
        style={{
          paddingLeft: "1.25rem",
          marginBottom: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem",
          listStyleType: "disc",
        }}
      >
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      <ol
        style={{
          paddingLeft: "1.25rem",
          marginBottom: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem",
          listStyleType: "decimal",
        }}
      >
        {children}
      </ol>
    ),

    li: ({ children }) => (
      <li
        style={{
          color: "var(--color-text-secondary)",
          fontSize: "0.95rem",
          lineHeight: 1.7,
          paddingLeft: "0.25rem",
        }}
      >
        {children}
      </li>
    ),

    table: ({ children }) => (
      <div
        className="my-5 overflow-x-auto rounded-xl border"
        style={{ borderColor: "var(--color-border)" }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          {children}
        </table>
      </div>
    ),

    thead: ({ children }) => (
      <thead style={{ background: "var(--color-surface-2)" }}>{children}</thead>
    ),

    th: ({ children }) => (
      <th
        style={{
          padding: "0.6rem 1rem",
          textAlign: "left",
          fontSize: "0.78rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--color-text-muted)",
          borderBottom: "1px solid var(--color-border)",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </th>
    ),

    td: ({ children }) => (
      <td
        style={{
          padding: "0.6rem 1rem",
          fontSize: "0.9rem",
          color: "var(--color-text-secondary)",
          borderBottom: "1px solid var(--color-border)",
          verticalAlign: "top",
        }}
      >
        {children}
      </td>
    ),

    tr: ({ children }) => (
      <tr className="transition-colors hover:bg-[var(--color-surface)]">
        {children}
      </tr>
    ),

    hr: () => (
      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--color-border)",
          margin: "2rem 0",
        }}
      />
    ),

    a: ({ href, children }) => (
      <a
        href={href}
        style={{
          color: "var(--color-accent)",
          textDecoration: "none",
          borderBottom: "1px solid rgba(108,99,255,0.35)",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor =
            "var(--color-accent)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor =
            "rgba(108,99,255,0.35)";
        }}
      >
        {children}
      </a>
    ),

    strong: ({ children }) => (
      <strong style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>
        {children}
      </strong>
    ),

    em: ({ children }) => (
      <em style={{ color: "var(--color-text-secondary)", fontStyle: "italic" }}>
        {children}
      </em>
    ),
  };
}

// ─── MarkdownRenderer ─────────────────────────────────────────────────────────
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const components = buildComponents();

  return (
    <article style={{ maxWidth: "72ch", width: "100%" }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeHighlight, { detect: true }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}

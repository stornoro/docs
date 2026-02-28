import { createHighlighter, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: ["bash", "json", "javascript", "typescript", "php", "html", "css", "xml", "yaml", "shell"],
    });
  }
  return highlighterPromise;
}

export async function highlight(code: string, lang: string): Promise<string> {
  const highlighter = await getHighlighter();
  const validLangs = highlighter.getLoadedLanguages();

  // Normalize language aliases
  const langMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    sh: "bash",
    zsh: "bash",
    curl: "bash",
  };
  const resolvedLang = langMap[lang] || lang;
  const finalLang = validLangs.includes(resolvedLang) ? resolvedLang : "text";

  try {
    return highlighter.codeToHtml(code, {
      lang: finalLang,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    });
  } catch {
    return highlighter.codeToHtml(code, {
      lang: "text",
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    });
  }
}

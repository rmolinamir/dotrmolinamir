import { readFileSync } from "node:fs";
import { XMLParser } from "fast-xml-parser";
import { strFromU8, unzipSync } from "fflate";

function textNodes(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(textNodes);
  if (value === null || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) =>
    key === "#text" && typeof child === "string" ? [child] : textNodes(child),
  );
}

function normalize(value: string): string {
  // Ignore list markers, layout whitespace, and discretionary soft hyphens.
  return value.replace(/[\s\u2022\u25cf\u00ad]+/gu, "");
}

type PdfToolRunner = (command: string, args: readonly string[]) => string;

export function verifyResume(
  source: string,
  pdf: string,
  runTool: PdfToolRunner,
): void {
  if (readFileSync(pdf).subarray(0, 5).toString() !== "%PDF-") {
    throw new Error("Conversion did not produce a PDF.");
  }
  const archive = unzipSync(readFileSync(source), {
    filter: (file) => file.name === "word/document.xml",
  });
  const document = archive["word/document.xml"];
  if (!document) throw new Error("The DOCX is missing word/document.xml.");
  const parser = new XMLParser({
    parseTagValue: false,
    preserveOrder: true,
    trimValues: false,
  });
  const sourceText = textNodes(parser.parse(strFromU8(document), true)).join(
    " ",
  );
  const text = runTool("pdftotext", ["-layout", "-enc", "UTF-8", pdf, "-"]);
  if (!text.trim() || normalize(sourceText) !== normalize(text)) {
    throw new Error(
      "PDF text differs from the DOCX. Check missing text and reading order.",
    );
  }
  const info = runTool("pdfinfo", [pdf]);
  const pages = /^Pages:\s+(\d+)/m.exec(info);
  if (pages?.[1] !== "2") {
    throw new Error(
      "Expected a two-page resume. Inspect the layout before publishing.",
    );
  }
  const fonts = runTool("pdffonts", [pdf]);
  if (!/\bGaramond\s/.test(fonts) || !/\bGaramond-Bold\s/.test(fonts)) {
    throw new Error(
      "The PDF is missing the original Garamond fonts. Check font substitution before publishing.",
    );
  }
  console.info(
    "Verified: two pages, selectable text, and matching DOCX/PDF reading order.",
  );
}

import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

const SUPERSCRIPT_DIGITS = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
};

function stripInlineMarkdown(text) {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(^|[\s(])\*([^*\n]+?)\*(?=[\s.,;:)!?]|$)/g, "$1$2")
    .replace(/(^|[\s(])_([^_\n]+?)_(?=[\s.,;:)!?]|$)/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeCommonAsciiEntities(input) {
  return input
    .replace(/&rarr;|&#8594;|&#x2192;/gi, " -> ")
    .replace(/&rArr;|&#8658;|&#x21D2;/gi, " -> ")
    .replace(/&times;|&#215;|&#x00D7;/gi, "x");
}

function sanitizePdfText(value) {
  const source = decodeCommonAsciiEntities(String(value ?? ""));
  let out = "";
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (SUPERSCRIPT_DIGITS[ch]) {
      let digits = "";
      while (i < source.length && SUPERSCRIPT_DIGITS[source[i]]) {
        digits += SUPERSCRIPT_DIGITS[source[i]];
        i++;
      }
      i--;
      const prev = out[out.length - 1] || "";
      out += prev === "^" || !/[0-9A-Za-z)]/.test(prev) ? digits : `^${digits}`;
      continue;
    }
    out += ch;
  }

  return out
    .replace(/[\u2190-\u21FF\u2700-\u27BF\u27F0-\u27FF\u2900-\u297F]/g, " -> ")
    .replace(/[×✕✖⨯]/g, "x")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u00B7\u2022]/g, "-")
    .replace(/\s+->\s+/g, " -> ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

/** Sole entry for PDF-safe text; only called from wrapTextByWidth. */
function preparePdfTextForWrap(value) {
  return sanitizePdfText(value).replace(/\S{38,}/g, (word) =>
    word.match(/.{1,28}/g).join(" "),
  );
}

function getPageNumber(doc) {
  if (typeof doc.getCurrentPageInfo === "function") {
    return doc.getCurrentPageInfo().pageNumber;
  }
  return doc.internal.getNumberOfPages();
}

/**
 * Render generated Annex XI markdown into a jsPDF document.
 * @param {object} options
 * @param {import("jspdf").jsPDF} options.doc
 * @param {string} options.generatedDocument
 * @param {string} [options.modelName]
 * @param {string|null} [options.documentReference]
 * @param {string|null} [options.saveFilename] When set, saves the PDF to disk.
 * @param {(entry: { page: number, text: string, x: number, width: number, rightEdge: number }) => void} [options.auditTextDraw]
 */
export function renderAnnexXiPdf({
  doc,
  generatedDocument,
  modelName = "",
  documentReference = null,
  saveFilename = null,
  auditTextDraw = null,
}) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 56;
  const marginTop = 64;
  const marginBottom = 60;
  const contentWidth = pageWidth - marginX * 2;
  const rightEdge = pageWidth - marginX;

  const COLOR_TEXT = [20, 20, 20];
  const COLOR_MUTED = [110, 110, 110];
  const COLOR_RULE = [200, 200, 200];
  const COLOR_TABLE_RULE = [160, 160, 160];
  const COLOR_TABLE_HEADER_BG = [238, 238, 238];

  let y = marginTop;

  if (auditTextDraw) {
    const originalText = doc.text.bind(doc);
    doc.text = function auditedText(text, x, yPos, options) {
      const str = String(text ?? "");
      const width = doc.getTextWidth(str);
      const align = options?.align;
      const textLeft =
        align === "right" ? x - width : align === "center" ? x - width / 2 : x;
      auditTextDraw({
        page: getPageNumber(doc),
        text: str,
        x: textLeft,
        width,
        rightEdge,
      });
      return originalText(text, x, yPos, options);
    };
  }

  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
  };

  const resetFlowState = () => {
    doc.setLineWidth(1);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLOR_TEXT);
  };

  const wrapTextByWidth = (rawText, maxWidth) => {
    const text = preparePdfTextForWrap(rawText);
    const paragraphs = text.replace(/\r\n/g, "\n").split("\n");
    const wrapped = [];

    for (const paragraph of paragraphs) {
      const line = paragraph.trim();
      if (!line) {
        wrapped.push("");
        continue;
      }

      const words = line.split(/\s+/).filter(Boolean);
      let current = "";

      const flushCurrent = () => {
        if (current) {
          wrapped.push(current);
          current = "";
        }
      };

      const pushLongWord = (word) => {
        let chunk = "";
        for (const ch of word) {
          const candidate = chunk + ch;
          if (doc.getTextWidth(candidate) <= maxWidth || !chunk) {
            chunk = candidate;
          } else {
            wrapped.push(chunk);
            chunk = ch;
          }
        }
        if (chunk) wrapped.push(chunk);
      };

      for (const word of words) {
        if (doc.getTextWidth(word) > maxWidth) {
          flushCurrent();
          pushLongWord(word);
          continue;
        }

        const candidate = current ? `${current} ${word}` : word;
        if (doc.getTextWidth(candidate) <= maxWidth || !current) {
          current = candidate;
        } else {
          wrapped.push(current);
          current = word;
        }
      }

      flushCurrent();
    }

    return wrapped.length ? wrapped : [""];
  };

  const renderInlineTokensToText = (tokens) => {
    if (!tokens || !tokens.length) return "";
    return tokens
      .map((t) => {
        if (typeof t.text === "string") return t.text;
        if (t.tokens) return renderInlineTokensToText(t.tokens);
        return "";
      })
      .join("");
  };

  const tokenText = (tok) => {
    if (tok.tokens && tok.tokens.length) {
      return stripInlineMarkdown(renderInlineTokensToText(tok.tokens));
    }
    return stripInlineMarkdown(tok.text ?? "");
  };

  const drawPdfLines = (rawText, { size, style, color, indent = 0, lineMul = 1.4 }) => {
    const maxWidth = contentWidth - indent;
    const lineHeight = size * lineMul;
    resetFlowState();
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const wrapped = wrapTextByWidth(rawText, maxWidth);
    for (const w of wrapped) {
      ensureSpace(lineHeight);
      if (w) doc.text(w, marginX + indent, y);
      y += lineHeight;
    }
  };

  const drawText = (text, opts) => drawPdfLines(text, opts);

  drawPdfLines("Annex XI — Technical Documentation", {
    size: 18,
    style: "bold",
    color: COLOR_TEXT,
    lineMul: 1.2,
  });

  const subtitle = `Regulation (EU) 2024/1689 · Article 53(1)(a)${
    modelName ? ` · ${modelName}` : ""
  }`;
  drawPdfLines(subtitle, {
    size: 10,
    style: "normal",
    color: COLOR_MUTED,
    lineMul: 1.2,
  });

  if (documentReference) {
    drawPdfLines(`Document reference: ${documentReference}`, {
      size: 9,
      style: "normal",
      color: COLOR_MUTED,
      lineMul: 1.2,
    });
  }

  doc.setDrawColor(...COLOR_RULE);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 18;

  const renderListItems = (items, depth, ordered) => {
    items.forEach((item, idx) => {
      const bullet = ordered ? `${idx + 1}.` : "-";
      const indent = 14 + depth * 14;
      const baseText = tokenText(item);
      if (baseText) {
        const lineHeight = 11 * 1.4;
        ensureSpace(lineHeight);
        resetFlowState();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...COLOR_TEXT);
        doc.text(bullet, marginX + indent - 12, y);
        const wrapped = wrapTextByWidth(baseText, contentWidth - indent);
        for (const w of wrapped) {
          ensureSpace(lineHeight);
          if (w) doc.text(w, marginX + indent, y);
          y += lineHeight;
        }
      }
      if (item.tokens) {
        for (const sub of item.tokens) {
          if (sub.type === "list") {
            renderListItems(sub.items, depth + 1, !!sub.ordered);
          }
        }
      }
      y += 2;
    });
  };

  const renderTable = (tok) => {
    const headers = tok.header.map((h) => tokenText(h));
    const rows = tok.rows.map((r) => r.map((c) => tokenText(c)));
    const cols = headers.length || (rows[0] ? rows[0].length : 0);
    if (!cols) return;
    const colWidths =
      cols === 2
        ? [contentWidth * 0.35, contentWidth * 0.65]
        : Array.from({ length: cols }, () => contentWidth / cols);
    const padX = 6;
    const padY = 6;
    const fontSize = 9.5;
    const lineMul = 1.35;

    const renderRow = (cells, bold) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(fontSize);
      doc.setTextColor(...COLOR_TEXT);
      const wrappedCells = cells.map((c, i) =>
        wrapTextByWidth(c, colWidths[i] - padX * 2),
      );
      const maxLines = Math.max(1, ...wrappedCells.map((w) => w.length));
      const rowHeight = maxLines * fontSize * lineMul + padY * 2;
      ensureSpace(rowHeight + 2);
      const rowTop = y;
      doc.setDrawColor(...COLOR_TABLE_RULE);
      doc.setLineWidth(0.6);
      let xLeft = marginX;
      for (let i = 0; i < cols; i++) {
        const colWidth = colWidths[i];
        if (bold) {
          doc.setFillColor(...COLOR_TABLE_HEADER_BG);
          doc.rect(xLeft, rowTop, colWidth, rowHeight, "FD");
        } else {
          doc.rect(xLeft, rowTop, colWidth, rowHeight);
        }
        const lines = wrappedCells[i] || [];
        let cellY = rowTop + padY + fontSize;
        for (const line of lines) {
          doc.text(line, xLeft + padX, cellY);
          cellY += fontSize * lineMul;
        }
        xLeft += colWidth;
      }
      y = rowTop + rowHeight + 2;
    };

    if (headers.length) renderRow(headers, true);
    rows.forEach((r) => renderRow(r, false));
    resetFlowState();
    doc.setFontSize(11);
    y += 6;
  };

  const renderTokens = (tokens) => {
    for (const tok of tokens) {
      switch (tok.type) {
        case "space":
          y += 4;
          break;
        case "hr":
          ensureSpace(16);
          y += 4;
          doc.setDrawColor(...COLOR_RULE);
          doc.line(marginX, y, pageWidth - marginX, y);
          y += 14;
          break;
        case "heading": {
          const sizes = { 1: 17, 2: 14.5, 3: 12.5, 4: 11.5, 5: 11, 6: 11 };
          const size = sizes[tok.depth] || 11;
          const leading = tok.depth === 1 ? 12 : tok.depth === 2 ? 10 : 6;
          ensureSpace(leading + size + 6);
          y += leading;
          drawText(tokenText(tok), {
            size,
            style: "bold",
            color: COLOR_TEXT,
            lineMul: 1.3,
          });
          y += 4;
          break;
        }
        case "blockquote": {
          const innerStartY = y;
          const inner = tok.tokens
            ? renderInlineTokensToText(tok.tokens)
            : tok.text || "";
          drawText(stripInlineMarkdown(inner), {
            size: 11,
            style: "italic",
            color: COLOR_MUTED,
            indent: 14,
          });
          const lineEndY = y;
          doc.setDrawColor(180, 180, 180);
          doc.setLineWidth(2);
          doc.line(marginX, innerStartY - 8, marginX, lineEndY - 4);
          doc.setLineWidth(1);
          y += 6;
          break;
        }
        case "list":
          renderListItems(tok.items, 0, !!tok.ordered);
          y += 4;
          break;
        case "table":
          renderTable(tok);
          break;
        case "code":
          drawText(tok.text || "", {
            size: 9.5,
            style: "normal",
            color: COLOR_MUTED,
            indent: 8,
            lineMul: 1.3,
          });
          y += 6;
          break;
        case "paragraph":
          drawText(tokenText(tok), {
            size: 11,
            style: "normal",
            color: COLOR_TEXT,
          });
          y += 6;
          break;
        case "html": {
          const txt = stripInlineMarkdown((tok.text || "").replace(/<[^>]+>/g, ""));
          if (txt) {
            drawText(txt, { size: 11, style: "normal", color: COLOR_TEXT });
            y += 6;
          }
          break;
        }
        default: {
          const fallback = stripInlineMarkdown(tok.raw || tok.text || "");
          if (fallback) {
            drawText(fallback, { size: 11, style: "normal", color: COLOR_TEXT });
            y += 6;
          }
        }
      }
    }
  };

  const tokens = marked.lexer(generatedDocument);
  renderTokens(tokens);

  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    const footerWrapped = wrapTextByWidth(
      "Generated by JurisAI · Regulation (EU) 2024/1689",
      contentWidth,
    );
    doc.text(footerWrapped[0] || "", marginX, pageHeight - 28);
    doc.text(
      `Page ${p} of ${totalPages}`,
      pageWidth - marginX,
      pageHeight - 28,
      { align: "right" },
    );
  }

  if (saveFilename) {
    doc.save(saveFilename);
  }

  return { pageCount: totalPages, rightEdge };
}

export const PDF_NON_ASCII_PATTERN = /[^\x09\x0A\x0D\x20-\x7E]/;

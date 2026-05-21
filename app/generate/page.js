"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

const STEPS = [
  { id: 1, title: "Model Identity", short: "Identity" },
  { id: 2, title: "Architecture", short: "Architecture" },
  { id: 3, title: "Training Process", short: "Training" },
  { id: 4, title: "Training Data", short: "Data" },
  { id: 5, title: "Evaluation", short: "Evaluation" },
  { id: 6, title: "Intended Purpose", short: "Purpose" },
];

const FORM_STEP_COUNT = STEPS.length;
const RESULT_STEP = 7;

const MODALITIES = [
  { key: "text", label: "Text" },
  { key: "image", label: "Image" },
  { key: "audio", label: "Audio" },
  { key: "video", label: "Video" },
  { key: "code", label: "Code" },
];

const INTENDED_USE_CATEGORIES = [
  "Text generation",
  "Code generation",
  "Conversational AI",
  "Question answering",
  "Summarization",
  "Translation",
  "Classification",
  "Information retrieval",
  "Content moderation",
  "Creative writing",
  "Embedding generation",
  "Domain-specific applications",
];

const PROHIBITED_USE_CATEGORIES = [
  "Subliminal manipulation",
  "Exploitation of vulnerabilities",
  "Social scoring by public authorities",
  "Real-time remote biometric ID",
  "Predictive policing",
  "Emotion recognition in workplace/education",
  "Biometric categorisation inferring protected characteristics",
  "Untargeted facial scraping",
  "Medical diagnosis without clinical oversight",
  "Legal advice without legal supervision",
  "Autonomous weapons",
  "CSAM/non-consensual imagery",
];

const ANNEX_III_CATEGORIES = [
  "Biometric ID",
  "Critical infrastructure",
  "Education/vocational training",
  "Employment/workers management",
  "Essential services access",
  "Law enforcement",
  "Migration/asylum/border",
  "Justice/democratic processes",
];

const EU_MEMBER_STATES = [
  "Austria",
  "Belgium",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Poland",
  "Portugal",
  "Romania",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
];

const WORLD_COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

const initialForm = {
  modelName: "",
  providerName: "",
  providerLegalIdentity: {
    legalForm: "",
    registeredAddress: "",
    countryOfEstablishment: "",
    companyRegistrationNumber: "",
    vatNumber: "",
    complianceContactName: "",
    complianceContactRole: "",
    complianceContactEmail: "",
    authorisedRepresentative: {
      name: "",
      address: "",
      contactEmail: "",
    },
  },
  versionNumber: "",
  releaseDate: "",
  modelArchitecture: "",
  numberOfParameters: "",
  modalities: { text: false, image: false, audio: false, video: false, code: false },
  preTrainingDescription: "",
  fineTuningDescription: "",
  alignmentTechniques: "",
  totalFlopsEstimate: "",
  dataSources: "",
  dataCollectionMethod: "",
  filteringPreprocessing: "",
  humanVsSyntheticRatio: "",
  benchmarksUsed: "",
  evaluationResultsSummary: "",
  knownLimitations: "",
  intendedUseCases: {
    selectedCategories: [],
    customDescription: "",
  },
  prohibitedUseCases: {
    selectedCategories: [],
    customDescription: "",
  },
  highRiskClassification: {
    isHighRisk: false,
    applicableCategories: [],
    justifications: {},
    notHighRiskJustification: "",
  },
};

const REFERENCE_PATTERNS = [
  /document\s+reference(?:\s+number)?\s*[:\-]\s*\*?\*?\s*([A-Z0-9][A-Z0-9._\-\/]{3,})/i,
  /reference\s+number\s*[:\-]\s*\*?\*?\s*([A-Z0-9][A-Z0-9._\-\/]{3,})/i,
  /document\s+(?:id|no\.?|number)\s*[:\-]\s*\*?\*?\s*([A-Z0-9][A-Z0-9._\-\/]{3,})/i,
  /\bref\.?\s*(?:no\.?|number)?\s*[:\-]\s*\*?\*?\s*([A-Z0-9][A-Z0-9._\-\/]{3,})/i,
];

function extractReferenceNumber(text) {
  if (!text) return null;
  for (const pattern of REFERENCE_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].replace(/[*\s]+$/g, "");
  }
  return null;
}

function sanitizeFilename(name) {
  return (
    (name || "")
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80) || "document"
  );
}

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

const mono = "font-mono-legal";

const labelClass = `${mono} block text-[10px] uppercase tracking-[0.12em] text-[#444444]`;
const sectionTitleClass = `${mono} text-[10px] uppercase tracking-[0.12em] text-[#888888]`;
const sectionDivider = { borderBottom: "1px solid #1A1A1A" };

const inputClass =
  "mt-2 w-full rounded-none border border-[#222222] bg-[#0A0A0A] px-[14px] py-[10px] text-[14px] font-normal text-[#FFFFFF] outline-none placeholder:text-[#333333] focus:border-[#FFFFFF] transition-colors";

const fieldCol = "flex flex-col gap-5";

export default function GeneratePage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [generatedDocument, setGeneratedDocument] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  const progressPercent = useMemo(() => {
    if (step >= RESULT_STEP) return 100;
    return (step / FORM_STEP_COUNT) * 100;
  }, [step]);

  const renderedHtml = useMemo(() => {
    if (!generatedDocument) return "";
    try {
      return marked.parse(generatedDocument);
    } catch {
      return "";
    }
  }, [generatedDocument]);

  const documentReference = useMemo(
    () => extractReferenceNumber(generatedDocument),
    [generatedDocument],
  );
  const isEUEstablished = EU_MEMBER_STATES.includes(
    form.providerLegalIdentity.countryOfEstablishment,
  );

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleModality(key) {
    setForm((prev) => ({
      ...prev,
      modalities: { ...prev.modalities, [key]: !prev.modalities[key] },
    }));
  }

  function setLegalIdentityField(field, value) {
    setForm((prev) => ({
      ...prev,
      providerLegalIdentity: {
        ...prev.providerLegalIdentity,
        [field]: value,
      },
    }));
  }

  function setCountryOfEstablishment(value) {
    setForm((prev) => ({
      ...prev,
      providerLegalIdentity: {
        ...prev.providerLegalIdentity,
        countryOfEstablishment: value,
        authorisedRepresentative: EU_MEMBER_STATES.includes(value)
          ? {
              name: "",
              address: "",
              contactEmail: "",
            }
          : prev.providerLegalIdentity.authorisedRepresentative,
      },
    }));
  }

  function setAuthRepField(field, value) {
    setForm((prev) => ({
      ...prev,
      providerLegalIdentity: {
        ...prev.providerLegalIdentity,
        authorisedRepresentative: {
          ...prev.providerLegalIdentity.authorisedRepresentative,
          [field]: value,
        },
      },
    }));
  }

  function toggleUseCategory(group, category) {
    setForm((prev) => {
      const current = prev[group].selectedCategories;
      const next = current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category];
      return {
        ...prev,
        [group]: { ...prev[group], selectedCategories: next },
      };
    });
  }

  function setUseDescription(group, value) {
    setForm((prev) => ({
      ...prev,
      [group]: { ...prev[group], customDescription: value },
    }));
  }

  function setIsHighRisk(value) {
    setForm((prev) => ({
      ...prev,
      highRiskClassification: value
        ? {
            ...prev.highRiskClassification,
            isHighRisk: true,
            notHighRiskJustification: "",
          }
        : {
            ...prev.highRiskClassification,
            isHighRisk: false,
            applicableCategories: [],
            justifications: {},
          },
    }));
  }

  function toggleHighRiskCategory(category) {
    setForm((prev) => {
      const current = prev.highRiskClassification.applicableCategories;
      const isSelected = current.includes(category);
      const nextCategories = isSelected
        ? current.filter((c) => c !== category)
        : [...current, category];
      const nextJustifications = { ...prev.highRiskClassification.justifications };
      if (isSelected) {
        delete nextJustifications[category];
      }
      return {
        ...prev,
        highRiskClassification: {
          ...prev.highRiskClassification,
          applicableCategories: nextCategories,
          justifications: nextJustifications,
        },
      };
    });
  }

  function setHighRiskJustification(category, value) {
    setForm((prev) => ({
      ...prev,
      highRiskClassification: {
        ...prev.highRiskClassification,
        justifications: {
          ...prev.highRiskClassification.justifications,
          [category]: value,
        },
      },
    }));
  }

  function setNotHighRiskJustification(value) {
    setForm((prev) => ({
      ...prev,
      highRiskClassification: {
        ...prev.highRiskClassification,
        notHighRiskJustification: value,
      },
    }));
  }

  async function handleDownloadPdf() {
    if (!generatedDocument || downloadingPdf) return;
    setPdfError(null);
    setDownloadingPdf(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 56;
      const marginTop = 64;
      const marginBottom = 60;
      const contentWidth = pageWidth - marginX * 2;

      const COLOR_TEXT = [20, 20, 20];
      const COLOR_MUTED = [110, 110, 110];
      const COLOR_RULE = [200, 200, 200];
      const COLOR_TABLE_RULE = [220, 220, 220];

      let y = marginTop;

      const ensureSpace = (needed) => {
        if (y + needed > pageHeight - marginBottom) {
          doc.addPage();
          y = marginTop;
        }
      };

      const drawText = (text, { size, style, color, indent = 0, lineMul = 1.4 }) => {
        const wrapped = doc.splitTextToSize(text, contentWidth - indent);
        const lineHeight = size * lineMul;
        doc.setFont("helvetica", style);
        doc.setFontSize(size);
        doc.setTextColor(color[0], color[1], color[2]);
        for (const w of wrapped) {
          ensureSpace(lineHeight);
          doc.text(w, marginX + indent, y);
          y += lineHeight;
        }
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

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...COLOR_TEXT);
      doc.text("Annex XI — Technical Documentation", marginX, y);
      y += 22;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...COLOR_MUTED);
      const subtitle = `Regulation (EU) 2024/1689 · Article 53(1)(a)${
        form.modelName ? ` · ${form.modelName}` : ""
      }`;
      doc.text(subtitle, marginX, y);
      y += 12;

      if (documentReference) {
        doc.setFontSize(9);
        doc.text(`Document reference: ${documentReference}`, marginX, y);
        y += 8;
      }

      doc.setDrawColor(...COLOR_RULE);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 18;

      const renderListItems = (items, depth, ordered) => {
        items.forEach((item, idx) => {
          const bullet = ordered ? `${idx + 1}.` : "•";
          const indent = 14 + depth * 14;
          const baseText = tokenText(item);
          if (baseText) {
            const lineHeight = 11 * 1.4;
            ensureSpace(lineHeight);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(...COLOR_TEXT);
            doc.text(bullet, marginX + indent - 12, y);
            const wrapped = doc.splitTextToSize(baseText, contentWidth - indent);
            for (const w of wrapped) {
              ensureSpace(lineHeight);
              doc.text(w, marginX + indent, y);
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
        const colWidth = contentWidth / cols;
        const pad = 5;
        const fontSize = 10;
        const lineMul = 1.35;

        const renderRow = (cells, bold) => {
          doc.setFont("helvetica", bold ? "bold" : "normal");
          doc.setFontSize(fontSize);
          doc.setTextColor(...COLOR_TEXT);
          const wrappedCells = cells.map((c) =>
            doc.splitTextToSize(c, colWidth - pad * 2),
          );
          const maxLines = Math.max(1, ...wrappedCells.map((w) => w.length));
          const rowHeight = maxLines * fontSize * lineMul + pad * 2;
          ensureSpace(rowHeight + 2);
          const rowTop = y - fontSize;
          doc.setDrawColor(...COLOR_TABLE_RULE);
          for (let i = 0; i < cols; i++) {
            const xLeft = marginX + i * colWidth;
            doc.rect(xLeft, rowTop, colWidth, rowHeight);
            const lines = wrappedCells[i] || [];
            let cellY = rowTop + pad + fontSize;
            for (const line of lines) {
              doc.text(line, xLeft + pad, cellY);
              cellY += fontSize * lineMul;
            }
          }
          y = rowTop + rowHeight + 2;
        };

        if (headers.length) renderRow(headers, true);
        rows.forEach((r) => renderRow(r, false));
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
        doc.text(
          "Generated by JurisAI · Regulation (EU) 2024/1689",
          marginX,
          pageHeight - 28,
        );
        doc.text(
          `Page ${p} of ${totalPages}`,
          pageWidth - marginX,
          pageHeight - 28,
          { align: "right" },
        );
      }

      const baseName = documentReference
        ? documentReference
        : `Annex_XI_${form.modelName || "model"}`;
      doc.save(`${sanitizeFilename(baseName)}.pdf`);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (step !== FORM_STEP_COUNT) return;

    setGenerateError(null);
    setGenerateLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Generation failed",
        );
      }
      if (typeof data.document !== "string") {
        throw new Error("Invalid response from server");
      }
      setGeneratedDocument(data.document);
      setStep(RESULT_STEP);
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setGenerateLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FFFFFF]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .juris-check {
            appearance: none;
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            border: 1px solid #222222;
            background: #0A0A0A;
            position: relative;
            cursor: pointer;
            display: inline-block;
            transition: border-color 0.15s ease, background-color 0.15s ease;
            flex-shrink: 0;
          }
          .juris-check:hover { border-color: #444444; }
          .juris-check:checked { background: #FFFFFF; border-color: #FFFFFF; }
          .juris-check:checked::after {
            content: "";
            position: absolute;
            left: 4px;
            top: 1px;
            width: 5px;
            height: 9px;
            border-right: 1.6px solid #000000;
            border-bottom: 1.6px solid #000000;
            transform: rotate(45deg);
          }
          .juris-radio {
            appearance: none;
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            border: 1px solid #222222;
            background: #0A0A0A;
            border-radius: 50%;
            position: relative;
            cursor: pointer;
            display: inline-block;
            transition: border-color 0.15s ease, background-color 0.15s ease;
            flex-shrink: 0;
          }
          .juris-radio:hover { border-color: #444444; }
          .juris-radio:checked { background: #FFFFFF; border-color: #FFFFFF; }
          .juris-radio:checked::after {
            content: "";
            position: absolute;
            left: 4px;
            top: 4px;
            width: 6px;
            height: 6px;
            background: #000000;
            border-radius: 50%;
          }
          .juris-doc { color: #888888; font-size: 14px; line-height: 1.7; font-family: inherit; word-wrap: break-word; }
          .juris-doc > *:first-child { margin-top: 0; }
          .juris-doc h1 { color: #FFFFFF; font-size: 22px; font-weight: 600; line-height: 1.3; margin: 28px 0 12px; }
          .juris-doc h2 { color: #FFFFFF; font-size: 18px; font-weight: 600; line-height: 1.3; margin: 24px 0 10px; }
          .juris-doc h3 { color: #FFFFFF; font-size: 16px; font-weight: 600; line-height: 1.4; margin: 20px 0 8px; }
          .juris-doc h4, .juris-doc h5, .juris-doc h6 { color: #FFFFFF; font-size: 14px; font-weight: 600; margin: 18px 0 8px; }
          .juris-doc p { margin: 0 0 16px 0; }
          .juris-doc strong, .juris-doc b { color: #FFFFFF; font-weight: 600; }
          .juris-doc em, .juris-doc i { font-style: italic; color: #888888; }
          .juris-doc hr { border: 0; border-top: 1px solid #222222; margin: 24px 0; height: 0; }
          .juris-doc ul, .juris-doc ol { margin: 0 0 16px 0; padding-left: 22px; }
          .juris-doc li { margin-bottom: 6px; }
          .juris-doc li > p { margin: 0 0 6px 0; }
          .juris-doc blockquote { border-left: 3px solid #222222; margin: 16px 0; padding: 4px 14px; color: #666666; font-style: italic; }
          .juris-doc blockquote p { margin: 6px 0; }
          .juris-doc code { background: #1A1A1A; padding: 2px 6px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; color: #FFFFFF; }
          .juris-doc pre { background: #1A1A1A; padding: 12px 14px; overflow-x: auto; margin: 16px 0; border: 1px solid #222222; }
          .juris-doc pre code { background: transparent; padding: 0; font-size: 12.5px; color: #FFFFFF; }
          .juris-doc a { color: #FFFFFF; text-decoration: underline; }
          .juris-doc table { width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #222222; background: #1A1A1A; }
          .juris-doc thead { background: #111111; }
          .juris-doc th, .juris-doc td { border: 1px solid #222222; padding: 8px 12px; text-align: left; font-size: 13px; vertical-align: top; color: #888888; }
          .juris-doc th { font-weight: 600; color: #FFFFFF; }
        `,
        }}
      />

      <div className="mx-auto max-w-[720px] px-[24px] py-[48px]">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col border border-[#222222] bg-[#111111] p-8"
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-[13px] font-bold tracking-[0.14em] text-[#FFFFFF]">
              JURIS<span className="text-[#FFFFFF]">AI</span>
            </Link>
            <span className={`${mono} text-[10px] uppercase tracking-[0.12em] text-[#444444]`}>
              Annex XI · Article 53(1)(a)
            </span>
          </div>

          <hr
            className="mt-4 h-0 border-0 border-t border-[#1A1A1A] p-0"
            aria-hidden
          />

          <h1 className="mt-6 text-[24px] font-semibold leading-tight text-[#FFFFFF]">
            Annex XI document generator
          </h1>
          <p className="mt-3 text-[13px] leading-[1.7] text-[#888888] mb-6">
            Structured technical documentation required under Article 53(1)(a)
            of Regulation (EU) 2024/1689 — complete each section to generate
            your Annex XI compliance record.
          </p>

          {/* Tabs */}
          {step < RESULT_STEP ? (
            <nav className="flex w-full" aria-label="Form steps" role="tablist">
              {STEPS.map((s) => {
                const active = s.id === step;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    disabled={generateLoading}
                    onClick={() => {
                      if (!generateLoading) setStep(s.id);
                    }}
                    className={`${mono} flex-1 pb-2.5 text-center text-[10px] uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-50`}
                    style={{
                      color: active ? "#FFFFFF" : "#444444",
                      borderBottom: active
                        ? "1px solid #FFFFFF"
                        : "1px solid transparent",
                    }}
                  >
                    {s.short}
                  </button>
                );
              })}
            </nav>
          ) : (
            <div
              className={`${mono} border-b border-[#FFFFFF] pb-2.5 text-center text-[10px] uppercase tracking-[0.12em] text-[#FFFFFF]`}
              role="status"
            >
              Output
            </div>
          )}

          {/* Progress bar */}
          <div
            className="mt-4 h-px w-full overflow-hidden bg-[#222222]"
            role="progressbar"
            aria-valuenow={step >= RESULT_STEP ? RESULT_STEP : step}
            aria-valuemin={1}
            aria-valuemax={RESULT_STEP}
            aria-label="Form progress"
          >
            <div
              className="h-px bg-[#FFFFFF] transition-[width] duration-200 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className={`${mono} mt-3 text-[10px] uppercase tracking-[0.12em] text-[#444444]`}>
            <span>
              {String(step >= RESULT_STEP ? RESULT_STEP : step).padStart(2, "0")}
              {" / "}
              {String(RESULT_STEP).padStart(2, "0")}
            </span>
            <span className="ml-2 text-[#666666]">
              ·{" "}
              {step >= RESULT_STEP
                ? "Generated document"
                : STEPS[step - 1].title}
            </span>
          </p>

          <div className="mt-6 flex flex-1 flex-col">
            {step === 1 && (
              <div className={fieldCol}>
                <div className="pb-3" style={sectionDivider}>
                  <h2 className={sectionTitleClass}>Model identity</h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="modelName" className={labelClass}>Model name</label>
                    <input
                      id="modelName"
                      type="text"
                      className={inputClass}
                      value={form.modelName}
                      onChange={(e) => updateField("modelName", e.target.value)}
                      placeholder="e.g. Juris-LM 7B"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="providerName" className={labelClass}>Provider name</label>
                    <input
                      id="providerName"
                      type="text"
                      className={inputClass}
                      value={form.providerName}
                      onChange={(e) => updateField("providerName", e.target.value)}
                      placeholder="Legal entity or product owner"
                    />
                  </div>
                  <div className="sm:col-span-2 border-t border-[#1A1A1A] pt-5">
                    <h3 className={`${mono} text-[11px] uppercase tracking-[0.12em] text-[#FFFFFF]`}>
                      Provider Legal Identity
                    </h3>
                    <p className="mt-2 text-[13px] leading-[1.7] text-[#888888]">
                      The legal entity name is captured above in Provider name.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="legalForm" className={labelClass}>Legal form</label>
                    <input
                      id="legalForm"
                      type="text"
                      className={inputClass}
                      value={form.providerLegalIdentity.legalForm}
                      onChange={(e) => setLegalIdentityField("legalForm", e.target.value)}
                      placeholder="e.g. Private Limited, GmbH, S.A.S."
                    />
                  </div>
                  <div>
                    <label htmlFor="countryOfEstablishment" className={labelClass}>Country of establishment</label>
                    <select
                      id="countryOfEstablishment"
                      className={inputClass}
                      required
                      value={form.providerLegalIdentity.countryOfEstablishment}
                      onChange={(e) => setCountryOfEstablishment(e.target.value)}
                    >
                      <option value="">Select country</option>
                      {WORLD_COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="registeredAddress" className={labelClass}>Registered address</label>
                    <textarea
                      id="registeredAddress"
                      rows={3}
                      className={`${inputClass} min-h-[88px] resize-y`}
                      value={form.providerLegalIdentity.registeredAddress}
                      onChange={(e) => setLegalIdentityField("registeredAddress", e.target.value)}
                      placeholder="Registered office address"
                    />
                  </div>
                  <div>
                    <label htmlFor="companyRegistrationNumber" className={labelClass}>Company registration number</label>
                    <input
                      id="companyRegistrationNumber"
                      type="text"
                      className={inputClass}
                      value={form.providerLegalIdentity.companyRegistrationNumber}
                      onChange={(e) => setLegalIdentityField("companyRegistrationNumber", e.target.value)}
                      placeholder="Company registry number"
                    />
                  </div>
                  <div>
                    <label htmlFor="vatNumber" className={labelClass}>VAT number</label>
                    <input
                      id="vatNumber"
                      type="text"
                      className={inputClass}
                      value={form.providerLegalIdentity.vatNumber}
                      onChange={(e) => setLegalIdentityField("vatNumber", e.target.value)}
                      placeholder="VAT / tax registration number"
                    />
                  </div>
                  <div>
                    <label htmlFor="complianceContactName" className={labelClass}>Compliance contact name</label>
                    <input
                      id="complianceContactName"
                      type="text"
                      className={inputClass}
                      value={form.providerLegalIdentity.complianceContactName}
                      onChange={(e) => setLegalIdentityField("complianceContactName", e.target.value)}
                      placeholder="Named compliance owner"
                    />
                  </div>
                  <div>
                    <label htmlFor="complianceContactRole" className={labelClass}>Compliance contact role</label>
                    <input
                      id="complianceContactRole"
                      type="text"
                      className={inputClass}
                      value={form.providerLegalIdentity.complianceContactRole}
                      onChange={(e) => setLegalIdentityField("complianceContactRole", e.target.value)}
                      placeholder="e.g. Head of Compliance"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="complianceContactEmail" className={labelClass}>Compliance contact email</label>
                    <input
                      id="complianceContactEmail"
                      type="email"
                      className={inputClass}
                      value={form.providerLegalIdentity.complianceContactEmail}
                      onChange={(e) => setLegalIdentityField("complianceContactEmail", e.target.value)}
                      placeholder="compliance@example.com"
                    />
                  </div>
                  {form.providerLegalIdentity.countryOfEstablishment &&
                    !isEUEstablished && (
                    <>
                      <div className="sm:col-span-2 border-t border-[#1A1A1A] pt-5">
                        <h3 className={`${mono} text-[11px] uppercase tracking-[0.12em] text-[#FFFFFF]`}>
                          Authorised Representative
                        </h3>
                        <p className="mt-2 text-[13px] leading-[1.7] text-[#888888]">
                          Required for non-EU GPAI providers under Article 54.
                        </p>
                      </div>
                      <div>
                        <label htmlFor="authRepName" className={labelClass}>Representative name</label>
                        <input
                          id="authRepName"
                          type="text"
                          className={inputClass}
                          value={form.providerLegalIdentity.authorisedRepresentative.name}
                          onChange={(e) => setAuthRepField("name", e.target.value)}
                          placeholder="EU authorised representative"
                        />
                      </div>
                      <div>
                        <label htmlFor="authRepContactEmail" className={labelClass}>Representative contact email</label>
                        <input
                          id="authRepContactEmail"
                          type="email"
                          className={inputClass}
                          value={form.providerLegalIdentity.authorisedRepresentative.contactEmail}
                          onChange={(e) => setAuthRepField("contactEmail", e.target.value)}
                          placeholder="representative@example.eu"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="authRepAddress" className={labelClass}>Representative address</label>
                        <textarea
                          id="authRepAddress"
                          rows={3}
                          className={`${inputClass} min-h-[88px] resize-y`}
                          value={form.providerLegalIdentity.authorisedRepresentative.address}
                          onChange={(e) => setAuthRepField("address", e.target.value)}
                          placeholder="EU establishment address"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label htmlFor="versionNumber" className={labelClass}>Version number</label>
                    <input
                      id="versionNumber"
                      type="text"
                      className={inputClass}
                      value={form.versionNumber}
                      onChange={(e) => updateField("versionNumber", e.target.value)}
                      placeholder="e.g. 1.2.0"
                    />
                  </div>
                  <div>
                    <label htmlFor="releaseDate" className={labelClass}>Release date</label>
                    <input
                      id="releaseDate"
                      type="date"
                      className={inputClass}
                      value={form.releaseDate}
                      onChange={(e) => updateField("releaseDate", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={fieldCol}>
                <div className="pb-3" style={sectionDivider}>
                  <h2 className={sectionTitleClass}>Architecture</h2>
                </div>
                <div>
                  <label htmlFor="modelArchitecture" className={labelClass}>Model architecture</label>
                  <textarea
                    id="modelArchitecture"
                    rows={4}
                    className={`${inputClass} min-h-[100px] resize-y`}
                    value={form.modelArchitecture}
                    onChange={(e) => updateField("modelArchitecture", e.target.value)}
                    placeholder="Transformer variant, attention pattern, context length, etc."
                  />
                </div>
                <div>
                  <label htmlFor="numberOfParameters" className={labelClass}>Number of parameters</label>
                  <input
                    id="numberOfParameters"
                    type="text"
                    className={inputClass}
                    value={form.numberOfParameters}
                    onChange={(e) => updateField("numberOfParameters", e.target.value)}
                    placeholder="e.g. 7B (active), 70B total"
                  />
                </div>
                <fieldset className="min-w-0 border-0 p-0">
                  <legend className={labelClass}>Modalities</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {MODALITIES.map(({ key, label }) => {
                      const checked = !!form.modalities[key];
                      return (
                        <label
                          key={key}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-none border px-[14px] py-[10px] text-[14px] font-normal transition-colors ${
                            checked
                              ? "border-[#FFFFFF] bg-[#1A1A1A] text-[#FFFFFF]"
                              : "border-[#222222] bg-[#0A0A0A] text-[#888888] hover:border-[#444444]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleModality(key)}
                            className="juris-check"
                          />
                          {label}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </div>
            )}

            {step === 3 && (
              <div className={fieldCol}>
                <div className="pb-3" style={sectionDivider}>
                  <h2 className={sectionTitleClass}>Training process</h2>
                </div>
                <div>
                  <label htmlFor="preTraining" className={labelClass}>Pre-training description</label>
                  <textarea
                    id="preTraining"
                    rows={4}
                    className={`${inputClass} min-h-[100px] resize-y`}
                    value={form.preTrainingDescription}
                    onChange={(e) => updateField("preTrainingDescription", e.target.value)}
                    placeholder="Objectives, compute regime, curriculum, etc."
                  />
                </div>
                <div>
                  <label htmlFor="fineTuning" className={labelClass}>Fine-tuning description</label>
                  <textarea
                    id="fineTuning"
                    rows={4}
                    className={`${inputClass} min-h-[100px] resize-y`}
                    value={form.fineTuningDescription}
                    onChange={(e) => updateField("fineTuningDescription", e.target.value)}
                    placeholder="Supervised stages, domain adaptation, etc."
                  />
                </div>
                <div>
                  <label htmlFor="alignment" className={labelClass}>Alignment techniques (RLHF / DPO / other)</label>
                  <input
                    id="alignment"
                    type="text"
                    className={inputClass}
                    value={form.alignmentTechniques}
                    onChange={(e) => updateField("alignmentTechniques", e.target.value)}
                    placeholder="e.g. RLHF then DPO on preference data"
                  />
                </div>
                <div>
                  <label htmlFor="flops" className={labelClass}>Total FLOPs estimate</label>
                  <input
                    id="flops"
                    type="text"
                    className={inputClass}
                    value={form.totalFlopsEstimate}
                    onChange={(e) => updateField("totalFlopsEstimate", e.target.value)}
                    placeholder="e.g. ~2e24 training FLOPs (approximate)"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className={fieldCol}>
                <div className="pb-3" style={sectionDivider}>
                  <h2 className={sectionTitleClass}>Training data</h2>
                </div>
                <div>
                  <label htmlFor="dataSources" className={labelClass}>Data sources</label>
                  <textarea
                    id="dataSources"
                    rows={5}
                    className={`${inputClass} min-h-[120px] resize-y`}
                    value={form.dataSources}
                    onChange={(e) => updateField("dataSources", e.target.value)}
                    placeholder="Corpora, licensed sets, partner feeds, public web, etc."
                  />
                </div>
                <div>
                  <label htmlFor="collection" className={labelClass}>Data collection method</label>
                  <textarea
                    id="collection"
                    rows={3}
                    className={`${inputClass} min-h-[88px] resize-y`}
                    value={form.dataCollectionMethod}
                    onChange={(e) => updateField("dataCollectionMethod", e.target.value)}
                    placeholder="Crawling, licensing agreements, synthetic pipelines…"
                  />
                </div>
                <div>
                  <label htmlFor="filtering" className={labelClass}>Filtering and preprocessing applied</label>
                  <textarea
                    id="filtering"
                    rows={3}
                    className={`${inputClass} min-h-[88px] resize-y`}
                    value={form.filteringPreprocessing}
                    onChange={(e) => updateField("filteringPreprocessing", e.target.value)}
                    placeholder="PII filters, toxicity classifiers, deduplication…"
                  />
                </div>
                <div>
                  <label htmlFor="ratio" className={labelClass}>Human vs synthetic data ratio</label>
                  <input
                    id="ratio"
                    type="text"
                    className={inputClass}
                    value={form.humanVsSyntheticRatio}
                    onChange={(e) => updateField("humanVsSyntheticRatio", e.target.value)}
                    placeholder="e.g. 85% human-originated / 15% synthetic"
                  />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className={fieldCol}>
                <div className="pb-3" style={sectionDivider}>
                  <h2 className={sectionTitleClass}>Evaluation</h2>
                </div>
                <div>
                  <label htmlFor="benchmarks" className={labelClass}>Benchmarks used</label>
                  <textarea
                    id="benchmarks"
                    rows={3}
                    className={`${inputClass} min-h-[88px] resize-y`}
                    value={form.benchmarksUsed}
                    onChange={(e) => updateField("benchmarksUsed", e.target.value)}
                    placeholder="MMLU, HumanEval, domain legal benchmarks…"
                  />
                </div>
                <div>
                  <label htmlFor="evalSummary" className={labelClass}>Evaluation results summary</label>
                  <textarea
                    id="evalSummary"
                    rows={4}
                    className={`${inputClass} min-h-[100px] resize-y`}
                    value={form.evaluationResultsSummary}
                    onChange={(e) => updateField("evaluationResultsSummary", e.target.value)}
                    placeholder="Headline scores, confidence intervals, caveats…"
                  />
                </div>
                <div>
                  <label htmlFor="limitations" className={labelClass}>Known limitations</label>
                  <textarea
                    id="limitations"
                    rows={4}
                    className={`${inputClass} min-h-[100px] resize-y`}
                    value={form.knownLimitations}
                    onChange={(e) => updateField("knownLimitations", e.target.value)}
                    placeholder="Failure modes, coverage gaps, brittleness…"
                  />
                </div>
              </div>
            )}

            {step === 6 && (
              <div className={fieldCol}>
                <div className="pb-3" style={sectionDivider}>
                  <h2 className={sectionTitleClass}>Intended purpose</h2>
                </div>

                {/* 7.1 Intended use cases */}
                <section className="flex flex-col gap-3">
                  <h3 className={`${mono} text-[11px] uppercase tracking-[0.12em] text-[#FFFFFF]`}>
                    7.1 — Intended use cases
                  </h3>
                  <fieldset className="min-w-0 border-0 p-0">
                    <legend className={labelClass}>Select all that apply</legend>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {INTENDED_USE_CATEGORIES.map((category) => {
                        const checked =
                          form.intendedUseCases.selectedCategories.includes(category);
                        return (
                          <label
                            key={category}
                            className={`flex cursor-pointer items-start gap-2.5 rounded-none border px-[14px] py-[10px] text-[14px] font-normal leading-snug transition-colors ${
                              checked
                                ? "border-[#FFFFFF] bg-[#1A1A1A] text-[#FFFFFF]"
                                : "border-[#222222] bg-[#0A0A0A] text-[#888888] hover:border-[#444444]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                toggleUseCategory("intendedUseCases", category)
                              }
                              className="juris-check mt-0.5"
                            />
                            <span>{category}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  <div>
                    <label htmlFor="intendedCustom" className={labelClass}>
                      Additional description (optional)
                    </label>
                    <textarea
                      id="intendedCustom"
                      rows={3}
                      className={`${inputClass} min-h-[88px] resize-y`}
                      value={form.intendedUseCases.customDescription}
                      onChange={(e) =>
                        setUseDescription("intendedUseCases", e.target.value)
                      }
                      placeholder="Specific deployment contexts, domains, user populations…"
                    />
                  </div>
                </section>

                {/* 7.2 Prohibited use cases */}
                <section className="mt-2 flex flex-col gap-3 border-t border-[#1A1A1A] pt-6">
                  <h3 className={`${mono} text-[11px] uppercase tracking-[0.12em] text-[#FFFFFF]`}>
                    7.2 — Prohibited use cases
                  </h3>
                  <fieldset className="min-w-0 border-0 p-0">
                    <legend className={labelClass}>
                      Select all categories your model is contractually prohibited from
                    </legend>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {PROHIBITED_USE_CATEGORIES.map((category) => {
                        const checked =
                          form.prohibitedUseCases.selectedCategories.includes(category);
                        return (
                          <label
                            key={category}
                            className={`flex cursor-pointer items-start gap-2.5 rounded-none border px-[14px] py-[10px] text-[14px] font-normal leading-snug transition-colors ${
                              checked
                                ? "border-[#FFFFFF] bg-[#1A1A1A] text-[#FFFFFF]"
                                : "border-[#222222] bg-[#0A0A0A] text-[#888888] hover:border-[#444444]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                toggleUseCategory("prohibitedUseCases", category)
                              }
                              className="juris-check mt-0.5"
                            />
                            <span>{category}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  <div>
                    <label htmlFor="prohibitedCustom" className={labelClass}>
                      Additional prohibitions (optional)
                    </label>
                    <textarea
                      id="prohibitedCustom"
                      rows={3}
                      className={`${inputClass} min-h-[88px] resize-y`}
                      value={form.prohibitedUseCases.customDescription}
                      onChange={(e) =>
                        setUseDescription("prohibitedUseCases", e.target.value)
                      }
                      placeholder="Provider-specific restrictions not captured above…"
                    />
                  </div>
                </section>

                {/* 7.3 High-risk classification */}
                <section className="mt-2 flex flex-col gap-3 border-t border-[#1A1A1A] pt-6">
                  <h3 className={`${mono} text-[11px] uppercase tracking-[0.12em] text-[#FFFFFF]`}>
                    7.3 — High-risk classification (Annex III)
                  </h3>
                  <fieldset className="min-w-0 border-0 p-0">
                    <legend className={labelClass}>
                      Does this model qualify as a high-risk AI system under Annex III?
                    </legend>
                    <div className="mt-2 flex flex-wrap gap-5">
                      {[
                        { value: true, label: "Yes" },
                        { value: false, label: "No" },
                      ].map(({ value, label }) => (
                        <label
                          key={String(value)}
                          className="flex cursor-pointer items-center gap-2.5 text-[14px] font-normal text-[#FFFFFF]"
                        >
                          <input
                            type="radio"
                            name="isHighRisk"
                            checked={form.highRiskClassification.isHighRisk === value}
                            onChange={() => setIsHighRisk(value)}
                            className="juris-radio"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {form.highRiskClassification.isHighRisk ? (
                    <div className="flex flex-col gap-4">
                      <fieldset className="min-w-0 border-0 p-0">
                        <legend className={labelClass}>
                          Applicable Annex III categories
                        </legend>
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {ANNEX_III_CATEGORIES.map((category) => {
                            const checked =
                              form.highRiskClassification.applicableCategories.includes(
                                category,
                              );
                            return (
                              <label
                                key={category}
                                className={`flex cursor-pointer items-start gap-2.5 rounded-none border px-[14px] py-[10px] text-[14px] font-normal leading-snug transition-colors ${
                                  checked
                                    ? "border-[#FFFFFF] bg-[#1A1A1A] text-[#FFFFFF]"
                                    : "border-[#222222] bg-[#0A0A0A] text-[#888888] hover:border-[#444444]"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleHighRiskCategory(category)}
                                  className="juris-check mt-0.5"
                                />
                                <span>{category}</span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>

                      {form.highRiskClassification.applicableCategories.length === 0 && (
                        <p className={`${mono} text-[11px] uppercase tracking-[0.08em] text-[#666666]`}>
                          Select at least one Annex III category to provide justifications.
                        </p>
                      )}

                      {form.highRiskClassification.applicableCategories.map(
                        (category) => {
                          const id = `justification-${category.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
                          return (
                            <div key={category}>
                              <label htmlFor={id} className={labelClass}>
                                Justification — {category}{" "}
                                <span className="text-[#FFFFFF]">*</span>
                              </label>
                              <textarea
                                id={id}
                                required
                                rows={3}
                                className={`${inputClass} min-h-[88px] resize-y`}
                                value={
                                  form.highRiskClassification.justifications[
                                    category
                                  ] || ""
                                }
                                onChange={(e) =>
                                  setHighRiskJustification(category, e.target.value)
                                }
                                placeholder="Specific Annex III sub-paragraph(s), intended deployment, and risk-mitigation posture…"
                              />
                            </div>
                          );
                        },
                      )}
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="notHighRiskJustification" className={labelClass}>
                        Justification that the model is not high-risk{" "}
                        <span className="text-[#FFFFFF]">*</span>
                      </label>
                      <textarea
                        id="notHighRiskJustification"
                        required
                        rows={4}
                        className={`${inputClass} min-h-[100px] resize-y`}
                        value={
                          form.highRiskClassification.notHighRiskJustification
                        }
                        onChange={(e) =>
                          setNotHighRiskJustification(e.target.value)
                        }
                        placeholder="Explain why none of the Annex III categories apply: intended purpose, scope, target users, downstream use restrictions…"
                      />
                    </div>
                  )}
                </section>
              </div>
            )}

            {step === RESULT_STEP && (
              <div className={fieldCol}>
                <div className="pb-3" style={sectionDivider}>
                  <h2 className={sectionTitleClass}>Annex XI output</h2>
                </div>
                {documentReference && (
                  <p className={`${mono} text-[10px] uppercase tracking-[0.12em] text-[#666666]`}>
                    Document reference · {documentReference}
                  </p>
                )}
                <div
                  className="juris-doc max-h-[600px] overflow-y-auto border border-[#222222] bg-[#111111] p-6"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf || !generatedDocument}
                  className="w-full rounded-none bg-[#FFFFFF] px-5 py-3 text-[13px] font-medium uppercase tracking-[0.08em] text-[#000000] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloadingPdf ? "Preparing PDF..." : "Download as PDF"}
                </button>
                {pdfError && (
                  <p
                    className={`${mono} text-[11px] uppercase tracking-[0.08em] text-[#FFFFFF]`}
                    role="alert"
                  >
                    {pdfError}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (step === RESULT_STEP) {
                    setStep(FORM_STEP_COUNT);
                    return;
                  }
                  setStep((s) => Math.max(1, s - 1));
                }}
                disabled={step === 1 || (step === FORM_STEP_COUNT && generateLoading)}
                className={`${mono} rounded-none border border-[#333333] bg-transparent px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#666666] transition-colors hover:border-[#666666] hover:text-[#FFFFFF] disabled:cursor-not-allowed disabled:opacity-40`}
              >
                Back
              </button>
              {step < FORM_STEP_COUNT ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(FORM_STEP_COUNT, s + 1))}
                  disabled={generateLoading}
                  className={`${mono} rounded-none bg-[#FFFFFF] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#000000] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Next →
                </button>
              ) : step === RESULT_STEP ? null : (
                <button
                  type="submit"
                  disabled={generateLoading}
                  className={`${mono} rounded-none bg-[#FFFFFF] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#000000] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  {generateLoading ? "Generating..." : "Submit →"}
                </button>
              )}
            </div>
            {generateError && step === FORM_STEP_COUNT && (
              <p
                className={`${mono} mt-3 text-[11px] uppercase tracking-[0.08em] text-[#FFFFFF]`}
                role="alert"
              >
                {generateError}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

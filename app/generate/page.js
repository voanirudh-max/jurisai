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

const RED_TEAM_CATEGORIES = [
  "Bias",
  "Jailbreak",
  "Prompt injection",
  "Harmful content",
  "Factuality",
  "CBRN",
  "Cybersecurity",
  "Persuasion",
];

const TRAINING_COMPUTE_UNITS = ["GPU-hours", "FLOPs"];

const RED_TEAM_APPROACHES = [
  { value: "internal", label: "Internal" },
  { value: "external", label: "External" },
  { value: "both", label: "Both" },
  { value: "none", label: "None" },
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
    legalName: "",
    tradeName: "",
    legalForm: "",
    registeredAddress: "",
    countryOfEstablishment: "",
    contactEmail: "",
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
  energyDisclosures: {
    totalTrainingEnergyKwh: "",
    trainingComputeValue: "",
    trainingComputeUnit: "GPU-hours",
    trainingInfrastructureLocations: "",
    estimatedCo2eTonnes: "",
    energyMethodology: "",
    inferenceEnergyPerQuery: "",
  },
  redTeaming: {
    approach: "both",
    adversarialCategories: [],
    customAdversarialCategories: "",
    teamComposition: "",
    methodologySummary: "",
    findingsAndMitigations: "",
    residualRisks: "",
    exerciseDates: "",
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
    isHighRisk: null,
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

const labelClass =
  "font-sans block text-[10px] font-medium uppercase tracking-[0.12em] text-dim";
const sectionTitleClass =
  "font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-dim";
const sectionDivider = { borderBottom: "1px solid var(--hairline)" };

const inputClass =
  "mt-2 w-full rounded-[7px] border border-hairline bg-surface px-[14px] py-[10px] text-[14px] font-normal text-ink outline-none placeholder:text-dim focus:border-ink transition-colors";

const fieldCol = "flex flex-col gap-5";

export default function GeneratePage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateStatus, setGenerateStatus] = useState("Generating...");
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
      highRiskClassification: {
        ...prev.highRiskClassification,
        isHighRisk: value,
        ...(value === true ? { notHighRiskJustification: "" } : {}),
        ...(value !== true
          ? { applicableCategories: [], justifications: {} }
          : {}),
        ...(value === null ? { notHighRiskJustification: "" } : {}),
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

  function setEnergyField(field, value) {
    setForm((prev) => ({
      ...prev,
      energyDisclosures: {
        ...prev.energyDisclosures,
        [field]: value,
      },
    }));
  }

  function setRedTeamField(field, value) {
    setForm((prev) => ({
      ...prev,
      redTeaming: {
        ...prev.redTeaming,
        [field]: value,
      },
    }));
  }

  function toggleRedTeamCategory(category) {
    setForm((prev) => {
      const current = prev.redTeaming.adversarialCategories;
      const next = current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category];
      return {
        ...prev,
        redTeaming: {
          ...prev.redTeaming,
          adversarialCategories: next,
        },
      };
    });
  }

  async function handleDownloadPdf() {
    if (!generatedDocument || downloadingPdf) return;
    setPdfError(null);
    setDownloadingPdf(true);
    try {
      const [{ jsPDF }, { renderAnnexXiPdf }] = await Promise.all([
        import("jspdf"),
        import("../../lib/annexXiPdf.js"),
      ]);
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const baseName = documentReference
        ? documentReference
        : `Annex_XI_${form.modelName || "model"}`;
      renderAnnexXiPdf({
        doc,
        generatedDocument,
        modelName: form.modelName,
        documentReference,
        saveFilename: `${sanitizeFilename(baseName)}.pdf`,
      });
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
    setGenerateStatus("Generating...");

    async function requestGeneration() {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const category =
          res.status === 429
            ? "Rate limited"
            : res.status >= 500
              ? "Server error"
              : res.status === 502
                ? "Upstream API error"
                : "Generation failed";
        const detail =
          typeof data.error === "string" ? data.error : "Unknown error";
        const err = new Error(`${category}: ${detail}`);
        err.retryable = res.status === 429 || res.status >= 500;
        throw err;
      }
      if (typeof data.document !== "string") {
        throw new Error("Invalid response: missing document payload");
      }
      return data.document;
    }

    try {
      let document;
      try {
        document = await requestGeneration();
      } catch (firstErr) {
        if (firstErr instanceof Error && firstErr.retryable) {
          setGenerateStatus("Retrying...");
          await new Promise((resolve) => setTimeout(resolve, 2000));
          document = await requestGeneration();
        } else {
          throw firstErr;
        }
      }
      setGeneratedDocument(document);
      setStep(RESULT_STEP);
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setGenerateLoading(false);
      setGenerateStatus("Generating...");
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--bg)_0%,var(--surface)_48%,var(--bg)_100%)] text-ink">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .juris-check {
            appearance: none;
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            border: 1px solid var(--hairline);
            background: var(--surface);
            position: relative;
            cursor: pointer;
            display: inline-block;
            transition: border-color 0.15s ease, background-color 0.15s ease;
            flex-shrink: 0;
          }
          .juris-check:hover { border-color: #c9c2b6; }
          .juris-check:checked { background: var(--ink); border-color: var(--ink); }
          .juris-check:checked::after {
            content: "";
            position: absolute;
            left: 4px;
            top: 1px;
            width: 5px;
            height: 9px;
            border-right: 1.6px solid var(--bg);
            border-bottom: 1.6px solid var(--bg);
            transform: rotate(45deg);
          }
          .juris-radio {
            appearance: none;
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            border: 1px solid var(--hairline);
            background: var(--surface);
            border-radius: 50%;
            position: relative;
            cursor: pointer;
            display: inline-block;
            transition: border-color 0.15s ease, background-color 0.15s ease;
            flex-shrink: 0;
          }
          .juris-radio:hover { border-color: #c9c2b6; }
          .juris-radio:checked { background: var(--ink); border-color: var(--ink); }
          .juris-radio:checked::after {
            content: "";
            position: absolute;
            left: 4px;
            top: 4px;
            width: 6px;
            height: 6px;
            background: var(--bg);
            border-radius: 50%;
          }
          .juris-doc { color: var(--muted); font-size: 14px; line-height: 1.7; font-family: inherit; word-wrap: break-word; }
          .juris-doc > *:first-child { margin-top: 0; }
          .juris-doc h1 { color: var(--ink); font-family: var(--font-serif), ui-serif, Georgia, serif; font-size: 22px; font-weight: 500; line-height: 1.3; margin: 28px 0 12px; }
          .juris-doc h2 { color: var(--ink); font-family: var(--font-serif), ui-serif, Georgia, serif; font-size: 18px; font-weight: 500; line-height: 1.3; margin: 24px 0 10px; }
          .juris-doc h3 { color: var(--ink); font-family: var(--font-serif), ui-serif, Georgia, serif; font-size: 16px; font-weight: 500; line-height: 1.4; margin: 20px 0 8px; }
          .juris-doc h4, .juris-doc h5, .juris-doc h6 { color: var(--ink); font-size: 14px; font-weight: 500; margin: 18px 0 8px; }
          .juris-doc p { margin: 0 0 16px 0; }
          .juris-doc strong, .juris-doc b { color: var(--ink); font-weight: 600; }
          .juris-doc em, .juris-doc i { font-style: italic; color: var(--muted); }
          .juris-doc hr { border: 0; border-top: 1px solid var(--hairline); margin: 24px 0; height: 0; }
          .juris-doc ul, .juris-doc ol { margin: 0 0 16px 0; padding-left: 22px; }
          .juris-doc li { margin-bottom: 6px; }
          .juris-doc li > p { margin: 0 0 6px 0; }
          .juris-doc blockquote { border-left: 3px solid var(--hairline); margin: 16px 0; padding: 4px 14px; color: var(--muted); font-style: italic; }
          .juris-doc blockquote p { margin: 6px 0; }
          .juris-doc code { background: var(--chrome); padding: 2px 6px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; color: var(--ink); }
          .juris-doc pre { background: var(--chrome); padding: 12px 14px; overflow-x: auto; margin: 16px 0; border: 1px solid var(--hairline); }
          .juris-doc pre code { background: transparent; padding: 0; font-size: 12.5px; color: var(--ink); }
          .juris-doc a { color: var(--ink); text-decoration: underline; }
          .juris-doc table { width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid var(--hairline); background: var(--surface); }
          .juris-doc thead { background: var(--chrome); }
          .juris-doc th, .juris-doc td { border: 1px solid var(--hairline); padding: 8px 12px; text-align: left; font-size: 13px; vertical-align: top; color: var(--muted); }
          .juris-doc th { font-weight: 600; color: var(--ink); }
        `,
        }}
      />

      <div className="mx-auto max-w-[720px] px-[24px] py-[48px]">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col rounded-lg border border-hairline bg-surface p-8"
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-[13px] font-bold tracking-[0.14em] text-ink">
              JURIS<span>AI</span>
            </Link>
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-dim">
              Annex XI · Article 53(1)(a)
            </span>
          </div>

          <hr
            className="mt-4 h-0 border-0 border-t border-hairline p-0"
            aria-hidden
          />

          <h1 className="font-serif mt-6 text-[28px] font-medium leading-tight text-ink">
            Annex XI document generator
          </h1>
          <p className="mb-6 mt-3 text-[13px] leading-[1.7] text-muted">
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
                    className="font-sans flex-1 pb-2.5 text-center text-[10px] font-medium uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      color: active ? "var(--ink)" : "var(--dim)",
                      borderBottom: active
                        ? "1px solid var(--ink)"
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
              className="font-sans border-b border-ink pb-2.5 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-ink"
              role="status"
            >
              Output
            </div>
          )}

          {/* Progress bar */}
          <div
            className="mt-4 h-px w-full overflow-hidden bg-hairline"
            role="progressbar"
            aria-valuenow={step >= RESULT_STEP ? RESULT_STEP : step}
            aria-valuemin={1}
            aria-valuemax={RESULT_STEP}
            aria-label="Form progress"
          >
            <div
              className="h-px bg-ink transition-[width] duration-200 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="font-sans mt-3 text-[10px] font-medium uppercase tracking-[0.12em] text-dim">
            <span>
              {String(step >= RESULT_STEP ? RESULT_STEP : step).padStart(2, "0")}
              {" / "}
              {String(RESULT_STEP).padStart(2, "0")}
            </span>
            <span className="ml-2 text-muted">
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
                  <div className="sm:col-span-2 border-t border-hairline pt-5">
                    <h3 className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-ink">
                      Provider Identification
                    </h3>
                    <p className="mt-2 text-[13px] leading-[1.7] text-muted">
                      Section 1 of the generated Annex XI document. Required before any model description.
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="legalName" className={labelClass}>Provider legal name</label>
                    <input
                      id="legalName"
                      type="text"
                      className={inputClass}
                      value={form.providerLegalIdentity.legalName}
                      onChange={(e) => setLegalIdentityField("legalName", e.target.value)}
                      placeholder="Registered legal entity name"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="tradeName" className={labelClass}>Trade name / brand (if different)</label>
                    <input
                      id="tradeName"
                      type="text"
                      className={inputClass}
                      value={form.providerLegalIdentity.tradeName}
                      onChange={(e) => setLegalIdentityField("tradeName", e.target.value)}
                      placeholder="e.g. JurisAI (optional)"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="providerName" className={labelClass}>Provider name (display)</label>
                    <input
                      id="providerName"
                      type="text"
                      className={inputClass}
                      value={form.providerName}
                      onChange={(e) => updateField("providerName", e.target.value)}
                      placeholder="Name used in document header if different from legal name"
                    />
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
                  <div>
                    <label htmlFor="contactEmail" className={labelClass}>Provider contact email</label>
                    <input
                      id="contactEmail"
                      type="email"
                      className={inputClass}
                      value={form.providerLegalIdentity.contactEmail}
                      onChange={(e) => setLegalIdentityField("contactEmail", e.target.value)}
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div>
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
                      <div className="sm:col-span-2 border-t border-hairline pt-5">
                        <h3 className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-ink">
                          Authorised Representative
                        </h3>
                        <p className="mt-2 text-[13px] leading-[1.7] text-muted">
                          Article 54 may require an EU-established representative before a non-EU provider places a GPAI model on the Union market. Applicability can depend on exceptions; enter representative details only if a written mandate exists.
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
                              ? "border-ink bg-bg text-ink"
                              : "border-hairline bg-surface text-muted hover:border-dim"
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

                <div className="border-t border-hairline pt-6">
                  <h3 className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-ink">
                    Energy and Compute Disclosures
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.7] text-muted">
                    Annex XI Section 1(j) — training energy consumption and compute.
                  </p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="totalTrainingEnergyKwh" className={labelClass}>Total training energy (kWh)</label>
                    <input
                      id="totalTrainingEnergyKwh"
                      type="number"
                      min="0"
                      step="any"
                      className={inputClass}
                      value={form.energyDisclosures.totalTrainingEnergyKwh}
                      onChange={(e) => setEnergyField("totalTrainingEnergyKwh", e.target.value)}
                      placeholder="e.g. 1250000"
                    />
                  </div>
                  <div>
                    <label htmlFor="trainingComputeValue" className={labelClass}>Training compute</label>
                    <div className="mt-2 flex gap-2">
                      <input
                        id="trainingComputeValue"
                        type="number"
                        min="0"
                        step="any"
                        className={`${inputClass} flex-1`}
                        value={form.energyDisclosures.trainingComputeValue}
                        onChange={(e) => setEnergyField("trainingComputeValue", e.target.value)}
                        placeholder="e.g. 1.2e23"
                      />
                      <select
                        className={`${inputClass} w-[140px]`}
                        value={form.energyDisclosures.trainingComputeUnit}
                        onChange={(e) => setEnergyField("trainingComputeUnit", e.target.value)}
                      >
                        {TRAINING_COMPUTE_UNITS.map((unit) => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="trainingInfrastructureLocations" className={labelClass}>Training infrastructure / data center location(s)</label>
                    <textarea
                      id="trainingInfrastructureLocations"
                      rows={2}
                      className={`${inputClass} min-h-[72px] resize-y`}
                      value={form.energyDisclosures.trainingInfrastructureLocations}
                      onChange={(e) => setEnergyField("trainingInfrastructureLocations", e.target.value)}
                      placeholder="e.g. Hyderabad, India; Frankfurt, Germany"
                    />
                  </div>
                  <div>
                    <label htmlFor="estimatedCo2eTonnes" className={labelClass}>Estimated CO2e emissions (tonnes, optional)</label>
                    <input
                      id="estimatedCo2eTonnes"
                      type="number"
                      min="0"
                      step="any"
                      className={inputClass}
                      value={form.energyDisclosures.estimatedCo2eTonnes}
                      onChange={(e) => setEnergyField("estimatedCo2eTonnes", e.target.value)}
                      placeholder="e.g. 420"
                    />
                  </div>
                  <div>
                    <label htmlFor="inferenceEnergyPerQuery" className={labelClass}>Inference energy per query (optional)</label>
                    <input
                      id="inferenceEnergyPerQuery"
                      type="text"
                      className={inputClass}
                      value={form.energyDisclosures.inferenceEnergyPerQuery}
                      onChange={(e) => setEnergyField("inferenceEnergyPerQuery", e.target.value)}
                      placeholder="e.g. ~0.8 Wh per 1k-token response"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="energyMethodology" className={labelClass}>Methodology for energy estimate</label>
                    <textarea
                      id="energyMethodology"
                      rows={3}
                      className={`${inputClass} min-h-[88px] resize-y`}
                      value={form.energyDisclosures.energyMethodology}
                      onChange={(e) => setEnergyField("energyMethodology", e.target.value)}
                      placeholder="e.g. GPU-hours x hardware TDP x PUE x grid carbon intensity"
                    />
                  </div>
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

                <div className="border-t border-hairline pt-6">
                  <h3 className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-ink">
                    Red-Teaming and Adversarial Evaluation
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.7] text-muted">
                    Annex XI Section 2 — internal and external adversarial testing measures.
                  </p>
                </div>
                <div>
                  <label htmlFor="redTeamApproach" className={labelClass}>Red-teaming approach</label>
                  <select
                    id="redTeamApproach"
                    className={inputClass}
                    value={form.redTeaming.approach}
                    onChange={(e) => setRedTeamField("approach", e.target.value)}
                  >
                    {RED_TEAM_APPROACHES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <fieldset className="min-w-0 border-0 p-0">
                  <legend className={labelClass}>Adversarial categories covered</legend>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {RED_TEAM_CATEGORIES.map((category) => {
                      const checked = form.redTeaming.adversarialCategories.includes(category);
                      return (
                        <label
                          key={category}
                          className={`flex cursor-pointer items-start gap-2.5 rounded-none border px-[14px] py-[10px] text-[14px] font-normal leading-snug transition-colors ${
                            checked
                              ? "border-ink bg-bg text-ink"
                              : "border-hairline bg-surface text-muted hover:border-dim"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleRedTeamCategory(category)}
                            className="juris-check mt-0.5"
                          />
                          <span>{category}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <div>
                  <label htmlFor="customAdversarialCategories" className={labelClass}>Additional adversarial categories (optional)</label>
                  <input
                    id="customAdversarialCategories"
                    type="text"
                    className={inputClass}
                    value={form.redTeaming.customAdversarialCategories}
                    onChange={(e) => setRedTeamField("customAdversarialCategories", e.target.value)}
                    placeholder="Comma-separated custom categories"
                  />
                </div>
                <div>
                  <label htmlFor="teamComposition" className={labelClass}>Red-team composition and qualifications</label>
                  <textarea
                    id="teamComposition"
                    rows={3}
                    className={`${inputClass} min-h-[88px] resize-y`}
                    value={form.redTeaming.teamComposition}
                    onChange={(e) => setRedTeamField("teamComposition", e.target.value)}
                    placeholder="Internal security engineers, external penetration testers, domain experts…"
                  />
                </div>
                <div>
                  <label htmlFor="methodologySummary" className={labelClass}>Methodology summary</label>
                  <textarea
                    id="methodologySummary"
                    rows={3}
                    className={`${inputClass} min-h-[88px] resize-y`}
                    value={form.redTeaming.methodologySummary}
                    onChange={(e) => setRedTeamField("methodologySummary", e.target.value)}
                    placeholder="Attack libraries, scenario design, evaluation rubrics…"
                  />
                </div>
                <div>
                  <label htmlFor="findingsAndMitigations" className={labelClass}>Summary of findings and mitigations</label>
                  <textarea
                    id="findingsAndMitigations"
                    rows={4}
                    className={`${inputClass} min-h-[100px] resize-y`}
                    value={form.redTeaming.findingsAndMitigations}
                    onChange={(e) => setRedTeamField("findingsAndMitigations", e.target.value)}
                    placeholder="Key vulnerabilities identified and remediations applied…"
                  />
                </div>
                <div>
                  <label htmlFor="residualRisks" className={labelClass}>Residual risks identified</label>
                  <textarea
                    id="residualRisks"
                    rows={3}
                    className={`${inputClass} min-h-[88px] resize-y`}
                    value={form.redTeaming.residualRisks}
                    onChange={(e) => setRedTeamField("residualRisks", e.target.value)}
                    placeholder="Risks accepted or deferred with rationale…"
                  />
                </div>
                <div>
                  <label htmlFor="exerciseDates" className={labelClass}>Date(s) of red-teaming exercise</label>
                  <input
                    id="exerciseDates"
                    type="text"
                    className={inputClass}
                    value={form.redTeaming.exerciseDates}
                    onChange={(e) => setRedTeamField("exerciseDates", e.target.value)}
                    placeholder="e.g. 2026-03-15 to 2026-04-02"
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
                  <h3 className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-ink">
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
                                ? "border-ink bg-bg text-ink"
                                : "border-hairline bg-surface text-muted hover:border-dim"
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
                <section className="mt-2 flex flex-col gap-3 border-t border-hairline pt-6">
                  <h3 className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-ink">
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
                                ? "border-ink bg-bg text-ink"
                                : "border-hairline bg-surface text-muted hover:border-dim"
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
                <section className="mt-2 flex flex-col gap-3 border-t border-hairline pt-6">
                  <h3 className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-ink">
                    7.3 — Annex III context for an integrated AI system
                  </h3>
                  <fieldset className="min-w-0 border-0 p-0">
                    <legend className={labelClass}>
                      Is an AI system using this model intended for an Annex III high-risk use?
                    </legend>
                    <div className="mt-2 flex flex-wrap gap-5">
                      {[
                        { value: null, label: "Not assessed" },
                        { value: true, label: "Yes" },
                        { value: false, label: "No" },
                      ].map(({ value, label }) => (
                        <label
                          key={String(value)}
                          className="flex cursor-pointer items-center gap-2.5 text-[14px] font-normal text-ink"
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

                  {form.highRiskClassification.isHighRisk === true ? (
                    <div className="flex flex-col gap-4">
                      <fieldset className="min-w-0 border-0 p-0">
                        <legend className={labelClass}>
                        Applicable Annex III use categories for the AI system
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
                                    ? "border-ink bg-bg text-ink"
                                    : "border-hairline bg-surface text-muted hover:border-dim"
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
                        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
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
                                <span className="text-ink">*</span>
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
                  ) : form.highRiskClassification.isHighRisk === false ? (
                    <div>
                      <label htmlFor="notHighRiskJustification" className={labelClass}>
                        Basis for the provider-reported answer{" "}
                        <span className="text-ink">*</span>
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
                        placeholder="Describe the intended purpose, users, and deployment context supporting the provider-reported answer…"
                      />
                    </div>
                  ) : (
                    <p className="text-[13px] leading-[1.7] text-muted">
                      Choose “Not assessed” unless the provider has assessed the intended use. This section records context only; it does not classify the GPAI model or a downstream AI system.
                    </p>
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
                  <p className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
                    Document reference · {documentReference}
                  </p>
                )}
                <div
                  className="juris-doc max-h-[600px] overflow-y-auto rounded-lg border border-hairline bg-surface p-6"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf || !generatedDocument}
                  className="w-full rounded-[7px] bg-ink px-5 py-3 text-[13px] font-medium uppercase tracking-[0.08em] text-bg transition-colors hover:bg-[#3a342c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloadingPdf ? "Preparing PDF..." : "Download as PDF"}
                </button>
                {pdfError && (
                  <p
                    className="font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-ink"
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
                className="font-sans rounded-[7px] border border-hairline bg-transparent px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted transition-colors hover:border-dim hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              {step < FORM_STEP_COUNT ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(FORM_STEP_COUNT, s + 1))}
                  disabled={generateLoading}
                  className="font-sans rounded-[7px] bg-ink px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-bg transition-colors hover:bg-[#3a342c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next →
                </button>
              ) : step === RESULT_STEP ? null : (
                <button
                  type="submit"
                  disabled={generateLoading}
                  className="font-sans rounded-[7px] bg-ink px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-bg transition-colors hover:bg-[#3a342c] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {generateLoading ? generateStatus : "Submit →"}
                </button>
              )}
            </div>
            {generateError && step === FORM_STEP_COUNT && (
              <p
                className="font-sans mt-3 text-[11px] font-medium uppercase tracking-[0.08em] text-ink"
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

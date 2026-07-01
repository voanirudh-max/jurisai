/** Fixed Annex XI section skeleton — cross-references must use these numbers only. */
export const DOCUMENT_SECTION_SKELETON = `## 1. Provider Identification
### 1.1 Provider Identity
### 1.2 Compliance and Regulatory Contacts
### 1.3 Authorised Representative (Article 54)
## 2. Model Overview
## 3. Model Architecture and System Design
### 3.1 Parameterisation
### 3.2 System Design
### 3.3 Known Limitations (cross-reference: Section 9.3)
## 4. Training Process
### 4.1 Training Pipeline
### 4.2 Alignment and Fine-Tuning
### 4.3 Compute Estimate
## 5. Training Data Governance
## 6. Energy and Compute Disclosures
### 6.1 Energy Methodology
## 7. Evaluation and Benchmarking
### 7.1 Benchmarks
### 7.2 Evaluation Results
### 7.3 Known Limitations (cross-reference: Section 3.3)
## 8. Red-Teaming and Adversarial Evaluation
## 9. Intended Purpose and Use Restrictions
### 9.1 Intended Use Cases
### 9.2 Prohibited Use Cases
### 9.3 High-Risk Classification (Annex III)`;

export const ARTICLE_5_PROHIBITED_PRACTICES = [
  {
    ref: "5(1)(a)",
    text: "Subliminal, purposefully manipulative or deceptive techniques materially distorting behaviour, causing or likely to cause significant harm",
  },
  {
    ref: "5(1)(b)",
    text: "Exploitation of vulnerabilities due to age, disability, or social or economic situation",
  },
  {
    ref: "5(1)(c)",
    text: "Social scoring: evaluation/classification of persons based on social behaviour or personal characteristics leading to detrimental or unfavourable treatment",
  },
  {
    ref: "5(1)(d)",
    text: "Risk assessments predicting criminal offence likelihood based solely on profiling or personality traits",
  },
  {
    ref: "5(1)(e)",
    text: "Untargeted scraping of facial images from the internet or CCTV to create facial recognition databases",
  },
  {
    ref: "5(1)(f)",
    text: "Emotion recognition in the workplace and education institutions (except medical/safety reasons)",
  },
  {
    ref: "5(1)(g)",
    text: "Biometric categorisation inferring race, political opinions, trade union membership, religious or philosophical beliefs, sex life or sexual orientation",
  },
  {
    ref: "5(1)(h)",
    text: "Real-time remote biometric identification in publicly accessible spaces for law enforcement (subject to narrow exceptions)",
  },
];

const CO2E_DISCLAIMER =
  "The declared figure reflects the provider's own attribution methodology; the computed full-facility figure is shown for transparency.";

function parsePositiveNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseFromMethodology(methodology, patterns) {
  const source = String(methodology ?? "");
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match?.[1]) {
      const n = Number(match[1]);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return null;
}

function parseTdpKwFromMethodology(methodology) {
  const source = String(methodology ?? "");
  const tdpKw = parseFromMethodology(source, [
    /TDP[^0-9]*(\d+(?:\.\d+)?)\s*kW/i,
    /(\d+(?:\.\d+)?)\s*kW[^.\n]{0,40}TDP/i,
  ]);
  if (tdpKw !== null) return tdpKw;

  const wattPatterns = [
    /TDP[^0-9]*\(?\s*(\d+(?:\.\d+)?)\s*W(?!h)/i,
    /(\d+(?:\.\d+)?)\s*W(?!h)\)?[^.\n]{0,40}TDP/i,
    /(\d+(?:\.\d+)?)\s*W(?!h)\b/i,
  ];
  for (const pattern of wattPatterns) {
    const match = source.match(pattern);
    if (match?.[1]) {
      const n = Number(match[1]);
      if (Number.isFinite(n) && n > 0) {
        return n > 10 ? n / 1000 : n;
      }
    }
  }

  return 0.4;
}

/**
 * Parse intended/prohibited use-case group from POST body field shape in
 * app/generate/page.js initialForm (selectedCategories + customDescription).
 */
export function parseUseCaseGroupFromForm(group) {
  if (!group || typeof group !== "object") {
    return { selectedCategories: [], customDescription: "" };
  }

  const selectedCategories = Array.isArray(group.selectedCategories)
    ? group.selectedCategories.filter((c) => typeof c === "string" && c.trim())
    : [];
  const customDescription =
    typeof group.customDescription === "string" ? group.customDescription.trim() : "";

  return { selectedCategories, customDescription };
}

/** Read prohibitedUseCases from full JSON.stringify(form) POST payload. */
export function parseProhibitedUseCasesFromPostBody(body) {
  return parseUseCaseGroupFromForm(body?.prohibitedUseCases);
}

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return "N/A";
  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

export function renderArticle5Boilerplate(modelName) {
  const name = modelName?.trim() || "the model";
  const items = ARTICLE_5_PROHIBITED_PRACTICES.map(
    (item) => `- **Article ${item.ref}** — ${item.text}`,
  ).join("\n");

  return `#### Article 5(1) Prohibited AI Practices (Regulation (EU) 2024/1689)

The provider confirms that ${name} is not placed on the market, put into service, or used in any manner that constitutes a prohibited AI practice under Article 5(1) of Regulation (EU) 2024/1689. The following practices are expressly prohibited:

${items}`;
}

function renderContractualProhibitedUses(body) {
  const { selectedCategories, customDescription } =
    parseProhibitedUseCasesFromPostBody(body);

  const lines = [];
  if (selectedCategories.length) {
    lines.push("The provider contractually prohibits the following use categories:");
    lines.push(...selectedCategories.map((c) => `- ${c}`));
  }
  if (customDescription) {
    if (lines.length) lines.push("");
    lines.push(`Additional contractual restrictions: ${customDescription}`);
  }
  if (!lines.length) {
    lines.push(
      "No additional provider-specific contractual prohibitions were declared beyond Article 5(1).",
    );
  }

  return `#### Contractually Prohibited Uses

${lines.join("\n")}`;
}

export function renderSection92ProhibitedUses(body) {
  const modelName = body?.modelName;
  return `### 9.2 Prohibited Use Cases

${renderArticle5Boilerplate(modelName)}

${renderContractualProhibitedUses(body)}`;
}

export function computeEnergyReconciliation(energy) {
  if (!energy || typeof energy !== "object") {
    return {
      methodologyBlock: "",
      factsForPrompt: "(energy disclosures not provided)",
    };
  }

  const methodology = String(energy.energyMethodology ?? "");
  const gpuHours =
    energy.trainingComputeUnit === "GPU-hours"
      ? parsePositiveNumber(energy.trainingComputeValue)
      : null;
  const tdpKw = parseTdpKwFromMethodology(methodology);
  const pue =
    parseFromMethodology(methodology, [
      /PUE[^0-9]*(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)[^.\n]{0,20}PUE/i,
    ]) ?? 1.2;
  const gridKgPerKwh =
    parseFromMethodology(methodology, [
      /(\d+(?:\.\d+)?)\s*kg\s*CO2e?\s*\/\s*kWh/i,
      /(\d+(?:\.\d+)?)\s*g\s*CO2e?\s*\/\s*kWh/i,
    ]) ?? 0.45;

  const gridIntensityKgPerKwh =
    /g\s*CO2e?\s*\/\s*kWh/i.test(methodology) && gridKgPerKwh > 5
      ? gridKgPerKwh / 1000
      : gridKgPerKwh;

  const declaredTotalKwh = parsePositiveNumber(energy.totalTrainingEnergyKwh);
  const declaredCo2eTonnes = parsePositiveNumber(energy.estimatedCo2eTonnes);

  const gpuDirectKwh =
    gpuHours !== null ? gpuHours * tdpKw : null;
  const pueAdjustedKwh =
    gpuDirectKwh !== null ? gpuDirectKwh * pue : null;
  const auxiliaryKwh =
    declaredTotalKwh !== null && pueAdjustedKwh !== null
      ? declaredTotalKwh - pueAdjustedKwh
      : null;
  const computedCo2eTonnes =
    declaredTotalKwh !== null
      ? (declaredTotalKwh * gridIntensityKgPerKwh) / 1000
      : null;

  let co2eDisclaimer = "";
  if (
    declaredCo2eTonnes !== null &&
    computedCo2eTonnes !== null &&
    computedCo2eTonnes > 0
  ) {
    const delta = Math.abs(declaredCo2eTonnes - computedCo2eTonnes);
    if (delta / computedCo2eTonnes > 0.1) {
      co2eDisclaimer = CO2E_DISCLAIMER;
    }
  }

  const methodologyBlock = `### 6.1 Energy Methodology

**Step 1 — GPU draw (kWh):** ${gpuDirectKwh !== null ? `${formatNumber(gpuDirectKwh)} kWh (= ${formatNumber(gpuHours)} GPU-hours x ${formatNumber(tdpKw, 3)} kW TDP)` : "Not computed (training compute not provided in GPU-hours)."}

**Step 2 — PUE adjustment (kWh):** ${pueAdjustedKwh !== null ? `${formatNumber(pueAdjustedKwh)} kWh (= ${formatNumber(gpuDirectKwh)} kWh x PUE ${formatNumber(pue, 3)})` : "Not computed."}

**Step 3 — Declared total and auxiliary infrastructure:** ${declaredTotalKwh !== null ? `Declared total training energy: ${formatNumber(declaredTotalKwh)} kWh.` : "Declared total training energy: not provided."}${auxiliaryKwh !== null ? ` Difference attributed to auxiliary infrastructure (cooling, networking, storage): ${formatNumber(auxiliaryKwh)} kWh.` : ""}

**Step 4 — CO2e estimate (tonnes):** ${computedCo2eTonnes !== null ? `Computed CO2e from declared total energy: ${formatNumber(computedCo2eTonnes, 3)} tonnes (= ${formatNumber(declaredTotalKwh)} kWh x ${formatNumber(gridIntensityKgPerKwh, 4)} kg CO2e/kWh).` : "Not computed."}${declaredCo2eTonnes !== null ? ` Provider-declared CO2e: ${formatNumber(declaredCo2eTonnes, 3)} tonnes.` : ""}${co2eDisclaimer ? `\n\n${co2eDisclaimer}` : ""}

Provider methodology note: ${methodology.trim() || "(not provided)"}`;

  const factsForPrompt = [
    `- GPU-hours: ${gpuHours !== null ? formatNumber(gpuHours) : "(not provided)"}`,
    `- TDP (kW): ${formatNumber(tdpKw, 3)}`,
    `- PUE: ${formatNumber(pue, 3)}`,
    `- GPU-direct energy (kWh): ${gpuDirectKwh !== null ? formatNumber(gpuDirectKwh) : "N/A"}`,
    `- PUE-adjusted energy (kWh): ${pueAdjustedKwh !== null ? formatNumber(pueAdjustedKwh) : "N/A"}`,
    `- Declared total training energy (kWh): ${declaredTotalKwh !== null ? formatNumber(declaredTotalKwh) : "(not provided)"}`,
    `- Auxiliary infrastructure attribution (kWh): ${auxiliaryKwh !== null ? formatNumber(auxiliaryKwh) : "N/A"}`,
    `- Grid carbon intensity (kg CO2e/kWh): ${formatNumber(gridIntensityKgPerKwh, 4)}`,
    `- Computed CO2e (tonnes): ${computedCo2eTonnes !== null ? formatNumber(computedCo2eTonnes, 3) : "N/A"}`,
    `- Declared CO2e (tonnes): ${declaredCo2eTonnes !== null ? formatNumber(declaredCo2eTonnes, 3) : "(not provided)"}`,
  ].join("\n");

  return { methodologyBlock, factsForPrompt, co2eDisclaimer };
}

function replaceSubsectionRange(document, startPattern, endPattern, replacement) {
  const startMatch = document.match(startPattern);
  if (!startMatch || startMatch.index === undefined) return document;

  const start = startMatch.index;
  const afterStart = start + startMatch[0].length;
  const rest = document.slice(afterStart);
  const endMatch = rest.match(endPattern);
  const end =
    endMatch && endMatch.index !== undefined
      ? afterStart + endMatch.index
      : document.length;

  return document.slice(0, start) + replacement + document.slice(end);
}

export function postProcessGeneratedDocument(document, body) {
  let out = String(document ?? "");

  const section92 = renderSection92ProhibitedUses(body);
  if (/###\s*9\.2\b/i.test(out)) {
    out = replaceSubsectionRange(
      out,
      /###\s*9\.2[^\n]*\n/i,
      /\n###\s*9\.3\b|\n##\s*10\./i,
      `${section92}\n\n`,
    );
  }

  const { methodologyBlock } = computeEnergyReconciliation(body.energyDisclosures);
  if (methodologyBlock && /###\s*6\.1\b/i.test(out)) {
    out = replaceSubsectionRange(
      out,
      /###\s*6\.1[^\n]*\n/i,
      /\n###\s*6\.2\b|\n##\s*7\./i,
      `${methodologyBlock}\n\n`,
    );
  }

  return out;
}

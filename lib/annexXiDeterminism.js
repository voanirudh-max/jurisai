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
### 9.3 Annex III High-Risk AI System Context
## 10. Document Control and Maintenance Obligations
### 10.1 Version History
### 10.2 Maintenance Notes
### 10.3 Availability and Retention of Technical Documentation
### 10.4 Draft Completeness Notes`;

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

  return null;
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

Article 5(1) of Regulation (EU) 2024/1689 prohibits the following practices in the circumstances defined by the Regulation. This legal summary does not represent a provider attestation about how ${name} is used:

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
      "No provider-specific contractual prohibitions were supplied in the intake. This does not confirm that none exist.",
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

export function renderHighRiskClassification(hrc) {
  if (!hrc || typeof hrc !== "object" || (hrc.isHighRisk !== true && hrc.isHighRisk !== false)) {
    return "**Assessment status: Not assessed.** No conclusion on whether an AI system using this model falls within an Annex III high-risk use is made because the provider has not supplied an assessment. Assess the intended purpose and deployment context before making a determination.";
  }

  if (hrc.isHighRisk === true) {
    const categories = Array.isArray(hrc.applicableCategories)
      ? hrc.applicableCategories.filter((c) => typeof c === "string" && c.trim())
      : [];
    const justifications = hrc.justifications && typeof hrc.justifications === "object" ? hrc.justifications : {};
    const details = categories.length
      ? categories.map((category) => {
          const justification = justifications[category];
          return `- ${category}: ${typeof justification === "string" && justification.trim() ? justification.trim() : "No justification supplied."}`;
        }).join("\n")
      : "No Annex III categories were supplied.";
    return `**Provider-reported Annex III context: Yes.** The provider reports that an AI system using this model is intended for an Annex III high-risk use. This does not classify the GPAI model itself or independently determine whether an integrated AI system is high-risk. This statement has not been independently verified.\n\n${details}`;
  }

  const justification = typeof hrc.notHighRiskJustification === "string" ? hrc.notHighRiskJustification.trim() : "";
  return `**Provider-reported Annex III context: No.** The provider reports that the intended use does not fall within an Annex III high-risk use. This is not an independent legal determination and does not classify downstream AI systems.\n\nProvider-supplied basis: ${justification || "No justification supplied."}`;
}

const EU_MEMBER_STATES = new Set([
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark",
  "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland",
  "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands",
  "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden",
]);

export function renderArticle54Statement(identity) {
  const establishmentCountry =
    typeof identity?.countryOfEstablishment === "string"
      ? identity.countryOfEstablishment.trim()
      : "";
  const representative =
    identity?.authorisedRepresentative && typeof identity.authorisedRepresentative === "object"
      ? identity.authorisedRepresentative
      : {};
  const representativeDetails = [
    ["Name", representative.name],
    ["Address", representative.address],
    ["Contact email", representative.contactEmail],
  ].filter(([, value]) => typeof value === "string" && value.trim());

  if (!establishmentCountry) {
    return "**Article 54 applicability: Not assessed.** The provider's country of establishment was not supplied, so this document cannot assess whether an authorised representative is required.";
  }

  if (EU_MEMBER_STATES.has(establishmentCountry)) {
    return `**Provider-reported country of establishment:** ${establishmentCountry}. On this provider-supplied fact, the third-country provider appointment requirement in Article 54(1) does not apply. This statement has not been independently verified.`;
  }

  const details = representativeDetails.length
    ? representativeDetails.map(([label, value]) => `- ${label}: ${value.trim()}`).join("\n")
    : "Representative details were not supplied. This does not establish that no representative exists.";

  return `**Provider-reported country of establishment:** ${establishmentCountry} (outside the EU). If the provider places the GPAI model on the Union market, Article 54(1) generally requires an authorised representative established in the Union before placement. Article 54(6) provides a conditional exception for certain qualifying free and open-source models, unless they present systemic risks; eligibility was not assessed from this intake.\n\n**Appointment status:** Not verified from the intake. Supplied contact details alone do not establish a written mandate.\n\n${details}`;
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
    ]);
  const gridKgPerKwh =
    parseFromMethodology(methodology, [
      /(\d+(?:\.\d+)?)\s*kg\s*CO2e?\s*\/\s*kWh/i,
      /(\d+(?:\.\d+)?)\s*g\s*CO2e?\s*\/\s*kWh/i,
    ]);

  const gridIntensityKgPerKwh =
    gridKgPerKwh !== null && /g\s*CO2e?\s*\/\s*kWh/i.test(methodology) && gridKgPerKwh > 5
      ? gridKgPerKwh / 1000
      : gridKgPerKwh;

  const declaredTotalKwh = parsePositiveNumber(energy.totalTrainingEnergyKwh);
  const declaredCo2eTonnes = parsePositiveNumber(energy.estimatedCo2eTonnes);

  const gpuDirectKwh =
    gpuHours !== null && tdpKw !== null ? gpuHours * tdpKw : null;
  const pueAdjustedKwh =
    gpuDirectKwh !== null && pue !== null ? gpuDirectKwh * pue : null;
  const auxiliaryKwh =
    declaredTotalKwh !== null && pueAdjustedKwh !== null
      ? declaredTotalKwh - pueAdjustedKwh
      : null;
  const computedCo2eTonnes =
    declaredTotalKwh !== null && gridIntensityKgPerKwh !== null
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

**Step 1 — GPU draw (kWh):** ${gpuDirectKwh !== null ? `${formatNumber(gpuDirectKwh)} kWh (= ${formatNumber(gpuHours)} GPU-hours x ${formatNumber(tdpKw, 3)} kW TDP)` : "Not computed; GPU-hours and verified hardware power data are both required."}

**Step 2 — PUE adjustment (kWh):** ${pueAdjustedKwh !== null ? `${formatNumber(pueAdjustedKwh)} kWh (= ${formatNumber(gpuDirectKwh)} kWh x PUE ${formatNumber(pue, 3)})` : "Not computed; a verified PUE value was not supplied."}

**Step 3 — Declared total and auxiliary infrastructure:** ${declaredTotalKwh !== null ? `Declared total training energy: ${formatNumber(declaredTotalKwh)} kWh.` : "Declared total training energy: not provided."}${auxiliaryKwh !== null ? ` Difference attributed to auxiliary infrastructure (cooling, networking, storage): ${formatNumber(auxiliaryKwh)} kWh.` : ""}

**Step 4 — CO2e estimate (tonnes):** ${computedCo2eTonnes !== null ? `Computed CO2e from declared total energy: ${formatNumber(computedCo2eTonnes, 3)} tonnes (= ${formatNumber(declaredTotalKwh)} kWh x ${formatNumber(gridIntensityKgPerKwh, 4)} kg CO2e/kWh).` : "Not computed; declared energy and a provider-supplied carbon-intensity factor are required."}${declaredCo2eTonnes !== null ? ` Provider-declared CO2e: ${formatNumber(declaredCo2eTonnes, 3)} tonnes.` : " Provider-declared CO2e: not provided."}${co2eDisclaimer ? `\n\n${co2eDisclaimer}` : ""}

Provider methodology note: ${methodology.trim() || "(not provided)"}`;

  const factsForPrompt = [
    `- GPU-hours: ${gpuHours !== null ? formatNumber(gpuHours) : "(not provided)"}`,
    `- TDP (kW): ${tdpKw !== null ? formatNumber(tdpKw, 3) : "(not provided; no default applied)"}`,
    `- PUE: ${pue !== null ? formatNumber(pue, 3) : "(not provided; no default applied)"}`,
    `- GPU-direct energy (kWh): ${gpuDirectKwh !== null ? formatNumber(gpuDirectKwh) : "N/A"}`,
    `- PUE-adjusted energy (kWh): ${pueAdjustedKwh !== null ? formatNumber(pueAdjustedKwh) : "N/A"}`,
    `- Declared total training energy (kWh): ${declaredTotalKwh !== null ? formatNumber(declaredTotalKwh) : "(not provided)"}`,
    `- Auxiliary infrastructure attribution (kWh): ${auxiliaryKwh !== null ? formatNumber(auxiliaryKwh) : "N/A"}`,
    `- Grid carbon intensity (kg CO2e/kWh): ${gridIntensityKgPerKwh !== null ? formatNumber(gridIntensityKgPerKwh, 4) : "(not provided; no default applied)"}`,
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

  const highRiskBlock = renderHighRiskClassification(body?.highRiskClassification);
  if (/###\s*9\.3\b/i.test(out)) {
    out = replaceSubsectionRange(
      out,
      /###\s*9\.3[^\n]*\n/i,
      /\n##\s*10\./i,
      `### 9.3 Annex III High-Risk AI System Context\n\n${highRiskBlock}\n\n`,
    );
  }

  if (/###\s*1\.3\b/i.test(out)) {
    out = replaceSubsectionRange(
      out,
      /###\s*1\.3[^\n]*\n/i,
      /\n##\s*2\./i,
      `### 1.3 Authorised Representative (Article 54)\n\n${renderArticle54Statement(body?.providerLegalIdentity)}\n\n`,
    );
  }

  const trainingSummary = "Article 53(1)(d) requires the provider to draw up and make publicly available a sufficiently detailed summary of the content used to train the GPAI model, according to the template provided by the AI Office. This is a separate public deliverable and is not generated by this Annex XI draft. Applicability and timing depend on the model's market history. Article 111(3) provides a transition until 2 August 2027 for GPAI models placed on the market before 2 August 2025. This draft does not assess which timing rule applies.";
  out = out.replace(
    /(?:The provider must make available to downstream providers and deployers a sufficiently detailed summary of training data in accordance with Article 53\(1\)\(d\)\.|Article 53\(1\)\(d\) requires[^\n]*sufficiently detailed summary[^\n]*AI Office template\.?)/gi,
    trainingSummary,
  );
  // The model may emit this obligation as a heading plus paragraph. Replace the
  // whole subsection so no conflicting deadline or downstream-only framing remains.
  out = replaceSubsectionRange(
    out,
    /(?:^|\n)(?:#{2,4}\s*)?Article 53\(1\)\(d\)[^\n]*(?:Training Content Summary|training-content summary)[^\n]*\n/i,
    /\n(?:#{2,4}\s*)?(?:Article 53\(1\)\(a\)|(?:6\.|Energy and Compute))/i,
    `\nArticle 53(1)(d) — Training Content Summary:\n\n${trainingSummary}\n\n`,
  );
  // Some model responses render the training-summary label and its prose as
  // one paragraph rather than a heading/subsection. Replace that paragraph too.
  out = out.replace(
    /(^|\n)(?:\*\*)?Article 53\(1\)\(d\)\s*[—–-]\s*(?:Public )?Training Content Summary:\s*(?:\*\*)?[^\n]*(?:\n(?!\s*\n)[^\n]*)*/gi,
    `$1Article 53(1)(d) — Training Content Summary: ${trainingSummary}`,
  );
  out = out.replace(
    /\b(?:The )?provider must prepare and publish [^.]*?(?:training content summary|summary of training content)[^.]*?(?:before|prior to)[^.]*?(?:Union market|market placement|downstream integration)[^.]*\./gi,
    "Preparation and publication status are not assessed in this draft. Apply the timing that follows from the model's market history, including any applicable transition under Article 111(3).",
  );

  // Normalize any model-added/renumbered sections after Section 9 into the
  // fixed Section 10 slots. This prevents model-generated headings from
  // displacing the deterministic availability and retention statement.
  const sectionMatches = [...out.matchAll(/^##\s+(\d+)\.\s+([^\n]*)\n?/gm)];
  const extras = sectionMatches
    .map((match, index) => ({
      number: Number(match[1]),
      title: match[2].trim(),
      text: out.slice(match.index + match[0].length, sectionMatches[index + 1]?.index ?? out.length).trim(),
    }))
    .filter((section) => section.number >= 10);
  const completenessSection = extras.find((section) => /completeness/i.test(section.title));
  const sectionBody = (section, fallback) => {
    if (!section?.text) return fallback;
    return section.text
      .replace(/^#{1,6}[^\n]*\n?/gm, "")
      .replace(/Document Retention Notice:[\s\S]*$/i, "")
      .trim() || fallback;
  };
  const subsectionBody = (headingPattern, fallback) => {
    const heading = out.match(headingPattern);
    if (!heading || heading.index === undefined) return fallback;
    const bodyStart = heading.index + heading[0].length;
    const remainder = out.slice(bodyStart);
    const nextHeading = remainder.match(/^#{1,3}\s+/m);
    const value = remainder.slice(0, nextHeading?.index ?? remainder.length).trim();
    return value || fallback;
  };
  const rawVersionHistory = subsectionBody(
    /^###\s*10\.1\s+Version History[^\n]*\n?/im,
    "No version history was supplied in the intake.",
  );
  const versionHistory = rawVersionHistory.startsWith("|")
    ? rawVersionHistory.match(/^\|[^\n]*(?:\n\|[^\n]*)*/)?.[0] ?? rawVersionHistory
    : rawVersionHistory.split(/\n\s*\n/)[0];
  const completenessNotes = subsectionBody(
    /^###\s*10\.4\s+(?:Draft )?Completeness Notes[^\n]*\n?/im,
    sectionBody(completenessSection, "No completeness assessment was supplied. Verify all missing or provider-reported information before relying on this draft."),
  );
  const canonicalSection10 = [
    "## 10. Document Control and Maintenance Obligations",
    "### 10.1 Version History\n\n" + versionHistory,
    "### 10.2 Maintenance Notes\n\nNo separate maintenance history was supplied. Keep this technical documentation up to date when the model or its relevant documentation changes.",
    "### 10.3 Availability and Retention of Technical Documentation\n\nArticle 53(1)(a) requires providers to draw up and keep the model's technical documentation up to date and make it available to the AI Office and national competent authorities upon request. Article 54(3)(b) separately requires an appointed authorised representative to keep a copy of the Annex XI technical documentation at the disposal of those authorities for 10 years after the model is placed on the market. This does not state a general 10-year retention period for every supporting record.",
    "### 10.4 Draft Completeness Notes\n\n" + completenessNotes + "\n\nThis draft completeness note is an automated review of supplied information, not a legal compliance determination.",
  ].join("\n\n");
  const firstExtraIndex = sectionMatches.find((match) => Number(match[1]) >= 10)?.index;
  if (firstExtraIndex !== undefined) {
    out = out.slice(0, firstExtraIndex).trimEnd() + "\n\n" + canonicalSection10 + "\n";
  } else {
    out = out.trimEnd() + "\n\n" + canonicalSection10 + "\n";
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
